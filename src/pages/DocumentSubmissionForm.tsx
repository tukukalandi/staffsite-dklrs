import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

const DOCUMENT_TYPES = [
  'Duplicate Passbook',
  'Revival',
  'Nomination Change',
  'Name Change',
  'Address Change',
  'Mobile Number Change',
  'Account Closure',
  'Account Transfer',
  'KYC Update',
  'Signature Update',
  'Others'
];

const SUBMITTED_TO_OPTIONS = [
  'Dhenkanal HO',
  'Division Office',
  'Other'
];

const STATUS_OPTIONS = [
  'Pending',
  'Received',
  'Completed',
  'Rejected',
  'Returned'
];

export function DocumentSubmissionForm() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to login");
    }
  };

  const getToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    accountNo: '',
    customerName: '',
    documentType: '',
    otherType: '',
    entryDate: getToday(),
    submissionDate: getToday(),
    submittedTo: '',
    otherOffice: '',
    remarks: '',
    status: 'Pending',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError('');
    
    // Validate
    if (!/^\d+$/.test(formData.accountNo)) {
      setError('Account Number must be numeric.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        accountNo: formData.accountNo || '',
        customerName: formData.customerName || '',
        documentType: formData.documentType || '',
        otherType: formData.documentType === 'Others' ? (formData.otherType || '') : '',
        entryDate: formData.entryDate || '',
        submissionDate: formData.submissionDate || '',
        submittedTo: formData.submittedTo || '',
        otherOffice: formData.submittedTo === 'Other' ? (formData.otherOffice || '') : '',
        remarks: formData.remarks || '',
        status: formData.status || 'Pending',
        submittedBy: currentUser.displayName || currentUser.email || 'Unknown Staff',
        submittedById: currentUser.uid || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'documentSubmissionReport'), payload);
      
      setSuccess(true);
      setFormData({
        accountNo: '',
        customerName: '',
        documentType: '',
        otherType: '',
        entryDate: getToday(),
        submissionDate: getToday(),
        submittedTo: '',
        otherOffice: '',
        remarks: '',
        status: 'Pending',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden text-center p-12">
        <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Staff Authentication Required</h3>
        <p className="text-neutral-500 mb-6">Please sign in to submit documents.</p>
        <button onClick={handleLogin} className="px-6 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 transition">Sign in</button>
        {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-8 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
        <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Document Submission Form</h3>
        <p className="text-neutral-500 mt-2 font-medium">Record physical documents sent to Head Office.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center border border-green-200 shadow-sm">
            <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-bold">Record saved successfully.</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-bold border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Account Number *</label>
            <input required type="text" name="accountNo" value={formData.accountNo} onChange={handleChange} placeholder="e.g. 123456789" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Customer Name *</label>
            <input required type="text" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="e.g. John Doe" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Type of Document *</label>
            <select required name="documentType" value={formData.documentType} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all">
              <option value="">Select Document Type</option>
              {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {formData.documentType === 'Others' && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-700">Specify Type *</label>
              <input required type="text" name="otherType" value={formData.otherType} onChange={handleChange} placeholder="Specify Document Type" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Date of Entry in Finacle *</label>
            <input required type="date" name="entryDate" value={formData.entryDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Date of Submission *</label>
            <input required type="date" name="submissionDate" value={formData.submissionDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Submitted To *</label>
            <select required name="submittedTo" value={formData.submittedTo} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all">
              <option value="">Select Office</option>
              {SUBMITTED_TO_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {formData.submittedTo === 'Other' && (
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-neutral-700">Specify Office *</label>
              <input required type="text" name="otherOffice" value={formData.otherOffice} onChange={handleChange} placeholder="Specify Office Name" className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-bold text-neutral-700">Remarks (Optional)</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleChange} rows={3} placeholder="Any additional remarks..." className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-neutral-700">Submitted By</label>
            <input type="text" disabled value={currentUser.displayName || currentUser.email || 'Unknown'} className="w-full px-4 py-2.5 bg-neutral-100 border border-neutral-200 text-neutral-500 rounded-xl cursor-not-allowed" />
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-100">
          <button disabled={isSubmitting} type="submit" className="w-full sm:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 hover:shadow-red-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
