import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Link2,
  Video,
  FileCheck2,
  UserCheck,
  BarChart3,
  DownloadCloud,
  ScrollText,
  Settings,
  LogOut,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', label: 'Command Center', icon: LayoutDashboard, end: true },
    { to: '/admin/campaigns', label: 'Hiring Campaigns', icon: Briefcase },
    { to: '/admin/candidates', label: 'Candidate Pipeline', icon: Users },
    { to: '/admin/invitations', label: 'Unique Portal Links', icon: Link2 },
    { to: '/admin/interviews', label: 'Interview Monitor', icon: Video },
    { to: '/admin/assessments', label: 'Scorecards & Evidence', icon: FileCheck2 },
    { to: '/admin/reviews', label: 'Human Review Queue', icon: UserCheck },
    { to: '/admin/analytics', label: 'Pipeline Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Workspace Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200/90 bg-white flex flex-col h-screen sticky top-0 shrink-0 shadow-xs z-30">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <NavLink to="/admin" className="flex items-center gap-2.5 group">
          <img src="/tplogo-icon.png" alt="TalentPilot AI Logo" className="h-8 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform" />
          <div>
            <div className="text-sm font-bold text-slate-900 font-display tracking-tight flex items-center gap-1.5">
              TalentPilot <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded-full border border-indigo-200/80 font-mono font-semibold">HQ</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Recruiter Command</div>
          </div>
        </NavLink>
      </div>

      <div className="px-3 py-2.5">
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700 shadow-xs">
          <div className="flex flex-col min-w-0 pr-1">
            <span className="truncate font-semibold text-slate-900 text-[12px]">{user?.full_name || 'Recruiter'}</span>
            <span className="truncate text-[10px] text-slate-500">{user?.email || 'admin@talentpilot.ai'}</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-indigo-100 text-indigo-700 shrink-0">
            {user?.role?.replace('_', ' ') || 'ADMIN'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/90 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium border border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100 space-y-2">
        <a
          href="/interview/live_demo_priya_sharma_token"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 hover:bg-indigo-100/80 transition-all group shadow-xs"
        >
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Test Candidate Portal
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:text-indigo-700" />
        </a>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
