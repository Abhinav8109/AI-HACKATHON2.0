import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-800 p-4 font-sans relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-indigo-200/50 via-purple-100/40 to-blue-100/30 blur-[120px] pointer-events-none rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2 mb-2 focus:outline-none group">
            <img src="/tplogo.png" alt="TalentPilot AI" className="h-16 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
          </Link>
          <p className="text-xs text-slate-500 font-medium">Recruiter & Administrator Command Center Access</p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-7 sm:p-8 backdrop-blur-md shadow-xl shadow-slate-200/60">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-rose-500" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username or Email</label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter corporate username or email"
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Production Authentication Boundary Active
            </span>
            <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-semibold">Back to Home</Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            &larr; Back to Public Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
