import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ResumeBuilder from './ResumeBuilder';
import AnalyticsVault from './AnalyticsVault';
import VaultSimulator from './VaultSimulator';
import QAGenerator from './QAGenerator';
import ProfileSetup from './ProfileSetup';
import VoiceResumeBuilder from './VoiceResumeBuilder';
import WrittenTest from './WrittenTest';
import ResourceFinder from './ResourceFinder';
import CareerRoadmap from './CareerRoadmap';
import ResumeMatchingEngine from './ResumeMatchingEngine';
import CareerRecommendations from './CareerRecommendations';
import JDAnalyzer from './JDAnalyzer';
import PlacementReadinessScore from './PlacementReadinessScore';
import { 
  Terminal, 
  Code2,
  Mic, 
  BarChart3, 
  ChevronRight, 
  Activity,
  LogOut,
  User as UserIcon,
  Search,
  Settings,
  ShieldCheck,
  FileSearch,
  Cpu,
  BrainCircuit,
  Clock,
  Compass,
  Milestone,
  TrendingUp,
  FileCheck2,
  FileCode,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  FileText,
  GitCompare,
  Target,
  Bell,
  CheckCircle2,
  X,
  BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { getAgentForModule, AGENTS } from '../lib/agents';
import AgentStatus from './AgentStatus';


type ModuleId = 
  | 'profile-setup'          // 1 | Candidate Onboarding & Profile Setup
  | 'voice-resume'           // 2 | Voice Resume Builder
  | 'resume-analyzer'        // 3 | AI Resume Analyzer
  | 'jd-analyzer'            // 4 | Job Description Analyzer
  | 'job-match'               // 5 | Resume-Job Matching Engine
  | 'skill-gap'              // 6 | Skill Gap Analysis
  | 'prep-plan'              // 7 | Personalized Preparation Plan
  | 'interview-sim'          // 8 | AI Interview Simulator
  | 'interview-eval'         // 9 | AI Interview Evaluation
  | 'coding-assessment'      // 10 | Coding & Technical Assessment
  | 'aptitude-prep'          // 11 | Aptitude Preparation
  | 'career-recommend'       // 12 | Career & Role Recommendation
  | 'progress-dashboard'     // 13 | Progress Dashboard
  | 'readiness-score'        // 14 | Placement Readiness Score
  | 'resource-hub';          // 15 | AI Resource Hub

interface UserProfile {
  photoURL?: string;
  displayName?: string;
  email?: string;
}

export default function WarMap({ user }: { user: UserProfile }) {
  const [activeModule, setActiveModule] = useState<ModuleId>(() => {
    try {
      const p = localStorage.getItem('awaken-onboarding-profile') || localStorage.getItem('yogyata-onboarding-profile');
      return p ? 'profile-setup' : 'profile-setup';
    } catch {
      return 'profile-setup';
    }
  });
  const [showLogs, setShowLogs] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([45, 52, 48, 62, 58, 73, 67, 81, 76, 88]);

  const [showPlanNotification, setShowPlanNotification] = useState<boolean>(() => {
    // If user has an onboarding profile saved and hasn't dismissed plan toast, show notification
    try {
      const p = localStorage.getItem('awaken-onboarding-profile');
      const seen = sessionStorage.getItem('awaken-plan-notif-seen');
      return !!p && !seen;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (showPlanNotification) {
      sessionStorage.setItem('awaken-plan-notif-seen', 'true');
    }
  }, [showPlanNotification]);

  React.useEffect(() => {
    const perfInterval = setInterval(() => {
      setPerformanceHistory((prev) => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const change = (Math.random() - 0.5) * 16;
        const newVal = Math.max(30, Math.min(98, Math.round(last + change)));
        next.push(newVal);
        return next;
      });
    }, 1000);
    return () => clearInterval(perfInterval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (num: number) => String(num).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const svgPath = performanceHistory
    .map((val, index) => `${(index * 12).toFixed(1)},${(100 - val).toFixed(1)}`)
    .join(' ');

  const activeAgent = getAgentForModule(activeModule);

  const handleLogout = async () => {
    try {
      await api.logout();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  const menuItems = [
    { id: 'profile-setup', label: '1. Candidate Onboarding', icon: UserIcon, desc: 'Profile, Target Role & Social Links' },
    { id: 'voice-resume', label: '2. Voice Resume Builder', icon: Mic, desc: 'Speech-to-ATS Resume Generation' },
    { id: 'resume-analyzer', label: '3. AI Resume Analyzer', icon: FileSearch, desc: 'Upload PDF/DOCX & Audit' },
    { id: 'jd-analyzer', label: '4. Job Description Analyzer', icon: FileText, desc: 'Skills & Responsibilities Extraction' },
    { id: 'job-match', label: '5. Resume-Job Matching Engine', icon: GitCompare, desc: 'Candidate Fit & Experience Matrix' },
    { id: 'skill-gap', label: '6. Skill Gap Analysis', icon: Layers, desc: '6-Domain Deficiencies Breakdown' },
    { id: 'prep-plan', label: '7. Personalized Preparation Plan', icon: Milestone, desc: 'Day-Wise & Week-Wise Roadmap' },
    { id: 'interview-sim', label: '8. AI Interview Simulator', icon: ShieldCheck, desc: 'Interactive Multi-Round Voice' },
    { id: 'interview-eval', label: '9. AI Interview Evaluation', icon: Award, desc: '6-Dimension Scorecard & Presence' },
    { id: 'coding-assessment', label: '10. Coding & Technical Assessment', icon: Code2, desc: 'Algorithms, SQL & Debugging' },
    { id: 'aptitude-prep', label: '11. Aptitude Preparation', icon: Terminal, desc: 'Quant, Logical & Verbal Drills' },
    { id: 'career-recommend', label: '12. Career & Role Recommendation', icon: TrendingUp, desc: 'Market Fit & Salary Insights' },
    { id: 'progress-dashboard', label: '13. Progress Dashboard', icon: BarChart3, desc: 'Real-time Metrics & Trajectory' },
    { id: 'readiness-score', label: '14. Placement Readiness Score', icon: Target, desc: 'Holistic Employability Index' },
    { id: 'resource-hub', label: '15. AI Resource Hub', icon: BookOpen, desc: 'Curated Roadmaps, Documentation & Repositories' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 font-sans flex overflow-hidden">
      {/* Structural Professional Background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent opacity-20" />
      </div>

      {/* Side Navigation Rail */}
      <aside className="w-72 bg-slate-900 border-r border-white/5 z-30 flex flex-col shadow-2xl relative">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h1 className="text-2xl font-extrabold tracking-tight text-white">AWAKEN.ai</h1>
          </div>
          <p className="text-[9px] text-blue-500/60 uppercase tracking-[0.3em] font-black">Agentic Orchestrator</p>
        </div>

        {/* Navigation Rail */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          <div className="px-4 py-2 mb-2 flex justify-between items-center">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Workspace</p>
            <div className="flex gap-1.5">
               <div className="w-1 h-1 rounded-full bg-blue-500" />
               <div className="w-1 h-1 rounded-full bg-emerald-500" />
            </div>
          </div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as any)}
              className={`w-full group px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-300 relative overflow-hidden ${
                activeModule === item.id 
                  ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)] text-white' 
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              {activeModule === item.id && (
                <motion.div layoutId="highlight" className="absolute inset-x-0 bottom-0 h-0.5 bg-white/40" />
              )}
              <item.icon className={`w-4 h-4 shrink-0 transition-colors ${activeModule === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <div className="flex-1 text-left min-w-0">
                <p className={`text-[11px] font-bold tracking-wide truncate ${activeModule === item.id ? 'text-white' : ''}`}>
                  {item.label}
                </p>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${activeModule === item.id ? 'translate-x-0 opacity-100 text-white' : '-translate-x-1 opacity-0 text-slate-500'}`} />
            </button>
          ))}
        </nav>

        {/* User Profile & Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
               {user?.photoURL ? (
                 <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <UserIcon className="w-4 h-4 text-blue-400" />
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[11px] font-bold text-white truncate">{user?.displayName || 'Candidate'}</p>
               <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
          >
             <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
             <span className="text-[11px] font-bold uppercase tracking-wider">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 relative flex flex-col z-10 bg-slate-950">
        {/* Top Control Bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-300 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Placement Preparation & Career Acceleration Platform
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-8 pr-6 border-r border-white/5">
               {/* Interval Timer */}
               <div className="flex flex-col items-end">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Session Active</span>
                  <div className="flex items-center gap-2 text-blue-400 font-mono font-bold text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimer(elapsedSeconds)}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className={`h-10 px-4 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 ${
                  showLogs ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                 <Activity className="w-3.5 h-3.5 text-blue-400" />
                 {showLogs ? 'Hide Node Logs' : 'View Core Logs'}
              </button>
            </div>
          </div>
        </header>

        {/* Plan Generated Global Banner Toast */}
        <AnimatePresence>
          {showPlanNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-8 mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/40 flex items-center justify-between shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Personalized Preparation Plan Generated</h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 uppercase">Automated</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your day-wise and week-wise milestones have been synthesized from your onboarding parameters. Ready to explore in Module 5!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveModule('prep-plan');
                    setShowPlanNotification(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  View Plan
                </button>
                <button
                  onClick={() => setShowPlanNotification(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <section className="flex-1 relative overflow-hidden flex">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 p-8 overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeModule === 'profile-setup' && <ProfileSetup onComplete={() => setActiveModule('voice-resume')} />}
                  {activeModule === 'voice-resume' && <VoiceResumeBuilder onGoToProfile={() => setActiveModule('profile-setup')} />}
                  {activeModule === 'resume-analyzer' && <ResumeBuilder focusMode="resume" />}
                  {activeModule === 'jd-analyzer' && <JDAnalyzer />}
                  {activeModule === 'job-match' && <ResumeMatchingEngine defaultTab="overview" />}
                  {activeModule === 'skill-gap' && <ResumeMatchingEngine defaultTab="gaps" />}
                  {activeModule === 'prep-plan' && <CareerRoadmap />}
                  {activeModule === 'interview-sim' && <VaultSimulator mode="technical" />}
                  {activeModule === 'interview-eval' && <VaultSimulator showEvaluationDirectly={true} />}
                  {activeModule === 'coding-assessment' && <WrittenTest defaultCategory="coding" moduleMode="technical" />}
                  {activeModule === 'aptitude-prep' && <WrittenTest defaultCategory="quant" moduleMode="aptitude" />}
                  {activeModule === 'career-recommend' && <CareerRecommendations />}
                  {activeModule === 'progress-dashboard' && <AnalyticsVault viewMode="dashboard" />}
                  {activeModule === 'readiness-score' && <PlacementReadinessScore />}
                  {activeModule === 'resource-hub' && <ResourceFinder />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Core Logs Overlay Panel */}
          <AnimatePresence>
            {showLogs && (
              <motion.aside
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="w-96 bg-slate-900 border-l border-white/5 z-40 p-8 overflow-y-auto scrollbar-hide shadow-[-40px_0_60px_rgba(0,0,0,0.5)]"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity Logs</h4>
                    <button onClick={() => setShowLogs(false)} className="text-slate-500 hover:text-white">✕</button>
                  </div>

                  <div className="space-y-6">
                    {[
                      { time: '14:22:04', agent: 'Orchestrator', msg: 'User profile loaded.' },
                      { time: '14:22:05', agent: 'System', msg: 'Interactive session ready.' },
                      { time: '14:22:08', agent: 'System', msg: 'Audio input connected.' },
                      { time: '14:22:12', agent: 'Forensic Auditor', msg: 'Resume parsed successfully.' },
                      { time: '14:22:15', agent: 'Orchestrator', msg: 'Progress metrics cached.' },
                    ].map((log, i) => (
                      <div key={i} className="space-y-1 font-mono">
                         <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-600">{log.time}</span>
                            <span className="text-[10px] text-blue-500 font-bold uppercase">{log.agent}</span>
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{log.msg}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">System Activity</p>
                     <div className="flex justify-between items-end h-12 gap-1 px-4">
                        {[40, 70, 45, 90, 65, 80, 50, 60].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm relative group overflow-hidden">
                             <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: `${h}%` }}
                               className="absolute bottom-0 inset-x-0 bg-blue-500 opacity-60" 
                             />
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>

  );
}



