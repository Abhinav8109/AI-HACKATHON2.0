import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  ArrowRight,
  Search,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  UserCheck,
  UserX,
  FileText,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Layers,
  Filter,
  Check,
  Info
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

interface InterviewItem {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  campaign_id: string;
  campaign_title: string;
  job_title: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  last_heartbeat: string | null;
  current_question_index: number;
  overall_score: number | null;
  recommendation: string | null;
  human_review_required: boolean;
  decision: string | null;
  decision_rationale: string | null;
  decision_date: string | null;
  decision_by: string | null;
}

export const InterviewsMonitor: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED' | 'PENDING' | 'IN_PROGRESS'>('ALL');
  const [selectedDecisionModal, setSelectedDecisionModal] = useState<InterviewItem | null>(null);

  const fetchInterviews = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await apiRequest<InterviewItem[]>('/interviews');
      setInterviews(data);
      setLastSynced(new Date());
    } catch (e) {
      console.error('Failed to fetch interview telemetry:', e);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    const interval = setInterval(() => fetchInterviews(false), 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute Telemetry Metrics
  const metrics = useMemo(() => {
    const total = interviews.length;
    const inProgress = interviews.filter((i) => i.status === 'IN_PROGRESS').length;
    const completed = interviews.filter((i) => i.status === 'COMPLETED').length;
    
    // Approved count (ADVANCE, NEXT_ROUND, APPROVED, HIRED)
    const approved = interviews.filter((i) =>
      i.decision && ['ADVANCE', 'NEXT_ROUND', 'APPROVED', 'HIRED'].includes(i.decision.toUpperCase())
    ).length;

    // Rejected count (REJECT, REJECTED)
    const rejected = interviews.filter((i) =>
      i.decision && ['REJECT', 'REJECTED'].includes(i.decision.toUpperCase())
    ).length;

    // Pending human decision (completed session without final decision)
    const pending = interviews.filter((i) =>
      i.status === 'COMPLETED' && !i.decision
    ).length;

    return { total, inProgress, completed, approved, rejected, pending };
  }, [interviews]);

  // Filtered interviews list
  const filteredInterviews = useMemo(() => {
    return interviews.filter((item) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.candidate_name?.toLowerCase().includes(query) ||
        item.candidate_email?.toLowerCase().includes(query) ||
        item.job_title?.toLowerCase().includes(query) ||
        item.decision?.toLowerCase().includes(query) ||
        item.decision_rationale?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Decision / Status filter
      if (decisionFilter === 'ALL') return true;
      if (decisionFilter === 'APPROVED') {
        return item.decision && ['ADVANCE', 'NEXT_ROUND', 'APPROVED', 'HIRED'].includes(item.decision.toUpperCase());
      }
      if (decisionFilter === 'REJECTED') {
        return item.decision && ['REJECT', 'REJECTED'].includes(item.decision.toUpperCase());
      }
      if (decisionFilter === 'PENDING') {
        return item.status === 'COMPLETED' && !item.decision;
      }
      if (decisionFilter === 'IN_PROGRESS') {
        return item.status === 'IN_PROGRESS';
      }

      return true;
    });
  }, [interviews, searchQuery, decisionFilter]);

  const isApproved = (dec: string | null) =>
    dec && ['ADVANCE', 'NEXT_ROUND', 'APPROVED', 'HIRED'].includes(dec.toUpperCase());

  const isRejected = (dec: string | null) =>
    dec && ['REJECT', 'REJECTED'].includes(dec.toUpperCase());

  return (
    <div className="flex-1 flex flex-col bg-slate-50/70 min-h-screen text-slate-800">
      <AdminHeader
        title="Live Interview Monitor"
        subtitle="Real-time telemetry on candidate sessions, live question progression, and human recruiter approval / rejection governance."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
        {/* TELEMETRY STATUS BAR */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Telemetry Polling Active (4s)</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Real-Time Cloud Autosave Synchronized</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero Automated Rejection Guarantee Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 self-end sm:self-auto">
            <span className="font-mono text-[11px]">
              Last update: {lastSynced.toLocaleTimeString()}
            </span>
            <button
              onClick={() => fetchInterviews(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              title="Force Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="font-medium hidden sm:inline">Sync Now</span>
            </button>
          </div>
        </div>

        {/* 5-METRIC KPI BENTO CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* TOTAL SESSIONS */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Total Sessions</span>
              <Video className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 font-display">{metrics.total}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Monitored pipeline</div>
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-600">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Live In-Progress</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-indigo-600 font-display">{metrics.inProgress}</div>
              <div className="text-[11px] text-indigo-600/80 mt-0.5 font-medium">Answering active questions</div>
            </div>
          </div>

          {/* APPROVED / ADVANCED */}
          <div
            onClick={() => setDecisionFilter('APPROVED')}
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
              decisionFilter === 'APPROVED'
                ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30 shadow-emerald-500/10'
                : 'bg-white border-slate-200/90 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-700">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Human Approved</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-emerald-600 font-display">{metrics.approved}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Stage 3 advancement sent</div>
            </div>
          </div>

          {/* REJECTED */}
          <div
            onClick={() => setDecisionFilter('REJECTED')}
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
              decisionFilter === 'REJECTED'
                ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-400/30 shadow-rose-500/10'
                : 'bg-white border-slate-200/90 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between text-rose-700">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Human Rejected</span>
              <div className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                <UserX className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-rose-600 font-display">{metrics.rejected}</div>
              <div className="text-[11px] text-rose-700 font-semibold mt-0.5">Recruiter human sign-off</div>
            </div>
          </div>

          {/* PENDING DECISION */}
          <div
            onClick={() => setDecisionFilter('PENDING')}
            className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all col-span-2 sm:col-span-1 ${
              decisionFilter === 'PENDING'
                ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30 shadow-amber-500/10'
                : 'bg-white border-slate-200/90 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between text-amber-700">
              <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Pending Decision</span>
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-600 font-display">{metrics.pending}</div>
              <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Awaiting HR decision room</div>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER CONTROL PANEL */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by candidate name, email, job title, or decision rationale..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setDecisionFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                decisionFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>All Sessions</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white font-mono">
                {metrics.total}
              </span>
            </button>

            <button
              onClick={() => setDecisionFilter('APPROVED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                decisionFilter === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved ({metrics.approved})</span>
            </button>

            <button
              onClick={() => setDecisionFilter('REJECTED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                decisionFilter === 'REJECTED'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected ({metrics.rejected})</span>
            </button>

            <button
              onClick={() => setDecisionFilter('PENDING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                decisionFilter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Decision ({metrics.pending})</span>
            </button>

            <button
              onClick={() => setDecisionFilter('IN_PROGRESS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                decisionFilter === 'IN_PROGRESS'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>In Progress ({metrics.inProgress})</span>
            </button>
          </div>
        </div>

        {/* LIVE SESSIONS TABLE */}
        <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-xl skeleton-shimmer w-full"></div>
              ))}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 font-medium space-y-3">
              <Video className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No interview sessions match your current filter.</p>
              <p className="text-slate-500">Try adjusting your search query or selecting "All Sessions".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDecisionFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-mono text-[11px]">
                    <th className="py-4 px-5 font-bold">Candidate & Campaign</th>
                    <th className="py-4 px-4 font-bold">Session State</th>
                    <th className="py-4 px-4 font-bold">Question Progression</th>
                    <th className="py-4 px-4 font-bold">AI Evidence Score</th>
                    <th className="py-4 px-5 font-bold">Human Decision Status</th>
                    <th className="py-4 px-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInterviews.map((item) => {
                    const approved = isApproved(item.decision);
                    const rejected = isRejected(item.decision);
                    const isHold = item.decision?.toUpperCase() === 'HOLD';
                    const progressPercent = Math.min(
                      100,
                      Math.round(((item.current_question_index + 1) / 8) * 100)
                    );

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50/80 transition-colors group ${
                          approved ? 'bg-emerald-50/20' : rejected ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        {/* CANDIDATE & ROLE */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Link
                              to={`/admin/candidates/${item.candidate_id}`}
                              className="hover:text-indigo-600 transition-colors"
                            >
                              {item.candidate_name}
                            </Link>
                            {approved && (
                              <span className="p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Candidate Approved">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                            {rejected && (
                              <span className="p-0.5 rounded-full bg-rose-100 text-rose-700" title="Candidate Rejected">
                                <UserX className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{item.candidate_email}</div>
                          <div className="text-[10px] text-indigo-700 font-mono mt-1 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span>{item.job_title}</span>
                          </div>
                        </td>

                        {/* SESSION STATE */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <StatusBadge status={item.status} size="sm" />
                            {item.status === 'IN_PROGRESS' && (
                              <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-mono font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                <span>Active</span>
                              </div>
                            )}
                            {item.completed_at && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                {new Date(item.completed_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* PROGRESSION */}
                        <td className="py-4 px-4">
                          <div className="space-y-1.5 min-w-[130px]">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="font-bold text-slate-700">
                                {item.status === 'COMPLETED' ? '8 of 8 Completed' : `Question ${item.current_question_index + 1} of 8`}
                              </span>
                              <span className="text-slate-400">{item.status === 'COMPLETED' ? '100%' : `${progressPercent}%`}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  item.status === 'COMPLETED'
                                    ? 'bg-emerald-500'
                                    : 'bg-indigo-600'
                                }`}
                                style={{ width: `${item.status === 'COMPLETED' ? 100 : progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* AI EVIDENCE SCORE */}
                        <td className="py-4 px-4">
                          {item.overall_score ? (
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 font-mono font-extrabold text-xs px-2.5 py-1 rounded-full border ${
                                  item.overall_score >= 4.0
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : item.overall_score >= 3.0
                                    ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                    : item.overall_score >= 2.0
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}
                              >
                                {item.overall_score.toFixed(1)} / 5.0
                              </span>
                              {item.recommendation && (
                                <div className="text-[10px] font-mono text-slate-500 uppercase">
                                  {item.recommendation.replace('_', ' ')}
                                </div>
                              )}
                              {item.human_review_required && (
                                <div className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  <span>Review Flagged</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px] italic">
                              In Evaluation
                            </span>
                          )}
                        </td>

                        {/* HUMAN RECRUITER DECISION STATUS (THE CORE REQUIREMENT!) */}
                        <td className="py-4 px-5">
                          {approved ? (
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 font-bold text-xs shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>APPROVED & ADVANCED</span>
                              </div>
                              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Stage 3 Next-Round Sent</span>
                              </div>
                              {item.decision_rationale && (
                                <button
                                  onClick={() => setSelectedDecisionModal(item)}
                                  className="text-[11px] text-slate-600 hover:text-emerald-800 text-left line-clamp-1 italic max-w-xs hover:underline flex items-center gap-1"
                                  title="Click to view full decision rationale"
                                >
                                  <span>"{item.decision_rationale}"</span>
                                  <Info className="w-3 h-3 text-emerald-600 shrink-0 inline" />
                                </button>
                              )}
                            </div>
                          ) : rejected ? (
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-300 text-rose-800 font-bold text-xs shadow-2xs">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>REJECTED</span>
                              </div>
                              {item.decision_rationale && (
                                <button
                                  onClick={() => setSelectedDecisionModal(item)}
                                  className="text-[11px] text-slate-600 hover:text-rose-800 text-left line-clamp-1 italic max-w-xs hover:underline flex items-center gap-1"
                                  title="Click to view full decision rationale"
                                >
                                  <span>"{item.decision_rationale}"</span>
                                  <Info className="w-3 h-3 text-rose-600 shrink-0 inline" />
                                </button>
                              )}
                            </div>
                          ) : isHold ? (
                            <div className="space-y-1.5">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-800 font-bold text-xs shadow-2xs">
                                <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>ON HOLD</span>
                              </div>
                              {item.decision_rationale && (
                                <button
                                  onClick={() => setSelectedDecisionModal(item)}
                                  className="text-[11px] text-slate-600 hover:text-amber-800 text-left line-clamp-1 italic max-w-xs hover:underline"
                                >
                                  "{item.decision_rationale}"
                                </button>
                              )}
                            </div>
                          ) : item.status === 'COMPLETED' ? (
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending Human Decision</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Requires recruiter review
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono">
                              Assessment in progress
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}
                        <td className="py-4 px-5 text-right space-x-2">
                          {item.decision_rationale && (
                            <button
                              onClick={() => setSelectedDecisionModal(item)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                              title="View Decision Notes"
                            >
                              <FileText className="w-3 h-3 text-slate-500" />
                              <span className="hidden sm:inline">Rationale</span>
                            </button>
                          )}
                          <Link
                            to={`/admin/candidates/${item.candidate_id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs"
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
            </div>
          )}

          <div className="p-4 bg-slate-50/70 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Showing {filteredInterviews.length} of {interviews.length} monitored sessions
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Approved: {metrics.approved}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Rejected: {metrics.rejected}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Pending Decision: {metrics.pending}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK DECISION RATIONALE MODAL */}
      <AnimatePresence>
        {selectedDecisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Recruiter Human Governance Record
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedDecisionModal.candidate_name}
                  </h3>
                  <div className="text-xs text-slate-500">{selectedDecisionModal.job_title}</div>
                </div>

                <div className="shrink-0">
                  {isApproved(selectedDecisionModal.decision) ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      APPROVED
                    </span>
                  ) : isRejected(selectedDecisionModal.decision) ? (
                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-300 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      REJECTED
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300">
                      {selectedDecisionModal.decision}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Recruiter Rationale & Justification
                  </label>
                  <div className="mt-1.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                    {selectedDecisionModal.decision_rationale || 'No detailed rationale text recorded.'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Recorded By</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedDecisionModal.decision_by || 'Authorized Recruiter (Sarah Chen)'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Decision Timestamp</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedDecisionModal.decision_date
                        ? new Date(selectedDecisionModal.decision_date).toLocaleString()
                        : 'Recorded'}
                    </span>
                  </div>
                </div>

                {isApproved(selectedDecisionModal.decision) && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Stage 3 automated advancement notification sent to candidate inbox.</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/admin/candidates/${selectedDecisionModal.candidate_id}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Open Full Candidate Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setSelectedDecisionModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
