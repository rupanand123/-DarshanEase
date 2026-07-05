import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Compass, 
  MapPin, 
  Ticket, 
  Calendar, 
  User, 
  LogOut, 
  LogIn, 
  ShieldAlert, 
  Menu, 
  X,
  Bell,
  Heart
} from "lucide-react";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  setCurrentTab, 
  onOpenNotifications, 
  unreadCount 
}) => {
  const { user, logout, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleRoleChange = async (role: "devotee" | "temple_admin" | "super_admin") => {
    await loginAsDemo(role);
    setShowRoleSelector(false);
    if (role === "super_admin" || role === "temple_admin") {
      setCurrentTab("admin");
    } else {
      setCurrentTab("home");
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Compass },
    { id: "temples", label: "Temples", icon: MapPin },
    { id: "bookings", label: "My Bookings", icon: Calendar, protected: true },
    { id: "profile", label: "Profile", icon: User, protected: true },
    { id: "contact", label: "Contact", icon: Compass },
  ];

  // Filter items based on auth state
  const visibleNavItems = navItems.filter(item => {
    if (item.protected && !user) return false;
    return true;
  });

  return (
    <header className="sticky top-4 z-40 max-w-7xl mx-auto w-[calc(100%-2rem)] bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden mb-6 mt-4">
      {/* Quick Role Switcher Banner */}
      <div className="bg-saffron-600 text-white text-xs py-1.5 px-4 flex justify-between items-center font-sans">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-gold-300 animate-pulse" />
          <span>Reviewer Mode: Quickly switch roles to test full capabilities!</span>
        </span>
        <div className="relative">
          <button 
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="bg-white/15 hover:bg-white/25 transition-all px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border border-white/20"
          >
            Current: {user ? user.role.replace("_", " ") : "Guest"} ▾
          </button>
          
          {showRoleSelector && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white text-gray-800 rounded-lg shadow-xl border border-saffron-100 overflow-hidden z-50">
              <div className="bg-saffron-50 px-3 py-1.5 border-b border-saffron-100 text-[10px] font-bold text-saffron-700 tracking-wider uppercase">
                Switch Application Role
              </div>
              <button 
                onClick={() => handleRoleChange("devotee")}
                className="w-full text-left px-4 py-2 text-xs hover:bg-saffron-50 transition-colors flex items-center gap-2 border-b border-gray-50"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Devotee (User View)</span>
              </button>
              <button 
                onClick={() => handleRoleChange("temple_admin")}
                className="w-full text-left px-4 py-2 text-xs hover:bg-saffron-50 transition-colors flex items-center gap-2 border-b border-gray-50"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Temple Admin</span>
              </button>
              <button 
                onClick={() => handleRoleChange("super_admin")}
                className="w-full text-left px-4 py-2 text-xs hover:bg-saffron-50 transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-saffron-600"></span>
                <span>Super Admin (Full Access)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab("home")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-[#FF9933] to-[#D4AF37] rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Ticket className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-display tracking-tight text-gradient">
                DarshanEase
              </span>
              <p className="text-[9px] text-saffron-600 font-sans tracking-widest uppercase -mt-1">
                Divine Journey with Ease
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive 
                      ? "bg-saffron-50 text-saffron-700 shadow-xs border border-saffron-100" 
                      : "text-gray-600 hover:text-saffron-600 hover:bg-saffron-50/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            {/* Admin panel button if user is admin */}
            {user && (user.role === "temple_admin" || user.role === "super_admin") && (
              <button
                onClick={() => setCurrentTab("admin")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                  currentTab === "admin"
                    ? "bg-amber-100 text-amber-800 border border-amber-200 shadow-xs"
                    : "text-amber-700 hover:text-amber-950 hover:bg-amber-50"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* User Session Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notification trigger */}
            {user && (
              <button 
                onClick={onOpenNotifications}
                className="relative p-2 text-gray-500 hover:text-saffron-600 hover:bg-saffron-50 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-saffron-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div 
                  onClick={() => setCurrentTab("profile")}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {user.photo ? (
                    <img 
                      src={user.photo} 
                      alt={user.name} 
                      className="w-8.5 h-8.5 rounded-full object-cover border border-saffron-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8.5 h-8.5 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center font-bold text-xs border border-saffron-200">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-gray-800 leading-none">
                      {user.name}
                    </p>
                    <span className="text-[9px] font-bold text-saffron-600 tracking-wider uppercase">
                      {user.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab("login")}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-saffron-600 hover:bg-saffron-50 rounded-full transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab("register")}
                  className="px-4 py-2 bg-gradient-saffron text-white text-xs font-semibold rounded-full shadow-md shadow-saffron-200 hover:shadow-lg transition-all"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              <button 
                onClick={onOpenNotifications}
                className="relative p-2 text-gray-500 hover:text-saffron-600 rounded-full"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-saffron-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-saffron-600 hover:bg-saffron-50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-saffron-100 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
                    currentTab === item.id
                      ? "bg-saffron-50 text-saffron-700"
                      : "text-gray-600 hover:bg-saffron-50/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}

            {user && (user.role === "temple_admin" || user.role === "super_admin") && (
              <button
                onClick={() => {
                  setCurrentTab("admin");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
                  currentTab === "admin" ? "bg-amber-50 text-amber-800" : "text-amber-700"
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                Admin Dashboard
              </button>
            )}

            <div className="pt-4 border-t border-saffron-100 px-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {user.photo ? (
                      <img 
                        src={user.photo} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{user.name}</h4>
                      <p className="text-[10px] font-bold text-saffron-600 tracking-wider uppercase">
                        {user.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setCurrentTab("login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 border border-saffron-200 text-saffron-600 text-xs font-semibold rounded-xl text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTab("register");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 bg-gradient-saffron text-white text-xs font-semibold rounded-xl text-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
