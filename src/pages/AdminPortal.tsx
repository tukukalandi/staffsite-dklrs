import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, ShieldAlert, Trash2, FileText, Calendar, Building2 } from 'lucide-react';
import { doc, setDoc, deleteDoc, serverTimestamp, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { uploadToGoogleDrive } from '../lib/drive';

const BRANCH_LIST = [
  'Speed Post',
  'Parcel',
  'International Mail',
  'CCS',
  'Savings',
  'PLI',
  'Philately',
  'Building',
  'Staff',
  'Accounts',
  'Stock',
  'Technology',
  'Loss/Fraud',
  'Other'
];

import { StaffPhotosAdmin } from '../components/StaffPhotosAdmin';

export function AdminPortal() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);

  const [userDocs, setUserDocs] = useState<any[]>([]);

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setUserDocs([]);
      return;
    }
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', currentUser.uid),
      orderBy('uploadDate', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserDocs(docsData);
    });
    return unsubscribe;
  }, [currentUser]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setDriveToken(credential.accessToken);
      }
    } catch (e: any) {
      console.error(e);
      setSubmitError(e.message || "Failed to login");
    }
  };

  const [formData, setFormData] = useState({
    letterNo: '',
    branch: '',
    receiptDate: '',
    description: '',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    if (!currentUser) return;
    if (!driveToken) {
      setSubmitError("Please connect your Google Drive first.");
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      // 1. Upload to Google Drive using the REST API.
      const driveUploadResult = await uploadToGoogleDrive(file, driveToken);

      // 2. Prepare the document record
      const documentId = crypto.randomUUID();
      const newDoc = {
        letterNo: formData.letterNo,
        branch: formData.branch,
        receiptDate: formData.receiptDate,
        description: formData.description,
        fileName: file.name,
        fileUrl: driveUploadResult.webViewLink,
        driveFileId: driveUploadResult.id,
        uploadDate: serverTimestamp(),
        userId: currentUser.uid,
      };

      // 3. Save to Firestore
      const docRef = doc(db, 'documents', documentId);
      try {
        await setDoc(docRef, newDoc);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `documents/${documentId}`);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          letterNo: '',
          branch: '',
          receiptDate: '',
          description: '',
        });
        setFile(null);
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'An error occurred during upload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId: string, driveFileId?: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    try {
      // 1. Delete from Firestore first
      const docRef = doc(db, 'documents', docId);
      await deleteDoc(docRef);

      // 2. Try to delete from Google Drive if we have the file ID and token
      if (driveFileId && driveToken) {
        try {
          const { deleteFromGoogleDrive } = await import('../lib/drive');
          await deleteFromGoogleDrive(driveFileId, driveToken);
        } catch (err) {
          console.error("Failed to delete from Drive: ", err);
          // Keep going even if Drive delete fails
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `documents/${docId}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden text-center p-12">
        <ShieldAlert className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">Admin Portal Authentication</h3>
        <p className="text-neutral-500 mb-6">You must sign in with Google to upload documents to Google Drive and the database.</p>
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 transition"
        >
          Sign in with Google
        </button>
        {submitError && <p className="text-red-500 mt-4 text-sm">{submitError}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Staff Photos Management */}
      <StaffPhotosAdmin />

      {/* Document Upload Management */}
      {!driveToken ? (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden text-center p-12">
          <UploadCloud className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Connect Google Drive</h3>
          <p className="text-neutral-500 mb-6">Please authorize access to Google Drive so documents can be uploaded directly.</p>
          <button
            onClick={handleLogin}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 transition"
          >
            Authorize Google Drive
          </button>
          {submitError && <p className="text-red-500 mt-4 text-sm">{submitError}</p>}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-200 bg-neutral-50">
            <h3 className="text-lg font-semibold text-neutral-900">Upload Official Document</h3>
            <p className="text-sm text-neutral-500 mt-1">Submit new letters or files to the correspondence system.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center mb-6 border border-green-200">
            <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">Document uploaded to Google Drive and saved successfully!</p>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200 text-sm">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Letter No.</label>
            <input 
              required
              type="text" 
              value={formData.letterNo}
              onChange={e => setFormData({...formData, letterNo: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="e.g. DHK/2023/102"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Date of Receipt</label>
            <input 
              required
              type="date" 
              value={formData.receiptDate}
              onChange={e => setFormData({...formData, receiptDate: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Related to which Branch</label>
          <select 
            required
            value={formData.branch}
            onChange={e => setFormData({...formData, branch: e.target.value})}
            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm"
          >
            <option value="">Select a branch</option>
            {BRANCH_LIST.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Description</label>
          <textarea 
            required
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm placeholder:text-neutral-400"
            placeholder="Briefly describe the contents of the document..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Upload Document</label>
          <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-neutral-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-red-400 hover:bg-red-50 focus:outline-none">
            <span className="flex items-center space-x-2">
              <UploadCloud className="w-6 h-6 text-neutral-600" />
              <span className="font-medium text-neutral-600">
                {file ? file.name : "Drop files to attach, or browse"}
              </span>
            </span>
            <input 
              required
              type="file" 
              name="file_upload" 
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        <div className="pt-4 border-t border-neutral-200 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Uploading to Drive & Saving...' : 'Save Document'}
          </button>
        </div>
      </form>

      {userDocs.length > 0 && (
        <div className="p-6 border-t border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Uploaded Documents</h3>
          <div className="space-y-3">
            {userDocs.map(doc => (
              <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-red-100 text-red-600 rounded-md flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900">{doc.letterNo}</h4>
                    <div className="flex items-center text-xs text-neutral-500 mt-1 space-x-2">
                       <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />{doc.receiptDate}</span>
                       <span className="text-neutral-300">|</span>
                       <span className="flex items-center"><Building2 className="h-3 w-3 mr-1" />{doc.branch}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 sm:ml-4 self-end sm:self-auto">
                  <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
                  >
                    View
                  </a>
                  <button 
                    onClick={() => handleDelete(doc.id, doc.driveFileId)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
