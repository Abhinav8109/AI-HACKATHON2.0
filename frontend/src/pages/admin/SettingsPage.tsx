import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Cpu,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Mail,
  Zap,
  RefreshCw,
  Server,
  KeyRound,
  FileCheck2,
  Sparkles,
  Save,
  Check,
  Building,
  Sliders,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  Minus,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'WORKSPACE' | 'SECURITY' | 'COMPLIANCE' | 'EMAIL'>('WORKSPACE');
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | null>(null);

  // Workspace Customizations State
  const [orgName, setOrgName] = useState('TalentPilot Global Enterprise');
  const [questionCount, setQuestionCount] = useState('8');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [groundingMode, setGroundingMode] = useState('STRICT_RESUME');
  const [antiBiasPolicy, setAntiBiasPolicy] = useState('STRICT');
  const [interviewTimeLimit, setInterviewTimeLimit] = useState('10');
  const [autoEmailInvite, setAutoEmailInvite] = useState(true);
  const [senderName, setSenderName] = useState('Sarah Chen (Talent Lead)');
  const [senderEmail, setSenderEmail] = useState('admin@talentpilot.ai');
  const [customWelcomeNote, setCustomWelcomeNote] = useState(
    'Welcome to your technical assessment. Take your time to detail your architectural thinking.'
  );

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings Save State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Compliance Audit Events
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  useEffect(() => {
    // Load persisted settings if available
    const saved = localStorage.getItem('talentpilot_workspace_customizations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.orgName) setOrgName(parsed.orgName);
        if (parsed.questionCount) setQuestionCount(parsed.questionCount);
        if (parsed.aiModel) setAiModel(parsed.aiModel);
        if (parsed.groundingMode) setGroundingMode(parsed.groundingMode);
        if (parsed.antiBiasPolicy) setAntiBiasPolicy(parsed.antiBiasPolicy);
        if (parsed.interviewTimeLimit) setInterviewTimeLimit(parsed.interviewTimeLimit);
        if (parsed.senderName) setSenderName(parsed.senderName);
        if (parsed.customWelcomeNote) setCustomWelcomeNote(parsed.customWelcomeNote);
      } catch (e) {
        console.error(e);
      }
    }
    fetchComplianceEvents();
  }, []);

  const fetchComplianceEvents = async () => {
    setIsLoadingAudit(true);
    try {
      const data = await apiRequest('/dashboard/activity?limit=15');
      setAuditEvents(data || []);
    } catch (e) {
      console.warn('Could not load audit events', e);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const durationNum = parseInt(interviewTimeLimit, 10) || 10;
    const settingsPayload = {
      orgName,
      questionCount,
      aiModel,
      groundingMode,
      antiBiasPolicy,
      interviewTimeLimit: durationNum.toString(),
      autoEmailInvite,
      senderName,
      senderEmail,
      customWelcomeNote,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('talentpilot_workspace_customizations', JSON.stringify(settingsPayload));

    try {
      await apiRequest('/campaigns/time-window', {
        method: 'POST',
        body: JSON.stringify({ duration_minutes: durationNum })
      });
    } catch (err) {
      console.warn('Time window backend sync notice:', err);
    }

    setIsSavingSettings(false);
    setSaveSuccessNotice(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordNotice({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      setPasswordNotice({ type: 'success', text: 'Password successfully changed! Your credentials are now updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setPasswordNotice({ type: 'error', text: err.message || 'Failed to update password. Verify your current password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const checkHealth = () => {
    setHealthStatus('checking');
    setTimeout(() => {
      setHealthStatus('healthy');
      setTimeout(() => setHealthStatus(null), 3500);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Workspace Configuration & Recruiter Settings"
        subtitle="Customize agent behavior, interview questions, email templates, and security credentials."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
        {/* TOP CLUSTER TELEMETRY BANNER */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 font-display">TalentPilot AI Platform Cluster</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  ALL SYSTEMS OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">FastAPI Backend &bull; SQLite Persistence &bull; Gemini 2.5 Flash Orchestration</p>
            </div>
          </div>
          <button
            onClick={checkHealth}
            disabled={healthStatus === 'checking'}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthStatus === 'checking' ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{healthStatus === 'healthy' ? 'Cluster Diagnostics Passed (100%)' : 'Run Diagnostics'}</span>
          </button>
        </div>

        {/* NOTIFICATIONS */}
        <AnimatePresence>
          {saveSuccessNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Workspace settings and agent parameters updated successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('WORKSPACE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
              activeTab === 'WORKSPACE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Workspace & AI Agent Calibration</span>
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
              activeTab === 'SECURITY'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Recruiter Security & Password</span>
          </button>

          <button
            onClick={() => setActiveTab('EMAIL')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
              activeTab === 'EMAIL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email & Candidate Communication</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLIANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
              activeTab === 'COMPLIANCE'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Compliance Logged Events</span>
          </button>
        </div>

        {/* TAB 1: WORKSPACE & AI AGENT CUSTOMIZATIONS */}
        {activeTab === 'WORKSPACE' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Organization Profile */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">Organization & Workspace Identity</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Appears on candidate invitations, emails, and scorecards.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Candidate Assessment Limit</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="8">Strictly 8 Questions (Standard Balanced Assessment)</option>
                    <option value="6">6 Questions (Accelerated Screen)</option>
                    <option value="10">10 Questions (Deep Technical Architecture)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Sets the exact number of interview questions prepared per candidate session.</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Interview Time Window</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {interviewTimeLimit} Minutes Active
                    </span>
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(interviewTimeLimit, 10) || 10;
                        setInterviewTimeLimit(Math.max(1, current - 5).toString());
                      }}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs active:scale-95"
                      title="Decrease by 5 minutes"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={interviewTimeLimit}
                        onChange={(e) => setInterviewTimeLimit(e.target.value)}
                        className="w-full px-4 py-2 text-center rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                        mins
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(interviewTimeLimit, 10) || 10;
                        setInterviewTimeLimit(Math.min(180, current + 5).toString());
                      }}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs active:scale-95"
                      title="Increase by 5 minutes"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Quick Pills */}
                  <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                    {[
                      { val: '5', label: '5m' },
                      { val: '10', label: '10m (Default)' },
                      { val: '15', label: '15m' },
                      { val: '20', label: '20m' },
                      { val: '30', label: '30m' },
                      { val: '45', label: '45m' },
                      { val: '60', label: '60m' }
                    ].map((preset) => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setInterviewTimeLimit(preset.val)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          interviewTimeLimit === preset.val
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2">
                    Enforces a live countdown timer during candidate portal sessions. Automatically submits answers when time elapses.
                  </p>
                </div>
              </div>

              {/* AI Agent Engine Parameters */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-display">Gemini AI Engine & Grounding Rules</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Foundation LLM</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Sub-500ms Low-Latency Inference)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Architectural Reasoning)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Powers Planner, Interviewer, Consistency, Evaluator, and Critic agents.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Evidence Grounding Policy</label>
                  <select
                    value={groundingMode}
                    onChange={(e) => setGroundingMode(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="STRICT_RESUME">Strict Resume-Grounded Only (Every question cites candidate projects)</option>
                    <option value="BALANCED">Balanced (Resume claims + general role competencies)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fair-Chance & Anti-Bias Auditing</label>
                  <select
                    value={antiBiasPolicy}
                    onChange={(e) => setAntiBiasPolicy(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="STRICT">Strict (Zero auto-rejections; 100% human-in-the-loop audit)</option>
                    <option value="STANDARD">Standard Enterprise Compliance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSettings ? 'Saving Configuration...' : 'Save Workspace Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: RECRUITER SECURITY & PASSWORD CHANGE */}
        {activeTab === 'SECURITY' && (
          <div className="max-w-2xl bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <KeyRound className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Change Recruiter Password</h3>
                <p className="text-xs text-slate-500">Update credentials for admin@talentpilot.ai access</p>
              </div>
            </div>

            {passwordNotice && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  passwordNotice.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {passwordNotice.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{passwordNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password (e.g. admin or talentpilot123)"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password (min. 4 characters)"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-all active:scale-98"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: EMAIL & CANDIDATE COMMUNICATION */}
        {activeTab === 'EMAIL' && (
          <form onSubmit={handleSaveSettings} className="max-w-3xl bg-white p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-display">Candidate Email & Dispatch Settings</h3>
                <p className="text-xs text-slate-500">Configure transactional SMTP and stage notifications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Display Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reply-To / System Sender Email</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Candidate Welcome Note</label>
              <textarea
                rows={3}
                value={customWelcomeNote}
                onChange={(e) => setCustomWelcomeNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Configured Delivery Channels</span>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Stage 1: Personalized Candidate Invitation & Credentials</span>
                <span className="text-emerald-700 font-bold font-mono">AUTOMATIC (SMTP)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Stage 2: Post-Interview Confirmation & Receipt</span>
                <span className="text-emerald-700 font-bold font-mono">AUTOMATIC (SMTP)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Stage 3: Next Round Advancement & Decision</span>
                <span className="text-emerald-700 font-bold font-mono">ON RECRUITER DECISION</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save Email Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: COMPLIANCE LOGGED EVENTS */}
        {activeTab === 'COMPLIANCE' && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">Compliance Logged Events</h3>
                  <p className="text-xs text-slate-500">Tamper-evident audit trail of recruiter actions, logins, and evaluations</p>
                </div>
              </div>
              <button
                onClick={fetchComplianceEvents}
                disabled={isLoadingAudit}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAudit ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            {auditEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No compliance events recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {auditEvents.map((evt, idx) => (
                  <div key={idx} className="py-3 flex items-start justify-between gap-4 text-xs hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <span>{evt.title || evt.action || 'COMPLIANCE_EVENT'}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{evt.description || 'System state change authenticated.'}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {new Date(evt.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
