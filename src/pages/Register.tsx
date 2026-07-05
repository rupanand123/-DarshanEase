import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Phone, LogIn, Compass, ShieldAlert } from "lucide-react";
import { UserRole } from "../types";

interface RegisterProps {
  onLoginClick: () => void;
  onRegisterSuccess: () => void;
}

export const Register: React.FC<RegisterProps> = ({
  onLoginClick,
  onRegisterSuccess
}) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("devotee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, name, phone, role);
      onRegisterSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create account. Try using quick demo login instead.");
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
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Create Devotee Account</h2>
          <p className="text-xs text-gray-500">Plan and reserve secure temple slots easily.</p>
        </div>

        {/* Register Frame */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-saffron-100 shadow-md space-y-5 text-left">
          {error && (
            <div className="bg-red-50 border border-red-150 p-3.5 rounded-xl text-xs text-red-600 flex items-center gap-2 font-medium">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Devotee Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="e.g. Ananya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="devotee@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs outline-hidden"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase">Account Role Type</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-saffron-300 focus:bg-white rounded-xl text-xs sm:text-sm font-semibold outline-hidden"
              >
                <option value="devotee">Devotee (Standard User)</option>
                <option value="temple_admin">Temple Devasthanam Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-saffron hover:bg-saffron-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-saffron-100 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Registering account..." : "Register Account"}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-gray-500">Already have an account? </span>
            <button 
              onClick={onLoginClick}
              className="text-xs text-saffron-600 font-bold hover:underline"
            >
              Sign In
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
