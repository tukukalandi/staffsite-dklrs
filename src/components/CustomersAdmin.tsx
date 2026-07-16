import React, { useState, useRef, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-error';
import { Users, Upload, CheckCircle2, Loader2, Trash2, UserCircle } from 'lucide-react';
import { resizeImageToBase64 } from '../lib/imageUtils';

export function CustomersAdmin() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const custs: any[] = [];
      snapshot.forEach(docSnap => {
        custs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCustomers(custs);
    });
    return unsub;
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await resizeImageToBase64(file, 400, 400);
      setPhotoData(base64);
    } catch (err) {
      console.error(err);
      alert('Failed to process image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !photoData) {
      alert("Name, Address, and Photo are required.");
      return;
    }
    
    setLoading(true);
    try {
      const newId = crypto.randomUUID();
      const docRef = doc(db, 'customers', newId);
      await setDoc(docRef, {
        name,
        address,
        email,
        mobile,
        photoData,
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      
      // Reset form
      setName('');
      setAddress('');
      setEmail('');
      setMobile('');
      setPhotoData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteDoc(doc(db, 'customers', id));
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `customers/${id}`);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-neutral-100 overflow-hidden">
      <div className="p-8 border-b border-neutral-100 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" />
            Our Customers
          </h3>
          <p className="text-neutral-500 mt-2 font-medium">Manage customer details and photos.</p>
        </div>
      </div>
      
      <div className="p-8 border-b border-neutral-100 bg-neutral-50/50">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Mobile</label>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-1">Address *</label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} required className="w-full px-4 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-neutral-700 mb-2">Customer Photo *</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center overflow-hidden">
                {photoData ? (
                  <img src={photoData} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-8 h-8 text-neutral-400" />
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-neutral-300 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 shadow-sm flex items-center gap-2">
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {success ? <CheckCircle2 className="w-5 h-5" /> : null}
            {success ? 'Saved!' : 'Save Customer'}
          </button>
        </form>
      </div>

      <div className="p-8">
        <h4 className="font-bold text-neutral-800 mb-6">Existing Customers ({customers.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <div key={c.id} className="border border-neutral-200 rounded-2xl p-4 flex items-center gap-4 bg-white relative group">
              <img src={c.photoData} alt={c.name} className="w-16 h-16 rounded-full object-cover border-2 border-neutral-100 shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-neutral-900 truncate">{c.name}</p>
                <p className="text-xs text-neutral-500 truncate">{c.mobile || 'No Mobile'}</p>
                <p className="text-xs text-neutral-500 truncate">{c.address}</p>
              </div>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
