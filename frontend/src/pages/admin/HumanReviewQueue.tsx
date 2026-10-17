import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const HumanReviewQueue: React.FC = () => {
  const [flaggedCandidates, setFlaggedCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQueue() {
      try {
        const candidates = await apiRequest('/candidates');
        const flagged = candidates.filter((c: any) => c.status === 'UNDER_REVIEW' || (c.overall_score && c.overall_score >= 2.5 && c.overall_score <= 3.4));
        setFlaggedCandidates(flagged);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadQueue();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Human Review Queue"
        subtitle="Mandatory human recruiter alignment queue for borderline or flagged candidate assessments."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-3.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900">AI Governance Safeguard:</span> The Critic Agent flagged these candidates for mandatory recruiter review due to borderline scoring or brief responses. The AI will never reject these candidates automatically; an authorized human decision must be recorded.
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer w-full"></div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="pb-3.5 font-semibold">Candidate</th>
                  <th className="pb-3.5 font-semibold">Status</th>
                  <th className="pb-3.5 font-semibold">Score</th>
                  <th className="pb-3.5 font-semibold">Critic Flag</th>
                  <th className="pb-3.5 font-semibold text-right">Human Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flaggedCandidates.length > 0 ? (
                  flaggedCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <div className="font-semibold text-slate-900">{c.full_name}</div>
                        <div className="text-[11px] text-slate-500">{c.email}</div>
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5">
                        <span className="font-bold text-amber-600 font-mono">{c.overall_score || 3.1} / 5.0</span>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        Borderline depth / brief response requiring alignment
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/admin/candidates/${c.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20 active:scale-98"
                        >
                          <span>Review & Decide</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      All flagged assessments have been reviewed. Queue is empty!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
