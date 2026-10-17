import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, Link2, Sparkles, ArrowLeft, PlusCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const [campRes, candRes] = await Promise.all([
          apiRequest(`/campaigns/${id}`),
          apiRequest(`/candidates?campaign_id=${id}`)
        ]);
        setData(campRes);
        setCandidates(candRes);
      } catch (err) {
        console.error('Failed to load campaign details', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
        <AdminHeader title="Hiring Campaign Dossier" subtitle="Loading campaign competencies..." />
        <div className="p-6 max-w-6xl w-full space-y-6">
          <div className="h-6 w-32 rounded skeleton-shimmer"></div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="h-8 w-64 rounded skeleton-shimmer"></div>
            <div className="h-4 w-96 rounded skeleton-shimmer"></div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="h-20 rounded-xl skeleton-shimmer"></div>
              <div className="h-20 rounded-xl skeleton-shimmer"></div>
              <div className="h-20 rounded-xl skeleton-shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { campaign, job_description, competency_matrix } = data;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title={campaign.title}
        subtitle={`${campaign.department || 'Engineering'} • ${campaign.location || 'Remote'} • ${campaign.job_level || 'Senior'}`}
      />

      <div className="p-6 max-w-6xl w-full space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/admin/campaigns" className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Campaigns
          </Link>
          <StatusBadge status={campaign.status} />
        </div>

        {/* Competencies Preview */}
        {competency_matrix && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-mono font-semibold">
              <Sparkles className="w-4 h-4" /> AI Competency Framework (Version {competency_matrix.version})
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2.5">Technical Proficiencies</h4>
              <div className="flex flex-wrap gap-2">
                {(competency_matrix.technical_skills || []).map((skill: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Candidates in this campaign */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Assigned Candidates ({candidates.length})</h3>
              <p className="text-xs text-slate-500">Candidates with personalized interview plans and links</p>
            </div>
            <Link
              to="/admin/candidates"
              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 transition-colors inline-flex items-center gap-1.5 border border-indigo-200/60"
            >
              <span>Add Candidate</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Interview State</th>
                  <th className="pb-3 font-semibold">Overall Score</th>
                  <th className="pb-3 font-semibold text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-900">{c.full_name}</div>
                      <div className="text-[11px] text-slate-500">{c.email}</div>
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 text-slate-600 font-mono">
                      {c.interview_status}
                    </td>
                    <td className="py-3.5">
                      {c.overall_score ? (
                        <span className="font-bold text-indigo-600">{c.overall_score} / 5.0</span>
                      ) : (
                        <span className="text-slate-400 font-mono">--</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/candidates/${c.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        Open Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
