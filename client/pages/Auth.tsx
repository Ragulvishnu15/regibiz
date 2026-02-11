import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, Loader2, Shield } from 'lucide-react';
import { mockAuthService } from '../services/mockFirebase';
import { UserProfile } from '../types';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'mail' | 'otp'>('mail');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'mail') {
        const user = await mockAuthService.loginWithEmail(email);
        onLogin(user);
      } else {
        if (!otpSent) {
          // Send OTP flow
          setTimeout(() => {
            setOtpSent(true);
            setLoading(false);
          }, 1000);
          return;
        }
        // Verify OTP flow
        const user = await mockAuthService.loginWithPhone(phone, otp);
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (activeTab === 'mail' || (activeTab === 'otp' && otpSent)) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-navy-900">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-peacock-600/20 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md p-6">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-peacock-500 shadow-lg shadow-emerald-500/20 mb-4">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">RegiPRO</h1>
          <p className="text-gray-400 mt-2">Government Compliance & Registration</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-1 shadow-2xl">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 gap-1 bg-black/40 rounded-xl mb-6">
            <button
              onClick={() => { setActiveTab('mail'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'mail' 
                  ? 'bg-navy-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Mail size={16} /> Mail Login
            </button>
            <button
              onClick={() => { setActiveTab('otp'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'otp' 
                  ? 'bg-navy-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Phone size={16} /> OTP Login
            </button>
          </div>

          <div className="px-6 pb-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {activeTab === 'mail' ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Select Account Type</label>
                    <div className="relative group">
                      <select 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-navy-900/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all cursor-pointer hover:bg-navy-900"
                      >
                        <option value="">-- Choose Role --</option>
                        <option value="super@regipro.com">Super Admin</option>
                        <option value="admin@regipro.com">Admin Manager</option>
                        <option value="customer@regipro.com">Customer Account</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Phone Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={otpSent}
                        placeholder="99999 99999"
                        className="w-full bg-navy-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono"
                      />
                    </div>
                  </div>
                  
                  {otpSent && (
                     <div className="animate-fade-in">
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">One-Time Password</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="1 2 3 4 5 6"
                          className="w-full bg-navy-900/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-center text-white tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                          autoFocus
                        />
                        <p className="text-center text-xs text-emerald-500 mt-2">OTP sent to {phone}</p>
                     </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (activeTab === 'mail' && !email) || (activeTab === 'otp' && !phone)}
                className="w-full bg-gradient-to-r from-emerald-500 to-peacock-600 hover:from-emerald-400 hover:to-peacock-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {activeTab === 'otp' && !otpSent ? 'Send Code' : 'Secure Login'} 
                    {!loading && <ArrowRight size={18} />}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          &copy; 2025 RegiPRO Inc. Compliance Portal.
        </p>
      </div>
    </div>
  );
};

export default Auth;
