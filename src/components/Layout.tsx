import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Building2, Users, UserSquare2, ShieldAlert, FolderOpen, LogOut } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Official Correspondence', href: '/', icon: FileText },
  { name: 'Branch Offices', href: '/branches', icon: Building2 },
  { name: 'Our Customers', href: '/customers', icon: Users },
  { name: 'Our Agents', href: '/agents', icon: UserSquare2 },
  { name: 'Others', href: '/others', icon: FolderOpen },
  { name: 'Admin Portal', href: '/admin', icon: ShieldAlert },
];

export function Layout() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <LayoutDashboard className="h-6 w-6 text-red-600 mr-3" />
          <h1 className="text-lg font-bold text-neutral-900 leading-tight">Dhenkanal RS SO</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-red-50 text-red-700" 
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-red-600" : "text-neutral-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-neutral-200">
          <div className="text-xs text-neutral-500">
            Staff Portal v1.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-neutral-200 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-800">
            {navigation.find(n => n.href === location.pathname)?.name || 'Portal'}
          </h2>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-600">{user.displayName || user.email}</span>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="h-8 w-8 rounded-full border border-neutral-200" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleSignOut}
                  className="text-neutral-500 hover:text-red-600 p-1 rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <span className="text-sm font-medium text-neutral-500">Not signed in</span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
