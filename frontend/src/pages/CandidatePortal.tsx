import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  Save,
  Pause,
  Play,
  RotateCcw,
  Check,
  Send,
  Lock,
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiRequest } from '../api/client';

export const CandidatePortal: React.FC = () => {
  const { invitationToken } = useParams<{ invitationToken: string }>();
  const [session, setSession] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState<any>(null);
  const [answerText, setAnswerText] = useState('');
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [followUpPrompt, setFollowUpPrompt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes default (in seconds)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // Fetch session details on load
  const loadSession = async () => {
    if (!invitationToken) return;
    try {
      setError(null);
      const data = await apiRequest(`/portal/session?token=${invitationToken}`);
      setSession(data);

      // Initialize or restore countdown timer
      const durationMins = data.duration_minutes || 10;
      const totalSeconds = durationMins * 60;
      const timerKey = `tp_timer_${invitationToken}`;
      const savedStart = localStorage.getItem(timerKey);
      if (savedStart) {
        const elapsed = Math.floor((Date.now() - parseInt(savedStart, 10)) / 1000);
        setTimeLeft(Math.max(0, totalSeconds - elapsed));
      } else {
        setTimeLeft(totalSeconds);
      }

      if (data.session_status === 'COMPLETED') {
        setIsCompleted(true);
      } else if (data.session_status === 'IN_PROGRESS') {
        await loadQuestion();
      }
    } catch (err: any) {
      setError(err.message || 'Unable to access interview session.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current question & restore autosaved answer if any
  const loadQuestion = async () => {
    if (!invitationToken) return;
    try {
      const qData = await apiRequest(`/portal/interview?token=${invitationToken}`);
      if (qData.is_completed) {
        setIsCompleted(true);
      } else {
        setCurrentQ(qData);
        setAnswerText(qData.saved_answer || '');
        setIsFollowUp(false);
        setFollowUpPrompt(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load question.');
    }
  };

  useEffect(() => {
    loadSession();
  }, [invitationToken]);

  // Give consent
  const handleConsent = async () => {
    try {
      await apiRequest(`/portal/consent?token=${invitationToken}`, { method: 'POST' });
      setSession((prev: any) => ({ ...prev, consent_given: true }));
    } catch (e: any) {
      setError(e.message || 'Failed to record consent');
    }
  };

  // Start interview
  const handleStart = async () => {
    try {
      await apiRequest(`/portal/start?token=${invitationToken}`, { method: 'POST' });
      setSession((prev: any) => ({ ...prev, session_status: 'IN_PROGRESS' }));

      // Record timer start timestamp in localStorage to preserve across reloads
      const timerKey = `tp_timer_${invitationToken}`;
      if (!localStorage.getItem(timerKey)) {
        localStorage.setItem(timerKey, Date.now().toString());
      }

      await loadQuestion();
    } catch (e: any) {
      setError(e.message || 'Failed to start interview');
    }
  };

  // Countdown Timer Interval
  useEffect(() => {
    if (isCompleted || !session || session.session_status !== 'IN_PROGRESS' || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasAutoSubmitted) {
            setHasAutoSubmitted(true);
            handleFinalSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, session?.session_status, isPaused, hasAutoSubmitted]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Autosave answer
  const handleAutosave = async () => {
    if (!currentQ?.question?.id || !answerText.trim()) return;
    setIsSaving(true);
    try {
      await apiRequest(`/portal/answers?token=${invitationToken}`, {
        method: 'POST',
        body: JSON.stringify({
          question_id: currentQ.question.id,
          answer_text: answerText,
          is_follow_up: isFollowUp,
          follow_up_prompt: followUpPrompt
        })
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error('Autosave error', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Answer & Handle Adaptive Follow-up
  const handleSubmitAnswer = async () => {
    if (!currentQ?.question?.id || !answerText.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest(`/portal/answers?token=${invitationToken}`, {
        method: 'POST',
        body: JSON.stringify({
          question_id: currentQ.question.id,
          answer_text: answerText,
          is_follow_up: isFollowUp,
          follow_up_prompt: followUpPrompt
        })
      });

      // Adaptive Interviewer Decision
      if (res.needs_follow_up && !isFollowUp) {
        setIsFollowUp(true);
        setFollowUpPrompt(res.follow_up_prompt);
        setAnswerText(''); // Ready for follow-up reply
      } else {
        // Next question
        await loadQuestion();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer. Your draft has been preserved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalize Interview
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest(`/portal/submit?token=${invitationToken}`, {
        method: 'POST'
      });
      setIsCompleted(true);
      setFeedbackNote(res.candidate_feedback);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit interview.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error / Expired / Revoked Screen
  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-800 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-md text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-display">Invitation Link Unavailable</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
          <div className="pt-2 text-xs text-slate-500 font-medium">
            Please contact your recruiting team to request a fresh invitation link.
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs font-mono">
        Authenticating candidate invitation session...
      </div>
    );
  }

  // SCREEN 3: COMPLETION CONFIRMATION
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-slate-800 font-sans relative overflow-hidden">
        {/* Soft luminous glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-100/40 via-indigo-100/30 to-purple-100/20 blur-[130px] pointer-events-none rounded-full" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl w-full p-8 rounded-3xl bg-white/95 border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-6 backdrop-blur-md relative z-10"
        >
          <div className="flex justify-center mb-1">
            <img src="/tplogo.png" alt="TalentPilot AI" className="h-12 w-auto object-contain" />
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Interview Completed!</h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">Thank you, {session.candidate_name}. Your interview answers have been securely recorded.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left text-xs text-slate-700 space-y-2">
            <div className="text-[11px] font-mono uppercase text-slate-500 font-bold">What happens next?</div>
            <p className="leading-relaxed">
              Our multi-agent system is compiling your evidence scorecard. Your responses will be reviewed directly by the hiring team alongside your resume background.
            </p>
          </div>

          {feedbackNote && (
            <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 text-left text-xs text-indigo-950 space-y-2">
              <div className="text-[11px] font-mono uppercase text-indigo-700 font-bold flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-indigo-600" /> Candidate Note
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{feedbackNote}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <div className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs inline-flex items-center justify-center gap-2 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assessment Completed & Finalized</span>
            </div>
            <a
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 active:scale-98"
            >
              <span>Exit & Return Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 font-medium">
            Your technical submission has reached terminal status and is sealed for recruiter evaluation. Retakes are strictly disabled.
          </div>
        </motion.div>
      </div>
    );
  }

  // SCREEN 1: WELCOME & CONSENT
  if (session.session_status === 'NOT_STARTED' || !session.consent_given) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans p-4 sm:p-8 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-100/40 via-purple-100/30 to-pink-100/20 blur-[130px] pointer-events-none rounded-full" />

        <header className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200/80 relative z-10">
          <div className="flex items-center gap-3">
            <img src="/tplogo-icon.png" alt="TalentPilot AI Logo" className="h-9 w-auto object-contain drop-shadow-xs" />
            <div>
              <span className="font-bold text-slate-900 font-display text-base tracking-tight block">TalentPilot AI</span>
              <span className="text-[11px] text-slate-500 font-medium">Candidate Assessment Suite</span>
            </div>
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-full font-mono font-medium shadow-2xs">
            Private Candidate Session
          </span>
        </header>

        <main className="max-w-2xl mx-auto w-full my-8 space-y-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-700 font-bold mb-1.5">
              {session.campaign_title}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display">
              Welcome, {session.candidate_name}
            </h1>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              You have been invited to participate in a personalized adaptive technical interview for the position of <strong>{session.job_title}</strong>.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-slate-500 font-mono text-[11px] font-medium">Format</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">Asynchronous AI Interview</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
              <span className="text-slate-500 font-mono text-[11px] font-medium">Questions</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{session.question_count} Progressive Scenarios</div>
            </div>
          </div>

          {/* Step-by-Step Directions & Guide */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider text-indigo-700">
              Assessment Guide & Interview Steps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <div>
                  <div className="font-semibold text-slate-800">Resume-Grounded Questions</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Exactly 8 questions crafted directly from your uploaded resume claims and projects.</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <div>
                  <div className="font-semibold text-slate-800">Real-Time Cloud Autosave</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Your work drafts automatically as you type. You can pause or review anytime without losing progress.</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <div>
                  <div className="font-semibold text-slate-800">Depth & Evidence Grounding</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Focus on architectural decisions, trade-offs, and measurable outcomes from your actual experience.</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
                <div>
                  <div className="font-semibold text-slate-800">Human Recruiter Review</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">The recruiting lead reviews your evidence dossier and dispatches next round notification via email.</div>
                </div>
              </div>
            </div>
          </div>

          {session.candidate_instructions && (
            <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Candidate Instructions:</strong>
              {session.candidate_instructions}
            </div>
          )}

          {/* AI Disclosure & Consent */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-1">AI-Assisted Evaluation & Privacy Notice:</strong>
                This interview uses Gemini AI to deliver personalized questions and analyze answer depth. The AI never automatically rejects or hires; an authorized human recruiter reviews all evidence and makes the final employment decision.
              </div>
            </div>

            <label className="flex items-start gap-3 pt-2 cursor-pointer select-none border-t border-slate-100">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
              />
              <span className="text-xs text-slate-700 font-medium">
                I acknowledge that my interview responses will be processed by AI agents to support human recruiter review.
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              disabled={!consentChecked}
              onClick={async () => {
                await handleConsent();
                await handleStart();
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/25 active:scale-98"
            >
              <span>Begin Adaptive Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        <footer className="max-w-3xl mx-auto w-full pt-6 border-t border-slate-200/80 text-center text-[11px] text-slate-400 font-medium relative z-10">
          TalentPilot AI &bull; Encrypted Candidate Session &bull; Strictly Confidential
        </footer>
      </div>
    );
  }

  // SCREEN 2: ADAPTIVE INTERVIEW ROOM
  const progressPercent = currentQ ? Math.round(((currentQ.current_index) / currentQ.total_questions) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans p-4 sm:p-8 relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar with Progress */}
      <header className="max-w-3xl mx-auto w-full space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <img src="/tplogo-icon.png" alt="TalentPilot AI Logo" className="h-6 w-auto object-contain" />
            <span className="font-bold text-slate-900 font-display text-base">TalentPilot AI</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-600 font-mono font-medium">{session.job_title}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* LIVE COUNTDOWN TIMER */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs shadow-2xs transition-all ${
                timeLeft <= 120
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-400/30'
                  : timeLeft <= 300
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
              title="Allocated time window remaining for interview completion"
            >
              <Clock className={`w-3.5 h-3.5 ${timeLeft <= 120 ? 'text-rose-600' : 'text-slate-400'}`} />
              <span>{formatTimer(timeLeft)}</span>
              <span className="text-[10px] text-slate-400 font-sans font-normal hidden sm:inline">remaining</span>
            </div>

            {saveSuccess && (
              <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3" /> Draft Saved
              </span>
            )}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-500 font-mono font-medium">
            <span>Question {currentQ ? currentQ.current_index + 1 : 1} of {currentQ?.total_questions || session.question_count}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Question & Answer Room */}
      <main className="max-w-3xl mx-auto w-full my-6 flex-1 flex flex-col justify-center space-y-6">
        {isPaused ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-3">
            <h3 className="text-base font-bold text-slate-900">Interview Paused</h3>
            <p className="text-xs text-slate-500">Take a breath. Your saved answers are safely preserved in our database.</p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Resume Interview</span>
            </button>
          </div>
        ) : (
          <>
            {/* Question Card */}
            <motion.div 
              key={currentQ?.question?.id || 'loading'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {currentQ?.question?.competency || 'Engineering Evaluation'}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                  {currentQ?.question?.difficulty || 'MID'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ?.question?.question_text}
              </h2>
            </motion.div>

            {/* Adaptive Follow-up Banner if triggered */}
            {isFollowUp && followUpPrompt && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50/50 to-white border border-indigo-200 text-xs text-indigo-950 space-y-1.5 shadow-xs"
              >
                <div className="font-bold text-indigo-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span>Adaptive Follow-Up from Interviewer Agent:</span>
                </div>
                <p className="text-slate-900 text-xs leading-relaxed font-semibold pl-8">"{followUpPrompt}"</p>
                <p className="text-[11px] text-slate-500 pl-8">Please provide additional details on this specific aspect below.</p>
              </motion.div>
            )}

            {/* Answer Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="font-bold text-slate-800">Your Technical Response</label>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="font-medium text-slate-600">{answerText.trim() ? answerText.trim().split(/\s+/).length : 0} words</span>
                  <button
                    onClick={handleAutosave}
                    disabled={isSaving || !answerText.trim()}
                    className="hover:text-indigo-600 text-slate-500 flex items-center gap-1 transition-colors font-medium"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your detailed answer here. Focus on real architectural decisions, challenges, trade-offs, and metrics..."
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 leading-relaxed font-sans shadow-xs transition-all"
              />
            </div>

            {/* Submission Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-medium">
                Auto-saved on submission. Evaluated adaptively.
              </span>

              {currentQ && currentQ.current_index === currentQ.total_questions - 1 && (!isFollowUp || followUpPrompt) ? (
                <button
                  type="button"
                  onClick={async () => {
                    await handleSubmitAnswer();
                    await handleFinalSubmit();
                  }}
                  disabled={isSubmitting || !answerText.trim()}
                  className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-600/25 active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Evaluating & Finalizing...' : 'Submit Final Interview'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answerText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 active:scale-98"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Evaluating Answer...' : isFollowUp ? 'Submit Follow-Up' : 'Submit & Next Question'}</span>
                </button>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="max-w-3xl mx-auto w-full pt-4 border-t border-slate-200/80 text-center text-[11px] text-slate-400 font-medium">
        Answers persist across browser refresh. Powered by TalentPilot Adaptive Agent Engine.
      </footer>
    </div>
  );
};
