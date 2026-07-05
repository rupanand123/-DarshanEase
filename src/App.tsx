import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Temple, Booking, UserProfile, PaymentRecord, NotificationRecord } from "./types";
import { dbService } from "./services/db";

// Layout & Navigation elements
import { Header } from "./components/Header";
import { DigitalTicket } from "./components/DigitalTicket";
import { NotificationCenter } from "./components/NotificationCenter";

// Applet Pages
import { LandingPage } from "./pages/LandingPage";
import { TempleListingPage } from "./pages/TempleListingPage";
import { TempleDetailPage } from "./pages/TempleDetailPage";
import { BookingPage } from "./pages/BookingPage";
import { PaymentPage } from "./pages/PaymentPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { ContactPage } from "./pages/ContactPage";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { AdminDashboard } from "./pages/AdminDashboard";

import { Eye, X, HelpCircle, Compass } from "lucide-react";

type ActivePageType = 
  | "landing" 
  | "explore" 
  | "temple-detail" 
  | "booking-form" 
  | "payment-gateway" 
  | "my-bookings" 
  | "profile" 
  | "contact" 
  | "login" 
  | "register" 
  | "forgot-password" 
  | "admin";

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  // Page states
  const [currentPage, setCurrentPage] = useState<ActivePageType>("landing");
  
  // Storage payloads
  const [temples, setTemples] = useState<Temple[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Selection references
  const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);
  const [activeBookingData, setActiveBookingData] = useState<Partial<Booking>>({});
  const [viewingTicket, setViewingTicket] = useState<Booking | null>(null);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      dbService.getNotificationsByUser(user.userId).then(setNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    await dbService.markNotificationAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.notificationId === notificationId ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const mapPageToTab = (page: ActivePageType): string => {
    if (page === "landing") return "home";
    if (page === "explore" || page === "temple-detail" || page === "booking-form" || page === "payment-gateway") return "temples";
    if (page === "my-bookings") return "bookings";
    if (page === "profile") return "profile";
    if (page === "contact") return "contact";
    if (page === "admin") return "admin";
    if (page === "login") return "login";
    if (page === "register") return "register";
    return "home";
  };

  const handleNavigateFromHeader = (tab: string) => {
    if (tab === "home") {
      setCurrentPage("landing");
    } else if (tab === "temples") {
      setCurrentPage("explore");
    } else if (tab === "bookings") {
      setCurrentPage("my-bookings");
    } else {
      setCurrentPage(tab as any);
    }
  };

  // Load Database Records safely based on user role and auth state
  const loadDatabase = async () => {
    try {
      const allTemples = await dbService.getTemples();
      setTemples(allTemples);

      if (user) {
        if (user.role === "super_admin" || user.role === "temple_admin") {
          const [allBookings, allUsers, allPayments] = await Promise.all([
            dbService.getAllBookings().catch(e => { console.warn("Could not load bookings:", e); return []; }),
            dbService.getAllUsers().catch(e => { console.warn("Could not load users:", e); return []; }),
            dbService.getPayments().catch(e => { console.warn("Could not load payments:", e); return []; })
          ]);
          setBookings(allBookings);
          setUsers(allUsers);
          setPayments(allPayments);
        } else {
          const userBookings = await dbService.getBookingsByUser(user.userId).catch(e => {
            console.warn("Could not load user bookings:", e);
            return [];
          });
          setBookings(userBookings);
          setUsers([]);
          setPayments([]);
        }
      } else {
        setBookings([]);
        setUsers([]);
        setPayments([]);
      }
    } catch (err) {
      console.error("Error loading database records", err);
    }
  };

  // Trigger loadDatabase whenever the user auth state or role changes
  useEffect(() => {
    loadDatabase();
  }, [user]);

  // Filter user bookings or admin bookings based on permissions
  const visibleBookings = user?.role === "super_admin" || user?.role === "temple_admin"
    ? bookings 
    : bookings.filter(b => b.userId === user?.userId);

  // Navigation handlers
  const handleSelectTemple = (temple: Temple) => {
    setSelectedTemple(temple);
    setCurrentPage("temple-detail");
  };

  const handleBookNow = (templeId: string) => {
    const temple = temples.find(t => t.templeId === templeId);
    if (temple) {
      setSelectedTemple(temple);
      if (!user) {
        setCurrentPage("login");
      } else {
        setCurrentPage("booking-form");
      }
    }
  };

  const handleProceedToPayment = (bookingData: Partial<Booking>) => {
    setActiveBookingData(bookingData);
    setCurrentPage("payment-gateway");
  };

  const handlePaymentSuccess = (confirmedBooking: Booking) => {
    // Add confirmed booking directly to state
    setBookings(prev => [confirmedBooking, ...prev]);
    setCurrentPage("my-bookings");
    setViewingTicket(confirmedBooking);
  };

  // Re-book helper
  const handleRebook = (templeId: string) => {
    handleBookNow(templeId);
  };

  return (
    <div className="bg-[#FFF9F2] text-[#2D2D2D] min-h-screen flex flex-col justify-between font-sans selection:bg-saffron-100 selection:text-saffron-900">
      
      <NotificationCenter 
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* Top Header layout */}
      <Header 
        currentTab={mapPageToTab(currentPage)}
        setCurrentTab={handleNavigateFromHeader}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Main Pages router content */}
      <main className="flex-grow">
        {currentPage === "landing" && (
          <LandingPage 
            temples={temples} 
            onSelectTemple={handleSelectTemple}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === "explore" && (
          <TempleListingPage 
            temples={temples}
            onSelectTemple={handleSelectTemple}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === "temple-detail" && selectedTemple && (
          <TempleDetailPage 
            temple={selectedTemple}
            onBack={() => setCurrentPage("explore")}
            onBookNow={() => {
              if (!user) setCurrentPage("login");
              else setCurrentPage("booking-form");
            }}
          />
        )}

        {currentPage === "booking-form" && selectedTemple && (
          <BookingPage 
            temple={selectedTemple}
            onBack={() => setCurrentPage("temple-detail")}
            onProceedToPayment={handleProceedToPayment}
          />
        )}

        {currentPage === "payment-gateway" && (
          <PaymentPage 
            bookingData={activeBookingData}
            onBack={() => setCurrentPage("booking-form")}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {currentPage === "my-bookings" && (
          <MyBookingsPage 
            bookings={visibleBookings}
            onViewTicket={(bk) => setViewingTicket(bk)}
            onRebook={handleRebook}
            onRefresh={loadDatabase}
          />
        )}

        {currentPage === "profile" && (
          <UserProfilePage 
            temples={temples}
            bookings={bookings.filter(b => b.userId === user?.userId)}
            onSelectTemple={handleSelectTemple}
            onBookNow={handleBookNow}
          />
        )}

        {currentPage === "contact" && (
          <ContactPage />
        )}

        {currentPage === "login" && (
          <Login 
            onRegisterClick={() => setCurrentPage("register")}
            onForgotClick={() => setCurrentPage("forgot-password")}
            onLoginSuccess={() => {
              loadDatabase();
              setCurrentPage("landing");
            }}
          />
        )}

        {currentPage === "register" && (
          <Register 
            onLoginClick={() => setCurrentPage("login")}
            onRegisterSuccess={() => {
              loadDatabase();
              setCurrentPage("landing");
            }}
          />
        )}

        {currentPage === "forgot-password" && (
          <ForgotPassword 
            onLoginClick={() => setCurrentPage("login")}
          />
        )}

        {currentPage === "admin" && (
          <AdminDashboard 
            temples={temples}
            bookings={bookings}
            users={users}
            payments={payments}
            onRefreshAll={loadDatabase}
            onViewTicket={(bk) => setViewingTicket(bk)}
          />
        )}
      </main>

      {/* --- DIGITAL TICKET VIEW MODAL --- */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-[2rem] border border-saffron-100 shadow-2xl relative w-full max-w-sm overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header action */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setViewingTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Display receipt pass */}
            <div className="pt-6">
              <DigitalTicket booking={viewingTicket} />
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding section */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-850">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-saffron flex items-center justify-center text-white">
              <Compass className="w-4.5 h-4.5" />
            </div>
            <span className="font-display font-extrabold text-white tracking-wider text-sm">DARSHANEASE</span>
          </div>
          
          <div className="text-center sm:text-right space-y-1.5 text-xs">
            <p className="text-slate-300">Nationalized Shrines Devasthanam Slot Distribution Board.</p>
            <p className="text-[10px] text-slate-500">© 2026 DarshanEase Digital Passports Corporation. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
