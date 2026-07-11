import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  UserSquare2,
  ShieldAlert,
  FolderOpen,
  LogOut,
  Menu,
  X,
  Home as HomeIcon,
  Moon,
  Sun,
  Clock,
  CalendarDays
} from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { cn } from "../lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Official Correspondence", href: "/correspondence", icon: FileText },
  { name: "Branch Offices", href: "/branches", icon: Building2 },
  { name: "Our Customers", href: "/customers", icon: Users },
  { name: "Our Agents", href: "/agents", icon: UserSquare2 },
  { name: "Others", href: "/others", icon: FolderOpen },
  { name: "Admin Portal", href: "/admin", icon: ShieldAlert },
  { name: "Submit Document", href: "/doc-submission", icon: FileText },
  { name: "Document Report", href: "/doc-report", icon: FolderOpen },
];

export function Layout() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Top Info Bar */}
      <div className="bg-neutral-800 text-neutral-300 text-[11px] sm:text-xs py-1.5 px-4 flex justify-between items-center shrink-0 z-20">
        <div className="font-medium tracking-wide flex items-center gap-4">
          <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5"/> {currentTime.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {currentTime.toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-1.5 hover:text-white transition-colors p-1 rounded hover:bg-neutral-700 font-medium"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b-4 border-red-600 py-2 sm:py-3 px-4 lg:px-8 flex justify-between items-center shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            className="lg:hidden p-2 -ml-2 text-neutral-600 hover:text-red-600 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="Emblem of India"
              className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col border-l-2 border-neutral-200 pl-2 sm:pl-3">
              <span className="text-lg sm:text-2xl font-extrabold text-neutral-800 tracking-tight leading-none uppercase">
                India Post
              </span>
              <span className="text-[9px] sm:text-[11px] font-bold text-neutral-600 tracking-widest uppercase mt-0.5">
                Dhenkanal RS SO
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center justify-center mr-2 opacity-100 hover:opacity-90 transition-opacity">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/3/32/India_Post.svg"
              alt="India Post Logo"
              className="h-10 sm:h-12 object-contain"
            />
          </div>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-neutral-800 leading-tight">
                  {user.displayName || "Staff Member"}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
                  {user.email}
                </span>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-red-100 shadow-sm object-cover bg-white"
                />
              ) : (
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-red-100">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="ml-1 text-neutral-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="text-sm font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 px-4 py-2 rounded-md transition-colors border border-red-200 hover:border-red-600 shadow-sm"
            >
              Staff Login
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 z-50 w-64 md:w-72 bg-gradient-to-b from-white to-neutral-50 border-r border-neutral-200 shadow-2xl lg:static lg:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col",
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-neutral-100 bg-white">
            <span className="font-bold text-neutral-800 uppercase tracking-wider text-sm">
              Navigation
            </span>
            <button
              className="p-2 -mr-2 text-neutral-500 hover:text-red-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 group relative border shadow-sm",
                    isActive
                      ? "bg-red-600 text-white border-red-700 shadow-red-600/20"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-red-300 hover:text-red-600 hover:shadow-md",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                      isActive
                        ? "text-white"
                        : "text-red-600 group-hover:text-red-600",
                    )}
                  />
                  {item.name}
                  <div
                    className={cn(
                      "ml-auto w-1.5 h-1.5 rounded-full transition-colors",
                      isActive
                        ? "bg-white"
                        : "bg-transparent group-hover:bg-red-300",
                    )}
                  ></div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-1.5">
                <ShieldAlert className="w-4 h-4" /> Official Portal
              </div>
              <p className="text-xs text-red-600/80 leading-relaxed font-medium">
                Welcome to Dhenkanal RS SO intra-office management system.
              </p>
            </div>
          </div>
        </div>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto bg-[#F4F6F8] lg:rounded-tl-[2rem] lg:border-t-4 lg:border-l-4 lg:border-neutral-200/50 flex flex-col relative">
          {/* Subtle breadcrumb/page title area for the active route */}
          <div className="h-14 border-b border-neutral-200/60 bg-white/60 backdrop-blur-xl px-4 lg:px-8 flex items-center shrink-0 sticky top-0 z-10 hidden sm:flex">
            <div className="flex items-center text-sm text-neutral-500 font-bold tracking-wide">
              <Link
                to="/"
                className="hover:text-red-600 flex items-center transition-colors"
              >
                <HomeIcon className="w-4 h-4 mr-1.5" /> Dashboard
              </Link>
              <span className="mx-3 text-neutral-300">/</span>
              <span className="text-neutral-800 flex items-center">
                {navigation.find((n) => n.href === location.pathname)?.name ||
                  "Portal"}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
