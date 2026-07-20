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
  ArrowRight
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
        
        {/* Progress Circle & Metrics */}
        <div className="flex items-center gap-6 bg-slate-900/60 border border-white/5 p-5 rounded-2xl backdrop-blur-md">
          <div className="relative w-16 h-16 flex items-center justify-center">
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

      {/* Timeline Layout */}
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
    </div>
  );
}
