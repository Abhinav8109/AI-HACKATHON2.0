import React, { useEffect, useState } from 'react';
import { DownloadCloud, FileText, FileSpreadsheet, ExternalLink, Sparkles } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';

export const ReportsExport: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [camps, cands] = await Promise.all([
          apiRequest('/campaigns'),
          apiRequest('/candidates')
        ]);
        setCampaigns(camps);
        setCandidates(cands.filter((c: any) => c.overall_score !== null));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Reports & Compliance Exports"
        subtitle="Download verifiable candidate dossiers, campaign CSV summaries, and audit records."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* Campaign CSV Section */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-display">Campaign CSV Summaries</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">ATS Compatible</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Export candidate progress, scores, and human decisions for ATS or spreadsheet integration.</p>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl skeleton-shimmer w-full"></div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No active campaigns available for export.</div>
          ) : (
            <div className="space-y-2.5">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-indigo-200 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{camp.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{camp.candidate_count} Candidates &bull; {camp.completed_interviews} Completed</div>
                  </div>
                  <a
                    href={`/api/v1/reports/campaigns/${camp.id}/export`}
                    download
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-colors hover:text-emerald-700"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download CSV</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Candidate Dossier Downloads */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 font-display">Evaluated Candidate Dossiers</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">Verifiable Evidence</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">View or download evidence-grounded assessment dossiers with verbatim quote citations.</p>
          </div>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl skeleton-shimmer w-full"></div>
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No evaluated candidates ready for export yet.</div>
          ) : (
            <div className="space-y-2.5">
              {candidates.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-indigo-200 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{c.full_name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Overall Rating: <strong className="text-indigo-600 font-bold font-mono">{c.overall_score} / 5.0</strong> &bull; {c.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/v1/reports/candidates/${c.id}/export?format=html`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-colors hover:text-indigo-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                      <span>View Dossier (HTML)</span>
                    </a>
                    <a
                      href={`/api/v1/reports/candidates/${c.id}/export?format=json`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-colors hover:text-purple-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>JSON Raw</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
