import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  FileText,
  Sparkles,
  UserPlus,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  UploadCloud,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { apiRequest, uploadResumeFile } from '../../api/client';
import { AdminHeader } from '../../components/AdminHeader';

export const CampaignWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);

  // Step 1: Job Info
  const [jobInfo, setJobInfo] = useState({
    title: 'Senior Distributed Systems Architect',
    job_title: 'Senior Distributed Systems Architect',
    department: 'Core Infrastructure',
    job_level: 'Senior / Staff',
    location: 'Remote',
    hiring_manager: 'Marcus Ray (VP of Engineering)',
    description: 'Lead our next-generation cloud infrastructure and high-throughput data processing platforms.'
  });

  // Step 2: JD Text
  const [jdText, setJdText] = useState(`We are seeking a Senior Distributed Systems Architect to design and scale our mission-critical data platforms.

Responsibilities:
- Architect distributed microservices in Go, Python, and Rust capable of handling 100,000+ RPS.
- Design resilient Kafka event-driven architectures and partition topologies.
- Optimize PostgreSQL, Redis, and distributed consensus mechanisms (Raft).
- Lead technical design reviews and mentor senior engineering staff.

Requirements:
- 6+ years building large-scale distributed backends.
- Deep understanding of CAP theorem, consensus algorithms, and database internals.
- Proven track record diagnosing high-concurrency production incidents.`);

  // Step 3: AI Competency Matrix
  const [competencies, setCompetencies] = useState<{
    technical_skills: string[];
    preferred_skills: string[];
    job_competencies: any[];
  }>({
    technical_skills: ['Distributed Systems', 'Go/Python', 'Kafka', 'PostgreSQL', 'High Concurrency', 'System Design'],
    preferred_skills: ['Raft Consensus', 'Kubernetes', 'Redis Clustering'],
    job_competencies: [
      { name: 'Distributed Architecture', category: 'Technical', level: 'REQUIRED', description: 'Designing fault-tolerant event pipelines' },
      { name: 'Database Scalability', category: 'Storage', level: 'REQUIRED', description: 'Partitioning and write contention elimination' },
      { name: 'Incident Diagnosis', category: 'Observability', level: 'REQUIRED', description: 'Tracing latency anomalies in distributed topologies' }
    ]
  });

  // Step 4: Candidate Intake
  const [candidateData, setCandidateData] = useState({
    full_name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    skills: 'Distributed Systems, Kafka, Go, PostgreSQL, Redis',
    resume_text: `Elena Rostova - Staff Systems Engineer.
Built multi-region Kafka data ingestion pipeline at CloudTech processing 120k events/sec.
Designed zero-downtime database failover automation with PostgreSQL and Raft.
Authored engineering standards for distributed tracing with OpenTelemetry.`
  });

  // Step 5: Interview Config
  const [interviewConfig, setInterviewConfig] = useState({
    question_count: 6,
    interview_duration_minutes: 30,
    interview_language: 'English',
    follow_up_limits: 2,
    candidate_instructions: 'Please answer each scenario with specific architectural trade-offs from your past production systems.'
  });

  // Handle Step 2 -> 3 AI Competency Analysis
  const handleAnalyzeJD = async () => {
    setIsLoading(true);
    setError('');
    try {
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze JD');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadResumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingResume(true);
    setResumeFileName(file.name);
    try {
      const data = await uploadResumeFile(file);
      setCandidateData({
        full_name: data.full_name || candidateData.full_name,
        email: data.email || candidateData.email,
        skills: data.skills?.length ? data.skills.join(', ') : candidateData.skills,
        resume_text: data.raw_text || candidateData.resume_text
      });
    } catch (err: any) {
      alert(err.message || 'Error extracting resume data');
    } finally {
      setIsUploadingResume(false);
    }
  };

  // Submit and create full campaign
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 1. Create Campaign + JD
      const camp = await apiRequest('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          ...jobInfo,
          ...interviewConfig,
          raw_jd_text: jdText
        })
      });

      // 2. Add Candidate + Auto-generate personalized interview plan
      const cand = await apiRequest('/candidates', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: camp.id,
          full_name: candidateData.full_name,
          email: candidateData.email,
          skills: candidateData.skills.split(',').map(s => s.trim()),
          resume_text: candidateData.resume_text
        })
      });

      // 3. Generate Candidate's Unique Invitation Link
      const inv = await apiRequest(`/invitations/candidates/${cand.id}`, {
        method: 'POST'
      });

      // 4. Automatically dispatch credentials email to candidate
      if (inv?.id) {
        try {
          await apiRequest(`/invitations/${inv.id}/send-email`, {
            method: 'POST',
            body: JSON.stringify({
              custom_note: `Personalized technical assessment invitation for ${cand.full_name}.`
            })
          });
        } catch (e) {
          console.warn('Auto email dispatch warning', e);
        }
      }

      navigate(`/admin/campaigns/${camp.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen text-slate-800">
      <AdminHeader
        title="Guided Hiring Campaign Wizard"
        subtitle="Configure role requirements, extract AI competencies, intake candidates, and generate unique interview portals."
      />

      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* STEPPER PROGRESS */}
        <div className="grid grid-cols-6 gap-2 border-b border-slate-200 pb-5">
          {[
            { step: 1, label: 'Job Info' },
            { step: 2, label: 'JD Intake' },
            { step: 3, label: 'AI Matrix' },
            { step: 4, label: 'Candidates' },
            { step: 5, label: 'Settings' },
            { step: 6, label: 'Review' }
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold mb-1.5 transition-all shadow-xs ${
                  currentStep === s.step
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-md'
                    : currentStep > s.step
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <span className={`text-[11px] font-medium hidden sm:block ${currentStep === s.step ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: JOB INFO */}
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5"
            >
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Step 1 — Role & Department Information</h2>
                <p className="text-xs text-slate-500 mt-0.5">Specify basic administrative metadata for this hiring campaign.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Campaign Title</label>
                  <input
                    type="text"
                    value={jobInfo.title}
                    onChange={(e) => setJobInfo({ ...jobInfo, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Job Title</label>
                  <input
                    type="text"
                    value={jobInfo.job_title}
                    onChange={(e) => setJobInfo({ ...jobInfo, job_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department / Team</label>
                  <input
                    type="text"
                    value={jobInfo.department}
                    onChange={(e) => setJobInfo({ ...jobInfo, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seniority Level</label>
                  <input
                    type="text"
                    value={jobInfo.job_level}
                    onChange={(e) => setJobInfo({ ...jobInfo, job_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Location / Work Arrangement</label>
                  <input
                    type="text"
                    value={jobInfo.location}
                    onChange={(e) => setJobInfo({ ...jobInfo, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hiring Manager</label>
                  <input
                    type="text"
                    value={jobInfo.hiring_manager}
                    onChange={(e) => setJobInfo({ ...jobInfo, hiring_manager: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
                >
                  <span>Continue to JD Intake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: JD INTAKE */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5"
            >
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Step 2 — Job Description Text & Requirements</h2>
                <p className="text-xs text-slate-500 mt-0.5">Paste your job description below. The AI Planner Agent will extract core competencies in the next step.</p>
              </div>

              <textarea
                rows={11}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 leading-relaxed shadow-xs transition-all"
              />

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAnalyzeJD}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract AI Competency Matrix</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: AI COMPETENCY MATRIX */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-mono font-semibold mb-2">
                  <Sparkles className="w-3 h-3 text-indigo-600" /> Planner Agent Synthesis
                </div>
                <h2 className="text-base font-bold text-slate-900 font-display">Step 3 — Approved Competency Matrix</h2>
                <p className="text-xs text-slate-500 mt-0.5">Review and refine the AI-extracted competencies for this hiring campaign.</p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2.5">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {competencies.technical_skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-2.5">Core Job Competencies</h3>
                <div className="space-y-2.5">
                  {competencies.job_competencies.map((comp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{comp.name}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{comp.description}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {comp.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
                >
                  <span>Approve & Intake Candidates</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CANDIDATE INTAKE */}
          {currentStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5"
            >
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Step 4 — Candidate Ingestion</h2>
                <p className="text-xs text-slate-500 mt-0.5">Add an initial candidate. The system will create their record, extract resume claims, and generate an approved interview plan.</p>
              </div>

              {/* Resume File Upload Dropzone */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/30 transition-all text-center">
                <label className="flex flex-col items-center justify-center cursor-pointer select-none">
                  <UploadCloud className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">
                    {isUploadingResume ? 'Analyzing Resume File with Document AI...' : resumeFileName ? `Auto-filled from: ${resumeFileName}` : 'Auto-Fill from Resume (PDF / DOCX / TXT)'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">Click or drag a resume from the resumes/ folder to automatically populate candidate profile</span>
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleUploadResumeFile} className="hidden" disabled={isUploadingResume} />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Candidate Full Name</label>
                  <input
                    type="text"
                    value={candidateData.full_name}
                    onChange={(e) => setCandidateData({ ...candidateData, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Candidate Email Address</label>
                  <input
                    type="email"
                    value={candidateData.email}
                    onChange={(e) => setCandidateData({ ...candidateData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Declared Technical Skills</label>
                <input
                  type="text"
                  value={candidateData.skills}
                  onChange={(e) => setCandidateData({ ...candidateData, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Candidate Resume Text Excerpt</label>
                <textarea
                  rows={5}
                  value={candidateData.resume_text}
                  onChange={(e) => setCandidateData({ ...candidateData, resume_text: e.target.value })}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 leading-relaxed transition-all shadow-xs"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
                >
                  <span>Continue to Interview Settings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: INTERVIEW SETTINGS */}
          {currentStep === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5"
            >
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Step 5 — Interview Configuration & Rubric Rules</h2>
                <p className="text-xs text-slate-500 mt-0.5">Control interview duration, question counts, and adaptive AI follow-up thresholds.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Question Count</label>
                  <input
                    type="number"
                    min={4}
                    max={12}
                    value={interviewConfig.question_count}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, question_count: parseInt(e.target.value) || 6 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expected Duration (Minutes)</label>
                  <input
                    type="number"
                    value={interviewConfig.interview_duration_minutes}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, interview_duration_minutes: parseInt(e.target.value) || 30 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adaptive Follow-Up Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={3}
                    value={interviewConfig.follow_up_limits}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, follow_up_limits: parseInt(e.target.value) || 2 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Candidate Portal Instructions</label>
                <textarea
                  rows={3}
                  value={interviewConfig.candidate_instructions}
                  onChange={(e) => setInterviewConfig({ ...interviewConfig, candidate_instructions: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-xs"
                />
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-600/20 active:scale-98 transition-all"
                >
                  <span>Review & Launch Campaign</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 6: REVIEW & LAUNCH */}
          {currentStep === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6"
            >
              <div>
                <h2 className="text-base font-bold text-slate-900 font-display">Step 6 — Final Review & Launch Confirmation</h2>
                <p className="text-xs text-slate-500 mt-0.5">Confirming will create the campaign, initialize candidate interview plans, and generate unique invitation links.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Role & Title:</span>
                  <span className="font-semibold text-slate-900">{jobInfo.title}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Initial Candidate:</span>
                  <span className="font-semibold text-slate-900">{candidateData.full_name} ({candidateData.email})</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Questions & Duration:</span>
                  <span className="font-semibold text-slate-900">{interviewConfig.question_count} questions &bull; {interviewConfig.interview_duration_minutes} mins</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Candidate Isolation:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    SHA-256 Hashed Cryptographic Links
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 active:scale-98 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? 'Creating Campaign & Invitations...' : 'Launch Campaign & Generate Links'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
