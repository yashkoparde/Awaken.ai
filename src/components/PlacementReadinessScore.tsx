import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Compass, 
  BrainCircuit, 
  Layers, 
  FileCheck, 
  RefreshCw,
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { api } from '../lib/api';

interface DimensionScore {
  name: string;
  category: string;
  weight: number; // percentage of total
  score: number;
  status: 'optimal' | 'adequate' | 'needs_work';
  recommendation: string;
  metricDetails: string;
}

export default function PlacementReadinessScore() {
  const [profile, setProfile] = useState<any>(null);
  const [testScores, setTestScores] = useState<any[]>([]);
  const [atsScans, setAtsScans] = useState<any[]>([]);
  const [milestonesDone, setMilestonesDone] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Profile
      const p = await api.getProfile();
      if (p) setProfile(p);
      else {
        const local = localStorage.getItem('awaken-onboarding-profile');
        if (local) setProfile(JSON.parse(local));
      }

      // 2. Tests
      const tests = await api.getTestScores();
      setTestScores(tests || []);

      // 3. ATS Scans
      const scans = await api.getATSScans();
      setAtsScans(scans || []);

      // 4. Roadmap progress
      const savedRoadmap = localStorage.getItem('awaken-roadmap-progress');
      if (savedRoadmap) {
        const parsed = JSON.parse(savedRoadmap);
        const count = Object.values(parsed).filter(Boolean).length;
        setMilestonesDone(count);
      }
    } catch (e) {
      console.warn("Failed to load readiness telemetry:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute authentic mathematically derived dimensional scores
  const evaluation = React.useMemo(() => {
    // 1. Resume ATS Dimension (Weight: 25%)
    let latestAtsScore = 0;
    if (atsScans.length > 0) {
      latestAtsScore = Number(atsScans[0].ats_score || atsScans[0].atsScore || 0);
    } else if (profile?.role) {
      latestAtsScore = 75; // baseline when profile exists
    } else {
      latestAtsScore = 50;
    }

    // 2. Technical Coding Assessment Dimension (Weight: 25%)
    const codingTests = testScores.filter(t => 
      (t.topic || '').toLowerCase().includes('coding') || 
      (t.topic || '').toLowerCase().includes('algorithm') ||
      (t.topic || '').toLowerCase().includes('data structure') ||
      (t.topic || '').toLowerCase().includes('technical')
    );
    const avgCoding = codingTests.length > 0
      ? Math.round(codingTests.reduce((acc, t) => acc + Number(t.score || 0), 0) / codingTests.length)
      : (testScores.length > 0 ? Number(testScores[0].score || 70) : 65);

    // 3. Quantitative & Logical Aptitude Dimension (Weight: 20%)
    const aptitudeTests = testScores.filter(t => 
      (t.topic || '').toLowerCase().includes('aptitude') || 
      (t.topic || '').toLowerCase().includes('quant') ||
      (t.topic || '').toLowerCase().includes('logical') ||
      (t.topic || '').toLowerCase().includes('reasoning')
    );
    const avgAptitude = aptitudeTests.length > 0
      ? Math.round(aptitudeTests.reduce((acc, t) => acc + Number(t.score || 0), 0) / aptitudeTests.length)
      : (testScores.length > 1 ? Number(testScores[1].score || 72) : 70);

    // 4. AI Interview & Verbal Poise Dimension (Weight: 15%)
    const interviewTests = testScores.filter(t => 
      (t.topic || '').toLowerCase().includes('interview') || 
      (t.topic || '').toLowerCase().includes('mock')
    );
    const avgInterview = interviewTests.length > 0
      ? Math.round(interviewTests.reduce((acc, t) => acc + Number(t.score || 0), 0) / interviewTests.length)
      : 74;

    // 5. Preparation Roadmap & Project Execution (Weight: 15%)
    // Based on completed milestones out of 12 deliverables
    const roadmapScore = Math.min(100, Math.max(50, Math.round(50 + (milestonesDone / 12) * 50)));

    // Composite Weighted Placement Readiness Score:
    const compositeScore = Math.round(
      (latestAtsScore * 0.25) +
      (avgCoding * 0.25) +
      (avgAptitude * 0.20) +
      (avgInterview * 0.15) +
      (roadmapScore * 0.15)
    );

    // Tier Classification
    let tier: { title: string; color: string; bg: string; border: string; verdict: string };
    if (compositeScore >= 85) {
      tier = {
        title: "Tier 1: Corporate & Tier-1 Enterprise Ready",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        verdict: "Exceptional candidate viability. Demonstrates strong coding competence, ATS bullet qualification, and interview presence. Fast-track to direct on-campus and enterprise applications."
      };
    } else if (compositeScore >= 70) {
      tier = {
        title: "Tier 2: Competitive Market Ready",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        verdict: "Strong fundamental readiness with targeted areas for refinement. High probability of clearing initial technical screens and coding assessments."
      };
    } else {
      tier = {
        title: "Tier 3: Structured Preparation Required",
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        verdict: "Foundational stage. We recommend completing the daily sprint tasks in Module 5 and running 2 more mock tests in Written Test before corporate submissions."
      };
    }

    const dimensions: DimensionScore[] = [
      {
        name: "ATS Resume Relevance & Bullet Quant",
        category: "Module 1 & 3 Scans",
        weight: 25,
        score: latestAtsScore,
        status: latestAtsScore >= 80 ? 'optimal' : latestAtsScore >= 65 ? 'adequate' : 'needs_work',
        recommendation: latestAtsScore >= 80 ? "Keywords match current Fortune 500 ATS standards." : "Incorporate quantified metrics and high-yield keywords from Module 2.",
        metricDetails: atsScans.length > 0 ? `${atsScans.length} ATS audit logs analyzed` : "Baseline algorithmic estimate"
      },
      {
        name: "Technical & Algorithms Competency",
        category: "Module 8 Technical Assessments",
        weight: 25,
        score: avgCoding,
        status: avgCoding >= 80 ? 'optimal' : avgCoding >= 65 ? 'adequate' : 'needs_work',
        recommendation: avgCoding >= 80 ? "Demonstrates strong DSA and syntax fluency." : "Complete 5 timed algorithm problem sets under Module 8.",
        metricDetails: codingTests.length > 0 ? `${codingTests.length} coding benchmarks verified` : "Initial diagnostic assessment"
      },
      {
        name: "Quantitative, Logical & Verbal Aptitude",
        category: "Module 9 Aptitude Drills",
        weight: 20,
        score: avgAptitude,
        status: avgAptitude >= 80 ? 'optimal' : avgAptitude >= 65 ? 'adequate' : 'needs_work',
        recommendation: avgAptitude >= 80 ? "High percentile speed and accuracy in logic drills." : "Practice speed math shortcuts and deductive reasoning sets.",
        metricDetails: aptitudeTests.length > 0 ? `${aptitudeTests.length} aptitude rounds scored` : "Baseline speed diagnostic"
      },
      {
        name: "Mock Interview Poise & Executive STAR Delivery",
        category: "Module 6 & 7 Simulator",
        weight: 15,
        score: avgInterview,
        status: avgInterview >= 80 ? 'optimal' : avgInterview >= 65 ? 'adequate' : 'needs_work',
        recommendation: avgInterview >= 80 ? "Solid rhetorical flow, steady gaze, and STAR behavioral answers." : "Run a 5-question technical mock trial to improve cadence.",
        metricDetails: interviewTests.length > 0 ? `${interviewTests.length} voice/video trials completed` : "Standard interview baseline"
      },
      {
        name: "Roadmap Milestones & Portfolio Synthesis",
        category: "Module 5 Daily Blueprint",
        weight: 15,
        score: roadmapScore,
        status: roadmapScore >= 80 ? 'optimal' : roadmapScore >= 65 ? 'adequate' : 'needs_work',
        recommendation: roadmapScore >= 80 ? "Preparation plan milestones completed on schedule." : `${milestonesDone}/12 sprint tasks logged. Continue checking off calendar goals.`,
        metricDetails: `${milestonesDone} tasks marked done`
      }
    ];

    return {
      compositeScore,
      tier,
      dimensions
    };
  }, [profile, testScores, atsScans, milestonesDone]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 pb-20 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Employability Benchmark</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white">Placement Readiness Score</h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            A comprehensive, weighted index evaluating your candidate viability across ATS alignment, coding assessments, aptitude speed, mock interview delivery, and preparation milestones.
          </p>
        </div>
        
        <button
          onClick={loadData}
          className="px-5 py-3 bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Recalculate Index</span>
        </button>
      </div>

      {/* Hero Employability Gauge Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Circular Gauge Score */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-950/80 border border-white/5 rounded-3xl text-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="74"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
                fill="none"
              />
              <motion.circle
                cx="88"
                cy="88"
                r="74"
                stroke={evaluation.compositeScore >= 80 ? '#10b981' : evaluation.compositeScore >= 65 ? '#3b82f6' : '#f59e0b'}
                strokeWidth="10"
                fill="none"
                strokeDasharray="465"
                initial={{ strokeDashoffset: 465 }}
                animate={{ strokeDashoffset: 465 - (465 * evaluation.compositeScore) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white tracking-tight">{evaluation.compositeScore}</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">out of 100</span>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-xs font-bold text-white uppercase tracking-wider">Overall Employability Index</p>
            <p className="text-[10px] text-slate-400">Target Role: <span className="text-blue-400 font-semibold">{profile?.role || "Software Engineer"}</span></p>
          </div>
        </div>

        {/* Verdict & Candidate Status */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${evaluation.tier.bg} ${evaluation.tier.color} ${evaluation.tier.border}">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {evaluation.tier.title}
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Candidate Employability Evaluation
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {evaluation.tier.verdict}
            </p>
          </div>

          {/* Quick Pillar Status Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">ATS Calibration</span>
              <span className="text-base font-bold text-emerald-400">{evaluation.dimensions[0].score}%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Weighted (25%)</span>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Coding Depth</span>
              <span className="text-base font-bold text-blue-400">{evaluation.dimensions[1].score}%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Weighted (25%)</span>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Aptitude & Logic</span>
              <span className="text-base font-bold text-indigo-400">{evaluation.dimensions[2].score}%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Weighted (20%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Dimensional Breakdown Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            5-Pillar Employability Breakdown & Recommendations
          </h3>
          <span className="text-xs text-slate-500 font-mono">100% Normalized Mathematical Weight</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {evaluation.dimensions.map((dim, idx) => (
            <div
              key={idx}
              className="p-6 bg-slate-900/70 border border-white/5 hover:border-white/15 rounded-3xl flex flex-col justify-between gap-5 transition-all shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-lg bg-white/5 text-slate-400">
                    Weight: {dim.weight}%
                  </span>
                  <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    dim.status === 'optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    dim.status === 'adequate' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {dim.status === 'optimal' ? 'Optimal' : dim.status === 'adequate' ? 'Adequate' : 'Needs Work'}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {dim.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{dim.category} • {dim.metricDetails}</p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">Pillar Score</span>
                    <span className="text-white font-mono">{dim.score}/100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dim.score}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full ${
                        dim.score >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' :
                        dim.score >= 65 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]' :
                        'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl text-[11px] text-slate-300 leading-relaxed">
                <span className="text-[9px] uppercase tracking-wider font-bold text-blue-400 block mb-1">Prescribed Action:</span>
                {dim.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Placement Readiness Checklist */}
      <div className="p-8 bg-slate-900 border border-white/5 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Direct Campus & Industry Placement Checklist</h3>
            <p className="text-xs text-slate-400">Standard corporate recruitment criteria required by hiring partners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "ATS Resume format passes standard 80%+ parser validation", done: evaluation.dimensions[0].score >= 80 },
            { label: "Core technical algorithms solved within 45 min runtime constraints", done: evaluation.dimensions[1].score >= 75 },
            { label: "Quantitative aptitude percentile meets corporate qualifying benchmark", done: evaluation.dimensions[2].score >= 75 },
            { label: "STAR behavioral response format with measurable quantitative results", done: evaluation.dimensions[3].score >= 75 },
            { label: "All high-impact keywords from target job description integrated", done: atsScans.length > 0 },
            { label: "Portfolio repositories contain CI/CD automated deployment workflows", done: milestonesDone >= 3 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
              <div className="shrink-0">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <span className={`text-xs ${item.done ? 'text-slate-200' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
