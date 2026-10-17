import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lock, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <img src="/tplogo-icon.png" alt="TalentPilot AI Logo" className="h-8 w-auto object-contain" />
              <span className="text-lg font-bold text-slate-900 font-display">TalentPilot AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Agentic recruitment intelligence platform connecting hiring campaigns, unique candidate portals, and evidence-grounded evaluations.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Agent Systems Operational
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3 font-mono">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-indigo-600 transition-colors">Adaptive AI Interviews</Link></li>
              <li><Link to="/features" className="hover:text-indigo-600 transition-colors">Evidence-Based Scorecards</Link></li>
              <li><Link to="/features" className="hover:text-indigo-600 transition-colors">Resume Fact Cross-Referencing</Link></li>
              <li><Link to="/features" className="hover:text-indigo-600 transition-colors">Critic & Alignment Auditor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3 font-mono">Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/security" className="hover:text-indigo-600 transition-colors">Candidate Data Isolation</Link></li>
              <li><Link to="/security" className="hover:text-indigo-600 transition-colors">Human-in-the-Loop Reviews</Link></li>
              <li><Link to="/security" className="hover:text-indigo-600 transition-colors">WCAG 2.2 AA Accessibility</Link></li>
              <li><Link to="/security" className="hover:text-indigo-600 transition-colors">Prompt Injection Safeguards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3 font-mono">Command Center</h4>
            <p className="text-xs text-slate-500 mb-3">Authorized recruiter login and workspace management.</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:border-indigo-500 hover:text-indigo-600 hover:bg-white transition-all shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              Recruiter Sign In
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TalentPilot AI Systems. Built for high-integrity autonomous hiring intelligence.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Zero Automated Rejections
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Lock className="w-4 h-4 text-indigo-600" />
              SHA-256 Token Isolation
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
