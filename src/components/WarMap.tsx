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
  Milestone
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { getAgentForModule, AGENTS } from '../lib/agents';
import AgentStatus from './AgentStatus';


type ModuleId = 'profile' | 'voice-resume' | 'ats-scan' | 'qa' | 'written' | 'interview' | 'resources' | 'roadmap' | 'analytics';

interface UserProfile {
  photoURL?: string;
  displayName?: string;
  email?: string;
}

export default function WarMap({ user }: { user: UserProfile }) {
  const [activeModule, setActiveModule] = useState<ModuleId>('profile');
  const [showLogs, setShowLogs] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([45, 52, 48, 62, 58, 73, 67, 81, 76, 88]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    { id: 'profile', label: '1. Onboarding', icon: Settings, desc: 'Setup & Goals' },
    { id: 'voice-resume', label: '2. Voice Resume', icon: Mic, desc: 'Oral Profile Builder' },
    { id: 'ats-scan', label: '3. ATS Scan', icon: FileSearch, desc: 'ATS Scan & Audit' },
    { id: 'qa', label: '4. Practice Q&A', icon: Terminal, desc: 'Interview Prep Questions' },
    { id: 'written', label: '5. Written Test', icon: Code2, desc: 'Coding & Domain Quiz' },
    { id: 'interview', label: '6. Mock Interview', icon: ShieldCheck, desc: 'Interactive Simulation' },
    { id: 'resources', label: '7. Resource Hub', icon: Search, desc: 'Recommended Material' },
    { id: 'roadmap', label: '8. Career Roadmap', icon: Milestone, desc: 'Custom Progression Path' },
    { id: 'analytics', label: '9. Performance', icon: BarChart3, desc: 'Performance Metrics' },
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
              <item.icon className={`w-4 h-4 transition-colors ${activeModule === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <div className="flex-1 text-left">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${activeModule === item.id ? 'text-white' : ''}`}>
                  {item.label}
                </p>
                <p className={`text-[9px] font-medium ${activeModule === item.id ? 'text-blue-100/60' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
              <ChevronRight className={`w-3 h-3 transition-all duration-300 ${activeModule === item.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
            </button>
          ))}
        </nav>

        {/* Leftmost neural sync log panel removed. Code logs on right are active. */}

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
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 tracking-wide">
              Placement Preparation & Career Acceleration Platform
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-10 pr-8 border-r border-white/5">
               {/* Interval Timer */}
               <div className="flex flex-col items-end">
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Session Timer</span>
                  <div className="flex items-center gap-2 text-blue-400 font-mono font-bold text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimer(elapsedSeconds)}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className={`h-11 px-6 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3 ${
                  showLogs ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                 {showLogs ? 'Hide Node Logs' : 'View Core Logs'}
              </button>
              <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
                 <Activity className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 relative overflow-hidden flex">
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 p-10 overflow-y-auto scrollbar-hide">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {activeModule === 'profile' && <ProfileSetup onComplete={() => setActiveModule('voice-resume')} />}
                  {activeModule === 'voice-resume' && <VoiceResumeBuilder onGoToProfile={() => setActiveModule('profile')} />}
                  {activeModule === 'ats-scan' && <ResumeBuilder />}
                  {activeModule === 'qa' && <QAGenerator />}
                  {activeModule === 'written' && <WrittenTest />}
                  {activeModule === 'interview' && <VaultSimulator mode="technical" />}
                  {activeModule === 'resources' && <ResourceFinder />}
                  {activeModule === 'roadmap' && <CareerRoadmap />}
                  {activeModule === 'analytics' && <AnalyticsVault />}
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



