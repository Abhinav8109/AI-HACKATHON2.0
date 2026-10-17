import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  UserPlus,
  Send,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Lock,
  BrainCircuit,
  Award
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const HowItWorksPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "01",
      title: "Hiring Campaign & Competency Modeling",
      role: "Recruiter Action",
      icon: FileText,
      desc: "The recruiter defines the role title, level, and duration, then pastes or uploads a job description. The AI Planner Agent extracts technical requirements and maps a role competency matrix for human recruiter sign-off.",
      details: ["PDF/DOCX extraction with prompt-injection filtering", "Editable 5-tier competency rubric", "Customizable question counts and follow-up limits"]
    },
    {
      id: "02",
      title: "Candidate Intake & Question Personalization",
      role: "Autonomous Ingestion",
      icon: UserPlus,
      desc: "Candidate resumes are ingested. Stated claims are isolated and compared against the role matrix to build a personalized 8-10 question interview plan specific to each candidate's demonstrated background.",
      details: ["Claims separated into Technical, Experience, and Education", "Progressive difficulty: Junior (2), Mid (4), Senior (2)", "Recruiter preview and override before issuing links"]
    },
    {
      id: "03",
      title: "Unique Cryptographic Portal Links",
      role: "Security Boundary",
      icon: Lock,
      desc: "The platform creates high-entropy, 32-byte cryptographic invitation tokens. Tokens are stored as SHA-256 hashes in the database. Candidate A cannot see Candidate B's answers, resume, or scorecard.",
      details: ["Strict isolation enforced on every API request", "Configurable expiration window (default 72 hours)", "One-click link revocation and audit logging"]
    },
    {
      id: "04",
      title: "Adaptive AI Interview Execution",
      role: "Candidate Experience",
      icon: MessageSquare,
      desc: "The candidate accesses their clean, distraction-free portal. The Adaptive Interviewer asks questions one by one. If an answer lacks depth, it asks a targeted follow-up to explore trade-off thinking.",
      details: ["Reliable real-time autosave (never lose answers on refresh)", "Mobile-friendly and WCAG 2.2 AA compliant", "Pause / resume capabilities for accessibility"]
    },
    {
      id: "05",
      title: "Evidence-Based Multi-Agent Evaluation",
      role: "Evaluation Engine",
      icon: BrainCircuit,
      desc: "Upon final submission, the multi-agent system kicks off: Evaluator scores rubric with exact verbatim quotes, Consistency Analyst checks resume claims, and Critic audits score alignment.",
      details: ["Verbatim candidate quotes required for every score", "Adversarial Critic flags borderline cases", "Constructive candidate-facing feedback generated"]
    },
    {
      id: "06",
      title: "Recruiter Review & Final Decision",
      role: "Human-in-the-Loop",
      icon: Award,
      desc: "The recruiter inspects the live candidate dossier in the master command center. The AI provides recommendations, but only the authorized human recruiter can record the final employment decision.",
      details: ["AI never automatically rejects or hires candidates", "Full audit log of decision and rationale", "Exportable PDF/HTML candidate dossier and campaign CSV"]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-pink-100/20 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 shadow-xs mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Transparent Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-display mb-4">
              How TalentPilot AI Works
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              A transparent, auditable 6-stage lifecycle connecting recruiters, candidates, and multi-agent AI intelligence with zero hallucination.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Step navigation tabs */}
            <div className="space-y-2.5 lg:col-span-1">
              {steps.map((s, idx) => {
                const IconComponent = s.icon;
                const isActive = activeStep === idx;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStep(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex items-center justify-between shadow-xs ${
                      isActive
                        ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/10 text-slate-900 font-semibold'
                        : 'bg-white/80 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isActive ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {s.id}
                      </div>
                      <span className="text-left font-medium">{s.title}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Active Step Showcase */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl font-black font-mono text-indigo-600">Step {steps[activeStep].id}</span>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs">
                        {steps[activeStep].role}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 font-display">{steps[activeStep].title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-8">{steps[activeStep].desc}</p>

                    <div className="space-y-3 mb-8 p-5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">Key Architectural Safeguards</h4>
                      <div className="space-y-2.5">
                        {steps[activeStep].details.map((d, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep(p => Math.max(0, p - 1))}
                      className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={activeStep === steps.length - 1}
                      onClick={() => setActiveStep(p => Math.min(steps.length - 1, p + 1))}
                      className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 disabled:opacity-40 transition-colors"
                    >
                      Next Step &rarr;
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
            >
              Start in Recruiter Command Center
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
