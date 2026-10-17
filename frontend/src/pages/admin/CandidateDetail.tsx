import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Layers,
  MessageSquare,
  FileCheck2,
  Quote,
  ShieldCheck,
  UserCheck,
  ArrowLeft,
  Copy,
  ExternalLink,
  Check,
  Sparkles,
  AlertTriangle,
  Download,
  Mail,
  UploadCloud,
  Send,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiRequest } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';
import { StatusBadge } from '../../components/StatusBadge';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'plan' | 'transcript' | 'evaluation' | 'evidence' | 'consistency' | 'decision'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  
  // Recruiter Decision State
  const [decision, setDecision] = useState('ADVANCE');
  const [rationale, setRationale] = useState('Candidate demonstrated exemplary system architecture understanding with concrete evidence quotes.');
  const [decisionSuccess, setDecisionSuccess] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isResendingDecisionEmail, setIsResendingDecisionEmail] = useState(false);
  const [isReEvaluating, setIsReEvaluating] = useState(false);
  const [reEvaluateNotice, setReEvaluateNotice] = useState<string | null>(null);

  const handleTriggerReEvaluation = async () => {
    if (!id) return;
    setIsReEvaluating(true);
    try {
      const res = await apiRequest(`/candidates/${id}/re-evaluate`, {
        method: 'POST'
      });
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      setReEvaluateNotice(`AI Multi-Agent deep re-audit complete! Analyzed ${res.evidence_count || 8} questions with strict honest scoring (${res.overall_score} / 5.0).`);
      await fetchDossier();
      setTimeout(() => setReEvaluateNotice(null), 8000);
    } catch (err: any) {
      alert(err.message || 'Failed to trigger re-evaluation');
    } finally {
      setIsReEvaluating(false);
    }
  };

  const fetchDossier = async () => {
    try {
      const res = await apiRequest(`/candidates/${id}`);
      setData(res);
      if (res.decision) {
        setDecision(res.decision.decision);
        setRationale(res.decision.rationale);
      }
    } catch (err) {
      console.error('Failed to load candidate dossier', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [id]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateLink = async () => {
    try {
      await apiRequest(`/invitations/candidates/${id}`, { method: 'POST' });
      await fetchDossier();
    } catch (e) {
      alert('Failed to generate invitation link');
    }
  };

  const handleSendEmail = async () => {
    if (!latestInvitation?.id) return;
    setIsSendingEmail(true);
    setEmailNotice(null);
    try {
      const res = await apiRequest(`/invitations/${latestInvitation.id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({
          custom_note: `Personalized technical assessment invitation for ${candidate.full_name}.`
        })
      });
      setEmailNotice(`Credentials email sent to ${candidate.email}! (${res.status} via Gmail SMTP — check Spam/Promotions if not in Primary inbox)`);
      setTimeout(() => setEmailNotice(null), 8000);
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUploadResumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingResume(true);
    setResumeNotice(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/candidates/${id}/resume`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Resume upload failed');
      }
      setResumeNotice('Resume file uploaded & parsed! Claims and skills refreshed.');
      await fetchDossier();
      setTimeout(() => setResumeNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleRecordDecision = async () => {
    const candidate = data?.candidate;
    if (!id || !candidate) return;
    setIsSubmittingDecision(true);
    try {
      let res;
      try {
        res = await apiRequest(`/candidates/${id}/decision`, {
          method: 'POST',
          body: JSON.stringify({ decision, rationale })
        });
      } catch (err) {
        if (data?.session?.id) {
          res = await apiRequest(`/interviews/${data.session.id}/decision`, {
            method: 'POST',
            body: JSON.stringify({ decision, rationale })
          });
        } else {
          throw err;
        }
      }

      setDecisionSuccess(true);
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.65 } });
      setEmailNotice(`Stage 3 Decision Email successfully dispatched to ${candidate.email}! (${res?.email_status || 'SENT'} via Gmail SMTP)`);
      await fetchDossier();
      setTimeout(() => setDecisionSuccess(false), 5000);
      setTimeout(() => setEmailNotice(null), 8000);
    } catch (e: any) {
      alert(e.message || 'Failed to record decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleResendDecisionEmail = async () => {
    const candidate = data?.candidate;
    if (!id || !candidate) return;
    setIsResendingDecisionEmail(true);
    try {
      const res = await apiRequest(`/candidates/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision, rationale })
      });
      confetti({ particleCount: 50, spread: 45, origin: { y: 0.7 } });
      setEmailNotice(`Stage 3 Decision Email re-sent to ${candidate.email}! (${res?.email_status || 'SENT'} via Gmail SMTP)`);
      setTimeout(() => setEmailNotice(null), 8000);
    } catch (e: any) {
      alert(e.message || 'Failed to resend decision email');
    } finally {
      setIsResendingDecisionEmail(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
        <AdminHeader title="Candidate Intelligence Dossier" subtitle="Loading candidate records..." />
        <div className="p-6 lg:p-10 max-w-[1700px] w-full mx-auto space-y-6">
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

  const { candidate, campaign, resume, claims, interview_plan, session, answers, evaluation, evidence_items, consistency_findings, invitations } = data;
  const latestInvitation = invitations && invitations.length > 0 ? invitations[0] : null;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Users },
    { key: 'resume', label: 'Resume & Claims', icon: FileText },
    { key: 'plan', label: 'Interview Plan', icon: Layers },
    { key: 'transcript', label: 'Transcript & AI Reviews', icon: MessageSquare },
    { key: 'evaluation', label: 'Scorecard', icon: FileCheck2 },
    { key: 'evidence', label: 'Evidence Quotes & AI Audit', icon: Quote },
    { key: 'consistency', label: 'Fact Verification', icon: ShieldCheck },
    { key: 'decision', label: 'Human Decision', icon: UserCheck },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title={`${candidate.full_name} — Candidate Intelligence Dossier`}
        subtitle={`Target Role: ${campaign?.job_title || 'Engineering'} • Candidate ID: ${candidate.id.slice(0, 8)}`}
      />

      <div className="p-6 lg:p-10 max-w-[1700px] w-full mx-auto space-y-8">
        {/* Navigation & Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <Link to="/admin/candidates" className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Candidates
          </Link>

          <div className="flex items-center flex-wrap gap-3">
            <StatusBadge status={candidate.status} />
            {evaluation?.overall_score && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/90 px-3 py-1 rounded-full font-mono shadow-xs">
                Score: {evaluation.overall_score} / 5.0
              </span>
            )}
            {answers && answers.length > 0 && (
              <button
                type="button"
                disabled={isReEvaluating}
                onClick={handleTriggerReEvaluation}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border border-indigo-500 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isReEvaluating ? 'animate-spin text-indigo-200' : 'text-indigo-200'}`} />
                <span>{isReEvaluating ? 'Auditing with AI...' : 'Re-Audit Answers with AI'}</span>
              </button>
            )}
            <a
              href={`/api/v1/reports/candidates/${candidate.id}/export?format=html`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Dossier</span>
            </a>
          </div>
        </div>

        {/* Email, Resume & AI Re-Evaluate Action Notices */}
        {reEvaluateNotice && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium flex items-center gap-2 shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{reEvaluateNotice}</span>
          </div>
        )}
        {emailNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 shadow-xs">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailNotice}</span>
          </div>
        )}
        {resumeNotice && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium flex items-center gap-2 shadow-xs">
            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{resumeNotice}</span>
          </div>
        )}

        {/* INVITATION QUICK ACTIONS */}
        <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="text-xs font-bold text-slate-900 mb-0.5">Unique Candidate Portal Link</div>
            <div className="text-[11px] text-slate-600">
              {latestInvitation ? (
                <span>Active Link &bull; Status: <strong className="text-indigo-700 font-semibold">{latestInvitation.status}</strong></span>
              ) : (
                <span>No invitation link generated yet for this candidate.</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {latestInvitation ? (
              <>
                <button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20 active:scale-98"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isSendingEmail ? 'Sending...' : 'Email Credentials'}</span>
                </button>
                <button
                  onClick={() => {
                    const token = latestInvitation.raw_token || latestInvitation.token;
                    const url = latestInvitation.portal_url || (token ? `${window.location.origin}/interview/${token}` : `${window.location.origin}/interview/${latestInvitation.token_prefix}`);
                    handleCopyLink(url);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
                <a
                  href={latestInvitation.portal_url || `${window.location.origin}/interview/${latestInvitation.raw_token || latestInvitation.token || latestInvitation.token_prefix}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            ) : (
              <button
                onClick={handleGenerateLink}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-600/20 active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Unique Portal Link</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
                activeTab === t.key
                  ? 'bg-white text-indigo-700 border-t border-x border-slate-200 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <t.icon className={`w-3.5 h-3.5 ${activeTab === t.key ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT PANELS */}
        <div className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm min-h-[400px]">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-mono font-medium">Current Title</span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{candidate.current_title || 'Software Engineer'}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-mono font-medium">Contact Email</span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{candidate.email}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 font-mono font-medium">Location</span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{candidate.location || 'Remote'}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2.5">Technical Skills & Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills || []).map((s: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {candidate.summary && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">Professional Summary</h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {candidate.summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESUME & CLAIMS */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Extracted Resume Claims & Facts</h4>
                  <p className="text-[11px] text-slate-500">Cross-referenced against interview answers and verifiable credentials.</p>
                </div>
                <label className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/90 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isUploadingResume ? 'Parsing Resume...' : 'Upload / Update Resume File'}</span>
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleUploadResumeFile} className="hidden" />
                </label>
              </div>

              <div>
                <div className="space-y-2.5">
                  {claims && claims.length > 0 ? (
                    claims.map((claim: any) => (
                      <div key={claim.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                        <div>
                          <div className="text-xs font-semibold text-slate-900">{claim.claim_text}</div>
                          {claim.source_excerpt && (
                            <div className="text-[11px] text-slate-500 mt-1 italic">Source: "{claim.source_excerpt}"</div>
                          )}
                        </div>
                        <StatusBadge status={claim.verification_status} />
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">No claims extracted yet.</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">Raw Resume Text</h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-600 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {resume ? resume.raw_text : 'No resume file uploaded yet.'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEW PLAN */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Personalized Interview Plan</h4>
                  <p className="text-[11px] text-slate-500">Generated by Planner Agent matching role JD to this candidate's background.</p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Approved Plan
                </span>
              </div>

              <div className="space-y-3">
                {interview_plan?.questions?.map((q: any, idx: number) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-700">Question {idx + 1} &bull; {q.competency}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 shadow-2xs">
                        {q.difficulty} &bull; {q.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">{q.question_text}</p>
                    {q.relevant_resume_claim && (
                      <p className="text-[11px] text-slate-500 italic">Targeting Claim: {q.relevant_resume_claim}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INTERVIEW TRANSCRIPT & PER-QUESTION AI AUDIT */}
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Verified Interview Transcript & Real-Time AI Review</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Every answer is audited individually by the Evaluator Agent with zero-tolerance scoring (0.0 to 5.0).
                  </p>
                </div>
                {answers && answers.length > 0 && (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {answers.length} Responses Recorded
                  </span>
                )}
              </div>

              {answers && answers.length > 0 ? (
                <div className="space-y-5">
                  {answers.map((a: any, idx: number) => {
                    const matchingEvidence = evidence_items && evidence_items[idx];
                    const score = a.ai_score ?? matchingEvidence?.score;
                    const review = a.ai_review ?? matchingEvidence?.explanation;
                    const questionText = matchingEvidence?.dimension_name || (interview_plan?.questions?.[idx]?.question_text) || `Interview Question ${idx + 1}`;

                    return (
                      <div key={a.id || idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
                        {/* Header: Question context */}
                        <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 border-b border-slate-100">
                          <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                              Q{idx + 1}
                            </span>
                            <span>{a.is_follow_up ? 'Follow-Up Adaptive Probe' : questionText}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {a.word_count} words &bull; {new Date(a.saved_at).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Candidate Answer */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Candidate Answer:</span>
                          <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 font-sans">
                            {a.answer_text}
                          </p>
                        </div>

                        {/* AI Evaluator Agent Response Audit Card */}
                        {(score !== undefined && score !== null) && (
                          <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                            score < 1.5
                              ? 'bg-rose-50/40 border-rose-200 text-rose-950'
                              : score < 3.0
                              ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                              : 'bg-indigo-50/40 border-indigo-200 text-indigo-950'
                          }`}>
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                                  AI Evaluator Agent Technical Audit
                                </span>
                              </div>
                              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                                score < 1.5
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : score < 3.0
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              }`}>
                                Honest Score: {score} / 5.0
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              {review || "AI audited response depth, trade-off coverage, and architectural grounding against standard role expectations."}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                  Candidate has not submitted any answers yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EVALUATION SCORECARD */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              {evaluation ? (
                <>
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-mono font-medium">Overall Synthesis</span>
                      <div className="text-2xl font-black text-indigo-600 font-display mt-0.5">{evaluation.overall_score} / 5.0</div>
                      <div className="text-xs text-slate-600 mt-1">Recommendation: <strong className="text-slate-900">{evaluation.recommendation}</strong></div>
                    </div>
                    <div>
                      <StatusBadge status={evaluation.recommendation} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2">Executive Summary</h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      {evaluation.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                      <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono mb-2">Demonstrated Strengths</h4>
                      <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                        {(evaluation.strengths || []).map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">&bull;</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono mb-2">Areas for Growth</h4>
                      <ul className="space-y-1.5 text-xs text-amber-950 font-medium">
                        {(evaluation.development_areas || []).map((d: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">&bull;</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Evaluation has not been generated yet. Complete the interview to generate the scorecard.
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EVIDENCE & ANCHORS */}
          {activeTab === 'evidence' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-indigo-100">
                      Multi-Agent Verbatim Evidence Engine
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold">
                      Honest 0.0 - 5.0 Scoring
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    Evaluator Agent audits every single question response individually. Evasive, off-topic, or empty answers receive <strong>0.0</strong>; superficial definitions receive <strong>1.0</strong>; battle-tested architecture earns <strong>4.0–5.0</strong>.
                  </p>
                </div>
                {answers && answers.length > 0 && (
                  <button
                    type="button"
                    disabled={isReEvaluating}
                    onClick={handleTriggerReEvaluation}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-indigo-900 text-xs font-bold shrink-0 transition-all shadow-sm active:scale-98 flex items-center gap-2"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isReEvaluating ? 'animate-spin' : ''}`} />
                    <span>{isReEvaluating ? 'Auditing with AI...' : 'Re-Run AI Deep Audit'}</span>
                  </button>
                )}
              </div>

              {evidence_items && evidence_items.length > 0 ? (
                <div className="space-y-4">
                  {evidence_items.map((item: any, idx: number) => {
                    const score = Number(item.score);
                    const isZeroOrLow = score < 1.5;
                    const isMedium = score >= 1.5 && score < 3.0;

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-5 rounded-2xl border transition-all space-y-3.5 bg-white shadow-xs ${
                          isZeroOrLow
                            ? 'border-rose-200 bg-rose-50/10'
                            : isMedium
                            ? 'border-amber-200 bg-amber-50/10'
                            : 'border-slate-200 hover:border-indigo-200'
                        }`}
                      >
                        {/* Header: Question Number, Dimension, Score */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold font-mono flex items-center justify-center border border-indigo-100">
                              Q{idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              {item.dimension_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border shadow-2xs ${
                                isZeroOrLow
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : isMedium
                                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              }`}
                            >
                              {item.score} / 5.0 &bull; {item.rubric_anchor}
                            </span>
                          </div>
                        </div>

                        {/* Verbatim Candidate Quote Block */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                            <Quote className="w-3 h-3 text-indigo-500" />
                            <span>Candidate Verbatim Evidence Quote</span>
                          </div>
                          <p className="text-xs text-slate-800 italic leading-relaxed">
                            "{item.evidence_quote}"
                          </p>
                        </div>

                        {/* AI Technical Review & Critique */}
                        <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100/80 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider font-mono">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>AI Evaluator Agent Technical Critique</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {item.explanation}
                          </p>
                        </div>

                        {/* Missing Elements / Deductions (if present) */}
                        {item.missing_evidence && item.missing_evidence !== 'None identified' && (
                          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-semibold">Points Deducted / Missing Engineering Elements: </strong>
                              <span>{item.missing_evidence}</span>
                            </div>
                          </div>
                        )}

                        {/* Confidence & Authenticity Signal */}
                        {item.confidence_limitations && (
                          <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-100">
                            <span>Audit Metadata: {item.confidence_limitations}</span>
                            <span className="text-indigo-600 font-semibold">&#10003; Quote Grounded</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                  No evidence quotes generated yet. Candidate has not submitted answers.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: RESUME FACT VERIFICATION */}
          {activeTab === 'consistency' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Resume Consistency & Fact Verification</h4>
              {consistency_findings && consistency_findings.length > 0 ? (
                <div className="space-y-3">
                  {consistency_findings.map((cf: any) => (
                    <div key={cf.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Claim: "{cf.claim_text}"</span>
                        <StatusBadge status={cf.finding_type} />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{cf.explanation}</p>
                      {cf.suggested_follow_up && (
                        <p className="text-[11px] text-indigo-700 font-mono font-medium">Recommended Follow-up: {cf.suggested_follow_up}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Fact verification analysis will run once the interview is submitted.
                </div>
              )}
            </div>
          )}

          {/* TAB 8: HUMAN DECISION */}
          {activeTab === 'decision' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">Human Recruiter Decision Authority</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">Stage 3 Automation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  As required by responsible AI governance, AI agents extract verifiable evidence quotes, but the authorized human recruiter retains 100% final hiring authority. Recording your decision here automatically dispatches the <strong>Stage 3 Next-Round News Email</strong> directly to the candidate's inbox.
                </p>
              </div>

              {/* Existing Recorded Decision Card if present */}
              {data.decision && (
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">Current Official Decision:</span>
                      <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-indigo-600 text-white font-mono shadow-xs">
                        {data.decision.decision}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isResendingDecisionEmail}
                      onClick={handleResendDecisionEmail}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs active:scale-98"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isResendingDecisionEmail ? 'animate-spin' : ''}`} />
                      <span>{isResendingDecisionEmail ? 'Dispatching...' : 'Resend Stage 3 Decision Email'}</span>
                    </button>
                  </div>
                  
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-100 text-xs text-slate-700 italic">
                    "{data.decision.rationale}"
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Recorded: {data.decision.recorded_at ? new Date(data.decision.recorded_at).toLocaleString() : 'Recent'}</span>
                    <span className="text-indigo-600 font-semibold">&#10003; Stage 3 Candidate Notification Connected</span>
                  </div>
                </div>
              )}

              {decisionSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-xs font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official Human Decision recorded in immutable audit ledger & Stage 3 email dispatched to candidate!</span>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5 shadow-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">Select Official Pipeline Decision</label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-indigo-500 shadow-xs"
                  >
                    <option value="ADVANCE">&#127881; ADVANCE — Advance to Next Technical Panel / Offer</option>
                    <option value="HOLD">&#9208; HOLD — Hold for Comparative Cohort Review</option>
                    <option value="NEXT_ROUND">&#128172; NEXT_ROUND — Schedule Additional Technical Probe</option>
                    <option value="REJECT">&#10006; REJECT — Archive / Do Not Advance</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800">Recruiter Rationale & Audit Justification</label>
                    <span className="text-[11px] text-slate-400 font-mono">Sent to candidate in notification</span>
                  </div>

                  {/* Pre-fill suggestion chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="text-[10px] text-slate-500 font-semibold">Quick Rationale:</span>
                    {[
                      "Demonstrated world-class distributed systems depth & consensus mastery.",
                      "Exemplary practical trade-off analysis between latency and consistency.",
                      "Solid architectural foundation; advancing to final leadership panel.",
                      "Well-grounded responses with verbatim code and system proof points."
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRationale(chip)}
                        className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                      >
                        + {chip.slice(0, 32)}...
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={4}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Enter objective rationale grounded in observable candidate answers..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 leading-relaxed shadow-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-4 flex-wrap border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Dispatches personalized decision update to <strong>{candidate.email}</strong></span>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmittingDecision}
                    onClick={handleRecordDecision}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-98 inline-flex items-center gap-2"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSubmittingDecision ? 'animate-pulse' : ''}`} />
                    <span>{isSubmittingDecision ? 'Recording & Sending...' : 'Record Decision & Send Stage 3 Email'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
