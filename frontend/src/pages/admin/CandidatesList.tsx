import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  UploadCloud,
  FileText,
  Mail,
  Copy,
  Check,
  Sparkles,
  X,
  Send,
  AlertCircle,
  Award,
  CheckCheck,
  Star
} from 'lucide-react';
import { apiRequest, uploadResumeFile } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const CandidatesList: React.FC = () => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'ALL' | 'SELECTED' | 'REVIEW' | 'IN_PROGRESS'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [summary, setSummary] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // Options
  const [autoGenerateLink, setAutoGenerateLink] = useState(true);
  const [autoSendEmail, setAutoSendEmail] = useState(true);

  // Success Result
  const [creationResult, setCreationResult] = useState<{
    candidate: any;
    invitation: any;
    emailSent: boolean;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchCandidates = async () => {
    try {
      const url = search ? `/candidates?search=${encodeURIComponent(search)}` : '/candidates';
      const data = await apiRequest(url);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidates', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await apiRequest('/campaigns');
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load campaigns', err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle Resume File Upload & Parsing
  const handleResumeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingResume(true);
    setFormError(null);
    setResumeFileName(file.name);

    try {
      const parsed = await uploadResumeFile(file);
      if (parsed.full_name && parsed.full_name !== 'Candidate') {
        setFullName(parsed.full_name);
      }
      if (parsed.email && parsed.email !== 'candidate@example.com') {
        setEmail(parsed.email);
      }
      if (parsed.current_title) {
        setCurrentTitle(parsed.current_title);
      }
      if (parsed.skills && parsed.skills.length > 0) {
        setSkillsStr(parsed.skills.join(', '));
      }
      if (parsed.summary) {
        setSummary(parsed.summary);
      }
      if (parsed.raw_text) {
        setResumeText(parsed.raw_text);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error parsing resume file');
    } finally {
      setIsParsingResume(false);
    }
  };

  // Submit Candidate Creation
  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) {
      setFormError('Please select a hiring campaign.');
      return;
    }
    if (!fullName.trim() || !email.trim()) {
      setFormError('Candidate full name and email are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const skills = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // 1. Create Candidate record
      const candidateData = await apiRequest('/candidates', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: selectedCampaignId,
          full_name: fullName.trim(),
          email: email.trim(),
          current_title: currentTitle.trim() || 'Software Engineer',
          skills,
          summary: summary.trim(),
          resume_text: resumeText.trim()
        })
      });

      let invData = null;
      let emailSent = false;

      // 2. Generate unique portal invitation if checked
      if (autoGenerateLink && candidateData.id) {
        invData = await apiRequest(`/invitations/candidates/${candidateData.id}`, {
          method: 'POST'
        });

        // 3. Dispatch credentials email if checked
        if (autoSendEmail && invData.id) {
          try {
            await apiRequest(`/invitations/${invData.id}/send-email`, {
              method: 'POST',
              body: JSON.stringify({
                custom_note: `Personalized technical assessment invitation for ${candidateData.full_name}.`
              })
            });
            emailSent = true;
          } catch (e) {
            console.warn('Email dispatch warning', e);
          }
        }
      }

      setCreationResult({
        candidate: candidateData,
        invitation: invData,
        emailSent
      });

      // Refresh list
      await fetchCandidates();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create candidate profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setShowAddModal(false);
    setCreationResult(null);
    setFullName('');
    setEmail('');
    setCurrentTitle('');
    setSkillsStr('');
    setSummary('');
    setResumeText('');
    setResumeFileName(null);
    setFormError(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Candidate Pipelines"
        subtitle="Manage candidates, ingest resumes, cross-examine claims, and inspect AI interview dossiers."
      />

      <div className="w-full max-w-[1750px] mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search candidate by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 shadow-xs transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Add Candidate with Resume</span>
            </button>

            <Link
              to="/admin/campaigns/new"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>New Campaign</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs Bar (Including Selected Candidates View) */}
        {(() => {
          const selectedCount = candidates.filter(c => c.decision === 'ADVANCE').length;
          const reviewCount = candidates.filter(c => c.status === 'UNDER_REVIEW' || c.interview_status === 'COMPLETED').length;
          const inProgressCount = candidates.filter(c => c.status === 'IN_PROGRESS' || c.status === 'INVITED').length;

          return (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setActiveFilterTab('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  activeFilterTab === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>All Candidates</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilterTab === 'ALL' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {candidates.length}
                </span>
              </button>

              <button
                onClick={() => setActiveFilterTab('SELECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  activeFilterTab === 'SELECTED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Selected Candidates (Next Round / Offers)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeFilterTab === 'SELECTED' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                  {selectedCount}
                </span>
              </button>

              <button
                onClick={() => setActiveFilterTab('REVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  activeFilterTab === 'REVIEW'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Needs Human Review</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilterTab === 'REVIEW' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {reviewCount}
                </span>
              </button>

              <button
                onClick={() => setActiveFilterTab('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  activeFilterTab === 'IN_PROGRESS'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Invited / In Progress</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilterTab === 'IN_PROGRESS' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {inProgressCount}
                </span>
              </button>
            </div>
          );
        })()}

        {/* Candidates Table */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-xl skeleton-shimmer w-full"></div>
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No candidates found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono">
                    <th className="pb-3.5 font-semibold">Candidate</th>
                    <th className="pb-3.5 font-semibold">Current Title</th>
                    <th className="pb-3.5 font-semibold">Status</th>
                    <th className="pb-3.5 font-semibold">Interview State</th>
                    <th className="pb-3.5 font-semibold">Overall Score</th>
                    <th className="pb-3.5 font-semibold text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates
                    .filter(c => {
                      if (activeFilterTab === 'SELECTED') return c.decision === 'ADVANCE';
                      if (activeFilterTab === 'REVIEW') return c.status === 'UNDER_REVIEW' || c.interview_status === 'COMPLETED';
                      if (activeFilterTab === 'IN_PROGRESS') return c.status === 'IN_PROGRESS' || c.status === 'INVITED';
                      return true;
                    })
                    .map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {c.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{c.full_name}</span>
                              {c.decision === 'ADVANCE' && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  SELECTED
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 font-medium">
                        {c.current_title || 'Software Engineer'}
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3.5 font-mono text-slate-600">
                        {c.interview_status}
                      </td>
                      <td className="py-3.5">
                        {c.overall_score ? (
                          <span className="font-bold text-indigo-600 font-mono">{c.overall_score} / 5.0</span>
                        ) : (
                          <span className="text-slate-400 font-mono">--</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/admin/candidates/${c.id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate & Ingest Resume Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Add Candidate & Ingest Resume</h3>
                    <p className="text-[11px] text-slate-500">Auto-extract metadata from PDF/DOCX and generate personalized interview credentials.</p>
                  </div>
                </div>
                <button
                  onClick={resetModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-5">
                {creationResult ? (
                  /* Success Screen */
                  <div className="space-y-5 text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <Check className="w-8 h-8" />
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 font-display">Candidate Enrolled Successfully!</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>{creationResult.candidate.full_name}</strong> is now registered in the pipeline with an AI interview plan.
                      </p>
                    </div>

                    {creationResult.invitation && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono uppercase text-slate-500 font-bold">Unique Candidate Portal Link</span>
                          {creationResult.emailSent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold flex items-center gap-1">
                              <Send className="w-3 h-3" /> Credentials Emailed
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={creationResult.invitation.portal_url || `${window.location.origin}/interview/${creationResult.invitation.raw_token || creationResult.invitation.token}`}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-700 select-all"
                          />
                          <button
                            onClick={() => {
                              const token = creationResult.invitation.raw_token || creationResult.invitation.token;
                              const url = creationResult.invitation.portal_url || `${window.location.origin}/interview/${token}`;
                              navigator.clipboard.writeText(url);
                              setCopiedLink(true);
                              setTimeout(() => setCopiedLink(false), 2000);
                            }}
                            className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shrink-0 hover:bg-indigo-700 transition-colors inline-flex items-center gap-1"
                          >
                            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-center gap-3">
                      {creationResult.invitation && (
                        <a
                          href={creationResult.invitation.portal_url || `/interview/${creationResult.invitation.raw_token || creationResult.invitation.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Open Candidate Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={resetModal}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Close & Refresh Pipeline
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Form */
                  <form onSubmit={handleCreateCandidate} className="space-y-4">
                    {formError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Hiring Campaign Select */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Target Hiring Campaign *
                      </label>
                      <select
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                      >
                        {campaigns.map((camp) => (
                          <option key={camp.id} value={camp.id}>
                            {camp.title} ({camp.job_title})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resume Upload Dropzone */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Upload Candidate Resume (PDF / DOCX / TXT)
                      </label>
                      <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all group">
                        <UploadCloud className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform mb-1.5" />
                        <span className="text-xs font-semibold text-slate-800">
                          {isParsingResume
                            ? 'Extracting metadata from resume...'
                            : resumeFileName
                            ? `Selected: ${resumeFileName}`
                            : 'Choose Resume File or Drag & Drop'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Supports PDF, DOCX, and TXT (sample resumes available in resumes/ folder)
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={handleResumeFileSelect}
                          className="hidden"
                          disabled={isParsingResume}
                        />
                      </label>
                    </div>

                    {/* Name & Email Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Abhinav Sharma"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Candidate Email *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="abhinavclouds@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Title & Skills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Title</label>
                        <input
                          type="text"
                          value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                          placeholder="e.g. Senior Distributed Systems Architect"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Key Skills (comma separated)</label>
                        <input
                          type="text"
                          value={skillsStr}
                          onChange={(e) => setSkillsStr(e.target.value)}
                          placeholder="Python, Go, Kubernetes, PostgreSQL"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Summary / Excerpt */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Summary / Bio</label>
                      <textarea
                        rows={3}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Summary auto-extracted from resume..."
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs leading-relaxed"
                      />
                    </div>

                    {/* Automation Checkboxes */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2 text-xs">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoGenerateLink}
                          onChange={(e) => setAutoGenerateLink(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-900">
                          Automatically generate unique candidate interview portal link
                        </span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={autoSendEmail}
                          onChange={(e) => setAutoSendEmail(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-900">
                          Dispatch personalized credentials email to candidate ({email || 'candidate email'})
                        </span>
                      </label>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={resetModal}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || isParsingResume}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Ingesting & Enrolling...' : 'Register Candidate & Generate Portal'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
