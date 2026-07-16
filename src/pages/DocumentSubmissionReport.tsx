import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithPopup } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { DocumentSubmission } from '../types/documentSubmission';
import { ShieldAlert, Download, Search, FileText, Trash2, Edit, Printer, FileSpreadsheet, Eye, X, Check, Filter } from 'lucide-react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function DocumentSubmissionReport() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [records, setRecords] = useState<DocumentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<DocumentSubmission | null>(null);
  const [viewingRecord, setViewingRecord] = useState<DocumentSubmission | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    const q = query(collection(db, 'documentSubmissionReport'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DocumentSubmission));
      // Sort client-side by createdAt descending
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setRecords(data);
      setLoading(false);
      setFetchError(null);
    }, (error) => {
      console.error("Error fetching records:", error);
      setFetchError(error.message || 'Failed to fetch records. Please check permissions.');
      setLoading(false);
    });
    
    return unsub;
  }, [currentUser]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteDoc(doc(db, 'documentSubmissionReport', id));
      } catch (err) {
        console.error("Error deleting record: ", err);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !editingRecord.id) return;
    
    try {
      const docRef = doc(db, 'documentSubmissionReport', editingRecord.id);
      const payload = {
        ...editingRecord,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.displayName || currentUser?.email || 'Unknown Staff',
      };
      // We don't want to overwrite createdAt or id, but spreading is fine since we update what we need.
      delete payload.id;
      delete payload.createdAt;
      
      await updateDoc(docRef, payload as any);
      setEditingRecord(null);
    } catch (err) {
      console.error("Error updating record: ", err);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        (r.accountNo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.documentType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.otherType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.submittedTo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.status || '').toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter ? r.status === statusFilter : true;
      const matchesDocType = docTypeFilter ? r.documentType === docTypeFilter : true;
      const matchesOffice = officeFilter ? r.submittedTo === officeFilter : true;
      
      return matchesSearch && matchesStatus && matchesDocType && matchesOffice;
    });
  }, [records, searchQuery, statusFilter, docTypeFilter, officeFilter]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Returned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Received': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Export functions
  const exportCSV = () => {
    const csv = Papa.unparse(filteredRecords.map(r => ({
      Account_No: r.accountNo,
      Customer_Name: r.customerName,
      Document_Type: r.documentType === 'Others' ? r.otherType : r.documentType,
      Entry_Date: r.entryDate,
      Submission_Date: r.submissionDate,
      Submitted_To: r.submittedTo,
      Status: r.status,
      Submitted_By: r.submittedBy
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Document_Submission_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRecords.map(r => ({
      'Account No': r.accountNo,
      'Customer Name': r.customerName,
      'Document Type': r.documentType === 'Others' ? r.otherType : r.documentType,
      'Entry Date': r.entryDate,
      'Submission Date': r.submissionDate,
      'Submitted To': r.submittedTo,
      'Status': r.status,
      'Submitted By': r.submittedBy,
      'Remarks': r.remarks
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Submissions");
    XLSX.writeFile(wb, "Document_Submission_Report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('Document Submission Report', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Sl No', 'Account No', 'Customer Name', 'Doc Type', 'Submission Date', 'Office', 'Status']],
      body: filteredRecords.map((r, i) => [
        i + 1,
        r.accountNo,
        r.customerName,
        r.documentType === 'Others' ? (r.otherType || '') : r.documentType,
        r.submissionDate,
        r.submittedTo,
        r.status
      ]),
    });
    doc.save('Document_Submission_Report.pdf');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Submission Report</h2>
          <p className="text-neutral-500 mt-1 font-medium">View, search, and manage submitted documents.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={exportExcel} className="flex items-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-bold border border-green-200 transition-colors text-sm"><FileSpreadsheet className="w-4 h-4 mr-2"/> Excel</button>
          <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold border border-blue-200 transition-colors text-sm"><FileText className="w-4 h-4 mr-2"/> CSV</button>
          <button onClick={exportPDF} className="flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-bold border border-red-200 transition-colors text-sm"><Download className="w-4 h-4 mr-2"/> PDF</button>
          <button onClick={printReport} className="flex items-center px-4 py-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg font-bold border border-neutral-200 transition-colors text-sm"><Printer className="w-4 h-4 mr-2"/> Print</button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Search anything..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm">
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Received">Received</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
          <option value="Returned">Returned</option>
        </select>
        <select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm">
          <option value="">All Document Types</option>
          <option value="Duplicate Passbook">Duplicate Passbook</option>
          <option value="Revival">Revival</option>
          <option value="Nomination Change">Nomination Change</option>
          <option value="Name Change">Name Change</option>
          <option value="Address Change">Address Change</option>
          <option value="Mobile Number Change">Mobile Number Change</option>
          <option value="Account Closure">Account Closure</option>
          <option value="Account Transfer">Account Transfer</option>
          <option value="KYC Update">KYC Update</option>
          <option value="Signature Update">Signature Update</option>
          <option value="Others">Others</option>
        </select>
        <select value={officeFilter} onChange={(e) => setOfficeFilter(e.target.value)} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm">
          <option value="">All Offices</option>
          <option value="Dhenkanal HO">Dhenkanal HO</option>
          <option value="Division Office">Division Office</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 font-bold">Sl No</th>
                <th className="px-6 py-4 font-bold">Account No</th>
                <th className="px-6 py-4 font-bold">Customer Name</th>
                <th className="px-6 py-4 font-bold">Document Type</th>
                <th className="px-6 py-4 font-bold">Entry Date</th>
                <th className="px-6 py-4 font-bold">Office</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-neutral-500">Loading records...</td></tr>
              ) : fetchError ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-red-500 font-bold">{fetchError}</td></tr>
              ) : paginatedRecords.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-neutral-500">No records found.</td></tr>
              ) : (
                paginatedRecords.map((r, i) => (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">{(currentPage - 1) * rowsPerPage + i + 1}</td>
                    <td className="px-6 py-4 font-medium text-neutral-900">{r.accountNo}</td>
                    <td className="px-6 py-4 font-bold text-neutral-700">{r.customerName}</td>
                    <td className="px-6 py-4">
                      {r.documentType === 'Others' ? (
                        <span className="text-neutral-500 italic">{r.otherType}</span>
                      ) : (
                        r.documentType
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-500">{r.entryDate}</td>
                    <td className="px-6 py-4">
                      {r.submittedTo}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center print:hidden">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => setViewingRecord(r)} className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser?.email === 'tukukalandi@gmail.com' && (
                          <>
                            <button onClick={() => setEditingRecord(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => r.id && handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50 print:hidden">
          <div className="flex items-center text-sm text-neutral-600">
            Show 
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="mx-2 border border-neutral-300 rounded px-2 py-1 bg-white outline-none">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>
          <div className="flex items-center space-x-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border border-neutral-300 rounded bg-white text-sm font-medium disabled:opacity-50 hover:bg-neutral-100">Prev</button>
            <span className="text-sm font-medium text-neutral-700 px-2">Page {currentPage} of {totalPages || 1}</span>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border border-neutral-300 rounded bg-white text-sm font-medium disabled:opacity-50 hover:bg-neutral-100">Next</button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
              <h3 className="text-xl font-bold text-neutral-900">Edit Record</h3>
              <button onClick={() => setEditingRecord(null)} className="text-neutral-500 hover:text-red-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="edit-form" onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700">Account No</label>
                  <input type="text" value={editingRecord.accountNo} onChange={e => setEditingRecord({...editingRecord, accountNo: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700">Customer Name</label>
                  <input type="text" value={editingRecord.customerName} onChange={e => setEditingRecord({...editingRecord, customerName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700">Status</label>
                  <select value={editingRecord.status} onChange={e => setEditingRecord({...editingRecord, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none">
                    <option value="Pending">Pending</option>
                    <option value="Received">Received</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-neutral-700">Remarks</label>
                  <textarea value={editingRecord.remarks || ''} onChange={e => setEditingRecord({...editingRecord, remarks: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" rows={3}></textarea>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50">
              <button onClick={() => setEditingRecord(null)} className="px-5 py-2 font-bold text-neutral-600 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50">Cancel</button>
              <button type="submit" form="edit-form" className="px-5 py-2 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
              <h3 className="text-xl font-bold text-neutral-900">View Record Details</h3>
              <button onClick={() => setViewingRecord(null)} className="text-neutral-500 hover:text-red-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Account No</p>
                  <p className="font-medium text-neutral-900">{viewingRecord.accountNo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Customer Name</p>
                  <p className="font-medium text-neutral-900">{viewingRecord.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Document Type</p>
                  <p className="font-medium text-neutral-900">{viewingRecord.documentType === 'Others' ? viewingRecord.otherType : viewingRecord.documentType}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Status</p>
                  <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-bold border ${getStatusColor(viewingRecord.status)}`}>
                    {viewingRecord.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Entry Date</p>
                  <p className="font-medium text-neutral-900">{viewingRecord.entryDate}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Submission Date</p>
                  <p className="font-medium text-neutral-900">{viewingRecord.submissionDate}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Submitted To</p>
                  <p className="font-medium text-neutral-900">{viewingRecord.submittedTo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase">Submitted By</p>
                  <p className="font-medium text-neutral-900">{viewingRecord.submittedBy}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-100">
                <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Remarks</p>
                <p className="font-medium text-neutral-900 bg-neutral-50 p-3 rounded-lg border border-neutral-100">{viewingRecord.remarks || 'No remarks provided.'}</p>
              </div>
            </div>
            <div className="p-5 border-t border-neutral-100 flex justify-end gap-3 bg-neutral-50">
              <button onClick={() => setViewingRecord(null)} className="px-5 py-2 font-bold text-white bg-neutral-800 rounded-xl hover:bg-neutral-900">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
