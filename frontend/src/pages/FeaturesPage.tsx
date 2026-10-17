import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  FileCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  CheckCircle,
  FileText,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  Scale,
  BrainCircuit,
  Award,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const FeaturesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'All Capabilities' },
    { id: 'AGENTS', label: 'Multi-Agent Suite' },
    { id: 'SECURITY', label: 'Security & Isolation' },
    { id: 'EVALUATION', label: 'Evaluations & Scorecards' }
  ];

  const features = [
    {
      title: "AI Job Description Competency Extraction",
      desc: "Upload or paste any job description in PDF, DOCX, or text format. The Planner Agent extracts technical proficiencies, role scenarios, and practical responsibilities into an editable matrix.",
      icon: FileText,
      tag: "Agent 1: Planner",
      category: 'AGENTS'
    },
    {
      title: "Personalized Candidate Question Generation",
      desc: "Synthesizes approved JD competencies with the candidate's verified resume experience. Generates 8-10 customized technical and behavioral interview questions tailored to their background.",
      icon: Layers,
      tag: "Candidate-Specific Plans",
      category: 'AGENTS'
    },
    {
      title: "Adaptive Depth-Probing Interview Engine",
      desc: "Delivers questions one at a time. The Interviewer Agent evaluates the candidate's real answer depth in real-time. If shallow, it asks a sharp, contextual follow-up to uncover trade-off reasoning.",
      icon: Bot,
      tag: "Agent 2: Adaptive Interviewer",
      category: 'AGENTS'
    },
    {
      title: "Resume Claim Consistency & Fact Audit",
      desc: "Compares stated resume achievements against observable interview transcript evidence. Identifies consistent claims, expanded evidence, and potential inconsistencies requiring human review.",
      icon: FileCheck,
      tag: "Agent 3: Consistency Analyst",
      category: 'EVALUATION'
    },
    {
      title: "Evidence-Grounded Rubric Scorecards",
      desc: "Evaluates answers strictly against the approved 5-tier job rubric with verbatim quote citations. Protected attributes, accents, and irrelevant personal traits are strictly excluded.",
      icon: CheckCircle,
      tag: "Agent 4: Answer Evaluator",
      category: 'EVALUATION'
    },
    {
      title: "Independent Critic & Alignment Validator",
      desc: "An adversarial auditing agent checks score-to-evidence alignment, flags unsupported ratings, and automatically alerts human recruiters when an assessment requires human review.",
      icon: ShieldAlert,
      tag: "Agent 5: Critic Auditor",
      category: 'EVALUATION'
    },
    {
      title: "Strict Cryptographic Candidate Isolation",
      desc: "Tokens are 32-byte cryptographic strings hashed via SHA-256. Candidate A cannot see Candidate B's answers, questions, or resume. Expired or revoked links are securely invalidated.",
      icon: Lock,
      tag: "Zero-Trust Security",
      category: 'SECURITY'
    },
    {
      title: "Prompt Injection Delimiter Shield",
      desc: "Untrusted resume documents and candidate submissions are sanitized through strict structural delimiter boundaries, neutralizing adversarial prompt-injection payloads.",
      icon: ShieldCheck,
      tag: "Active Delimiter Shield",
      category: 'SECURITY'
    },
    {
      title: "Human-in-the-Loop Decision Authority",
      desc: "AI assists with evidence extraction and recommendation, but NEVER automatically rejects or hires a candidate. Final employment decisions are recorded and auditable by authorized recruiters.",
      icon: UserCheck,
      tag: "Recruiter Governance",
      category: 'SECURITY'
    }
  ];

  const filtered = selectedCategory === 'ALL'
    ? features
    : features.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 relative overflow-x-hidden">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        {/* Soft background luminous glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-pink-100/20 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-indigo-200 text-xs text-indigo-700 font-mono font-semibold mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Platform Architecture & Capabilities
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950 font-display mb-4">
              Engineered for Precision & Accountability
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Every feature in TalentPilot AI is built around observable evidence, candidate fairness, and recruiter oversight.
            </p>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === c.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            <AnimatePresence>
              {filtered.map((f, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  key={f.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 card-hover-lift"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                        <f.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Bottom CTA Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-purple-50 to-white border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Experience the Recruiter Workspace</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Ready to review real candidate evaluations or generate your first AI competency framework? Sign in to the authenticated master portal.
              </p>
            </div>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/25 active:scale-95 inline-flex items-center gap-2 shrink-0"
            >
              <span>Access Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
