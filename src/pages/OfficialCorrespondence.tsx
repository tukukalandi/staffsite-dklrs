import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Building2, Search, ChevronLeft, Folder } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const BRANCH_LIST = [
  'Speed Post', 'Parcel', 'International Mail', 'CCS', 'Savings', 'PLI',
  'Philately', 'Building', 'Staff', 'Accounts', 'Stock', 'Technology',
  'Loss/Fraud', 'Other'
];

const CATEGORY_COLORS: Record<string, { bg: string, text: string, iconText: string, border: string, hoverBorder: string, groupHoverBg: string }> = {
  'Speed Post': { bg: 'bg-red-50', text: 'text-red-900', iconText: 'text-red-600', border: 'border-red-200', hoverBorder: 'hover:border-red-400', groupHoverBg: 'group-hover:bg-red-600' },
  'Parcel': { bg: 'bg-amber-50', text: 'text-amber-900', iconText: 'text-amber-600', border: 'border-amber-200', hoverBorder: 'hover:border-amber-400', groupHoverBg: 'group-hover:bg-amber-500' },
  'International Mail': { bg: 'bg-blue-50', text: 'text-blue-900', iconText: 'text-blue-600', border: 'border-blue-200', hoverBorder: 'hover:border-blue-400', groupHoverBg: 'group-hover:bg-blue-600' },
  'CCS': { bg: 'bg-emerald-50', text: 'text-emerald-900', iconText: 'text-emerald-600', border: 'border-emerald-200', hoverBorder: 'hover:border-emerald-400', groupHoverBg: 'group-hover:bg-emerald-600' },
  'Savings': { bg: 'bg-teal-50', text: 'text-teal-900', iconText: 'text-teal-600', border: 'border-teal-200', hoverBorder: 'hover:border-teal-400', groupHoverBg: 'group-hover:bg-teal-600' },
  'PLI': { bg: 'bg-purple-50', text: 'text-purple-900', iconText: 'text-purple-600', border: 'border-purple-200', hoverBorder: 'hover:border-purple-400', groupHoverBg: 'group-hover:bg-purple-600' },
  'Philately': { bg: 'bg-pink-50', text: 'text-pink-900', iconText: 'text-pink-600', border: 'border-pink-200', hoverBorder: 'hover:border-pink-400', groupHoverBg: 'group-hover:bg-pink-600' },
  'Building': { bg: 'bg-stone-50', text: 'text-stone-900', iconText: 'text-stone-700', border: 'border-stone-300', hoverBorder: 'hover:border-stone-500', groupHoverBg: 'group-hover:bg-stone-600' },
  'Staff': { bg: 'bg-indigo-50', text: 'text-indigo-900', iconText: 'text-indigo-600', border: 'border-indigo-200', hoverBorder: 'hover:border-indigo-400', groupHoverBg: 'group-hover:bg-indigo-600' },
  'Accounts': { bg: 'bg-cyan-50', text: 'text-cyan-900', iconText: 'text-cyan-600', border: 'border-cyan-200', hoverBorder: 'hover:border-cyan-400', groupHoverBg: 'group-hover:bg-cyan-600' },
  'Stock': { bg: 'bg-lime-50', text: 'text-lime-900', iconText: 'text-lime-700', border: 'border-lime-200', hoverBorder: 'hover:border-lime-400', groupHoverBg: 'group-hover:bg-lime-600' },
  'Technology': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-900', iconText: 'text-fuchsia-600', border: 'border-fuchsia-200', hoverBorder: 'hover:border-fuchsia-400', groupHoverBg: 'group-hover:bg-fuchsia-600' },
  'Loss/Fraud': { bg: 'bg-rose-50', text: 'text-rose-900', iconText: 'text-rose-600', border: 'border-rose-200', hoverBorder: 'hover:border-rose-400', groupHoverBg: 'group-hover:bg-rose-600' },
  'Other': { bg: 'bg-slate-50', text: 'text-slate-900', iconText: 'text-slate-700', border: 'border-slate-300', hoverBorder: 'hover:border-slate-500', groupHoverBg: 'group-hover:bg-slate-600' },
};
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { onAuthStateChanged } from 'firebase/auth';

export function OfficialCorrespondence() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
      if (!user) {
        setDocuments([]);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, 'documents'), orderBy('uploadDate', 'desc'));
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(docsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'documents');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const branchDocs = selectedBranch 
    ? documents.filter(doc => doc.branch === selectedBranch)
    : [];

  const filteredDocs = branchDocs.filter(doc => 
    doc.letterNo?.toLowerCase().includes(search.toLowerCase()) ||
    doc.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm">
        <h3 className="text-lg font-medium text-neutral-900 mb-1">Authentication Required</h3>
        <p className="text-neutral-500 max-w-sm mx-auto">
          Please sign in using the Admin Portal to view official correspondence.
        </p>
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-neutral-800 border-b border-neutral-200 pb-4">Correspondence Categories</h2>
        {loading ? (
          <div className="text-center p-12">
            <p className="text-neutral-500">Loading documents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {BRANCH_LIST.map(branch => {
              const count = documents.filter(d => d.branch === branch).length;
              const colors = CATEGORY_COLORS[branch] || CATEGORY_COLORS['Other'];
              return (
                <button 
                  key={branch} 
                  onClick={() => setSelectedBranch(branch)}
                  className={`${colors.bg} p-6 rounded-xl border ${colors.border} shadow-sm hover:shadow-md ${colors.hoverBorder} transition-all text-left flex flex-col group`}
                >
                  <div className={`h-12 w-12 bg-white ${colors.iconText} rounded-lg flex items-center justify-center mb-4 ${colors.groupHoverBg} group-hover:text-white transition-colors shadow-sm`}>
                    <Folder className="h-6 w-6" />
                  </div>
                  <h3 className={`font-semibold ${colors.text} line-clamp-1`} title={branch}>{branch}</h3>
                  <p className={`text-sm ${colors.iconText} mt-1 font-medium opacity-80`}>{count} document{count !== 1 ? 's' : ''}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              setSelectedBranch(null);
              setSearch('');
            }} 
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors bg-white border border-neutral-200 shadow-sm"
            title="Back to Categories"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">{selectedBranch}</h2>
            <p className="text-sm text-neutral-500">
              {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search letters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
          />
          <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-12">
          <p className="text-neutral-500">Loading documents...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm">
          <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No documents found</h3>
          <p className="text-neutral-500 max-w-sm mx-auto">
            {search ? 'Try a different search query.' : `No documents have been mapped to ${selectedBranch} yet.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{doc.letterNo}</h4>
                    <p className="text-xs text-neutral-500 flex items-center mt-0.5">
                      <Calendar className="h-3 w-3 mr-1" />
                      {doc.receiptDate ? new Date(doc.receiptDate).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="View/Download Document"
                >
                  <Download className="h-5 w-5" />
                </a>
              </div>
              
              <div className="space-y-3 flex-1 flex flex-col">
                <div className="flex items-start space-x-2 text-sm">
                  <Building2 className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                  <span className="text-neutral-700">{doc.branch}</span>
                </div>
                
                <div className="bg-neutral-50 p-3 rounded-md border border-neutral-100 text-sm text-neutral-600 flex-1 line-clamp-3">
                  {doc.description}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-400 flex justify-between">
                <span className="truncate max-w-[150px]" title={doc.fileName}>File: {doc.fileName}</span>
                <span>Uploaded: {doc.uploadDate?.toMillis ? new Date(doc.uploadDate.toMillis()).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
