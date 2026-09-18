import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  MapPin, 
  Lock, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Milestone,
  Target,
  Sparkles,
  ArrowRight,
  Calendar,
  Clock,
  Check
} from 'lucide-react';

interface MilestoneItem {
  id: number;
  title: string;
  description: string;
  duration: string;
  focusArea: string;
  tasks: { id: string; text: string; done: boolean }[];
  resources: string[];
}

export default function CareerRoadmap() {
  const [profile] = useState<any>(() => {
    try {
      const savedProfile = localStorage.getItem('awaken-onboarding-profile') || localStorage.getItem('yogyata-onboarding-profile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch (e) {
      console.error("Failed to read onboarding profile:", e);
      return null;
    }
  });

  const [activeMilestoneId, setActiveMilestoneId] = useState<number>(1);
  const [roadmapMode, setRoadmapMode] = useState<'week-wise' | 'day-wise' | 'calendar'>('week-wise');

  const [taskProgress, setTaskProgress] = useState<Record<string, boolean>>(() => {
    try {
      const savedProgress = localStorage.getItem('awaken-roadmap-progress') || localStorage.getItem('yogyata-roadmap-progress');
      return savedProgress ? JSON.parse(savedProgress) : {};
    } catch {
      return {};
    }
  });

  // Derived milestones list from profile and taskProgress using useMemo
  const milestones = React.useMemo<MilestoneItem[]>(() => {
    const role = profile?.role || "Software Engineer";
    const exp = profile?.experience || "Entry Level";
    const domain = profile?.domain || "Technology";
    const targetJob = profile?.targetJob || "";

    if (roadmapMode === 'day-wise') {
      return [
        {
          id: 1,
          title: "Days 1–7: Skill Gap Triage & Target Baseline",
          description: `Diagnose core deficiencies in ${role} requirements and establish disciplined daily fundamentals.`,
          duration: "Day 1 to 7",
          focusArea: "Technical & Programming Gap Identification",
          tasks: [
            { id: "d1", text: "Day 1-2: Audit resume against 5 target job postings using Resume-Job Matching Engine", done: false },
            { id: "d2", text: "Day 3-4: Close priority Technical & Programming syntax gaps (e.g. TypeScript, SQL)", done: false },
            { id: "d3", text: "Day 5-7: Build and commit minimum viable project demonstrating missing technologies", done: false }
          ],
          resources: [`${role} Rapid Onboarding Guide`, "Daily Code Kata & DSA Drills", "Git Modular Project Starters"]
        },
        {
          id: 2,
          title: "Days 8–14: Quantitative Aptitude & Reasoning Sprint",
          description: "Intensive 7-day aptitude mastery covering quantitative math, logical patterns, and verbal comprehension.",
          duration: "Day 8 to 14",
          focusArea: "Aptitude, Verbal & Reasoning Drills",
          tasks: [
            { id: "d4", text: "Day 8-9: Complete 3 timed Quantitative Aptitude assessments in Written Test module", done: false },
            { id: "d5", text: "Day 10-11: Solve 25 Logical Reasoning puzzles and deductive pattern challenges", done: false },
            { id: "d6", text: "Day 12-14: Review Verbal Ability reading comprehension and error correction sets", done: false }
          ],
          resources: ["Quantitative Formulas Cheat Sheet", "Logical Deduction Shortcuts", "Verbal Comprehension Playbook"]
        },
        {
          id: 3,
          title: "Days 15–21: Technical Architecture & Coding Depth",
          description: "Execute deep coding assessments, system design principles, and database optimizations.",
          duration: "Day 15 to 21",
          focusArea: "System Design, Microservices & Data Structures",
          tasks: [
            { id: "d7", text: "Day 15-17: Solve 10 medium/hard DSA questions under timed simulation conditions", done: false },
            { id: "d8", text: "Day 18-19: Document database schema trade-offs (Indexing, Sharding, Caching)", done: false },
            { id: "d9", text: "Day 20-21: Run Practice Q&A technical round questions with AI evaluator", done: false }
          ],
          resources: ["System Architecture Design Patterns", "Database Indexing Manual", "Live Coding Interview Framework"]
        },
        {
          id: 4,
          title: "Days 22–30: AI Mock Simulator & Placement Readiness",
          description: "Engage in multi-round mock interviews (Technical, HR, Behavioral) with real video/voice telemetry.",
          duration: "Day 22 to 30",
          focusArea: "Interactive Mock Interviews & Behavioral Polish",
          tasks: [
            { id: "d10", text: "Day 22-24: Complete 2 Technical and 2 HR mock interviews on Mock Interview simulator", done: false },
            { id: "d11", text: "Day 25-27: Review 6-Dimension Scorecard (Confidence, Depth, Communication, Poise)", done: false },
            { id: "d12", text: "Day 28-30: Finalize ATS-optimized resume export and submit to targeted corporate roles", done: false }
          ],
          resources: ["Behavioral STAR Response Matrix", "Executive Poise & Voice Confidence Guide", "Salary Negotiation Masterclass"]
        }
      ].map(m => ({
        ...m,
        tasks: m.tasks.map(t => ({
          ...t,
          done: !!taskProgress[t.id]
        }))
      }));
    }

    const generated: MilestoneItem[] = [
      {
        id: 1,
        title: "Skill Alignment & Review",
        description: `Establish baseline hard skills and master core prerequisites for ${role} roles.`,
        duration: "Weeks 1-3",
        focusArea: `${domain} fundamentals & gap assessment`,
        tasks: [
          { id: "1-1", text: `Review target keywords for ${role} on modern ATS parsers`, done: false },
          { id: "1-2", text: `Complete baseline coding & architecture assessment`, done: false },
          { id: "1-3", text: `Build structural resume prototype inside ATS Scan tool`, done: false }
        ],
        resources: [
          `ATS Guide for ${role}`,
          `Deep Dive: Modern ${domain} Core Paradigms`,
          `Practical Portfolio Starter Repos`
        ]
      },
      {
        id: 2,
        title: "High-Impact Portfolio & Engineering Synthesis",
        description: `Build and showcase quantifiable engineering projects tailored to ${exp} standards.`,
        duration: "Weeks 4-7",
        focusArea: "Practical engineering & quantitative metrics",
        tasks: [
          { id: "2-1", text: `Deploy 2 full-scale projects demonstrating peak technical depth`, done: false },
          { id: "2-2", text: `Integrate telemetry or quantitative impact metrics (e.g., Latency, SEO scores)`, done: false },
          { id: "2-3", text: `Refine Voice Resume transcripts to emphasize technical leadership`, done: false }
        ],
        resources: [
          "System Design & Quantifiable Metrics Cheat Sheet",
          "Advanced Deployment & Scalability Blueprints",
          "Open Source Contribution Guidelines"
        ]
      },
      {
        id: 3,
        title: "Domain Test Preparation & Logic Mastery",
        description: `Hone core problem-solving structures and excel in domain-specific technical written assessments.`,
        duration: "Weeks 8-10",
        focusArea: "Algorithms, system architectures, and written diagnostics",
        tasks: [
          { id: "3-1", text: "Resolve 15 targeted written tests & technical challenge series", done: false },
          { id: "3-2", text: "Conduct 5 Practice Q&A cycles regarding systems bottlenecks", done: false },
          { id: "3-3", text: "Document system designs & database schema optimization logic", done: false }
        ],
        resources: [
          `Top Written Assessment Scenarios for ${domain}`,
          "Architectural Design Patterns & DB Scaling Manual",
          "Adversarial System Interview Questions Prep"
        ]
      },
      {
        id: 4,
        title: "Executive Presence & Active Simulator Validation",
        description: `Perform realistic, real-time simulated technical and behavioral mock trials with real camera telemetry.`,
        duration: "Weeks 11-13",
        focusArea: "WebRTC simulations & verbal communication cadence",
        tasks: [
          { id: "4-1", text: "Achieve a minimum 85% combined score on Mock Interview Simulator", done: false },
          { id: "4-2", text: "Optimize speech cadence clarity and pronunciation examples", done: false },
          { id: "4-3", text: "Refine body posture stability and maintain active eye contact", done: false }
        ],
        resources: [
          "Executive Charisma & Behavioral Strategy Guide",
          "Adversarial Interviewer Survival Framework",
          "Full Audio-Video Telemetry Optimization Manual"
        ]
      },
      {
        id: 5,
        title: "Pipeline Acquisition & Placement",
        description: `Target high-growth organizations and execute strategic interview responses for ${targetJob || 'Elite Roles'}.`,
        duration: "Weeks 14-16",
        focusArea: "Strategic applications & salary negotiations",
        tasks: [
          { id: "5-1", text: `Source 10 verified target vacancies matching ${domain}`, done: false },
          { id: "5-2", text: "Conduct targeted mock rounds mirroring realistic corporate tests", done: false },
          { id: "5-3", text: "Submit high-impact resume and complete initial screenings", done: false }
        ],
        resources: [
          "Elite Offer Negotiation Guide & Equity Benchmarks",
          "Direct Referral Pitching Templates",
          "Final-Round Behavioral Closing Playbook"
        ]
      }
    ];

    generated.forEach(m => {
      m.tasks.forEach(t => {
        if (taskProgress[t.id] !== undefined) {
          t.done = taskProgress[t.id];
        }
      });
    });

    return generated;
  }, [profile, taskProgress]);

  // Derived progressPercent from milestones using useMemo
  const progressPercent = React.useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    milestones.forEach(m => {
      m.tasks.forEach(t => {
        totalTasks++;
        if (t.done) completedTasks++;
      });
    });
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [milestones]);

  const toggleTask = (milestoneId: number, taskId: string) => {
    setTaskProgress(prev => {
      const nextProgress = {
        ...prev,
        [taskId]: !prev[taskId]
      };
      localStorage.setItem('awaken-roadmap-progress', JSON.stringify(nextProgress));
      return nextProgress;
    });
  };

  // Determine status of each milestone
  const getMilestoneStatus = (m: MilestoneItem) => {
    const isCompleted = m.tasks.every(t => t.done);
    const isStarted = m.tasks.some(t => t.done);
    if (isCompleted) return 'completed';
    if (isStarted || m.id === activeMilestoneId) return 'current';
    return 'locked';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20 font-sans text-slate-100">
      {/* Header and Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Milestone className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Milestone Blueprint</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Dynamic Career Roadmap</h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Your customized progression path generated from your onboarding parameters. Focus on completing each module to maximize candidate viability.
          </p>
        </div>
        
        {/* Progress Circle & Metrics & Mode Switch */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/60 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setRoadmapMode('week-wise'); setActiveMilestoneId(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                roadmapMode === 'week-wise' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Week-Wise (16 Wks)
            </button>
            <button
              onClick={() => { setRoadmapMode('day-wise'); setActiveMilestoneId(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                roadmapMode === 'day-wise' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Day-Wise (30 Days)
            </button>
            <button
              onClick={() => { setRoadmapMode('calendar'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                roadmapMode === 'calendar' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          <div className="flex items-center gap-4 pl-2 border-l border-white/5">
            <div className="relative w-14 h-14 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="none" />
              <motion.circle 
                cx="32" 
                cy="32" 
                r="28" 
                stroke="#2563eb" 
                strokeWidth="4" 
                fill="none" 
                strokeDasharray="175"
                animate={{ strokeDashoffset: 175 - (175 * progressPercent) / 100 }}
                transition={{ duration: 1 }}
              />
            </svg>
            <span className="text-sm font-black text-white">{progressPercent}%</span>
          </div>
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Total Completion</p>
            <p className="text-sm font-bold text-emerald-400">{progressPercent === 100 ? "Ready for Market!" : "In Progress"}</p>
          </div>
        </div>
      </div>
      </div>

      {/* Calendar View Mode */}
      {roadmapMode === 'calendar' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">30-Day Placement Preparation Calendar</h3>
                <p className="text-xs text-slate-400">Scheduled progression based on target role: <span className="text-blue-400 font-semibold">{profile?.role || "Software Engineer"}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Done
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Active Sprint
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block"></span> Upcoming
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { day: 1, title: 'Resume Audit & ATS Baseline', sprint: 'Sprint 1: Skill Gaps', taskId: 'd1', desc: 'Scan against 5 target JDs' },
              { day: 2, title: 'ATS Keyword Optimization', sprint: 'Sprint 1: Skill Gaps', taskId: 'd1', desc: 'Extract high-yield keywords' },
              { day: 3, title: 'Programming Syntax Review', sprint: 'Sprint 1: Skill Gaps', taskId: 'd2', desc: 'TypeScript, SQL & Python' },
              { day: 4, title: 'Priority Gap Drills', sprint: 'Sprint 1: Skill Gaps', taskId: 'd2', desc: 'Close technical deficiencies' },
              { day: 5, title: 'Project Scaffold Setup', sprint: 'Sprint 1: Skill Gaps', taskId: 'd3', desc: 'Init repo & modular architecture' },
              { day: 6, title: 'Project Core Delivery', sprint: 'Sprint 1: Skill Gaps', taskId: 'd3', desc: 'Implement business logic' },
              { day: 7, title: 'Sprint 1 Retrospective', sprint: 'Sprint 1: Skill Gaps', taskId: 'd3', desc: 'Deploy & commit portfolio work' },
              { day: 8, title: 'Quant Aptitude - Math', sprint: 'Sprint 2: Aptitude', taskId: 'd4', desc: 'Percentages, P&L, Time & Work' },
              { day: 9, title: 'Quant Aptitude - Timed', sprint: 'Sprint 2: Aptitude', taskId: 'd4', desc: 'Written test module drills' },
              { day: 10, title: 'Logical Reasoning Puzzles', sprint: 'Sprint 2: Aptitude', taskId: 'd5', desc: 'Deductive reasoning & syllogisms' },
              { day: 11, title: 'Pattern Recognition Drills', sprint: 'Sprint 2: Aptitude', taskId: 'd5', desc: 'Matrices & series completion' },
              { day: 12, title: 'Verbal Ability Grammar', sprint: 'Sprint 2: Aptitude', taskId: 'd6', desc: 'Sentence correction & vocab' },
              { day: 13, title: 'Reading Comprehension', sprint: 'Sprint 2: Aptitude', taskId: 'd6', desc: 'Speed reading & inference' },
              { day: 14, title: 'Full Aptitude Diagnostic', sprint: 'Sprint 2: Aptitude', taskId: 'd6', desc: 'Timed mock benchmark' },
              { day: 15, title: 'Data Structures - Arrays/Trees', sprint: 'Sprint 3: Tech Depth', taskId: 'd7', desc: 'LeetCode Medium problem set' },
              { day: 16, title: 'Dynamic Programming & Graphs', sprint: 'Sprint 3: Tech Depth', taskId: 'd7', desc: 'BFS/DFS & memoization' },
              { day: 17, title: 'Algorithms Speed Test', sprint: 'Sprint 3: Tech Depth', taskId: 'd7', desc: 'Timed execution simulation' },
              { day: 18, title: 'Database Indexing & Normalization', sprint: 'Sprint 3: Tech Depth', taskId: 'd8', desc: 'SQL optimization & execution plans' },
              { day: 19, title: 'System Design Fundamentals', sprint: 'Sprint 3: Tech Depth', taskId: 'd8', desc: 'Caching, Load Balancers, Sharding' },
              { day: 20, title: 'Microservices & API Contracts', sprint: 'Sprint 3: Tech Depth', taskId: 'd9', desc: 'gRPC vs REST vs GraphQL' },
              { day: 21, title: 'Technical Q&A Drilling', sprint: 'Sprint 3: Tech Depth', taskId: 'd9', desc: 'AI interactive review' },
              { day: 22, title: 'AI Mock Interview - Tech Rd 1', sprint: 'Sprint 4: Simulation', taskId: 'd10', desc: 'Coding & architecture probe' },
              { day: 23, title: 'AI Mock Interview - Tech Rd 2', sprint: 'Sprint 4: Simulation', taskId: 'd10', desc: 'Adversarial systems questions' },
              { day: 24, title: 'HR & Culture Mock Round', sprint: 'Sprint 4: Simulation', taskId: 'd10', desc: 'Leadership & STAR responses' },
              { day: 25, title: 'Voice & Poise Telemetry Audit', sprint: 'Sprint 4: Simulation', taskId: 'd11', desc: 'Speech cadence & eye contact' },
              { day: 26, title: 'Body Language Refinement', sprint: 'Sprint 4: Simulation', taskId: 'd11', desc: 'Postural stability practice' },
              { day: 27, title: '6-Dimension Scorecard Analysis', sprint: 'Sprint 4: Simulation', taskId: 'd11', desc: 'Review weak metrics' },
              { day: 28, title: 'Final ATS Resume Export', sprint: 'Sprint 4: Simulation', taskId: 'd12', desc: 'Format verified PDF' },
              { day: 29, title: 'Job Application Blitz', sprint: 'Sprint 4: Simulation', taskId: 'd12', desc: 'Apply to 10 curated postings' },
              { day: 30, title: 'Offer Readiness & Salary Strategy', sprint: 'Sprint 4: Simulation', taskId: 'd12', desc: 'Placement readiness unlocked' },
            ].map((d) => {
              const isDone = !!taskProgress[d.taskId];
              const isCurrent = d.day >= 8 && d.day <= 14;
              return (
                <div
                  key={d.day}
                  onClick={() => toggleTask(1, d.taskId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] group ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                      : isCurrent
                      ? 'bg-blue-950/30 border-blue-500/40 hover:border-blue-500/60 shadow-lg shadow-blue-500/5'
                      : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isDone ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'
                      }`}>
                        Day {d.day}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{d.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{d.desc}</p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>{d.sprint.split(':')[0]}</span>
                    <span className={isDone ? 'text-emerald-400 font-bold' : ''}>{isDone ? 'Completed' : 'Click to complete'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Timeline Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Timeline Track (milestones selector) */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Milestone Pipeline</p>
          
          <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-white/5">
            {milestones.map((m) => {
              const status = getMilestoneStatus(m);
              const isActive = m.id === activeMilestoneId;
              
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMilestoneId(m.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex gap-4 items-start relative overflow-hidden ${
                    isActive 
                      ? 'bg-blue-600/10 border-blue-500/40 shadow-lg shadow-blue-500/5' 
                      : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60 hover:border-white/10'
                  }`}
                >
                  {/* Glowing vertical line overlay */}
                  {isActive && (
                    <div className="absolute left-0 inset-y-0 w-1 bg-blue-500" />
                  )}

                  {/* Icon indicator */}
                  <div className="z-10 shrink-0">
                    {status === 'completed' ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">✓</div>
                    ) : status === 'current' ? (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-[10px]">{m.id}</div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-500">
                        <Lock className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">{m.duration}</span>
                      <ChevronRight className={`w-3 h-3 text-slate-500 transition-transform ${isActive ? 'translate-x-1 text-blue-400' : ''}`} />
                    </div>
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>{m.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{m.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed View of Active Milestone */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {milestones.filter(m => m.id === activeMilestoneId).map((m) => {
              const status = getMilestoneStatus(m);
              const isMilestoneDone = m.tasks.every(t => t.done);

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900 border border-white/5 rounded-3xl p-8 space-y-8 relative overflow-hidden shadow-2xl"
                >
                  {/* Decorative background circle */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Header */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] text-blue-400 font-bold uppercase tracking-wider">
                        {m.duration}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">
                        Focus: {m.focusArea}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                      {m.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  {/* Tasks Checklist */}
                  <div className="space-y-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                      <span>Milestone Deliverables</span>
                      <span className="h-px bg-white/5 flex-1" />
                    </p>

                    <div className="space-y-2.5">
                      {m.tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => toggleTask(m.id, task.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex gap-3.5 items-start ${
                            task.done 
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-400' 
                              : 'bg-slate-950/40 border-white/5 hover:border-white/10 text-slate-200'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {task.done ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 hover:text-blue-500 transition-colors" />
                            )}
                          </div>
                          <span className={`text-xs leading-relaxed ${task.done ? 'line-through text-slate-500' : ''}`}>
                            {task.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Learning Resources */}
                  <div className="space-y-4 pt-2">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                      <span>Curated Study Resources</span>
                      <span className="h-px bg-white/5 flex-1" />
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {m.resources.map((res, idx) => (
                        <div 
                          key={idx}
                          className="p-4 bg-slate-950/20 border border-white/5 rounded-xl hover:bg-slate-950/40 transition-colors flex gap-3 items-center"
                        >
                          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="text-xs text-slate-300 font-medium truncate">{res}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Status / Actions footer */}
                  <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2.5">
                      <Award className={`w-4 h-4 ${isMilestoneDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                        {isMilestoneDone ? "Milestone Unlocked & Completed!" : "Progress: Underway"}
                      </span>
                    </div>

                    {isMilestoneDone && m.id < 5 && (
                      <button
                        onClick={() => setActiveMilestoneId(m.id + 1)}
                        className="px-5 py-2 bg-blue-600 border border-blue-500 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2 hover:bg-blue-500 transition-colors"
                      >
                        <span>Next Milestone</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      )}
    </div>
  );
}
