import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Compass, ShieldAlert, CheckCircle2, ArrowLeft } from "lucide-react";

interface ForgotPasswordProps {
  onLoginClick: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onLoginClick }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to trigger reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-saffron flex items-center justify-center text-white shadow-md mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Recover Password</h2>
          <p className="text-xs text-gray-500">We'll send you an email with reset links.</p>
        </div>

        {/* Form panel */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100 shadow-md space-y-5 text-left">
          {error && (
            <div className="bg-red-50 border border-red-150 p-3.5 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-emerald-950 text-sm">Reset Email Dispatched!</h4>
              <p className="text-xs text-emerald-800 leading-relaxed px-2">
                We've dispatched a password reset link to <span className="font-bold">{email}</span>. Please verify your inbox and spam folders.
              </p>
              <button
                onClick={onLoginClick}
                className="w-full py-2.5 bg-gradient-saffron text-white rounded-xl text-xs font-bold"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs outline-hidden"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-saffron hover:bg-saffron-600 text-white rounded-xl font-bold text-xs disabled:opacity-50"
              >
                {loading ? "Sending reset links..." : "Send Recovery Email"}
              </button>
            </form>
          )}

          {!success && (
            <button
              onClick={onLoginClick}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
