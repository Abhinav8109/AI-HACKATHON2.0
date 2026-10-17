import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  actionTo?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  actionText,
  actionTo,
}) => {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-2xs">
      <div className="flex flex-col justify-center min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-900 font-display tracking-tight truncate">{title}</h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.2 rounded-full">
            <Sparkles className="w-2.5 h-2.5" /> AI Verified
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-500 font-normal truncate mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Live Synchronization Status */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-medium text-slate-700">Live Sync</span>
        </div>

        {/* Action Button if specified */}
        {actionText && actionTo && (
          <Link
            to={actionTo}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shadow-indigo-600/20 active:scale-[0.98] hover:shadow-indigo-600/30 hover:-translate-y-0.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{actionText}</span>
          </Link>
        )}
      </div>
    </header>
  );
};
