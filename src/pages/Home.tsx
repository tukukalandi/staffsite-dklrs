import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { UserCircle, MapPin, Mail, Phone, Award } from "lucide-react";
import { cn } from "../lib/utils";

const STAFF_LIST = [
  {
    id: "bibhuti",
    name: "Bibhuti Bhusan Naik",
    title: "Sub Postmaster (SPM)",
    branch: "Dhenkanal RS SO",
    role: "Head of Office",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "kalandi",
    name: "Kalandi Charan Sahoo",
    title: "Postal Assistant (PA)",
    branch: "Dhenkanal RS SO",
    role: "Operations",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "bharat",
    name: "Bharat Bhutia",
    title: "Postman",
    branch: "Dhenkanal RS SO",
    role: "Delivery",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "tulasi",
    name: "Tulasi Behera",
    title: "MTS",
    branch: "Dhenkanal RS SO",
    role: "Support",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export function Home() {
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staffPhotos"), (snapshot) => {
      const p: Record<string, string> = {};
      snapshot.forEach((doc) => {
        p[doc.id] = doc.data().photoData;
      });
      setPhotos(p);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] shadow-2xl bg-white border border-neutral-200">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500"></div>
        {/* Abstract pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width=\\"60\\" height=\\"60\\" viewBox=\\"0 0 60 60\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"none\\" fill-rule=\\"evenodd\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\"%3E%3Cpath d=\\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        ></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 md:mt-0 md:mr-0 opacity-10">
          <Mail className="w-64 h-64 md:w-[400px] md:h-[400px] transform rotate-12" />
        </div>

        <div className="relative z-10 p-6 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/90 text-red-900 px-4 py-1.5 rounded-full text-sm font-bold mb-4 sm:mb-6 shadow-sm">
              <MapPin className="w-4 h-4" />
              <span className="uppercase tracking-wider">
                Dhenkanal, Odisha 759013
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-6 tracking-tight text-white drop-shadow-sm leading-tight">
              India Post <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400 drop-shadow-none">
                Dhenkanal RS SO
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-red-50 leading-relaxed max-w-2xl mb-6 sm:mb-10 font-medium">
              Dak Sewa Jan Sewa. Providing reliable, efficient, and accessible
              postal, financial, and insurance services to our community.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md rounded-2xl p-4 sm:p-5 flex items-center border border-white/10 shadow-lg">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="bg-yellow-400 text-red-700 p-2 sm:p-3 rounded-xl shadow-inner">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-red-200 uppercase tracking-widest font-bold mb-1">
                      National Helpline
                    </p>
                    <p className="font-extrabold text-white text-lg sm:text-xl">
                      1800 266 6868
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-black/10 hover:bg-black/20 transition-colors backdrop-blur-md rounded-2xl p-4 sm:p-5 flex items-center border border-white/10 shadow-lg">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="bg-white text-red-600 p-2 sm:p-3 rounded-xl shadow-inner">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-red-200 uppercase tracking-widest font-bold mb-1">
                      Service Excellence
                    </p>
                    <p className="font-extrabold text-white text-lg sm:text-xl">
                      Dak Karmayogi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex relative w-64 h-64 md:w-80 md:h-80 xl:w-96 xl:h-96 shrink-0 items-center justify-center bg-white rounded-full p-8 shadow-2xl">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/3/32/India_Post.svg"
              alt="India Post Logo Large"
              className="w-full h-full object-contain relative z-10"
            />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="relative">
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold uppercase tracking-widest rounded-full mb-3">
              Our Dedicated Team
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Meet the Faces Serving You
            </h2>
            <p className="text-neutral-500 mt-3 text-lg max-w-2xl">
              The hardworking staff of Dhenkanal RS SO committed to delivering
              excellence every single day.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {STAFF_LIST.map((staff, i) => (
            <div
              key={staff.id}
              className={cn(
                "bg-white rounded-[2rem] border-2 shadow-sm hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center group transform hover:-translate-y-2 relative overflow-hidden",
                staff.color.replace("bg-", "border-").split(" ")[2],
              )}
            >
              {/* Decorative top shape */}
              <div
                className={cn(
                  "absolute top-0 left-0 right-0 h-32 opacity-10 rounded-b-[3rem]",
                  staff.color.split(" ")[0],
                )}
              ></div>

              <div className="relative mb-6 mt-4">
                <div
                  className={cn(
                    "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                    staff.color.split(" ")[0],
                  )}
                ></div>
                <div
                  className={cn(
                    "w-36 h-36 rounded-full overflow-hidden flex items-center justify-center border-4 relative z-10 transition-transform duration-500 group-hover:scale-105",
                    "border-white shadow-xl bg-white",
                  )}
                >
                  {photos[staff.id] ? (
                    <img
                      src={photos[staff.id]}
                      alt={staff.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle
                      className={cn(
                        "w-20 h-20 opacity-40",
                        staff.color.split(" ")[1],
                      )}
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "absolute bottom-2 right-2 z-20 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-lg",
                    staff.color.split(" ")[0],
                    staff.color.split(" ")[1],
                  )}
                >
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors">
                {staff.name}
              </h3>
              <p className="font-semibold text-neutral-500 mb-6">
                {staff.title}
              </p>

              <div className="mt-auto w-full pt-6">
                <span
                  className={cn(
                    "inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors",
                    staff.color,
                    "group-hover:bg-transparent",
                  )}
                >
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
