import React, { useState, useRef, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { UserCircle, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { resizeImageToBase64 } from '../lib/imageUtils';

const STAFF_LIST = [
  { id: 'bibhuti', name: 'Bibhuti Bhusan Naik', title: 'SPM' },
  { id: 'kalandi', name: 'Kalandi Charan Sahoo', title: 'PA' },
  { id: 'bharat', name: 'Bharat Bhutia', title: 'Postman' },
  { id: 'tulasi', name: 'Tulasi Behera', title: 'MTS' },
];

export function StaffPhotosAdmin() {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [loadingStaffId, setLoadingStaffId] = useState<string | null>(null);
  const [successStaffId, setSuccessStaffId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staffPhotos'), (snapshot) => {
      const p: Record<string, string> = {};
      snapshot.forEach(docSnap => {
        p[docSnap.id] = docSnap.data().photoData;
      });
      setPhotos(p);
    });
    return unsub;
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStaffId) return;

    try {
      setLoadingStaffId(selectedStaffId);
      const base64 = await resizeImageToBase64(file, 400, 400);

      const docRef = doc(db, 'staffPhotos', selectedStaffId);
      await setDoc(docRef, {
        photoData: base64,
        updatedAt: new Date().toISOString()
      });

      setSuccessStaffId(selectedStaffId);
      setTimeout(() => setSuccessStaffId(null), 2000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, `staffPhotos/${selectedStaffId}`);
    } finally {
      setLoadingStaffId(null);
      setSelectedStaffId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = (staffId: string) => {
    setSelectedStaffId(staffId);
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Manage Staff Photos</h3>
          <p className="text-sm text-neutral-500 mt-1">Upload profile pictures to be displayed on the Home page.</p>
        </div>
      </div>
      <div className="p-6">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STAFF_LIST.map((staff) => (
            <div key={staff.id} className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg">
              <div className="flex-shrink-0 relative">
                {photos[staff.id] ? (
                  <img src={photos[staff.id]} alt={staff.name} className="w-16 h-16 rounded-full object-cover border border-neutral-200" />
                ) : (
                  <UserCircle className="w-16 h-16 text-neutral-300" />
                )}
                {loadingStaffId === staff.id && (
                  <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                  </div>
                )}
                {successStaffId === staff.id && (
                  <div className="absolute -bottom-1 -right-1 bg-green-50 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{staff.name}</p>
                <p className="text-xs text-neutral-500">{staff.title}</p>
              </div>
              <div>
                <button
                  onClick={() => triggerFileSelect(staff.id)}
                  disabled={loadingStaffId !== null}
                  className="p-2 text-sm text-neutral-600 hover:text-red-600 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50"
                  title="Upload Photo"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
