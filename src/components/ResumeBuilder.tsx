import React, { useState } from 'react';
import { motion } from 'motion/react';
import { supabase, auth } from '../lib/supabase';
import { api } from '../lib/api';
import { FileSearch, AlertCircle, Upload, Download, Check, Sparkles, CheckCircle2, XCircle, BarChart, Layers } from 'lucide-react';
import { extractResumeText, auditResumeWithGroq } from '../lib/groq';
import { calculateATSScore, ATSAnalysisResult } from '../lib/atsAlgorithm';

export default function ResumeBuilder() {
  const [content, setContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const extracted = await extractResumeText(base64, file.type);
        setContent(extracted);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Extraction failed:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const auditResume = async () => {
    if (!content || !jobDescription) return;
    setIsGenerating(true);
    try {
      // Execute hybrid ATS audit: deterministic algorithm + Groq AI analysis
      const data = await auditResumeWithGroq(content, jobDescription);
      setResult(data);

      // Save to PHP backend
      await api.saveATSScan(data);

      // Also persist to Supabase if configured
      if (auth.currentUser) {
        try {
          await supabase.from('resumes').insert({
            user_id: auth.currentUser.uid,
            type: 'scan',
            ats_score: data.atsScore,
            created_at: new Date().toISOString()
          });
        } catch (dbErr) {
          // Silent fallback
        }
      }
    } catch (err) {
      console.error("Audit error, falling back to pure deterministic calculation:", err);
      const fallback = calculateATSScore(content, jobDescription);
      setResult(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    setDownloading(true);
    try {
      const reportText = `ATS FORENSIC AUDIT REPORT
==========================
Overall ATS Match Score: ${result.atsScore}%
Keyword Alignment: ${result.keywordScore}%
Structural Integrity: ${result.structureScore}%
Quantifiable Metrics Score: ${result.impactScore}%
Action Verb Score: ${result.verbScore}%

MATCHED KEYWORDS:
${result.matchedKeywords.length > 0 ? result.matchedKeywords.map(k => '- ' + k).join('\n') : '- None'}

MISSING HIGH-VALUE KEYWORDS:
${result.missingKeywords.length > 0 ? result.missingKeywords.map(k => '- ' + k).join('\n') : '- None'}

STRUCTURAL ATS SECTION CHECKS:
${result.sections.map(s => `[${s.found ? 'PASS' : 'FAIL'}] ${s.name}`).join('\n')}

CRITICAL FEEDBACK & AUDIT ANOMALIES:
${result.criticalReview.map((item: string, i: number) => `- [${i + 1}] ${item}`).join('\n')}

${result.optimizedBulletPoints && result.optimizedBulletPoints.length > 0 ? `RECOMMENDED BULLET POINTS:\n${result.optimizedBulletPoints.map(bp => '- ' + bp).join('\n')}` : ''}
`;
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATS_Audit_Report_${result.atsScore}pct.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] uppercase font-mono tracking-widest text-blue-500 font-bold">Awaken ATS Core</span>
          <span className="text-white/20">•</span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Groq Llama-3 + ATS Algo</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">ATS Forensic Scanner & Match Algorithm</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Deterministic applicant tracking algorithm evaluating keyword match, structural compliance, quantifiable metrics, and active verbs, augmented with Groq AI analysis.
        </p>
      </div>

      {/* Grid: Resume Input, Upload & Job Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input 1: File Upload */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">1. Upload Blueprint</label>
            <div className="relative border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-xl p-6 text-center cursor-pointer transition-all">
              <input
                type="file"
                accept=".txt,.pdf,.docx,.doc"
                onChange={handleFileUpload}
                disabled={isExtracting}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-300">
                {isExtracting ? "Parsing Document..." : "Select Resume File"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">.PDF, .DOCX, .TXT supported</p>
            </div>
          </div>
          {content && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-400 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-400" />
              <span>Resume Loaded ({content.trim().split(/\s+/).length} words)</span>
            </div>
          )}
        </div>

        {/* Input 2: Paste Raw Content */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 flex flex-col">
          <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest">2. Resume Text</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste raw resume text here or edit parsed content..."
            className="flex-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white h-36 focus:border-blue-500/50 outline-none transition-all resize-none font-medium font-mono"
          />
        </div>

        {/* Input 3: Target Job Description */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 flex flex-col">
          <label className="block text-[10px] text-slate-500 uppercase font-black tracking-widest">3. Target Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job posting or requirements here..."
            className="flex-1 w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white h-36 focus:border-blue-500/50 outline-none transition-all resize-none font-medium font-mono"
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={auditResume}
        disabled={isGenerating || !content || !jobDescription}
        className="w-full py-4 bg-blue-600 border border-blue-500 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-600/20"
      >
        {isGenerating ? (
          <span>Analyzing Resume Against ATS Algorithm & Groq...</span>
        ) : (
          <>
            <FileSearch className="w-4 h-4" />
            Run ATS Algorithm & Forensic Scan
          </>
        )}
      </button>

      {/* Results Panel */}
      <div className="bg-slate-900 border border-white/5 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        {!result ? (
          <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
             <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center opacity-25">
                <AlertCircle className="w-6 h-6 text-slate-400" />
             </div>
             <p className="text-xs uppercase tracking-[0.4em] font-black text-slate-500">Awaiting Resume & Job Description</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header & Scores */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-6 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Weighted ATS Match Score</p>
                <div className="flex items-baseline gap-3">
                   <span className="text-5xl font-black text-white tracking-tighter">{result.atsScore}%</span>
                   <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${
                     result.atsScore >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                   }`}>
                     {result.atsScore >= 75 ? 'Interview Ready' : 'Optimization Required'}
                   </span>
                </div>
              </div>
              <button 
                onClick={downloadReport}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 border border-white/10 hover:border-white/20 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md uppercase tracking-wider"
              >
                {downloading ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
                {downloading ? "Downloaded!" : "Download Report"}
              </button>
            </div>

            {/* Granular Subscores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Keywords Match</p>
                <p className="text-2xl font-black text-blue-400 mt-1">{result.keywordScore}%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{result.matchedKeywords.length} matched</p>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Section Layout</p>
                <p className="text-2xl font-black text-purple-400 mt-1">{result.structureScore}%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{result.sections.filter(s => s.found).length}/{result.sections.length} headers found</p>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Impact Metrics</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{result.impactScore}%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{result.quantifiableMetricsFound.length} metrics detected</p>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Action Verbs</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{result.verbScore}%</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{result.actionVerbsCount} power verbs used</p>
              </div>
            </div>

            {/* Section Integrity Checklist */}
            <div className="space-y-3 p-5 bg-slate-950/40 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Section Header Parsing Status</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {result.sections.map((sec, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium">
                    {sec.found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className={sec.found ? 'text-slate-300' : 'text-slate-500'}>{sec.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Anomalies & Missing Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <p className="text-[10px] text-rose-400 uppercase font-black tracking-widest">Critical Anomalies & Structural Feedback</p>
                  <ul className="space-y-3">
                    {result.criticalReview.map((r: string, i: number) => (
                      <li key={i} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-slate-300 leading-relaxed font-medium">
                        {r}
                      </li>
                    ))}
                  </ul>
               </div>
               
               <div className="space-y-4">
                  <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Skill Gap Analysis (Categorized)</p>
                  
                  {result.categorizedGaps ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Technical Skills', items: result.categorizedGaps.technicalSkills, color: 'text-blue-400 border-blue-500/20 bg-blue-500/10' },
                        { label: 'Programming Languages', items: result.categorizedGaps.programming, color: 'text-purple-400 border-purple-500/20 bg-purple-500/10' },
                        { label: 'Aptitude & DSA', items: result.categorizedGaps.aptitude, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
                        { label: 'Communication', items: result.categorizedGaps.communication, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
                        { label: 'Soft Skills', items: result.categorizedGaps.softSkills, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' },
                        { label: 'Domain Knowledge', items: result.categorizedGaps.domainKnowledge, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' },
                      ].filter(c => c.items && c.items.length > 0).map((cat, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1.5">
                          <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">{cat.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.items.map((it, i) => (
                              <span key={i} className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${cat.color}`}>
                                {it}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.length > 0 ? (
                        result.missingKeywords.map((k: string, i: number) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                            {k}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-emerald-400">All target job keywords matched!</p>
                      )}
                    </div>
                  )}
               </div>
            </div>

            {/* Optimized Bullet Points */}
            {result.optimizedBulletPoints && result.optimizedBulletPoints.length > 0 && (
               <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <p className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Groq Synthesized Bullet Points</p>
                  </div>
                  <ul className="grid grid-cols-1 gap-3">
                    {result.optimizedBulletPoints.map((bp: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 leading-relaxed font-medium flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        {bp}
                      </li>
                    ))}
                  </ul>
               </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
