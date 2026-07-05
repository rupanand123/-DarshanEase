import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Temple, Booking, UserProfile, PaymentRecord } from "../types";
import { TempleImage } from "../components/TempleImage";
import { dbService } from "../services/db";
import { QRScanner } from "../components/QRScanner";
import { 
  Building2, 
  CalendarCheck, 
  Users, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Eye, 
  TrendingUp, 
  Lock,
  Unlock,
  Sliders,
  CalendarDays,
  Clock,
  Briefcase
} from "lucide-react";
import { motion } from "motion/react";

interface AdminDashboardProps {
  temples: Temple[];
  bookings: Booking[];
  users: UserProfile[];
  payments: PaymentRecord[];
  onRefreshAll: () => void;
  onViewTicket: (booking: Booking) => void;
}

type AdminTabType = "overview" | "temples" | "bookings" | "users" | "scanner";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  temples,
  bookings,
  users,
  payments,
  onRefreshAll,
  onViewTicket
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabType>("overview");

  // Admin Verification
  const isAuthorized = user && (user.role === "temple_admin" || user.role === "super_admin");

  // State managers for managing temples CRUD
  const [editingTemple, setEditingTemple] = useState<Temple | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for adding/editing temple
  const [templeName, setTempleName] = useState("");
  const [templeLoc, setTempleLoc] = useState("");
  const [templeState, setTempleState] = useState("Andhra Pradesh");
  const [templeType, setTempleType] = useState("Vaishnavite");
  const [templeDesc, setTempleDesc] = useState("");
  const [templeHist, setTempleHist] = useState("");
  const [templePrice, setTemplePrice] = useState(100);
  const [templeImg, setTempleImg] = useState("");
  const [templeSlots, setTempleSlots] = useState<string[]>([
    "06:00 AM - 09:00 AM",
    "09:00 AM - 12:00 PM",
    "12:00 PM - 03:00 PM",
    "03:00 PM - 06:00 PM",
    "06:00 PM - 09:00 PM"
  ]);

  // Handle Edit Click
  const handleStartEdit = (temp: Temple) => {
    setEditingTemple(temp);
    setTempleName(temp.name);
    setTempleLoc(temp.location);
    setTempleState(temp.state);
    setTempleType(temp.type);
    setTempleDesc(temp.description);
    setTempleHist(temp.history);
    setTemplePrice(temp.ticketPrice);
    setTempleImg(temp.image);
    setTempleSlots(temp.availableSlots);
    setShowAddForm(true);
  };

  // Handle Create or Update Temple
  const handleSaveTempleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const templePayload: Temple = {
      templeId: editingTemple ? editingTemple.templeId : "temple-" + Date.now(),
      name: templeName,
      location: templeLoc,
      state: templeState,
      type: templeType,
      description: templeDesc,
      history: templeHist,
      openingTime: "04:00 AM",
      closingTime: "09:30 PM",
      rating: editingTemple ? editingTemple.rating : 4.5,
      ticketPrice: Number(templePrice),
      availableSlots: templeSlots,
      darshanTypes: editingTemple ? editingTemple.darshanTypes : [
        { name: "Free Dharma Darshan", price: 0, description: "Standard temple entry." },
        { name: "Special Entry Darshan", price: Number(templePrice), description: "Expedited entry with Laddu prasadam." },
        { name: "VIP VIP Entry", price: Number(templePrice) * 3, description: "Immediate access with direct pooja passes." }
      ],
      rules: editingTemple ? editingTemple.rules : [
        "Dress code is traditional wear only.",
        "Mobile phones are strictly prohibited inside the main shrine area."
      ],
      facilities: editingTemple ? editingTemple.facilities : ["Locker Facility", "Prasadam Stalls", "Annaprasadam Hall"],
      image: templeImg || "https://images.unsplash.com/photo-1601281372690-df4f09d8544d?auto=format&fit=crop&q=80&w=600",
      images: [templeImg || "https://images.unsplash.com/photo-1601281372690-df4f09d8544d?auto=format&fit=crop&q=80&w=600"],
      popular: editingTemple ? editingTemple.popular : false
    };

    await dbService.saveTemple(templePayload);
    
    // Clear forms
    setShowAddForm(false);
    setEditingTemple(null);
    clearForm();
    onRefreshAll();
    alert("Temple configuration saved successfully!");
  };

  const clearForm = () => {
    setTempleName("");
    setTempleLoc("");
    setTempleDesc("");
    setTempleHist("");
    setTemplePrice(100);
    setTempleImg("");
  };

  // Delete Temple
  const handleDeleteTemple = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this temple?")) return;
    await dbService.deleteTemple(id);
    onRefreshAll();
  };

  // Manage Bookings State Updates
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: "Upcoming" | "Completed" | "Cancelled") => {
    const b = bookings.find(b => b.bookingId === bookingId);
    if (b) {
      const updated = { ...b, bookingStatus: newStatus };
      await dbService.saveBooking(updated);
      
      // Notify user about status adjustment
      const notification = {
        notificationId: "NOTIF-" + Date.now(),
        userId: b.userId,
        title: `Darshan Status Update 🪔`,
        message: `Your booking ID: ${b.bookingId} for ${b.templeName} has been updated to: ${newStatus}.`,
        time: new Date().toISOString(),
        read: false,
        type: newStatus === "Cancelled" ? "cancellation" as const : "booking" as const
      };
      await dbService.createNotification(notification);

      onRefreshAll();
    }
  };

  // Manage User Toggles (Disable/Enable User)
  const handleToggleUserStatus = async (userProfile: UserProfile) => {
    const updatedRole = userProfile.role === "devotee" ? "temple_admin" : "devotee"; // Toggle or mock active block status
    const isDeactivating = userProfile.role !== "devotee";
    
    const updatedUser = { 
      ...userProfile, 
      role: updatedRole as any // simple toggle demonstration
    };

    await dbService.saveUserProfile(updatedUser);
    onRefreshAll();
    alert(`Devotee ${userProfile.name} role changed to ${updatedRole}`);
  };

  // Overview calculations
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === "Paid")
    .reduce((sum, b) => sum + b.price, 0);

  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayBookingsCount = bookings.filter(b => b.date === todayDateStr).length;

  if (!isAuthorized) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-[2rem] border border-saffron-100 shadow-xl max-w-md text-center space-y-4">
          <Lock className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold font-display text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            You require Administrative clearance to access this panel. If you are a reviewer, please click the <span className="font-bold text-saffron-600">Reviewer Mode</span> button at the top banner to swap to Temple Admin or Super Admin instantly!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header summary info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {user.role.replace("_", " ")} Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight mt-1.5">Devasthanam Control Panel</h1>
            <p className="text-gray-500 text-xs">
              Manage temple registries, available slots, devotee entries, and verify transaction receipts.
            </p>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex border-b border-gray-200">
          {(["overview", "temples", "bookings", "users", "scanner"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-xs sm:text-sm font-bold border-b-2 uppercase tracking-wide transition-all ${
                  isActive 
                    ? "border-saffron-500 text-saffron-700 font-extrabold" 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "scanner" ? "Ticket QR Scanner" : tab}
              </button>
            );
          })}
        </div>

        {/* --- 1. OVERVIEW STATISTICS PANEL --- */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Today's Slots</span>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-gray-800 block">{todayBookingsCount}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Total Shrines</span>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-gray-800 block">{temples.length}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Total Revenue</span>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-gray-800 block">₹{totalRevenue}</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Total Devotees</span>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-gray-800 block">{users.length}</span>
                </div>
              </div>
            </div>

            {/* Visual SVG Charting - Golden Revenue Trend */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Revenue Area Chart */}
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs text-left space-y-4 lg:col-span-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Income Stream Velocity</h3>
                    <span className="text-[10px] text-gray-400">Weekly checkout revenue logging</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+24.5% Growth</span>
                  </div>
                </div>

                {/* Pure Custom SVG Sparkline Area Chart */}
                <div className="h-56 relative w-full pt-4">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f26d0f" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f5b316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    
                    {/* Chart Area Fill */}
                    <path 
                      d="M 0 150 L 0 120 L 80 100 L 160 110 L 240 60 L 320 80 L 400 40 L 500 20 L 500 150 Z" 
                      fill="url(#chartGrad)" 
                    />
                    
                    {/* Chart Line */}
                    <path 
                      d="M 0 120 Q 40 110 80 100 Q 120 105 160 110 Q 200 85 240 60 Q 280 70 320 80 Q 360 60 400 40 Q 450 30 500 20" 
                      fill="none" 
                      stroke="#f26d0f" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Chart X axis markers */}
                  <div className="flex justify-between text-[10px] text-gray-400 font-mono font-semibold mt-1">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Booking breakdown by categories */}
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xs text-left space-y-4">
                <h3 className="font-bold text-gray-900 text-sm">Pass Categories Volume</h3>
                
                <div className="space-y-4 pt-3 text-xs font-semibold">
                  {/* Special Entry */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-700">
                      <span>Special Entry (₹300)</span>
                      <span>{bookings.filter(b => b.darshanType.includes("Special")).length} passes</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-saffron-500 rounded-full" style={{ width: "55%" }} />
                    </div>
                  </div>

                  {/* VIP Entry */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-700">
                      <span>VIP VIP Entry</span>
                      <span>{bookings.filter(b => b.darshanType.includes("VIP")).length} passes</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "25%" }} />
                    </div>
                  </div>

                  {/* Free Entry */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-gray-700">
                      <span>Free Dharma Entry</span>
                      <span>{bookings.filter(b => b.darshanType.includes("Free") || b.price === 0).length} passes</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. MANAGE TEMPLES CRUD PANEL --- */}
        {activeTab === "temples" && (
          <div className="space-y-6 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-base sm:text-lg font-bold font-display text-gray-900">Registered Temple Registry</h3>
              <button
                onClick={() => {
                  setEditingTemple(null);
                  clearForm();
                  setShowAddForm(!showAddForm);
                }}
                className="px-4 py-2 bg-gradient-saffron hover:bg-saffron-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-saffron-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {showAddForm ? "Close Form" : "Add New Temple"}
              </button>
            </div>

            {/* Add or Edit Temple Form block */}
            {showAddForm && (
              <form onSubmit={handleSaveTempleSubmit} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100 shadow-md grid sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="sm:col-span-2 border-b pb-2 mb-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    {editingTemple ? `Edit Shrine: ${editingTemple.name}` : "Configure New Shrine"}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700">Temple Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Somnath Temple"
                    value={templeName}
                    onChange={(e) => setTempleName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700">Location City/Town</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Veraval, Prabhas Patan"
                    value={templeLoc}
                    onChange={(e) => setTempleLoc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700">Indian State</label>
                  <select 
                    value={templeState}
                    onChange={(e) => setTempleState(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl font-bold text-gray-700"
                  >
                    <option>Andhra Pradesh</option>
                    <option>Telangana</option>
                    <option>Gujarat</option>
                    <option>Maharashtra</option>
                    <option>Tamil Nadu</option>
                    <option>Uttar Pradesh</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700">Temple Category Type</label>
                  <select 
                    value={templeType}
                    onChange={(e) => setTempleType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl font-bold text-gray-700"
                  >
                    <option>Vaishnavite</option>
                    <option>Jyotirlinga</option>
                    <option>Shakti Peetha</option>
                    <option>Vedic</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700">Special Entry Price (₹)</label>
                  <input 
                    type="number" 
                    value={templePrice}
                    onChange={(e) => setTemplePrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-700">Primary Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://images.unsplash.com/photo-..."
                    value={templeImg}
                    onChange={(e) => setTempleImg(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-gray-700">Temple Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Brief architectural history, deity details..."
                    value={templeDesc}
                    onChange={(e) => setTempleDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-gray-700">Sacred History details</label>
                  <textarea 
                    rows={3}
                    placeholder="Swayambhu legends, epic references..."
                    value={templeHist}
                    onChange={(e) => setTempleHist(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2 pt-3 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-saffron text-white rounded-xl font-bold shadow-md shadow-saffron-100"
                  >
                    Save Temple Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTemple(null);
                      clearForm();
                    }}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-250 text-gray-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            )}

            {/* Temples List table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-500">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Temple Details</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">State/Category</th>
                      <th className="px-6 py-4">Pass Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {temples.map((temp) => (
                      <tr key={temp.templeId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <TempleImage src={temp.image} alt={temp.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <h4 className="text-gray-900 font-bold text-xs">{temp.name}</h4>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {temp.templeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{temp.location}</td>
                        <td className="px-6 py-4">
                          <span className="block text-gray-800">{temp.state}</span>
                          <span className="text-[10px] text-saffron-600 font-bold uppercase">{temp.type}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-saffron-700">₹{temp.ticketPrice}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2.5 justify-end">
                            <button
                              onClick={() => handleStartEdit(temp)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                              title="Edit Temple"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemple(temp.templeId)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              title="Delete Temple"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- 3. MANAGE BOOKINGS ORDER LIST PANEL --- */}
        {activeTab === "bookings" && (
          <div className="space-y-6 text-left">
            <h3 className="text-base sm:text-lg font-bold font-display text-gray-900">Holy Devotee Bookings List</h3>
            
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-500">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Booking Ref</th>
                      <th className="px-6 py-4">Devotee Name</th>
                      <th className="px-6 py-4">Temple Destination</th>
                      <th className="px-6 py-4">Date/Slot</th>
                      <th className="px-6 py-4">Pricing/Type</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Adjust Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {bookings.map((bk) => {
                      let statusBadge = "bg-saffron-50 text-saffron-700 border-saffron-100";
                      if (bk.bookingStatus === "Completed") {
                        statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-150";
                      } else if (bk.bookingStatus === "Cancelled") {
                        statusBadge = "bg-rose-50 text-red-600 border-rose-100";
                      }

                      return (
                        <tr key={bk.bookingId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-gray-700 text-[11px] border">
                              {bk.bookingId}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-950 font-bold">{bk.userName}</div>
                            <div className="text-gray-400 text-[10px]">{bk.userEmail}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-800 font-bold truncate max-w-[150px]">
                            {bk.templeName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-800 font-bold">{bk.date}</div>
                            <div className="text-gray-400 text-[10px]">{bk.slot.split(" - ")[0]}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-saffron-700 font-bold">₹{bk.price} ({bk.persons} Dev)</div>
                            <div className="text-gray-400 text-[10px]">{bk.darshanType}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge}`}>
                              {bk.bookingStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => onViewTicket(bk)}
                                className="p-1.5 bg-saffron-50 hover:bg-saffron-100 text-saffron-600 rounded-lg transition-colors"
                                title="View/Print Pass"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {bk.bookingStatus === "Upcoming" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(bk.bookingId, "Completed")}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                    title="Mark Completed"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(bk.bookingId, "Cancelled")}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                    title="Cancel Ticket"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. MANAGE USERS PANEL --- */}
        {activeTab === "users" && (
          <div className="space-y-6 text-left">
            <h3 className="text-base sm:text-lg font-bold font-display text-gray-900">Devotee Directory Registry</h3>
            
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-500">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Devotee Details</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Contact Phone</th>
                      <th className="px-6 py-4">App Role</th>
                      <th className="px-6 py-4">Joined Since</th>
                      <th className="px-6 py-4 text-right">Toggle Administrative Power</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold">
                    {users.map((us) => (
                      <tr key={us.userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-2.5">
                          {us.photo ? (
                            <img src={us.photo} alt={us.name} className="w-8.5 h-8.5 rounded-full object-cover" />
                          ) : (
                            <div className="w-8.5 h-8.5 rounded-full bg-saffron-50 text-saffron-600 flex items-center justify-center font-bold">
                              {us.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-gray-950 font-bold">{us.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{us.email}</td>
                        <td className="px-6 py-4 text-gray-600">{us.phone || "Not specified"}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full bg-saffron-55 text-saffron-800 text-[10px] font-extrabold uppercase">
                            {us.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(us.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(us)}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold flex items-center gap-1 ml-auto transition-colors ${
                              us.role === "devotee" 
                                ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" 
                                : "bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {us.role === "devotee" ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Promote Admin</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Demote Devotee</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- 5. TICKET QR SCANNER PANEL --- */}
        {activeTab === "scanner" && (
          <QRScanner bookings={bookings} onRefreshAll={onRefreshAll} />
        )}

      </div>
    </div>
  );
};
