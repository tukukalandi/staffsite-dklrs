import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { UserCircle, MapPin, Mail, Phone, Award } from 'lucide-react';
import { cn } from '../lib/utils';

const STAFF_LIST = [
  { id: 'bibhuti', name: 'Bibhuti Bhusan Naik', title: 'Sub Postmaster (SPM)', branch: 'Dhenkanal RS SO', role: 'Head of Office', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'kalandi', name: 'Kalandi Charan Sahoo', title: 'Postal Assistant (PA)', branch: 'Dhenkanal RS SO', role: 'Operations', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'bharat', name: 'Bharat Bhutia', title: 'Postman', branch: 'Dhenkanal RS SO', role: 'Delivery', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'tulasi', name: 'Tulasi Behera', title: 'MTS', branch: 'Dhenkanal RS SO', role: 'Support', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export function Home() {
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'staffPhotos'), (snapshot) => {
      const p: Record<string, string> = {};
      snapshot.forEach(doc => {
        p[doc.id] = doc.data().photoData;
      });
      setPhotos(p);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-amber-500 shadow-xl border border-red-700/20 text-white p-8 sm:p-12">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 md:mt-0 md:mr-0 opacity-10">
          <Mail className="w-64 h-64 md:w-96 md:h-96 transform rotate-12" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium mb-6 border border-white/30">
            <MapPin className="w-4 h-4 text-amber-200" />
            <span>Dhenkanal, Odisha 759013</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
            India Post <br/>
            <span className="text-amber-200">Dhenkanal RS SO</span>
          </h1>
          <p className="text-lg md:text-xl text-red-50 leading-relaxed max-w-2xl mb-8">
            Providing reliable, efficient, and accessible postal, financial, and insurance services to our community. Welcome to our digital portal.
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center border border-white/20">
               <div className="flex items-center space-x-3">
                 <div className="bg-white/20 p-2 rounded-lg">
                   <Phone className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <p className="text-xs text-red-100 uppercase tracking-wider font-semibold">Contact</p>
                   <p className="font-medium">1800 266 6868</p>
                 </div>
               </div>
             </div>
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center border border-white/20">
               <div className="flex items-center space-x-3">
                 <div className="bg-white/20 p-2 rounded-lg">
                   <Award className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <p className="text-xs text-red-100 uppercase tracking-wider font-semibold">Service</p>
                   <p className="font-medium">Dak Karamyogi</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Our Dedicated Team</h2>
            <p className="text-neutral-500 mt-2 text-lg">Meet the faces serving you at Dhenkanal RS SO.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAFF_LIST.map((staff) => (
            <div 
              key={staff.id} 
              className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center group transform hover:-translate-y-1"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-400 to-amber-300 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className={cn("w-32 h-32 rounded-full overflow-hidden flex items-center justify-center border-4 relative z-10 transition-colors duration-300", 
                  "border-white shadow-lg", photos[staff.id] ? "bg-white" : "bg-neutral-100")}>
                  {photos[staff.id] ? (
                    <img src={photos[staff.id]} alt={staff.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <UserCircle className="w-20 h-20 text-neutral-400" />
                  )}
                </div>
                <div className={cn("absolute bottom-0 right-0 z-20 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-white shadow-sm", staff.color)}>
                   <Award className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover:text-red-600 transition-colors">{staff.name}</h3>
              <p className="font-medium text-neutral-600 mb-4">{staff.title}</p>
              
              <div className="mt-auto w-full pt-4 border-t border-neutral-100">
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border", staff.color)}>
                  {staff.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
