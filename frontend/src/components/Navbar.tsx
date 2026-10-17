import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <img src="/tplogo-icon.png" alt="TalentPilot AI Logo" className="h-9 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" />
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-slate-900 font-display">TalentPilot</span>
            <span className="text-[11px] ml-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono border border-indigo-200 font-bold shadow-xs">AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/features" className="hover:text-indigo-600 transition-colors">Features</Link>
          <Link to="/how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</Link>
          <Link to="/security" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Security & Ethics
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20 active:scale-95"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20 active:scale-95"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
