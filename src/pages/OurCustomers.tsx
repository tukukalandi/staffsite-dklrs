import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

export function OurCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const custs: any[] = [];
      snapshot.forEach(docSnap => {
        custs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setCustomers(custs);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-neutral-200">
        <h1 className="text-3xl font-extrabold text-neutral-900 flex items-center gap-3 tracking-tight">
          <Users className="h-10 w-10 text-blue-600" />
          Our Customers
        </h1>
        <p className="text-neutral-500 mt-2 font-medium">
          Meet our valued customers.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-neutral-200 shadow-sm">
          <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">No Customers Found</h2>
          <p className="text-neutral-500">Customer details have not been added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow group flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-blue-50 shadow-inner bg-neutral-100 flex items-center justify-center">
                {c.photoData ? (
                  <img src={c.photoData} alt={c.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                ) : (
                  <Users className="w-12 h-12 text-neutral-300" />
                )}
              </div>
              <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight mb-2">{c.name}</h3>
              
              <div className="w-full space-y-3 mt-4 text-left">
                {c.address && (
                  <div className="flex items-start gap-3 text-neutral-600">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{c.address}</span>
                  </div>
                )}
                {c.mobile && (
                  <div className="flex items-center gap-3 text-neutral-600">
                    <Phone className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-sm font-medium">{c.mobile}</span>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-3 text-neutral-600">
                    <Mail className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="text-sm font-medium">{c.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
