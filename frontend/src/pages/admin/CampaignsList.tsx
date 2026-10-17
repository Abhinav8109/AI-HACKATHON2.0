import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Users,
  Video,
  Link2,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const CampaignsList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const data = await apiRequest('/campaigns');
        setCampaigns(data);
        setFilteredCampaigns(data);
      } catch (err) {
        console.error('Failed to load campaigns', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  useEffect(() => {
    let result = campaigns;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        c =>
          c.title?.toLowerCase().includes(term) ||
          c.department?.toLowerCase().includes(term) ||
          c.location?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter(c => c.status === statusFilter);
    }
    setFilteredCampaigns(result);
  }, [searchTerm, statusFilter, campaigns]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Hiring Campaigns"
        subtitle="Manage active job campaigns, competency frameworks, and candidate pipelines."
        actionText="New Campaign"
        actionTo="/admin/campaigns/new"
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* FILTERS & SEARCH TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search campaigns by role, department, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/50 border border-slate-200 text-xs font-medium">
            {['ALL', 'ACTIVE', 'DRAFT', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold ${
                  statusFilter === st
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* CAMPAIGN CARDS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="h-5 w-24 rounded skeleton-shimmer"></div>
                <div className="h-6 w-3/4 rounded skeleton-shimmer"></div>
                <div className="h-14 rounded-xl skeleton-shimmer"></div>
              </div>
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">No campaigns match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a new hiring campaign to define AI competencies and begin issuing candidate interview portals.
            </p>
            <div className="pt-2">
              <Link
                to="/admin/campaigns/new"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-all shadow-indigo-600/20 active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Campaign</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCampaigns.map((camp, idx) => {
              const compPercent =
                camp.candidate_count > 0
                  ? Math.round((camp.completed_interviews / camp.candidate_count) * 100)
                  : 0;

              return (
                <motion.div 
                  key={camp.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between card-hover-lift"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={camp.status} size="sm" />
                      <span className="text-[11px] text-slate-400 font-mono font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(camp.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1.5 font-display line-clamp-1">{camp.title}</h3>
                    <p className="text-xs text-slate-600 mb-5 line-clamp-2 leading-relaxed">{camp.description || 'Enterprise role campaign with AI-tailored competency matrix and adaptive interview scenarios.'}</p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-500">Pipeline Completion</span>
                        <span className="font-bold text-indigo-600 font-mono">{compPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${compPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* KPI Mini Matrix */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-200/60 text-center mb-5">
                      <div>
                        <div className="text-base font-bold text-slate-900">{camp.candidate_count}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-medium">Candidates</div>
                      </div>
                      <div>
                        <div className="text-base font-bold text-indigo-600">{camp.invitation_count}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-medium">Invited</div>
                      </div>
                      <div>
                        <div className="text-base font-bold text-emerald-600">{camp.completed_interviews}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-mono font-medium">Completed</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {camp.location || 'Remote'}
                    </span>
                    <Link
                      to={`/admin/campaigns/${camp.id}`}
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                    >
                      <span>Manage Role</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
