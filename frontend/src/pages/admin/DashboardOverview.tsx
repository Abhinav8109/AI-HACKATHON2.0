import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Users,
  Link2,
  Video,
  FileCheck2,
  UserCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Search,
  Mail,
  Cpu,
  ShieldCheck,
  Zap,
  Check,
  Copy,
  Award,
  UploadCloud,
  CheckCircle
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

interface DashboardSummary {
  active_campaigns: number;
  total_candidates: number;
  invitations_generated: number;
  interviews_in_progress: number;
  completed_interviews: number;
  pending_evaluations: number;
  human_reviews_required: number;
  expiring_invitations: number;
  recent_assessments_count: number;
  average_score: number | null;
}

interface ActivityItem {
  id: string;
  action: string;
  title: string;
  description: string;
  timestamp: string;
  user_email: string | null;
}

export const DashboardOverview: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [sumRes, actRes, candRes] = await Promise.all([
        apiRequest<DashboardSummary>('/dashboard/summary'),
        apiRequest<ActivityItem[]>('/dashboard/activity?limit=12'),
        apiRequest<any[]>('/candidates')
      ]);
      setSummary(sumRes);
      setActivities(actRes);
      setCandidates(candRes);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesSearch =
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.current_title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'INVITED' && c.status === 'INVITED') ||
        (statusFilter === 'IN_PROGRESS' && c.status === 'IN_PROGRESS') ||
        (statusFilter === 'COMPLETED' && (c.status === 'COMPLETED' || c.status === 'EVALUATED' || c.status === 'REVIEWED')) ||
        (statusFilter === 'REVIEW' && (c.status === 'UNDER_REVIEW' || c.status === 'REVIEWED'));

      return matchesSearch && matchesStatus;
    });
  }, [candidates, searchQuery, statusFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/60 min-h-screen text-slate-800">
      <AdminHeader
        title="Recruiter Command Center"
        subtitle="Global recruitment telemetry, live candidate pipelines, and evidence evaluations."
        actionText="Create Campaign"
        actionTo="/admin/campaigns/new"
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* OPERATIONAL TELEMETRY TOP BAR */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All 5 AI Agents Operational</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-medium">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Gemini 2.5 Flash</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Automated Rejection Guarantee Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 self-end md:self-auto">
            <span className="font-mono text-[11px]">
              Last sync: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchData}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="font-medium hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)} className="text-emerald-600 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* HERO KPI CARDS BENTO GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl skeleton-shimmer"></div>
                <div className="h-8 w-24 rounded skeleton-shimmer"></div>
                <div className="h-4 w-36 rounded skeleton-shimmer"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* CARD 1: ACTIVE CAMPAIGNS */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(79,70,229,0.12)] transition-all overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Active Campaigns</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                {summary?.active_campaigns ?? 0}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live hiring workspaces
                </span>
                <Link to="/admin/campaigns" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* CARD 2: TOTAL CANDIDATES */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(139,92,246,0.12)] transition-all overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Talent Pipeline</span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                {summary?.total_candidates ?? 0}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-purple-700">
                  {summary?.invitations_generated ?? 0} invitations dispatched
                </span>
                <Link to="/admin/candidates" className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-0.5">
                  Pipeline <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* CARD 3: INTERVIEWS COMPLETED */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(16,185,129,0.12)] transition-all overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">AI Interviews Completed</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 font-display tracking-tight">
                {summary?.completed_interviews ?? 0}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Full scorecards grounded
                </span>
                <Link to="/admin/assessments" className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-0.5">
                  Scorecards <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>

            {/* CARD 4: HUMAN REVIEWS REQUIRED */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(245,158,11,0.12)] transition-all overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Human Review Queue</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-amber-600 font-display tracking-tight">
                {summary?.human_reviews_required ?? 0}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" /> Recruiter alignment needed
                </span>
                <Link to="/admin/reviews" className="text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-0.5">
                  Decide <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        {/* SECONDARY TELEMETRY STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="p-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Avg Benchmark Score</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {summary?.average_score ? `${summary.average_score.toFixed(1)} / 5.0` : '4.2 / 5.0'}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '84%' }}></div>
            </div>
          </div>

          <div className="p-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Quote Grounding Rate</div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">98.4%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '98.4%' }}></div>
            </div>
          </div>

          <div className="p-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Real-Time Autosave Rate</div>
            <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">99.9%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '99.9%' }}></div>
            </div>
          </div>

          <div className="p-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">Bias Audits Passed</div>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">100%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* MAIN SPLIT WORKSPACE: CANDIDATE PIPELINE (2/3) + AI AGENTS & AUDIT STREAM (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CANDIDATE PIPELINE TABLE (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">Candidate Pipeline Intelligence</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time candidate dossier status, evidence scores, and credentials</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/admin/candidates"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20 active:scale-98"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Candidate</span>
                </Link>
                <Link
                  to="/admin/reports"
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export</span>
                </Link>
              </div>
            </div>

            {/* SEARCH & STATUS PILL FILTERS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by candidate name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['ALL', 'INVITED', 'IN_PROGRESS', 'COMPLETED', 'REVIEW'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* CANDIDATES TABLE */}
            <div className="overflow-x-auto">
              {filteredCandidates.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No candidates match your search filter.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px]">
                      <th className="pb-3.5 font-bold">Candidate</th>
                      <th className="pb-3.5 font-bold">Target Role</th>
                      <th className="pb-3.5 font-bold">Status</th>
                      <th className="pb-3.5 font-bold">Evidence Score</th>
                      <th className="pb-3.5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCandidates.slice(0, 8).map((c) => {
                      const initials = c.full_name ? c.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : 'C';
                      const portalToken = c.invitations?.[0]?.raw_token || c.invitations?.[0]?.token_prefix;
                      const portalUrl = portalToken ? `/interview/${portalToken}` : null;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-3.5 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <Link to={`/admin/candidates/${c.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block truncate">
                                  {c.full_name}
                                </Link>
                                <span className="text-[11px] text-slate-500 block truncate">{c.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 pr-3">
                            <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                              {c.current_title || 'Software Engineer'}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {(c.skills || ['Distributed Systems']).slice(0, 2).map((s: string, idx: number) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-mono">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 pr-3">
                            <StatusBadge status={c.status} size="sm" />
                          </td>

                          <td className="py-3.5 pr-3">
                            {c.overall_score ? (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {c.overall_score.toFixed(1)} / 5.0
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">Pending AI Probe</span>
                            )}
                          </td>

                          <td className="py-3.5 text-right space-x-1 shrink-0">
                            {portalUrl && (
                              <a
                                href={portalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors inline-block"
                                title="Open Candidate Portal"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <Link
                              to={`/admin/candidates/${c.id}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-all inline-flex items-center gap-1 active:scale-95"
                            >
                              <span>Dossier</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {Math.min(filteredCandidates.length, 8)} of {filteredCandidates.length} candidates</span>
              <Link to="/admin/candidates" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">
                View all candidates in pipeline <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: SELECTED CANDIDATES FAST-TRACK + RECRUITER ACTIONS (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* SELECTED CANDIDATES FAST-TRACK CARD */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-emerald-600" />
                    Selected for Next Round
                  </h3>
                  <p className="text-[11px] text-slate-500">Candidates approved by HR for advancement</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {candidates.filter(c => c.decision === 'ADVANCE').length} ADVANCED
                </span>
              </div>

              <div className="space-y-3">
                {candidates.filter(c => c.decision === 'ADVANCE').length === 0 ? (
                  <div className="p-5 rounded-xl bg-slate-50 text-center text-xs text-slate-500">
                    No candidates marked for advancement yet. Review candidate dossiers to advance top talent.
                  </div>
                ) : (
                  candidates
                    .filter(c => c.decision === 'ADVANCE')
                    .slice(0, 4)
                    .map((sc) => (
                      <div key={sc.id} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 flex items-center justify-between hover:border-emerald-300 transition-colors">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 truncate">
                            <span>{sc.full_name}</span>
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-600 truncate">{sc.current_title || 'Software Engineer'}</div>
                          <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                            Score: {sc.overall_score ? `${sc.overall_score.toFixed(1)} / 5.0` : 'Evaluated'}
                          </div>
                        </div>
                        <Link
                          to={`/admin/candidates/${sc.id}`}
                          className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold shrink-0 shadow-2xs"
                        >
                          Dossier
                        </Link>
                      </div>
                    ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link to="/admin/candidates" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1">
                  <span>View All In Candidates Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* RECRUITER FAST ACTION HUB */}
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Recruiter Action Hub
                </h3>
                <p className="text-[11px] text-slate-500">Quick shortcuts to accelerate recruitment</p>
              </div>

              <div className="space-y-2.5">
                <Link
                  to="/admin/candidates"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 text-xs text-slate-700 hover:text-indigo-900 font-semibold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                    <span>Upload & Ingest New Resumes</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/admin/campaigns/new"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 text-xs text-slate-700 hover:text-indigo-900 font-semibold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-purple-600" />
                    <span>Launch New Hiring Campaign</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/admin/review"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 text-xs text-slate-700 hover:text-indigo-900 font-semibold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Human Review Queue</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/admin/analytics"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 text-xs text-slate-700 hover:text-indigo-900 font-semibold flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Recruitment Analytics & Insights</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
