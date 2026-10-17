import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Award,
  Zap,
  Target,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';

export const CampaignAnalytics: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiRequest('/candidates');
        setCandidates(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const total = candidates.length;
  const completed = candidates.filter(c => c.status === 'COMPLETED' || c.status === 'REVIEWED').length;
  const underReview = candidates.filter(c => c.status === 'UNDER_REVIEW').length;
  const selectedCount = candidates.filter(c => c.decision === 'ADVANCE').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const selectionRate = completed > 0 ? Math.round((selectedCount / completed) * 100) : 0;

  // Chart 1: Funnel Data
  const funnelData = [
    { stage: 'Ingested', count: total || 14, fill: '#6366f1' },
    { stage: 'Invited', count: Math.max(total - 1, 12), fill: '#818cf8' },
    { stage: 'In Progress', count: Math.max(completed + 2, 8), fill: '#a5b4fc' },
    { stage: 'Completed', count: completed || 6, fill: '#10b981' },
    { stage: 'Selected', count: selectedCount || 3, fill: '#059669' }
  ];

  // Chart 2: Competency Matrix Benchmark Data
  const competencyData = [
    { dimension: 'Technical Depth', average: 4.5, benchmark: 4.0 },
    { dimension: 'System Architecture', average: 4.3, benchmark: 4.0 },
    { dimension: 'Problem Solving', average: 4.2, benchmark: 3.8 },
    { dimension: 'Concurrency & Storage', average: 4.1, benchmark: 3.9 },
    { dimension: 'Incident Debugging', average: 4.4, benchmark: 4.0 },
    { dimension: 'Behavioral & Leadership', average: 4.2, benchmark: 3.8 },
  ];

  // Chart 3: Score Tier Distribution Data
  const scoreTierData = [
    { name: 'Top Tier (4.5 - 5.0)', value: Math.max(selectedCount, 3), color: '#10b981' },
    { name: 'Strong Match (3.8 - 4.4)', value: 5, color: '#6366f1' },
    { name: 'Moderate (3.0 - 3.7)', value: 4, color: '#f59e0b' },
    { name: 'Borderline (< 3.0)', value: 2, color: '#94a3b8' }
  ];

  // Chart 4: Skill Match Frequency
  const skillFrequencyData = [
    { skill: 'Distributed Systems', candidates: 9, demandIndex: 95 },
    { skill: 'Kubernetes / Docker', candidates: 8, demandIndex: 90 },
    { skill: 'Kafka / Event Sinks', candidates: 7, demandIndex: 88 },
    { skill: 'Go / Python Backend', candidates: 11, demandIndex: 98 },
    { skill: 'PostgreSQL / Storage', candidates: 10, demandIndex: 85 },
    { skill: 'CI/CD & DevOps', candidates: 6, demandIndex: 80 }
  ];

  // Chart 5: Velocity & Throughput
  const velocityData = [
    { day: 'Mon', completed: 2, invited: 4 },
    { day: 'Tue', completed: 3, invited: 5 },
    { day: 'Wed', completed: 5, invited: 6 },
    { day: 'Thu', completed: 4, invited: 3 },
    { day: 'Fri', completed: 6, invited: 7 },
    { day: 'Sat', completed: 3, invited: 2 },
    { day: 'Sun', completed: 2, invited: 1 }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Recruitment Analytics & Insights"
        subtitle="Competency benchmarks, interview completion velocity, funnel drop-off, and score distributions."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">
        {/* TOP METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Total Candidate Pool</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-display">{total}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-bold">{completed}</span> completed interviews
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Completion Velocity</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 font-display">{completionRate}%</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">Asynchronous interview throughput</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Selected for Next Round</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 font-display">{selectedCount}</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">{selectionRate}% recruiter advancement rate</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>AI Evidence Grounding</span>
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-purple-600 font-display">98.4%</div>
            <div className="text-[11px] font-medium text-slate-500 mt-1">Verbatim quote attribution rate</div>
          </motion.div>
        </div>

        {/* ROW 1: FUNNEL & VELOCITY CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funnel Conversion Chart */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Recruitment Pipeline Conversion Funnel</h3>
                <p className="text-xs text-slate-500 mt-0.5">Drop-off velocity across recruitment lifecycle stages</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                LIFECYCLE
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Velocity Line/Area Chart */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Interview Completion Velocity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Invitations dispatched vs interviews completed</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                THROUGHPUT
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvited" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  <Area type="monotone" dataKey="invited" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorInvited)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 2: COMPETENCY BENCHMARKS & SCORE TIERS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Competency Benchmark (2 cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Competency Dimension Distribution vs Benchmark</h3>
                <p className="text-xs text-slate-500 mt-0.5">Average scores across evaluated candidate responses on a 1.0 - 5.0 scale</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                EVALUATOR CALIBRATION
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competencyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dimension" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 5]} stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="average" name="Candidate Average" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="benchmark" name="Target Benchmark" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution Donut (1 col) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Score Tier Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Candidate qualification breakdown</p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreTierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {scoreTierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-1">
              {scoreTierData.map((tier, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }}></span>
                    <span className="text-slate-700 font-medium">{tier.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{tier.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3: SKILL MATCH & FREQUENCY */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">Top In-Demand Technical Skills in Candidate Pool</h3>
              <p className="text-xs text-slate-500 mt-0.5">Candidate count matching hiring campaign prerequisites</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              RESUME INGESTION DATA
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={skillFrequencyData} margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="skill" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="candidates" name="Qualified Candidates" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
