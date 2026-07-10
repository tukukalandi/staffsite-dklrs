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
    <div className="bg-white rounded-[2rem] shadow-xl border border-neutral-100 overflow-hidden">
      <div className="p-8 border-b border-neutral-100 bg-gradient-to-r from-red-50 to-white flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Staff Photos</h3>
          <p className="text-neutral-500 mt-2 font-medium">Manage profile pictures displayed on the Home page.</p>
        </div>
      </div>
      <div className="p-8">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STAFF_LIST.map((staff) => (
            <div key={staff.id} className="flex items-center space-x-6 p-6 border-2 border-neutral-100 hover:border-red-200 hover:shadow-md transition-all rounded-2xl group bg-neutral-50">
              <div className="flex-shrink-0 relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-sm bg-white flex items-center justify-center">
                  {photos[staff.id] ? (
                    <img src={photos[staff.id]} alt={staff.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
                  ) : (
                    <UserCircle className="w-full h-full p-2 text-neutral-300" />
                  )}
                </div>
                {loadingStaffId === staff.id && (
                  <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner mt-1 ml-1 w-20 h-20">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  </div>
                )}
                {successStaffId === staff.id && (
                  <div className="absolute -bottom-1 -right-1 bg-green-100 rounded-full p-1 shadow-sm border border-white">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-neutral-900 truncate group-hover:text-red-700 transition-colors">{staff.name}</p>
                <p className="text-sm text-neutral-500 font-medium">{staff.title}</p>
              </div>
              <div>
                <button
                  onClick={() => triggerFileSelect(staff.id)}
                  disabled={loadingStaffId !== null}
                  className="bg-white border text-red-600 hover:bg-red-600 hover:text-white border-red-200 shadow-sm p-3 rounded-full transition-colors disabled:opacity-50 hover:shadow-red-600/30 font-semibold"
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
