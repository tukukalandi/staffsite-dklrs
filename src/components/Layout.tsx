import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Building2, Users, UserSquare2, ShieldAlert, FolderOpen, LogOut, Menu, X, Home as HomeIcon } from 'lucide-react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Official Correspondence', href: '/correspondence', icon: FileText },
  { name: 'Branch Offices', href: '/branches', icon: Building2 },
  { name: 'Our Customers', href: '/customers', icon: Users },
  { name: 'Our Agents', href: '/agents', icon: UserSquare2 },
  { name: 'Others', href: '/others', icon: FolderOpen },
  { name: 'Admin Portal', href: '/admin', icon: ShieldAlert },
];

export function Layout() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 md:w-72 bg-gradient-to-b from-red-700 to-red-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-red-600/50 bg-red-800/30">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-lg mr-3 shadow-md">
              <LayoutDashboard className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Dhenkanal RS</h1>
          </div>
          <button 
            className="lg:hidden text-red-200 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/20" 
                    : "text-red-100 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110", 
                  isActive ? "text-white" : "text-red-300 group-hover:text-red-200"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-6 border-t border-red-600/50 bg-red-800/50">
          <div className="text-xs text-red-200 font-medium opacity-80 text-center leading-relaxed">
            Department of Posts<br/>
            Government of India
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white border-b border-neutral-200 shadow-sm shrink-0">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4 text-neutral-500 hover:text-neutral-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-neutral-800">
              {navigation.find(n => n.href === location.pathname)?.name || 'Portal'}
            </h2>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-sm font-medium text-neutral-600">{user.displayName || user.email}</span>
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

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
