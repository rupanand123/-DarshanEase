import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Temple, Booking } from "../types";
import { TempleImage } from "../components/TempleImage";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Heart, 
  Settings2, 
  Save, 
  Globe2, 
  BellRing,
  HelpCircle
} from "lucide-react";
import { motion } from "motion/react";

interface UserProfilePageProps {
  temples: Temple[];
  bookings: Booking[];
  onSelectTemple: (temple: Temple) => void;
  onBookNow: (templeId: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  temples,
  bookings,
  onSelectTemple,
  onBookNow
}) => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [photo, setPhoto] = useState(user?.photo || "");
  const [isEditing, setIsEditing] = useState(false);

  // Settings configs states
  const [language, setLanguage] = useState("English");
  const [darkMode, setDarkMode] = useState(false);
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);

  if (!user) return null;

  // Filter favorite temples
  const favTemples = temples.filter(t => user.favorites?.includes(t.templeId));

  // Compute statistics
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.bookingStatus === "Upcoming").length,
    completed: bookings.filter(b => b.bookingStatus === "Completed").length,
    favoritesCount: favTemples.length
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(name, phone, photo);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 text-left">
        
        {/* Profile Card / Header */}
        <div className="bg-white rounded-3xl border border-saffron-100/50 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar block */}
            <div className="relative">
              {user.photo ? (
                <img 
                  src={user.photo} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-saffron-200 shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-saffron-100 text-saffron-700 flex items-center justify-center font-bold text-2xl border-2 border-saffron-200">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-saffron-600 font-bold bg-saffron-50 border border-saffron-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {user.role.replace("_", " ")} Devotee
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-950 mt-1">{user.name}</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-saffron-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-saffron-700 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Settings2 className="w-4 h-4" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Bookings</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-saffron-700 block">{stats.total}</span>
            <span className="text-[10px] text-gray-400 block mt-1">Visit passes ordered</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Upcoming Visits</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 block">{stats.upcoming}</span>
            <span className="text-[10px] text-gray-400 block mt-1">Confirmed queue slots</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Completed Visits</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 block">{stats.completed}</span>
            <span className="text-[10px] text-gray-400 block mt-1">Sacred holy sight visits</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Favorite Temples</span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-500 block">{stats.favoritesCount}</span>
            <span className="text-[10px] text-gray-400 block mt-1">Bookmarked sacred shrines</span>
          </div>
        </div>

        {/* Edit Profile or settings form & Favorite temples */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form / Configs */}
          <div className="lg:col-span-6 space-y-6">
            {isEditing ? (
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100 shadow-sm space-y-6">
                <h3 className="text-base sm:text-lg font-bold font-display text-gray-900 border-b border-gray-100 pb-3">Update Profile Info</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase">Devotee Full Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase">Contact Phone Number</label>
                    <input 
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase">Profile Photo URL</label>
                    <input 
                      type="url" 
                      value={photo}
                      onChange={(e) => setPhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-saffron text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-saffron-100"
                  >
                    <Save className="w-4 h-4" />
                    Save Profile Changes
                  </button>
                </form>
              </div>
            ) : (
              /* Settings configs */
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xs space-y-6">
                <h3 className="text-base sm:text-lg font-bold font-display text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-saffron-600" />
                  Devasthanam Preference Settings
                </h3>
                
                <div className="space-y-4 text-xs">
                  {/* Select Language */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5">
                        <Globe2 className="w-4 h-4 text-saffron-600" />
                        Display Language
                      </span>
                      <p className="text-gray-400 text-[10px]">Preferred translation text for listings.</p>
                    </div>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-gray-700 text-xs"
                    >
                      <option>English</option>
                      <option>हिन्दी (Hindi)</option>
                      <option>తెలుగు (Telugu)</option>
                      <option>தமிழ் (Tamil)</option>
                    </select>
                  </div>

                  {/* Dark mode selector */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-800">Visual Dark Mode</span>
                      <p className="text-gray-400 text-[10px]">Toggles comfortable dark color themes.</p>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? "bg-saffron-600" : "bg-gray-200"}`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${darkMode ? "right-1" : "left-1"}`} />
                    </button>
                  </div>

                  {/* Notification Booking Config */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5">
                        <BellRing className="w-4 h-4 text-saffron-600" />
                        Booking Confirmation Alerts
                      </span>
                      <p className="text-gray-400 text-[10px]">Receive instant app notifications for bookings.</p>
                    </div>
                    <button 
                      onClick={() => setNotifBooking(!notifBooking)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${notifBooking ? "bg-saffron-600" : "bg-gray-200"}`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifBooking ? "right-1" : "left-1"}`} />
                    </button>
                  </div>

                  {/* Notification Reminders Config */}
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-800">Visit Schedule Reminders</span>
                      <p className="text-gray-400 text-[10px]">Get notified 2 hours before your scheduled slot.</p>
                    </div>
                    <button 
                      onClick={() => setNotifReminder(!notifReminder)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${notifReminder ? "bg-saffron-600" : "bg-gray-200"}`}
                    >
                      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifReminder ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Favorite Temples */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-display text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-1.5">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                Bookmarked Shrines
              </h3>

              {favTemples.length === 0 ? (
                <div className="text-center py-10 text-gray-400 space-y-1 text-xs">
                  <HelpCircle className="w-8 h-8 text-saffron-300 mx-auto" />
                  <p className="font-bold">No bookmarks yet</p>
                  <p>Browse temples and click the heart icon to save favorite shrines.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favTemples.map((temple) => (
                    <div 
                      key={temple.templeId}
                      className="p-3 border border-gray-50 hover:border-saffron-100 rounded-2xl bg-gray-50/50 flex justify-between items-center gap-4 text-xs transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <TempleImage 
                          src={temple.image} 
                          alt={temple.name} 
                          className="w-12 h-12 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left space-y-0.5">
                          <h4 className="font-bold text-gray-900 truncate max-w-[200px]">{temple.name}</h4>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-saffron-500" />
                            {temple.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSelectTemple(temple)}
                          className="px-2.5 py-1.5 bg-white border border-gray-150 hover:bg-saffron-50 text-gray-700 hover:text-saffron-700 rounded-xl font-bold transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onBookNow(temple.templeId)}
                          className="px-2.5 py-1.5 bg-gradient-saffron text-white rounded-xl font-bold hover:opacity-95 transition-opacity"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
