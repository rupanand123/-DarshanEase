import React, { useState } from "react";
import { Booking } from "../types";
import { dbService } from "../services/db";
import { Calendar, CheckCircle2, XCircle, Clock, Eye, Download, Undo, Compass, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface MyBookingsPageProps {
  bookings: Booking[];
  onViewTicket: (booking: Booking) => void;
  onRebook: (templeId: string) => void;
  onRefresh: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({
  bookings,
  onViewTicket,
  onRebook,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Completed" | "Cancelled">("Upcoming");

  const filteredBookings = bookings.filter(b => b.bookingStatus === activeTab);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel your divine darshan booking slot?")) return;
    
    try {
      const target = bookings.find(b => b.bookingId === bookingId);
      if (target) {
        const updated: Booking = { ...target, bookingStatus: "Cancelled" };
        await dbService.saveBooking(updated);
        
        // Notify user about cancellation success
        const notification = {
          notificationId: "NOTIF-" + Date.now(),
          userId: target.userId,
          title: "Booking Cancelled ✕",
          message: `Your booking ID: ${target.bookingId} for ${target.templeName} has been cancelled successfully.`,
          time: new Date().toISOString(),
          read: false,
          type: "cancellation" as const
        };
        await dbService.createNotification(notification);
        
        onRefresh();
      }
    } catch (e) {
      console.error("Error cancelling booking", e);
    }
  };

  return (
    <div className="bg-[#FFF9F2] text-[#2D2D2D] min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        
        {/* Page Titles */}
        <div>
          <h1 className="text-3xl font-extrabold font-display text-gray-900 tracking-tight">My Holy Passes</h1>
          <p className="text-gray-500 text-sm">
            View your upcoming, completed, and cancelled temple visits. Access digital QR code receipts or request slot cancellation.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-gray-200">
          {(["Upcoming", "Completed", "Cancelled"] as const).map((tab) => {
            const isActive = activeTab === tab;
            let TabIcon = Calendar;
            let tabColor = "border-saffron-500 text-saffron-600";
            if (tab === "Completed") {
              TabIcon = CheckCircle2;
              tabColor = "border-emerald-500 text-emerald-600";
            } else if (tab === "Cancelled") {
              TabIcon = XCircle;
              tabColor = "border-red-500 text-red-600";
            }

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold border-b-2 focus:outline-hidden transition-all ${
                  isActive 
                    ? `${tabColor} font-extrabold bg-white/50 rounded-t-xl` 
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab} Visits</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-mono">
                  {bookings.filter(b => b.bookingStatus === tab).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bookings Lists */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-saffron-100 p-12 text-center max-w-md mx-auto shadow-sm">
            <HelpCircle className="w-12 h-12 text-saffron-400 mx-auto mb-3" />
            <h3 className="font-display font-bold text-gray-800 text-sm">No bookings found here</h3>
            <p className="text-gray-500 text-xs mt-1">
              There are no {activeTab.toLowerCase()} bookings under this devotee profile.
            </p>
            {activeTab === "Upcoming" && (
              <button
                onClick={() => onRebook("tirupati")} // Redirect somewhere
                className="mt-4 px-4 py-2 bg-gradient-saffron hover:bg-saffron-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Plan Divine Journey
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((bk, idx) => (
              <motion.div
                key={bk.bookingId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
                className="bento-card p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-6"
              >
                <div className="flex gap-4 items-start text-left w-full sm:w-auto">
                  <div className="w-11 h-11 rounded-full bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0">
                    <Compass className="w-5.5 h-5.5" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[9px] bg-saffron-50 border border-saffron-100 px-2 py-0.5 rounded text-saffron-800 font-mono">
                      {bk.bookingId}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 leading-tight">{bk.templeName}</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                      <div>Date: <span className="font-semibold text-gray-700">{bk.date}</span></div>
                      <div>Slot: <span className="font-semibold text-gray-700">{bk.slot.split(" - ")[0]}</span></div>
                      <div>Devotees: <span className="font-semibold text-gray-700">{bk.persons} Person(s)</span></div>
                      <div>Type: <span className="font-bold text-saffron-600 text-[11px]">{bk.darshanType}</span></div>
                    </div>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50">
                  {activeTab === "Upcoming" && (
                    <>
                      <button
                        onClick={() => onViewTicket(bk)}
                        className="px-3.5 py-2 bg-[#FFF3E6] hover:bg-saffron-100 text-xs font-bold text-[#FF9933] rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        View Ticket
                      </button>
                      <button
                        onClick={() => handleCancelBooking(bk.bookingId)}
                        className="px-3.5 py-2 hover:bg-red-50 text-xs font-semibold text-red-600 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}

                  {activeTab === "Completed" && (
                    <>
                      <button
                        onClick={() => onViewTicket(bk)}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download Pass
                      </button>
                      <button
                        onClick={() => onRebook(bk.templeId)}
                        className="px-3.5 py-2 bg-gray-50 hover:bg-saffron-50 text-xs font-semibold text-gray-700 hover:text-saffron-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Undo className="w-4 h-4" />
                        Book Again
                      </button>
                    </>
                  )}

                  {activeTab === "Cancelled" && (
                    <button
                      onClick={() => onRebook(bk.templeId)}
                      className="px-3.5 py-2 bg-gradient-saffron hover:bg-saffron-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Undo className="w-4 h-4" />
                      Rebook Slot
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
