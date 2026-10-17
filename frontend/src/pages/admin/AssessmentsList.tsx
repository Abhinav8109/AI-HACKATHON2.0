import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const AssessmentsList: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const data = await apiRequest('/interviews?status_filter=COMPLETED');
        setAssessments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssessments();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="AI Scorecards & Evidence Dossiers"
        subtitle="Objective multi-agent evaluations anchored by verbatim candidate quotes."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer w-full"></div>
              ))}
            </div>
          ) : assessments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No completed assessments yet.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="pb-3.5 font-semibold">Candidate</th>
                  <th className="pb-3.5 font-semibold">Campaign Role</th>
                  <th className="pb-3.5 font-semibold">Overall Rating</th>
                  <th className="pb-3.5 font-semibold">AI Recommendation</th>
                  <th className="pb-3.5 font-semibold">Critic Audit</th>
                  <th className="pb-3.5 font-semibold text-right">Inspect Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-900">{a.candidate_name}</div>
                      <div className="text-[11px] text-slate-500">{a.candidate_email}</div>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">
                      {a.job_title}
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-indigo-600 text-sm font-display">{a.overall_score || 0} / 5.0</span>
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={a.recommendation || 'PENDING'} />
                    </td>
                    <td className="py-3.5">
                      {a.human_review_required ? (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold inline-flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Human Review Flagged
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Critic Verified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/candidates/${a.candidate_id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Full Evidence</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
