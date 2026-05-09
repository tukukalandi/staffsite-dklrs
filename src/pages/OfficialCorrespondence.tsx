import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Building2, Search } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { onAuthStateChanged } from 'firebase/auth';

export function OfficialCorrespondence() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const filteredDocs = documents.filter(doc => 
    doc.letterNo?.toLowerCase().includes(search.toLowerCase()) ||
    doc.description?.toLowerCase().includes(search.toLowerCase()) ||
    doc.branch?.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <p className="text-neutral-600">
          Showing {filteredDocs.length} recorded documents
        </p>
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
            {search ? 'Try a different search query.' : 'Use the Admin Portal to upload and record official correspondence documents.'}
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
