import React, { useState, useMemo } from "react";
import { Temple, Booking } from "../types";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Ticket, 
  Calculator, 
  ArrowRight, 
  Info,
  Heart
} from "lucide-react";

interface BookingPageProps {
  temple: Temple;
  onBack: () => void;
  onProceedToPayment: (bookingData: Partial<Booking>) => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  temple,
  onBack,
  onProceedToPayment
}) => {
  const { user } = useAuth();
  
  // Set default date to tomorrow
  const getTomorrowDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTomorrowDateString());
  const [selectedSlot, setSelectedSlot] = useState(temple.availableSlots[0]);
  const [selectedDarshan, setSelectedDarshan] = useState(temple.darshanTypes[0]);
  const [personsCount, setPersonsCount] = useState(1);

  // Price calculations
  const summary = useMemo(() => {
    const basePrice = selectedDarshan.price;
    const subtotal = basePrice * personsCount;
    // GST 5%
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;

    return {
      basePrice,
      subtotal,
      gst,
      total
    };
  }, [selectedDarshan, personsCount]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in or switch to a demo profile to book a ticket!");
      return;
    }

    // Prepare booking object
    const bookingData: Partial<Booking> = {
      bookingId: "BK-" + Math.floor(100000 + Math.random() * 900000),
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      templeId: temple.templeId,
      templeName: temple.name,
      templeLocation: temple.location,
      date: selectedDate,
      slot: selectedSlot,
      persons: personsCount,
      price: summary.total,
      darshanType: selectedDarshan.name,
      paymentStatus: "Pending",
      bookingStatus: "Upcoming",
      createdAt: new Date().toISOString()
    };

    onProceedToPayment(bookingData);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back navigation */}
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-saffron-600 bg-white hover:bg-saffron-50 rounded-full border border-gray-100 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Details
        </button>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Input Selection Forms */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100/50 shadow-sm text-left">
            <div className="border-b border-gray-100 pb-4 mb-6">
              <span className="text-[10px] text-saffron-600 font-bold uppercase tracking-widest">Select Ticket Details</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 mt-1">Book Your Sacred Pass</h2>
              <p className="text-xs text-gray-400 mt-0.5">Please provide authentic details for temple verification.</p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Select Date */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-saffron-600" />
                  Select Date of Darshan
                </label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-hidden transition-all"
                  required
                />
              </div>

              {/* Select Slot */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-saffron-600" />
                  Select Preferred Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {temple.availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3.5 rounded-2xl border text-xs text-left font-semibold transition-all ${
                          isSelected 
                            ? "bg-saffron-50 border-saffron-500 text-saffron-800 ring-2 ring-saffron-500/10" 
                            : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Select Darshan Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-saffron-600" />
                  Choose Pooja Entry Pass Type
                </label>
                <div className="space-y-3">
                  {temple.darshanTypes.map((type) => {
                    const isSelected = selectedDarshan.name === type.name;
                    return (
                      <button
                        key={type.name}
                        type="button"
                        onClick={() => setSelectedDarshan(type)}
                        className={`w-full p-4 rounded-2xl border text-left flex justify-between items-start gap-4 transition-all ${
                          isSelected 
                            ? "bg-saffron-50 border-saffron-500 text-saffron-800 ring-2 ring-saffron-500/10" 
                            : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs sm:text-sm font-bold block">{type.name}</span>
                          <span className="text-[10px] text-gray-500 font-medium leading-relaxed block">{type.description}</span>
                        </div>
                        <span className="text-xs font-extrabold text-saffron-700 shrink-0">
                          {type.price === 0 ? "Free" : `₹${type.price}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Persons Count */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-saffron-600" />
                  Total Number of Persons / Devotees
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={personsCount <= 1}
                    onClick={() => setPersonsCount(personsCount - 1)}
                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-all disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold font-mono">{personsCount}</span>
                  <button
                    type="button"
                    disabled={personsCount >= 10}
                    onClick={() => setPersonsCount(personsCount + 1)}
                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-all disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="text-[10px] text-gray-400 font-medium ml-3">
                    Maximum 10 devotees permitted per single ticket booking.
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-saffron hover:bg-saffron-600 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-saffron-200 hover:shadow-lg transition-all cursor-pointer"
                >
                  Proceed to Payment Selection
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </div>

            </form>
          </div>

          {/* Right: Price Breakdown Summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xs text-left space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Checkout Breakdown</span>
              <h3 className="text-lg font-bold font-display text-gray-900 mt-0.5">Booking Summary</h3>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Selected Temple */}
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Sacred Destination</span>
                <span className="font-bold text-gray-800 block text-sm">{temple.name}</span>
                <span className="text-[10px] text-gray-500">{temple.location}</span>
              </div>

              {/* Dynamic Details block */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100/70">
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Darshan Date</span>
                  <span className="font-bold text-gray-800">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Pass Category</span>
                  <span className="font-bold text-gray-800 truncate block">{selectedDarshan.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Selected Slot</span>
                  <span className="font-bold text-gray-800">{selectedSlot.split(" - ")[0]}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">Devotee Count</span>
                  <span className="font-bold text-gray-800">{personsCount} Person(s)</span>
                </div>
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t border-gray-100 space-y-2.5">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Entry Ticket Price (₹{summary.basePrice} × {personsCount})</span>
                  <span>₹{summary.subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Devasthanam GST (5%)</span>
                  <span>₹{summary.gst}</span>
                </div>
                
                <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center text-saffron-950 font-extrabold text-sm sm:text-base">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-4 h-4 text-saffron-500" />
                    Total Payable Amount
                  </span>
                  <span className="font-sans">₹{summary.total}</span>
                </div>
              </div>

            </div>

            <div className="bg-saffron-50/50 p-4 rounded-2xl border border-saffron-100/50 flex gap-2.5">
              <Info className="w-4.5 h-4.5 text-saffron-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-saffron-800 leading-normal">
                No extra convenience charge is applied on online bookings. The dynamic ticket code generated is valid only for the specific date & slot selected.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
