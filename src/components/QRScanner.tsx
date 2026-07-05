import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Sparkles, 
  RefreshCw, 
  UserCheck, 
  Calendar, 
  Clock, 
  Ticket, 
  QrCode,
  ShieldCheck,
  User,
  MapPin,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Booking } from "../types";
import { dbService } from "../services/db";

interface QRScannerProps {
  bookings: Booking[];
  onRefreshAll: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ bookings, onRefreshAll }) => {
  const [activeMode, setActiveMode] = useState<"camera" | "manual">("camera");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  
  // Scanned ticket result
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const [notFoundId, setNotFoundId] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  // Camera elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera stream
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Start camera stream
  const startCamera = async () => {
    setScanError(null);
    setVerifiedBooking(null);
    setNotFoundId(null);
    setVerificationSuccess(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: { facingMode: "environment" }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required for iOS
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      let errorMsg = "Could not access the camera. Please ensure camera permissions are granted.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Camera access denied. Please allow camera permission in your browser or iframe settings.";
      }
      setScanError(errorMsg);
      setActiveMode("manual");
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Frame processing loop for QR code detection
  useEffect(() => {
    if (!isScanning) return;

    const processFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            handleScanSuccess(code.data);
            return; // stop scanning after a success
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScanning]);

  // Parse scanned QR text
  const handleScanSuccess = (scannedText: string) => {
    stopCamera();
    
    // Scanned format can be:
    // ID:BOOK-XYZ|Temple:yadadri|Date:2026-07-06|Slot:...
    // Or just a plain Booking ID
    let bookingId = scannedText;

    if (scannedText.includes("ID:")) {
      const parts = scannedText.split("|");
      const idPart = parts.find(p => p.startsWith("ID:"));
      if (idPart) {
        bookingId = idPart.replace("ID:", "").trim();
      }
    }

    verifyBookingById(bookingId);
  };

  // Look up and verify booking in system
  const verifyBookingById = async (id: string) => {
    setVerifiedBooking(null);
    setNotFoundId(null);
    setVerificationSuccess(null);
    
    const cleanId = id.trim();
    if (!cleanId) return;

    // Try finding in current local/loaded bookings first
    let foundBooking = bookings.find(b => b.bookingId.toLowerCase() === cleanId.toLowerCase());

    if (!foundBooking) {
      // Direct fetch from firestore if not in list
      try {
        const directBooking = await dbService.getBookingById(cleanId);
        if (directBooking) {
          foundBooking = directBooking;
        }
      } catch (e) {
        console.warn("Error fetching booking directly:", e);
      }
    }

    if (foundBooking) {
      setVerifiedBooking(foundBooking);
    } else {
      setNotFoundId(cleanId);
    }
  };

  // Perform administrative check-in (marks booking completed)
  const handleVerifyCheckIn = async (booking: Booking) => {
    try {
      const updated: Booking = {
        ...booking,
        bookingStatus: "Completed"
      };
      
      await dbService.saveBooking(updated);

      // Create a devotee notification
      const notification = {
        notificationId: "NOTIF-" + Date.now(),
        userId: booking.userId,
        title: "Darshan Ticket Scanned! 🪔",
        message: `Your ticket for ${booking.templeName} has been successfully scanned and verified at the sanctum entrance. Wish you a peaceful Darshan!`,
        time: new Date().toISOString(),
        read: false,
        type: "booking" as const
      };
      await dbService.createNotification(notification);

      setVerificationSuccess(`Successfully verified Devotee ${booking.userName}'s entry pass!`);
      setVerifiedBooking(updated);
      onRefreshAll();
    } catch (e) {
      console.error("Check-in verification error:", e);
      alert("Failed to update ticket verification status.");
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xs p-6 md:p-8 text-left max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold font-display text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-saffron-600" />
            Divine Gate Entry Verification
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Scan dynamic ticket QR passes at temple checkpoints or manually enter booking codes to confirm pass validity.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-gray-100 p-1 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => {
              stopCamera();
              setActiveMode("camera");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === "camera"
                ? "bg-white text-saffron-700 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera Scan
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveMode("manual");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === "manual"
                ? "bg-white text-saffron-700 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Search className="w-4 h-4" />
            Simulation & Search
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SCANNER / CONTROLS */}
        <div className="md:col-span-6 flex flex-col space-y-4">
          
          {activeMode === "camera" ? (
            <div className="space-y-4">
              {/* Scan viewport container */}
              <div className="relative w-full aspect-video sm:aspect-square bg-slate-950 rounded-[2rem] overflow-hidden border-2 border-slate-900 shadow-inner flex items-center justify-center">
                
                {isScanning ? (
                  <>
                    <video 
                      ref={videoRef} 
                      className="absolute inset-0 w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Retro Scanner Grid Lines and Glowing Box */}
                    <div className="absolute inset-0 border-4 border-dashed border-saffron-500/20 p-8 flex items-center justify-center pointer-events-none">
                      <div className="relative w-48 h-48 sm:w-60 sm:h-60 border-2 border-saffron-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(242,109,15,0.4)]">
                        {/* Scanner overlay corner indicators */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-saffron-500 -translate-x-1 -translate-y-1 rounded-tl-md" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-saffron-500 translate-x-1 -translate-y-1 rounded-tr-md" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-saffron-500 -translate-x-1 translate-y-1 rounded-bl-md" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-saffron-500 translate-x-1 translate-y-1 rounded-br-md" />
                        
                        {/* Scanning Laser Line Animation */}
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-saffron-500 to-transparent shadow-[0_0_10px_#f26d0f] animate-bounce top-1/2" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <span className="bg-slate-900/80 text-white text-[10px] px-3 py-1 rounded-full font-mono font-bold tracking-wider backdrop-blur-xs flex items-center justify-center gap-1.5 w-max mx-auto border border-white/15">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                        Live Camera Feed Active
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-saffron-500">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Camera Offline</h4>
                      <p className="text-slate-400 text-[10px] max-w-xs mx-auto leading-relaxed">
                        To verify digital tickets in real-time, initialize your camera stream. Note: Camera permission popup will trigger.
                      </p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="px-6 py-2.5 bg-gradient-saffron text-white rounded-xl text-xs font-bold shadow-md shadow-saffron-950/20 hover:shadow-lg transition-all"
                    >
                      Initialize Camera Stream
                    </button>
                  </div>
                )}
              </div>

              {isScanning && (
                <button
                  onClick={stopCamera}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Turn Off Scanner
                </button>
              )}

              {scanError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex gap-2.5 text-xs">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-600" />
                  <div>
                    <span className="font-bold">Hardware Notice:</span>
                    <p className="mt-0.5 leading-relaxed text-[11px]">{scanError}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-gray-100 p-6 rounded-[2rem] space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-bold uppercase block tracking-wider">Manual Pass Search</label>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyBookingById(manualInput);
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Enter Booking ID (e.g., BOOK-...)"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 focus:border-saffron-300 focus:ring-1 focus:ring-saffron-200 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 bg-gradient-saffron text-white text-xs font-bold rounded-xl shadow-md shadow-saffron-100"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Simulation Helper */}
              <div className="space-y-2 border-t pt-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase block tracking-wider">Quick Select (Review Simulation)</span>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Select any currently active ticket booking from the registry below to instantly simulate scanning its custom QR code:
                </p>
                
                <div className="max-h-52 overflow-y-auto border border-gray-200/60 rounded-xl bg-white divide-y divide-gray-100 text-[11px]">
                  {bookings.length === 0 ? (
                    <div className="p-3 text-center text-gray-400 italic">No bookings found in system</div>
                  ) : (
                    bookings.map(b => (
                      <button
                        key={b.bookingId}
                        onClick={() => {
                          setManualInput(b.bookingId);
                          verifyBookingById(b.bookingId);
                        }}
                        className="w-full p-2.5 text-left hover:bg-saffron-50/50 flex items-center justify-between font-medium group transition-colors"
                      >
                        <div>
                          <div className="font-bold text-gray-800 flex items-center gap-1.5">
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border text-gray-600">{b.bookingId}</span>
                            <span>{b.userName}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{b.templeName} • {b.date} ({b.slot.split(" - ")[0]})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            b.bookingStatus === "Upcoming" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                            b.bookingStatus === "Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-150" :
                            "bg-red-50 text-red-500 border border-red-100"
                          }`}>
                            {b.bookingStatus}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-saffron-500 transition-colors" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: VERIFICATION DISPLAY SCREEN */}
        <div className="md:col-span-6 flex flex-col justify-center">
          
          <AnimatePresence mode="wait">
            {verifiedBooking ? (
              <motion.div
                key={verifiedBooking.bookingId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border-2 border-saffron-100 rounded-[2.2rem] shadow-lg overflow-hidden flex flex-col text-left relative"
              >
                {/* Visual Status Header bar */}
                <div className={`p-4 text-white font-bold flex items-center justify-between ${
                  verifiedBooking.bookingStatus === "Completed" ? "bg-emerald-600" :
                  verifiedBooking.bookingStatus === "Cancelled" ? "bg-rose-600" :
                  "bg-gradient-saffron"
                }`}>
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    {verifiedBooking.bookingStatus === "Completed" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Pass Checked-In
                      </>
                    ) : verifiedBooking.bookingStatus === "Cancelled" ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        Ticket Cancelled
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 animate-pulse" />
                        Valid Ticket Active
                      </>
                    )}
                  </div>
                  <span className="text-[10px] font-mono bg-white/20 px-2.5 py-0.5 rounded-full uppercase">
                    Status: {verifiedBooking.bookingStatus}
                  </span>
                </div>

                <div className="p-6 space-y-5 text-xs font-semibold relative">
                  
                  {/* Verification Status Notification Popup */}
                  {verificationSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 border border-emerald-150 p-3 rounded-2xl text-emerald-800 flex items-center gap-2 mb-2 text-[11px]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{verificationSuccess}</span>
                    </motion.div>
                  )}

                  {/* Destination Information */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-saffron-600 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5" />
                      {verifiedBooking.templeLocation}
                    </div>
                    <h3 className="text-base font-bold font-display text-gray-900 leading-tight">
                      {verifiedBooking.templeName}
                    </h3>
                  </div>

                  {/* Core ticket grid */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-4">
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Devotee Name</span>
                      <span className="font-bold text-gray-800 text-xs flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {verifiedBooking.userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Booking Ref</span>
                      <span className="font-mono font-bold text-saffron-700 text-[11px] bg-saffron-50/70 border border-saffron-100 px-1.5 py-0.5 rounded block w-max mt-0.5">
                        {verifiedBooking.bookingId}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Darshan Date</span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-saffron-500" />
                        {verifiedBooking.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Time Slot</span>
                      <span className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-saffron-500" />
                        {verifiedBooking.slot.split(" - ")[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Pooja Entry Category</span>
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-block text-[10px] mt-0.5 border border-amber-100">
                        {verifiedBooking.darshanType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase tracking-wider">Devotee Count</span>
                      <span className="font-bold text-gray-800 mt-0.5 block">{verifiedBooking.persons} Person(s)</span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 p-3 rounded-2xl border border-gray-100">
                    <span className="text-gray-500">Transaction Value</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      ₹{verifiedBooking.price} ({verifiedBooking.paymentStatus})
                    </span>
                  </div>

                  {/* Operational Check-in Button */}
                  {verifiedBooking.bookingStatus === "Upcoming" ? (
                    <button
                      onClick={() => handleVerifyCheckIn(verifiedBooking)}
                      className="w-full py-3.5 bg-gradient-saffron hover:bg-saffron-600 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-saffron-200 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4.5 h-4.5" />
                      Mark Verified & Complete Entry
                    </button>
                  ) : verifiedBooking.bookingStatus === "Completed" ? (
                    <div className="w-full py-3.5 bg-emerald-50 border border-emerald-150 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-1.5 text-center">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                      Entrance Completed Successfully
                    </div>
                  ) : (
                    <div className="w-full py-3.5 bg-rose-50 border border-rose-100 text-rose-700 font-bold rounded-2xl flex items-center justify-center gap-1.5 text-center">
                      <XCircle className="w-4.5 h-4.5 text-rose-600" />
                      Cancelled Ticket - Entry Denied
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setVerifiedBooking(null);
                      setVerificationSuccess(null);
                    }}
                    className="w-full py-2.5 text-center text-gray-400 hover:text-gray-600 font-semibold text-[11px]"
                  >
                    Clear & Scan Next
                  </button>

                </div>
              </motion.div>
            ) : notFoundId ? (
              <motion.div
                key="notfound"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-rose-50 border border-rose-100 rounded-[2rem] p-8 text-center space-y-4 max-w-sm mx-auto"
              >
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900 font-display">Ticket Not Registered</h3>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    The Booking ID <span className="font-mono font-bold text-rose-700">{notFoundId}</span> could not be validated in the Devasthanam registry. Please double check the code.
                  </p>
                </div>
                <button
                  onClick={() => setNotFoundId(null)}
                  className="px-5 py-2 bg-white hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-xl border border-gray-200 transition-colors"
                >
                  Dismiss
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50 border border-dashed border-gray-200 rounded-[2rem] p-10 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <Ticket className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-700">Waiting for Ticket Scan</h3>
                  <p className="text-gray-400 text-[10px] max-w-xs mx-auto leading-relaxed">
                    Once a ticket is successfully scanned with the camera or typed in, the devotee's verified pass details will instantly render here.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
};
