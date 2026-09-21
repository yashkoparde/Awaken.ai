import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitCompare, 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  BarChart3, 
  BrainCircuit, 
  Download, 
  Check, 
  Briefcase, 
  Code2, 
  Compass, 
  ShieldCheck,
  Layers,
  GraduationCap,
  Terminal
} from 'lucide-react';
import { extractResumeText, groqChatCompletion } from '../lib/groq';
import { calculateATSScore } from '../lib/atsAlgorithm';
import { api } from '../lib/api';

interface JobMatchingResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: {
    score: number;
    analysis: string;
    level: string;
  };
  categorizedSkillGaps: {
    technical: string[];
    programming: string[];
    aptitude: string[];
    communication: string[];
    softSkills: string[];
    domainKnowledge: string[];
  };
  recommendedActions: string[];
}

export default function ResumeMatchingEngine({ defaultTab = 'overview' }: { defaultTab?: 'overview' | 'gaps' }) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JobMatchingResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'gaps' | 'experience' | 'actions'>(defaultTab);
  const [copied, setCopied] = useState(false);

  // File Upload Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const extracted = await extractResumeText(base64, file.type);
        setResumeText(extracted);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Resume extraction failed:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Sample quick load for testing
  const loadSampleData = () => {
    setResumeText(`John Doe - Software Engineer
Email: john@example.com | Phone: +1 555-0199 | GitHub: github.com/johndoe
Summary:
Full-stack software developer with 3 years of hands-on experience building web applications, scalable backend microservices, and modern user interfaces. Proficient in TypeScript, React, Node.js, REST APIs, and PostgreSQL.

Experience:
Software Engineer | Alpha Innovations (2022 - Present)
- Developed and maintained React frontends and Node.js microservices serving 150k monthly active users.
- Designed RESTful API endpoints and optimized SQL queries in PostgreSQL, cutting endpoint latency by 25%.
- Implemented automated testing with Jest and CI/CD pipelines in GitHub Actions.

Education:
B.S. in Computer Science - University of Technology (2018 - 2022)
Skills:
TypeScript, JavaScript, React, Node.js, Express, PostgreSQL, Git, Docker, REST APIs, Agile`);

    setJobDescription(`Senior Full-Stack Engineer
Requirements:
- 4+ years of professional software engineering experience.
- Strong proficiency in TypeScript, React, Next.js, and Node.js.
- Production experience with Docker, Kubernetes, and AWS (ECS, S3, RDS).
- In-depth understanding of Redis caching, GraphQL, and microservices architecture.
- Excellent quantitative aptitude, analytical problem solving, and verbal communication.
- Experience mentoring junior engineers and leading cross-functional code reviews.`);
  };

  const runMatchingEngine = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setIsAnalyzing(true);

    try {
      const deterministic = calculateATSScore(resumeText, jobDescription);

      const systemPrompt = `You are an executive Technical Recruiter and ATS Matching Engine. 
Compare the Candidate Resume against the Job Description requirements thoroughly.
Output ONLY valid JSON with this exact schema:
{
  "matchPercentage": number (0 to 100),
  "matchingSkills": string[],
  "missingSkills": string[],
  "experienceMatch": {
    "score": number (0 to 100),
    "analysis": string,
    "level": string ("Underqualified" | "Well-Matched" | "Overqualified")
  },
  "categorizedSkillGaps": {
    "technical": string[],
    "programming": string[],
    "aptitude": string[],
    "communication": string[],
    "softSkills": string[],
    "domainKnowledge": string[]
  },
  "recommendedActions": string[]
}`;

      const userPrompt = `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`;
      
      let parsedResponse: any = null;
      try {
        const rawJson = await groqChatCompletion(systemPrompt, userPrompt, true);
        parsedResponse = JSON.parse(rawJson);
      } catch (llmErr) {
        console.warn("Groq LLM matching fallback engaged:", llmErr);
        // Deterministic fallback
        parsedResponse = {
          matchPercentage: deterministic.atsScore,
          matchingSkills: deterministic.matchedKeywords.slice(0, 10),
          missingSkills: deterministic.missingKeywords.slice(0, 8),
          experienceMatch: {
            score: Math.min(100, Math.round(deterministic.atsScore * 0.95)),
            analysis: "Candidate exhibits strong core fundamentals with potential alignment in targeted engineering responsibilities.",
            level: deterministic.atsScore >= 70 ? "Well-Matched" : "Underqualified"
          },
          categorizedSkillGaps: {
            technical: deterministic.categorizedGaps.technicalSkills,
            programming: deterministic.categorizedGaps.programming,
            aptitude: deterministic.categorizedGaps.aptitude,
            communication: deterministic.categorizedGaps.communication,
            softSkills: deterministic.categorizedGaps.softSkills,
            domainKnowledge: deterministic.categorizedGaps.domainKnowledge
          },
          recommendedActions: [
            "Add high-impact quantitative achievements reflecting target responsibilities.",
            "Integrate missing domain and programming technologies into your technical skills section.",
            "Complete a tailored Written Test on domain prerequisites to validate readiness."
          ]
        };
      }

      setResult(parsedResponse);
      
      // Save scan score to PHP Backend
      await api.saveATSScan({
        type: 'job_match',
        atsScore: parsedResponse.matchPercentage,
        matchingSkills: parsedResponse.matchingSkills,
        missingSkills: parsedResponse.missingSkills
      });

    } catch (e) {
      console.error("Match Engine error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAnalysis = () => {
    if (!result) return;
    const text = `RESUME-JOB MATCH REPORT\nMatch Score: ${result.matchPercentage}%\nExperience Level: ${result.experienceMatch.level}\n\nMATCHING SKILLS:\n${result.matchingSkills.join(', ')}\n\nMISSING SKILLS:\n${result.missingSkills.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <GitCompare className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] uppercase font-mono tracking-widest font-black">
              {defaultTab === 'gaps' ? 'Module 4: Skill Gap Analysis' : 'Module 3: Resume–Job Matching'}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">
              {defaultTab === 'gaps' ? '6-Domain Gap Categorization' : 'Requirements Comparison'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {defaultTab === 'gaps' ? 'Categorized Skill Gap Analysis Engine' : 'Resume–Job Matching Engine'}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            {defaultTab === 'gaps'
              ? 'Categorize identified deficiencies across Technical Skills, Programming Languages, Quantitative Aptitude, Communication, Soft Skills, and Domain Knowledge.'
              : 'Compare candidate resume with job requirements and identify matching skills, missing skills, and relevant experience alignment.'}
          </p>
        </div>

        <button
          onClick={loadSampleData}
          className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all shrink-0 self-start md:self-auto"
        >
          Load Sample Comparison
        </button>
      </div>

      {/* Input Stage: Dual Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Resume Box */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-center">
            <label className="text-xs uppercase font-black tracking-widest text-blue-400 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              1. Candidate Resume
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                disabled={isExtracting}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <button className="px-3 py-1 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-[10px] font-bold uppercase rounded-lg text-slate-300 flex items-center gap-1.5 transition-all">
                <Upload className="w-3 h-3 text-blue-400" />
                {isExtracting ? "Extracting..." : "Upload File"}
              </button>
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste raw resume text, education, experience, and project highlights..."
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 h-64 focus:border-blue-500/60 outline-none resize-none leading-relaxed transition-all placeholder:text-slate-600"
          />

          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium px-1">
            <span>{resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words detected` : 'Awaiting resume input'}</span>
            {resumeText.trim() && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
          </div>
        </div>

        {/* Target Job Description Box */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-2xl">
          <div className="flex justify-between items-center">
            <label className="text-xs uppercase font-black tracking-widest text-purple-400 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" />
              2. Target Job Description & Requirements
            </label>
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Paste JD</span>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job specifications, role responsibilities, qualifications, and required tech stack..."
            className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-200 h-64 focus:border-purple-500/60 outline-none resize-none leading-relaxed transition-all placeholder:text-slate-600"
          />

          <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium px-1">
            <span>{jobDescription.trim() ? `${jobDescription.trim().split(/\s+/).length} words detected` : 'Awaiting job description'}</span>
            {jobDescription.trim() && <span className="text-purple-400 flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
          </div>
        </div>
      </div>

      {/* Trigger Matching Button */}
      <button
        onClick={runMatchingEngine}
        disabled={isAnalyzing || !resumeText.trim() || !jobDescription.trim()}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-[0.99] transition-all disabled:opacity-40 cursor-pointer"
      >
        {isAnalyzing ? (
          <span className="animate-pulse flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-300" />
            Computing Alignment Matrix & Skill Gaps...
          </span>
        ) : (
          <>
            <GitCompare className="w-4 h-4" />
            Run Match & Gap Analysis Engine
          </>
        )}
      </button>

      {/* Results View */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8 relative overflow-hidden"
          >
            {/* Top Score Matrix Banner */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/5 pb-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center relative shadow-inner">
                  <span className="text-3xl font-black text-white tracking-tighter">{result.matchPercentage}%</span>
                  <span className="text-[8px] uppercase tracking-widest text-blue-400 font-bold mt-0.5">Match</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      result.matchPercentage >= 75 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                        : result.matchPercentage >= 50
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}>
                      {result.experienceMatch.level}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400 font-medium">Experience Score: {result.experienceMatch.score}%</span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Profile Requirement Fit</h3>
                  <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">{result.experienceMatch.analysis}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={copyAnalysis}
                  className="px-4 py-2.5 bg-slate-950 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BarChart3 className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Metrics"}
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/5 pb-4">
              {[
                { id: 'overview', label: 'Matching Skills & Requirements' },
                { id: 'gaps', label: 'Skill Gap Breakdown (6 Categories)' },
                { id: 'actions', label: 'Recommended Preparation Actions' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Skills Matching & Missing */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Matching Skills */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-emerald-400 uppercase font-black tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Matching Competencies ({result.matchingSkills.length})
                    </p>
                  </div>
                  <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl min-h-[220px]">
                    {result.matchingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.matchingSkills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Check className="w-3 h-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No direct keyword overlaps detected.</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-rose-400 uppercase font-black tracking-widest flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Unsatisfied Job Requirements ({result.missingSkills.length})
                    </p>
                  </div>
                  <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl min-h-[220px]">
                    {result.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {result.missingSkills.map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-400 font-semibold">Candidate matches 100% of required specifications!</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Categorized 6-Domain Skill Gap Analysis */}
            {activeTab === 'gaps' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">Structured 6-Category Gap Classification</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Categorized breakdown into Technical, Programming, Aptitude, Communication, Soft Skills, and Domain Knowledge.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Technical Skills', items: result.categorizedSkillGaps.technical, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10', icon: Code2 },
                    { label: 'Programming Languages', items: result.categorizedSkillGaps.programming, color: 'text-purple-400 border-purple-500/20 bg-purple-500/10', icon: Terminal },
                    { label: 'Aptitude & Reasoning', items: result.categorizedSkillGaps.aptitude, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', icon: BrainCircuit },
                    { label: 'Communication Ability', items: result.categorizedSkillGaps.communication, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10', icon: ShieldCheck },
                    { label: 'Soft Skills & Leadership', items: result.categorizedSkillGaps.softSkills, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10', icon: Compass },
                    { label: 'Domain Knowledge', items: result.categorizedSkillGaps.domainKnowledge, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10', icon: Layers }
                  ].map((cat, idx) => (
                    <div key={idx} className="p-5 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">{cat.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 min-h-[60px] items-start">
                        {cat.items && cat.items.length > 0 ? (
                          cat.items.map((it, i) => (
                            <span key={i} className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cat.color}`}>
                              {it}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-emerald-400/80 italic">No significant gaps detected in this bucket.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Recommended Actions */}
            {activeTab === 'actions' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold text-white tracking-tight">AI-Generated Remediation Strategy</h4>
                <div className="space-y-3">
                  {result.recommendedActions.map((action, i) => (
                    <div key={i} className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex items-start gap-4">
                      <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
