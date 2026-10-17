import React, { useEffect, useState } from 'react';
import { ScrollText, ShieldCheck, Search } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';

export const AuditLogViewer: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAudit() {
      try {
        const data = await apiRequest('/audit?limit=100');
        setEvents(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadAudit();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Compliance & Security Audit Log"
        subtitle="Immutable ledger of system lifecycle actions, recruiter decisions, and token events."
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
                  <th className="pb-3.5 font-semibold">Timestamp</th>
                  <th className="pb-3.5 font-semibold">Action</th>
                  <th className="pb-3.5 font-semibold">Resource</th>
                  <th className="pb-3.5 font-semibold">User</th>
                  <th className="pb-3.5 font-semibold">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-3.5">
                      <span className="font-mono text-indigo-700 font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px]">
                        {e.action}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700 font-mono text-[11px] font-medium">
                      {e.resource_type}
                    </td>
                    <td className="py-3.5 text-slate-700 font-medium">
                      {e.user_email || 'System / Candidate'}
                    </td>
                    <td className="py-3.5 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {JSON.stringify(e.details)}
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
