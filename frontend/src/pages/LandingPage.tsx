import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bot,
  Lock,
  ExternalLink,
  ChevronRight,
  FileSearch,
  MessageSquareCode,
  CheckCircle2,
  Zap,
  Award,
  Layers,
  FileCheck2,
  AlertTriangle,
  BrainCircuit,
  Sliders,
  Scale,
  Check,
  X
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interview' | 'evidence' | 'consistency'>('interview');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/20 selection:text-indigo-900 relative overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 overflow-hidden">
          {/* Luminous Light Glow Blobs */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-indigo-200/50 via-purple-100/40 to-pink-100/30 blur-[140px] pointer-events-none rounded-full animate-pulse-glow"></div>
          <div className="absolute top-80 right-4 w-[400px] h-[400px] bg-sky-100/60 blur-[120px] pointer-events-none rounded-full"></div>
          <div className="absolute top-96 left-4 w-[350px] h-[350px] bg-purple-100/50 blur-[110px] pointer-events-none rounded-full"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Tagline Pill with Shimmer & Pulse */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-indigo-100/90 text-xs text-indigo-950 mb-8 shadow-xs hover:shadow-md transition-all animate-float cursor-default"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span className="font-semibold text-slate-800">Autonomous Agentic Recruitment & Adaptive Intelligence</span>
              <span className="hidden sm:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">v2.5 Live</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 font-display max-w-4xl mx-auto leading-[1.08] mb-6"
            >
              Personalized AI Interviews.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
                Verifiable Decisions.
              </span>
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
            >
              Issue cryptographic invitation links, conduct depth-probing adaptive AI technical interviews, and review evidence scorecards anchored by verbatim quotes—all in one unified light workspace.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
            >
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Launch Recruiter Command</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="/interview/live_demo_priya_sharma_token"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-xs hover:shadow-md group"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Test Candidate Experience</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </a>
            </motion.div>

            {/* FLOATING TELEMETRY CHIPS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-14 text-left">
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="text-2xl font-bold font-display text-indigo-600">100%</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">Verbatim Quote Grounding</div>
                <div className="text-[11px] text-slate-500">Zero hallucinated scores</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="text-2xl font-bold font-display text-emerald-600">0</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">Auto Rejections</div>
                <div className="text-[11px] text-slate-500">Human recruiter sign-off</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="text-2xl font-bold font-display text-purple-600">32-Byte</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">SHA-256 Entropy</div>
                <div className="text-[11px] text-slate-500">Strict candidate isolation</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="text-2xl font-bold font-display text-amber-600">5 Agents</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">Multi-Agent Topology</div>
                <div className="text-[11px] text-slate-500">Adversarial critic validation</div>
              </div>
            </div>

            {/* LIVE PRODUCT PREVIEW INTERACTIVE SHOWCASE */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="max-w-5xl mx-auto rounded-3xl border border-slate-200/90 bg-white/95 p-3 sm:p-5 backdrop-blur-md shadow-2xl shadow-indigo-500/10 text-left transition-all hover:shadow-indigo-500/15"
            >
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {/* Mock Header with Interactive Tabs */}
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-semibold text-slate-700 font-mono ml-2">TalentPilot AI &bull; Interactive Multi-Agent Telemetry</span>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 border border-slate-200 text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('interview')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activeTab === 'interview'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Adaptive Interviewer
                    </button>
                    <button
                      onClick={() => setActiveTab('evidence')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activeTab === 'evidence'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Evidence Scorecard
                    </button>
                    <button
                      onClick={() => setActiveTab('consistency')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        activeTab === 'consistency'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Resume Claim Audit
                    </button>
                  </div>
                </div>

                {/* TAB 1: ADAPTIVE INTERVIEWER */}
                {activeTab === 'interview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-5 sm:p-6 gap-6 bg-gradient-to-b from-white to-slate-50/30">
                    <div className="space-y-4">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Live Candidate Session</div>
                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">Priya Sharma</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                            QUESTION 4 / 6
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Senior Distributed Systems Architect</p>
                        <div className="space-y-2 text-xs text-slate-600">
                          <div className="flex justify-between items-center">
                            <span>Topic Focus:</span>
                            <strong className="text-slate-800">Kafka Partitioning & Consensus</strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Autosave Status:</span>
                            <strong className="text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Synced sub-15ms
                            </strong>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Adaptive Depth:</span>
                            <strong className="text-indigo-600 font-bold">Level 3 (Senior)</strong>
                          </div>
                        </div>
                      </div>

                      <a
                        href="/interview/live_demo_priya_sharma_token"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-between w-full p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-semibold hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-xs group"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Launch Real Candidate Portal
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        Adaptive Probing Engine &bull; Real-Time Follow-Up
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                          <div className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-indigo-600" />
                            Primary Question (Architecture Trade-offs):
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            "In your resume you mention scaling a financial event streaming pipeline to 150k RPS. How did you handle consumer group rebalancing during sudden node failure without data loss?"
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 shadow-xs">
                          <div className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <MessageSquareCode className="w-4 h-4 text-emerald-600" />
                            Candidate Initial Answer:
                          </div>
                          <p className="text-xs text-slate-700 italic leading-relaxed">
                            "We tuned max.poll.interval.ms and session.timeout.ms to avoid false failures, and used static group membership so pods restarting during deployment didn't trigger cluster-wide rebalances."
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs">
                          <div className="flex items-center justify-between text-indigo-900 font-bold mb-1">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              Adaptive Probing Follow-Up Triggered:
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                              Depth Probing
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            "What exact partition assignment strategy did you select (e.g. CooperativeStickyAssignor vs RangeAssignor), and how did you prevent duplicate processing during partition handoff?"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EVIDENCE SCORECARD */}
                {activeTab === 'evidence' && (
                  <div className="p-5 sm:p-6 space-y-4 bg-gradient-to-b from-white to-slate-50/30">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 font-display">Competency Scorecard with Verbatim Citations</h4>
                        <p className="text-xs text-slate-500">Every score is mathematically justified by verbatim interview quotes.</p>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                        Score: 4.6 / 5.0 (ADVANCE)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">Distributed Consensus & Scalability</span>
                          <span className="text-xs font-mono font-bold text-indigo-600">4.8 / 5.0</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full w-[96%]"></div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 italic">
                          "We decoupled order ingestion from settlement using FastAPI pushing events to Redis Streams. This protected our primary PostgreSQL database during flash sales..."
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verbatim Quote Verified by Evaluator Agent
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">High-Concurrency Incident Triage</span>
                          <span className="text-xs font-mono font-bold text-indigo-600">4.4 / 5.0</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full w-[88%]"></div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600 italic">
                          "Implemented custom composite BRIN indexing on audit logs and partitioned active ledger tables by month, dropping p99 write latency under 15ms."
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verbatim Quote Verified by Evaluator Agent
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: RESUME CLAIM AUDIT */}
                {activeTab === 'consistency' && (
                  <div className="p-5 sm:p-6 space-y-4 bg-gradient-to-b from-white to-slate-50/30">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-display">Resume Claim Consistency Analyst</h4>
                      <p className="text-xs text-slate-500">Autonomous cross-referencing between resume bullet points and actual interview answers.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              CONSISTENT CLAIM
                            </span>
                            <span className="text-xs font-bold text-slate-900">Resume: "150,000+ RPS Kafka Ingestion"</span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Candidate accurately described broker partition counts, consumer group backpressure strategies, and disk I/O metrics matching high-scale architectures.
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      </div>

                      <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
                              EXPANDED EVIDENCE
                            </span>
                            <span className="text-xs font-bold text-slate-900">Resume: "Zero-Downtime Database Failover"</span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Candidate provided deep details on Raft consensus leader election and split-brain resolution beyond the brevity of their original resume bullet.
                          </p>
                        </div>
                        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5-AGENT MULTI-AGENT ARCHITECTURE SECTION */}
        <section className="py-20 border-y border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono mb-2">Multi-Agent Intelligence</h2>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                5 Specialized AI Agents Working in Orchestration
              </p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                Rather than relying on an unconstrained single prompt, TalentPilot divides the recruitment lifecycle into discrete, bounded, verifiable agent responsibilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                {
                  number: "01",
                  title: "Planner Agent",
                  tag: "Role & JD Matrix",
                  desc: "Extracts role competencies, preferred tech stacks, and grading rubrics directly from uploaded job descriptions.",
                  icon: Layers,
                  color: "indigo"
                },
                {
                  number: "02",
                  title: "Interviewer Agent",
                  tag: "Adaptive Follow-Up",
                  desc: "Conducts asynchronous interviews one question at a time. Dynamically probes shallow answers with depth questions.",
                  icon: Bot,
                  color: "purple"
                },
                {
                  number: "03",
                  title: "Consistency Agent",
                  tag: "Fact Verification",
                  desc: "Cross-references stated resume bullet points against actual transcript evidence to detect exaggerations.",
                  icon: FileCheck2,
                  color: "sky"
                },
                {
                  number: "04",
                  title: "Evaluator Agent",
                  tag: "Verbatim Scorecards",
                  desc: "Assigns objective 1-5 ratings strictly justified with exact transcript quotes under the approved rubric.",
                  icon: Award,
                  color: "emerald"
                },
                {
                  number: "05",
                  title: "Critic Agent",
                  tag: "Adversarial Audit",
                  desc: "Audits evaluator ratings for score inflation. Flags borderline scores for mandatory human recruiter sign-off.",
                  icon: Scale,
                  color: "amber"
                }
              ].map((agent, i) => (
                <div
                  key={agent.number}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <agent.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">{agent.number}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{agent.title}</h3>
                    <div className="text-[10px] font-mono text-indigo-600 font-semibold mb-2">{agent.tag}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEFORE VS AFTER TALENTPILOT COMPARISON */}
        <section className="py-20 border-b border-slate-200 bg-slate-50/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono mb-2">The TalentPilot Advantage</h2>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Traditional AI Screening vs. TalentPilot AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Traditional AI */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-rose-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm font-display">
                  <X className="w-5 h-5 p-0.5 rounded-full bg-rose-100 text-rose-700" />
                  Traditional Keyword ATS & Generic AI
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Blind keyword matching:</strong> Candidates game resumes with white text and keyword stuffing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Generic, static questions:</strong> Same 5 questions asked to everyone regardless of level or background.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Hallucinated scores:</strong> Subjective, ungrounded AI scores without verbatim quote evidence.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Uncontrolled automated rejections:</strong> Candidates rejected silently with no human recruiter visibility.</span>
                  </li>
                </ul>
              </div>

              {/* TalentPilot AI */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-200/90 shadow-sm shadow-emerald-500/5 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm font-display">
                  <Check className="w-5 h-5 p-0.5 rounded-full bg-emerald-100 text-emerald-700" />
                  TalentPilot Agentic Platform
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Personalized Question Plans:</strong> 8-10 customized questions dynamically matched to their verified resume claims.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Adaptive Follow-up Engine:</strong> Dynamically challenges shallow answers to probe true production trade-offs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% Quote-Linked Scorecards:</strong> Every single grade is anchored to an exact transcript quote citation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Mandatory Human Recruiter Governance:</strong> AI recommends; humans decide. Zero automated candidate rejections.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4-STEP RECRUITER JOURNEY */}
        <section className="py-20 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 font-mono mb-2">Recruiter Workflow</h2>
              <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                Four Connected Steps to Decision Confidence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Campaign & JD Intake",
                  desc: "Paste or drop job descriptions. AI extracts competencies, rubrics, and role scenarios into an editable matrix."
                },
                {
                  step: "02",
                  title: "Candidate Resumes & Plans",
                  desc: "Upload resumes. System extracts claims and synthesizes a personalized 8-10 question interview plan per candidate."
                },
                {
                  step: "03",
                  title: "Private Candidate Portals",
                  desc: "Generate SHA-256 cryptographic invitation links. Candidates complete adaptive interviews with autosave."
                },
                {
                  step: "04",
                  title: "Scorecards & Human Review",
                  desc: "Multi-agent engine evaluates answers against rubric, verifies resume consistency, and flags human decision."
                }
              ].map((s) => (
                <div key={s.step} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-md hover:bg-white transition-all card-hover-lift">
                  <div className="text-3xl font-black text-indigo-600 font-mono mb-2">{s.step}</div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">{s.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-purple-50/30">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-200 text-xs text-indigo-700 font-mono font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Ready for Hackathon Evaluation
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mb-4">
              Step Into the Future of Agentic Recruitment
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-xl mx-auto leading-relaxed">
              Launch the master recruiter command center or try the active candidate interview session directly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 active:scale-95"
              >
                <span>Sign In to Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="/interview/live_demo_priya_sharma_token"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-xs hover:shadow-sm"
              >
                <span>Open Candidate Demo Interview</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
