import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const InterviewsMonitor: React.FC = () => {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const data = await apiRequest('/interviews');
      setInterviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    const interval = setInterval(fetchInterviews, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Live Interview Monitor"
        subtitle="Real-time telemetry on candidate interview sessions and question progression."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
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
                  <th className="pb-3.5 font-semibold">Role</th>
                  <th className="pb-3.5 font-semibold">Session Status</th>
                  <th className="pb-3.5 font-semibold">Questions Progress</th>
                  <th className="pb-3.5 font-semibold">Scorecard</th>
                  <th className="pb-3.5 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-900">{item.candidate_name}</div>
                      <div className="text-[11px] text-slate-500">{item.candidate_email}</div>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">
                      {item.job_title}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 font-mono text-slate-600">
                      Question {item.current_question_index + 1}
                    </td>
                    <td className="py-3.5">
                      {item.overall_score ? (
                        <span className="font-bold text-indigo-600 font-mono">{item.overall_score} / 5.0</span>
                      ) : (
                        <span className="text-slate-400 font-mono">In Progress</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/admin/candidates/${item.candidate_id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Transcript</span>
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
