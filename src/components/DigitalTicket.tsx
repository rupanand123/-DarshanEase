import React, { useRef } from "react";
import { Booking } from "../types";
import { Ticket, Calendar, Clock, Users, ShieldCheck, Download, Share2, Printer, MapPin, Sparkles } from "lucide-react";

interface DigitalTicketProps {
  booking: Booking;
  onClose?: () => void;
}

export const DigitalTicket: React.FC<DigitalTicketProps> = ({ booking, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = ticketRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    
    if (printContent) {
      // Open print window
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Darshan Ticket - ${booking.bookingId}</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; background-color: #f9f9f9; padding: 20px; }
                .ticket-print { max-width: 600px; margin: 0 auto; background: white; border: 2px solid #f26d0f; border-radius: 20px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                .perforation { border-top: 2px dashed #e2e8f0; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="ticket-print">
                <div class="text-center mb-6">
                  <h1 class="text-2xl font-bold text-yellow-600">DARSHANEASE</h1>
                  <p class="text-xs tracking-wider uppercase text-gray-500">Official Divine Darshan Ticket</p>
                </div>
                <div class="border-l-4 border-yellow-500 pl-4 py-1 mb-6">
                  <h2 class="text-xl font-bold text-gray-800">${booking.templeName}</h2>
                  <p class="text-xs text-gray-500">${booking.templeLocation}</p>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-xs text-gray-400 block font-semibold">DEVOTEE NAME</span>
                    <span class="font-bold text-gray-800">${booking.userName}</span>
                  </div>
                  <div>
                    <span class="text-xs text-gray-400 block font-semibold">BOOKING ID</span>
                    <span class="font-bold font-mono text-gray-800">${booking.bookingId}</span>
                  </div>
                  <div>
                    <span class="text-xs text-gray-400 block font-semibold">DATE OF DARSHAN</span>
                    <span class="font-bold text-gray-800">${booking.date}</span>
                  </div>
                  <div>
                    <span class="text-xs text-gray-400 block font-semibold">TIME SLOT</span>
                    <span class="font-bold text-gray-800">${booking.slot}</span>
                  </div>
                  <div>
                    <span class="text-xs text-gray-400 block font-semibold">TOTAL PERSONS</span>
                    <span class="font-bold text-gray-800">${booking.persons} Devotee(s)</span>
                  </div>
                  <div>
                    <span class="text-xs text-gray-400 block font-semibold">DARSHAN TYPE</span>
                    <span class="font-bold text-yellow-600">${booking.darshanType}</span>
                  </div>
                </div>
                <div class="perforation"></div>
                <div class="flex flex-col items-center text-center">
                  <img src="${booking.qrCode}" class="w-40 h-40 border-2 border-yellow-500 rounded p-1 mb-4" />
                  <p class="text-[10px] text-gray-400 font-mono">SCAN QR CODE AT THE SANCTUM ENTRANCE FOR DESTRUCTION-FREE INSTANT VERIFICATION</p>
                  <p class="text-xs font-semibold text-green-600 mt-2">STATUS: CONFIRMED - ${booking.paymentStatus.toUpperCase()}</p>
                </div>
              </div>
              <script>
                window.onload = function() { window.print(); window.close(); }
              </script>
            </body>
          </html>
        `);
        win.document.close();
      }
    }
  };

  const handleShare = () => {
    const shareText = `My holy Darshan ticket to ${booking.templeName} is successfully confirmed via DarshanEase! Booking ID: ${booking.bookingId}`;
    if (navigator.share) {
      navigator.share({
        title: "My DarshanEase Ticket",
        text: shareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Ticket details copied to clipboard! You can paste and share it with your family.");
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-saffron-100 shadow-xl overflow-hidden max-w-xl mx-auto my-6 font-sans">
      {/* Ticket Body (Printable container) */}
      <div ref={ticketRef} className="relative p-6 sm:p-8">
        
        {/* Background spiritual motif */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(254,233,204,0.1)_0%,transparent_70%)] pointer-events-none" />

        {/* Outer Vintage Cuts */}
        <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-slate-50 border-r-2 border-saffron-100 -translate-y-1/2" />
        <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-slate-50 border-l-2 border-saffron-100 -translate-y-1/2" />

        {/* Top Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-saffron flex items-center justify-center text-white">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold font-display tracking-tight text-saffron-600">DarshanEase Passes</span>
              <p className="text-[8px] text-gray-400 font-mono uppercase tracking-widest">E-Devasthanam Boarding System</p>
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            VERIFIED CONFIRMED
          </div>
        </div>

        {/* Temple Name banner */}
        <div className="bg-gradient-to-r from-saffron-50 to-gold-50/50 p-4 rounded-2xl border border-saffron-100/50 mb-6 relative">
          <div className="absolute top-3 right-3 text-saffron-400 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-saffron-700 font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" />
            {booking.templeLocation}
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-gray-900 leading-snug">
            {booking.templeName}
          </h2>
        </div>

        {/* Ticket Grid Details */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6 pb-6 border-b-2 border-dashed border-gray-100">
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Primary Devotee</span>
            <span className="font-bold text-gray-800">{booking.userName}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Booking ID</span>
            <span className="font-bold font-mono text-saffron-700 text-xs bg-saffron-50 px-2 py-0.5 rounded border border-saffron-100 inline-block">
              {booking.bookingId}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Darshan Date</span>
            <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-4 h-4 text-saffron-500" />
              {booking.date}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Time Slot</span>
            <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-saffron-500" />
              {booking.slot}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Total Devotees</span>
            <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-saffron-500" />
              {booking.persons} Person(s)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-semibold block uppercase tracking-wider">Pooja Entry Type</span>
            <span className="font-bold text-saffron-600 bg-saffron-50/70 border border-saffron-100 px-2 py-0.5 rounded-full inline-block text-[11px] mt-0.5">
              {booking.darshanType}
            </span>
          </div>
        </div>

        {/* QR Section & Verification Note */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
          <div className="text-center sm:text-left space-y-2 max-w-xs">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Dynamic QR Pass</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              Show this QR code on your mobile device at the temple entrance. No printed paper required. Direct scanning enables seamless queue pass-through.
            </p>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center sm:justify-start gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span>Paid ₹{booking.price} via {booking.paymentStatus}</span>
            </div>
          </div>
          <div className="shrink-0 bg-white p-2 rounded-2xl border border-gray-200 shadow-xs">
            <img 
              src={booking.qrCode} 
              alt="Darshan Ticket QR Pass" 
              className="w-32 h-32"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

      </div>

      {/* Footer Print & Share Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700 font-semibold"
          >
            Close Receipt
          </button>
        )}
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Pass
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-saffron text-white rounded-xl text-xs font-bold shadow-md shadow-saffron-100 hover:shadow-lg transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print/Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
