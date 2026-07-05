import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, LogIn, Compass, ArrowRight, ShieldAlert } from "lucide-react";

interface LoginProps {
  onRegisterClick: () => void;
  onForgotClick: () => void;
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onRegisterClick,
  onForgotClick,
  onLoginSuccess
}) => {
  const { login, loginAsDemo, googleSignIn } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Try demo roles instead.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role: "devotee" | "temple_admin" | "super_admin") => {
    setError("");
    setLoading(true);
    try {
      await loginAsDemo(role);
      onLoginSuccess();
    } catch (err: any) {
      setError("Failed to start demo session.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await googleSignIn();
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Google sign-in was closed or failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-6">
        
        {/* Title Logo header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-saffron flex items-center justify-center text-white shadow-md mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Sign In to DarshanEase</h2>
          <p className="text-xs text-gray-500">Book temple darshan tickets online with dynamic QR tickets.</p>
        </div>

        {/* Login Main Form */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100 shadow-md space-y-6 text-left">
          {error && (
            <div className="bg-red-50 border border-red-150 p-3.5 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Email Address</label>
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

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 uppercase">Password</label>
                <button 
                  type="button" 
                  onClick={onForgotClick}
                  className="text-[10px] text-saffron-600 font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs outline-hidden"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-saffron hover:bg-saffron-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-saffron-100 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Google login divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400 font-bold text-[9px] tracking-widest">Or Sign In with</span></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png" alt="Google" className="w-4 h-4" />
            Sign In with Google
          </button>

          {/* Demoware Switcher Box (Extremely helpful for previewing) */}
          <div className="bg-saffron-50/50 p-4 rounded-2xl border border-saffron-100/70 space-y-2.5">
            <span className="text-[9px] text-saffron-800 font-bold tracking-wider uppercase block text-center">Quick Demo Profiles (One-Click Bypass)</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleDemoSignIn("devotee")}
                className="py-2 bg-white border border-saffron-200 rounded-lg text-[10px] font-bold text-saffron-800 hover:bg-saffron-50 transition-colors"
              >
                Devotee
              </button>
              <button
                onClick={() => handleDemoSignIn("temple_admin")}
                className="py-2 bg-white border border-saffron-200 rounded-lg text-[10px] font-bold text-saffron-800 hover:bg-saffron-50 transition-colors"
              >
                Temple Admin
              </button>
              <button
                onClick={() => handleDemoSignIn("super_admin")}
                className="py-2 bg-white border border-saffron-200 rounded-lg text-[10px] font-bold text-saffron-800 hover:bg-saffron-50 transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="text-xs text-gray-500">Don't have an account? </span>
            <button 
              onClick={onRegisterClick}
              className="text-xs text-saffron-600 font-bold hover:underline"
            >
              Register Here
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
