import React, { useState } from "react";
import { Booking, PaymentRecord, NotificationRecord } from "../types";
import { dbService } from "../services/db";
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Building2, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface PaymentPageProps {
  bookingData: Partial<Booking>;
  onBack: () => void;
  onPaymentSuccess: (confirmedBooking: Booking) => void;
}

type PaymentMethodType = "upi" | "card" | "netbanking" | "wallet";

export const PaymentPage: React.FC<PaymentPageProps> = ({
  bookingData,
  onBack,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>("upi");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Inputs
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bankSelected, setBankSelected] = useState("State Bank of India");

  const [transactionId, setTransactionId] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate Network latency
    setTimeout(async () => {
      const generatedTxId = "TXN-" + Math.floor(1000000000 + Math.random() * 9000000000);
      setTransactionId(generatedTxId);
      
      const confirmedBooking: Booking = {
        ...(bookingData as Booking),
        paymentStatus: "Paid",
        bookingStatus: "Upcoming",
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
          `ID:${bookingData.bookingId}|Temple:${bookingData.templeId}|Date:${bookingData.date}|Slot:${bookingData.slot}|Persons:${bookingData.persons}`
        )}`
      };

      // Create Payment Record
      const paymentRecord: PaymentRecord = {
        paymentId: "PAY-" + Math.floor(100000 + Math.random() * 900000),
        bookingId: bookingData.bookingId || "",
        amount: bookingData.price || 0,
        paymentMethod: selectedMethod.toUpperCase(),
        status: "Success",
        transactionId: generatedTxId,
        createdAt: new Date().toISOString()
      };

      // Create Notification Record for User
      const notificationRecord: NotificationRecord = {
        notificationId: "NOTIF-" + Date.now(),
        userId: bookingData.userId || "",
        title: "Booking Confirmed! 🪔",
        message: `Your Holy Darshan Ticket for ${bookingData.templeName} on ${bookingData.date} during slot ${bookingData.slot} is confirmed. Booking ID: ${bookingData.bookingId}`,
        time: new Date().toISOString(),
        read: false,
        type: "booking"
      };

      // Write to Database Service
      try {
        await dbService.saveBooking(confirmedBooking);
        await dbService.savePayment(paymentRecord);
        await dbService.createNotification(notificationRecord);
      } catch (err) {
        console.error("Error committing payment records", err);
      }

      setProcessing(false);
      setSuccess(true);

      // Trigger redirect after success animation completes
      setTimeout(() => {
        onPaymentSuccess(confirmedBooking);
      }, 2500);

    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        
        {/* Back navigation */}
        {!processing && !success && (
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 hover:text-saffron-600 bg-white hover:bg-saffron-50 rounded-full border border-gray-100 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Booking Form
          </button>
        )}

        {/* Payment Main Area */}
        {success ? (
          /* SUCCESS ANIMATION VIEW */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-10 max-w-lg mx-auto text-center space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce border border-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest">Transaction Successful</span>
              <h2 className="text-2xl font-bold text-gray-900 font-display">Divine Pass Confirmed!</h2>
              <p className="text-xs text-gray-500 leading-relaxed px-4">
                Thank you! Your payment of <span className="font-bold text-saffron-700">₹{bookingData.price}</span> was processed securely. We are generating your printable QR ticket now.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 max-w-xs mx-auto text-xs space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Transaction ID</span>
                <span className="font-mono font-bold text-gray-800 text-[10px] truncate max-w-[150px]">{transactionId}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Booking Reference</span>
                <span className="font-mono font-bold text-gray-800 text-[10px]">{bookingData.bookingId}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-saffron-600 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to ticket portal...</span>
            </div>
          </motion.div>
        ) : (
          /* SELECTION & CHECKOUT FORM VIEW */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Payment Method Pickers */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100/50 shadow-sm space-y-6">
              
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[10px] text-saffron-600 font-bold uppercase tracking-widest">Devasthanam Billing Secure</span>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 mt-1">Payment Selection</h2>
                <p className="text-xs text-gray-400 mt-0.5">Choose your preferred transaction system to book sacred slots.</p>
              </div>

              {/* Grid of Methods */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("upi")}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === "upi"
                      ? "bg-saffron-50 border-saffron-500 text-saffron-800"
                      : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-saffron-600" />
                  <span>UPI Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("card")}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === "card"
                      ? "bg-saffron-50 border-saffron-500 text-saffron-800"
                      : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-saffron-600" />
                  <span>Debit/Credit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("netbanking")}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === "netbanking"
                      ? "bg-saffron-50 border-saffron-500 text-saffron-800"
                      : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Building2 className="w-5 h-5 text-saffron-600" />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("wallet")}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    selectedMethod === "wallet"
                      ? "bg-saffron-50 border-saffron-500 text-saffron-800"
                      : "bg-gray-50/50 border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Wallet className="w-5 h-5 text-saffron-600" />
                  <span>Wallets</span>
                </button>
              </div>

              {/* Dynamic Billing Form Inputs based on method */}
              <form onSubmit={handlePay} className="pt-4 space-y-4">
                
                {selectedMethod === "upi" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">Enter UPI Address</label>
                    <input 
                      type="text" 
                      placeholder="e.g. devotee@okaxis, user@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-hidden transition-all"
                      required
                    />
                    <span className="text-[10px] text-gray-400 leading-normal block">
                      A demo payment request notification will be initiated to your verified UPI client app.
                    </span>
                  </div>
                )}

                {selectedMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">Card Number</label>
                      <input 
                        type="text" 
                        maxLength={19}
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-hidden transition-all"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">Expiry Date</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-hidden transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">Security CVV</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          placeholder="CVV"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-hidden transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === "netbanking" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">Select Nationalized Bank</label>
                    <select 
                      value={bankSelected}
                      onChange={(e) => setBankSelected(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-hidden transition-all"
                    >
                      <option>State Bank of India</option>
                      <option>HDFC Bank Ltd</option>
                      <option>ICICI Bank Ltd</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {selectedMethod === "wallet" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block">Choose Digital Wallet</label>
                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                      <div className="p-3 border rounded-xl flex items-center gap-2 bg-gray-50/50 cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="wallet" id="paytm" defaultChecked />
                        <label htmlFor="paytm">Paytm Balance</label>
                      </div>
                      <div className="p-3 border rounded-xl flex items-center gap-2 bg-gray-50/50 cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="wallet" id="phonepe" />
                        <label htmlFor="phonepe">PhonePe Wallet</label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-bit Secure Layer Connection</span>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-3.5 bg-gradient-saffron hover:bg-saffron-600 text-white text-xs font-extrabold rounded-2xl flex items-center gap-2 shadow-md shadow-saffron-100 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Pay...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4.5 h-4.5" />
                        <span>Pay ₹{bookingData.price} Now</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>

            {/* Right Side: Simple cart invoice recap */}
            <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[2rem] border border-gray-100 shadow-xs space-y-5 text-xs">
              <h3 className="text-sm font-bold font-display text-gray-900 border-b border-gray-100 pb-3">Bill Verification</h3>
              
              <div className="space-y-3.5 leading-normal">
                <div>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase block">Temple Name</span>
                  <span className="font-bold text-gray-800">{bookingData.templeName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase block">Date & Slot reserved</span>
                  <span className="font-bold text-gray-800">{bookingData.date} • {bookingData.slot}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase block">Devotees Count</span>
                  <span className="font-bold text-gray-800">{bookingData.persons} Person(s)</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-semibold uppercase block">Entry Category</span>
                  <span className="font-bold text-saffron-600">{bookingData.darshanType}</span>
                </div>
                
                <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center text-sm font-extrabold text-saffron-950">
                  <span>Total Due Amount</span>
                  <span>₹{bookingData.price}</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 text-[10px] text-emerald-800 flex gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <p>This is a simulated secure check-out portal. No real funds will be deducted from your account.</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
