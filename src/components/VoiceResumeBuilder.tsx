import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, MicOff, Sparkles, Send, AudioLines, Upload, FileText, 
  CheckCircle2, ArrowRight, Copy, RotateCcw, Volume2, VolumeX, 
  AlertCircle, Check, Trash2, HelpCircle, Activity, Linkedin, Link, Github,
  Printer, FileDown, Eye
} from 'lucide-react';
import { generateVoiceResume, scrapeResume, extractResumeText } from '../lib/groq';
import { supabase, auth } from '../lib/supabase';
import { api } from '../lib/api';



const DEFAULT_QUESTIONS = [
  "Let's start with your academic foundation. Could you describe your latest educational qualifications, including the institution and degree?",
  "Tell me about your most recent professional role. What were your primary responsibilities and key achievements?",
  "What are your core technical competencies? Mention languages, tools, or frameworks you excel in.",
  "Can you describe a significant project you led or contributed to? Focus on the impact and your specific role."
];

export default function VoiceResumeBuilder({ onGoToProfile }: { onGoToProfile?: () => void } = {}) {
  // Flow states: 'hasResume' | 'resumeInput' | 'scrapedSummary' | 'socialLinks' | 'questions'
  const [flowStep, setFlowStep] = useState<'hasResume' | 'resumeInput' | 'scrapedSummary' | 'socialLinks' | 'questions'>('hasResume');
  const [hasExistingResume, setHasExistingResume] = useState<boolean | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<any>(null);

  // Question stage states
  const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
  const [currentStage, setCurrentStage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  
  // Custom Voice & Assistant States
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return (localStorage.getItem('awaken-assistant-muted') || localStorage.getItem('yogyata-assistant-muted')) === 'true';
    } catch {
      return false;
    }
  });
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [downloadingTxt, setDownloadingTxt] = useState(false);

  const [profile, setProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('awaken-onboarding-profile') || localStorage.getItem('yogyata-onboarding-profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.linkedin === undefined) parsed.linkedin = '';
        if (parsed.portfolio === undefined) parsed.portfolio = '';
        return parsed;
      }
    } catch (err) {
      console.error("Error reading profile for voice resume:", err);
    }
    return {
      name: '',
      phone: '',
      email: auth.currentUser?.email || '',
      role: 'Software Engineer',
      experience: 'Entry Level',
      domain: 'Tech',
      targetJob: '',
      github: '',
      leetcode: '',
      codeforces: '',
      linkedin: '',
      portfolio: ''
    };
  });

  const lastSpokenRef = useRef<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Persistence of Mute Preferences
  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    try {
      localStorage.setItem('awaken-assistant-muted', String(newVal));
    } catch (e) {
      console.error(e);
    }
    if (newVal) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      window.speechSynthesis.cancel();
      setIsSynthesizing(false);
    } else {
      // Speak current question if we unmuted
      if (flowStep === 'questions' && currentStage < questions.length) {
        speak(questions[currentStage]);
      }
    }
  };

  const speak = useCallback(async (text: string) => {
    if (isComplete || isMuted) return;
    if (lastSpokenRef.current === text) return;
    lastSpokenRef.current = text;

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    // Cancel any previous speech
    window.speechSynthesis.cancel();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSynthesizing(true);
    utterance.onend = () => setIsSynthesizing(false);
    utterance.onerror = () => setIsSynthesizing(false);
    window.speechSynthesis.speak(utterance);
  }, [isComplete, isMuted]);

  // Track the stage index that was already spoken so we NEVER repeat the same question
  const spokenStageRef = useRef<number | null>(null);

  // Auto-speak question exactly ONCE when entering the questions stage or changing questions
  useEffect(() => {
    if (isMuted || flowStep !== 'questions') {
      window.speechSynthesis.cancel();
      setIsSynthesizing(false);
      return;
    }

    if (spokenStageRef.current !== currentStage && currentStage < questions.length) {
      spokenStageRef.current = currentStage;
      speak(questions[currentStage]);
    }
  }, [flowStep, currentStage, isMuted, speak, questions]);

  // Cleanup on unmount or tab switch: always cancel any playing speech immediately
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setIsSynthesizing(false);
    };
  }, []);

  // Save voice resume output to Supabase DB
  const generateFinalResume = useCallback(async (finalAnswers: any) => {
    setIsGeneratingResume(true);
    setError(null);
    try {
      const data = await generateVoiceResume(finalAnswers, profile, scrapedData);
      setResult(data);

      // Persist to PHP Backend
      await api.saveATSScan({
        type: 'voice_generated',
        atsScore: data.atsScore,
        content: data.content,
        tips: data.tips,
        answers: finalAnswers
      });

      if (auth.currentUser) {
        try {
          await supabase.from('resumes').insert({
            user_id: auth.currentUser.uid,
            type: 'voice_generated',
            ats_score: data.atsScore,
            content: data.content,
            tips: data.tips,
            raw_answers: finalAnswers,
            created_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error("Supabase persistence failed:", dbErr);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError("Resume synthesis failed. Please try again.");
      setIsComplete(false);
    } finally {
      setIsGeneratingResume(false);
    }
  }, [profile, scrapedData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setScrapeError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = (event.target?.result as string).split(',')[1];
          const extracted = await extractResumeText(base64, file.type);
          setResumeText(extracted);
        } catch (err) {
          console.error("Text extraction failed:", err);
          setScrapeError("Failed to extract text from your resume file. Please copy-paste your resume text below instead!");
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File reader failed:", err);
      setScrapeError("Could not read file. Please paste your resume text below.");
      setIsExtracting(false);
    }
  };

  const handleScrapeResume = async () => {
    if (!resumeText.trim()) return;
    setIsScraping(true);
    setScrapeError(null);
    try {
      const data = await scrapeResume(resumeText, profile?.role || "Software Engineer");
      setScrapedData(data);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
      setFlowStep('scrapedSummary');
    } catch (err) {
      console.error("Scrape failed:", err);
      setScrapeError("AI could not study your resume. Let's build your profile from scratch instead!");
    } finally {
      setIsScraping(false);
    }
  };

  const submitStageWithText = (textVal: string) => {
    const key = `question_${currentStage + 1}`;
    const updatedAnswers = { ...answers, [key]: textVal || "Skipped / No detail provided" };
    setAnswers(updatedAnswers);
    setTranscript('');
    setMicError(null);
    
    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }

    if (currentStage < questions.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      setIsComplete(true);
      generateFinalResume(updatedAnswers);
    }
  };

  const nextStep = () => {
    submitStageWithText(transcript);
  };

  const handleSkip = () => {
    submitStageWithText("");
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Failed to stop speech recognition:", e);
        }
      }
      setIsRecording(false);
      return;
    }

    setMicError(null);
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = '';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript((finalTranscript + interimTranscript).trim());
      };

      recognition.onerror = (e: any) => {
        console.error("SpeechRecognition error:", e);
        setIsRecording(false);
        if (e.error === 'not-allowed') {
          setMicError("Microphone access blocked. Please click the microphone icon in your browser address bar to grant permission, or try typing directly below!");
        } else if (e.error === 'no-speech') {
          setMicError("No speech detected. Speak clearly into your microphone, or type your answer.");
        } else {
          setMicError(`Voice input error (${e.error}). Feel free to type your response instead!`);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsRecording(false);
        setMicError("Unable to open speech recognition. You can type your answers directly.");
      }
    } else {
      setMicError("Speech recognition is not fully supported in this browser. Please type your responses directly in the input box!");
    }
  };

  const handleCopy = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMarkdownToHtml = (markdown: string) => {
    if (!markdown) return "";
    
    const lines = markdown.split('\n');
    let html = '';
    let inList = false;

    const parseInlineStyles = (text: string) => {
      let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      parsed = parsed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline font-semibold">$1</a>');
      return parsed;
    };

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h1 class="text-3xl font-black text-slate-900 border-b-2 border-blue-600 pb-3 mt-8 mb-4 tracking-tight text-center uppercase">${trimmed.substring(2)}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2 class="text-xs font-black text-blue-600 border-b border-slate-200 pb-1.5 mt-6 mb-3 tracking-widest uppercase">${trimmed.substring(3)}</h2>`;
      } else if (trimmed.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3 class="text-xs font-bold text-slate-800 mt-4 mb-1.5">${trimmed.substring(4)}</h3>`;
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) { html += '<ul class="list-disc pl-5 space-y-1.5 mb-4 text-slate-700 text-xs font-medium">'; inList = true; }
        html += `<li>${parseInlineStyles(trimmed.substring(2))}</li>`;
      } else if (trimmed === '') {
        if (inList) { html += '</ul>'; inList = false; }
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p class="text-slate-700 text-xs leading-relaxed mb-3 font-medium">${parseInlineStyles(trimmed)}</p>`;
      }
    }

    if (inList) { html += '</ul>'; }

    return html;
  };

  const handlePrintPDF = () => {
    if (!result?.content) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download/print your formatted resume.");
      return;
    }

    const renderMarkdownToCleanHtml = (markdown: string) => {
      const lines = markdown.split('\n');
      let html = '';
      let inList = false;

      const cleanInlineStyles = (text: string) => {
        let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
        parsed = parsed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: #2563eb; text-decoration: underline;">$1</a>');
        return parsed;
      };

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += `<h1 style="font-size: 22px; font-weight: 800; text-align: center; margin-top: 0; margin-bottom: 3px; color: #0f172a; letter-spacing: -0.02em;">${trimmed.substring(2)}</h1>`;
        } else if (trimmed.startsWith('## ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += `<h2 style="font-size: 11px; font-weight: 700; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 2px; margin-top: 14px; margin-bottom: 6px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.08em;">${trimmed.substring(3)}</h2>`;
        } else if (trimmed.startsWith('### ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += `<h3 style="font-size: 10px; font-weight: 600; margin-top: 8px; margin-bottom: 2px; color: #334155;">${trimmed.substring(4)}</h3>`;
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          if (!inList) { html += '<ul style="list-style-type: disc; margin-left: 14px; margin-bottom: 6px; padding-left: 0; font-size: 9.5px; color: #334155;">'; inList = true; }
          html += `<li style="margin-bottom: 2px; line-height: 1.4;">${cleanInlineStyles(trimmed.substring(2))}</li>`;
        } else if (trimmed === '') {
          if (inList) { html += '</ul>'; inList = false; }
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          html += `<p style="font-size: 9.5px; color: #334155; margin-bottom: 4px; line-height: 1.4;">${cleanInlineStyles(trimmed)}</p>`;
        }
      }
      if (inList) { html += '</ul>'; }
      return html;
    };

    const htmlContent = renderMarkdownToCleanHtml(result.content);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${profile?.name || 'Resume'} - Awaken.ai</title>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #ffffff;
            color: #1e293b;
            margin: 0;
            padding: 25px;
          }
          @media print {
            body {
              padding: 0;
            }
            @page {
              size: letter;
              margin: 12mm 15mm 12mm 15mm;
            }
          }
          .subtitle-role {
            font-size: 11px !important;
            text-align: center;
            font-weight: 700 !important;
            color: #2563eb !important;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-top: 0 !important;
            margin-bottom: 4px !important;
          }
          .contact-info {
            font-size: 8.5px !important;
            text-align: center;
            color: #64748b !important;
            margin-bottom: 12px !important;
            border-bottom: 1.5px solid #cbd5e1 !important;
            padding-bottom: 8px !important;
          }
        </style>
      </head>
      <body>
        <div id="resume-container">
          ${htmlContent}
        </div>
        <script>
          const container = document.getElementById('resume-container');
          const h1 = container.querySelector('h1');
          if (h1) {
            let next = h1.nextElementSibling;
            if (next && next.tagName === 'P') {
              next.classList.add('subtitle-role');
              let contact = next.nextElementSibling;
              if (contact && contact.tagName === 'P') {
                contact.classList.add('contact-info');
              }
            }
          }
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadTxt = () => {
    if (!result?.content) return;
    setDownloadingTxt(true);
    try {
      const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile?.name?.replace(/\s+/g, '_') || 'Resume'}_Formatted_Awaken.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloadingTxt(false), 1500);
    }
  };

  const startScratchFlow = () => {
    setQuestions(DEFAULT_QUESTIONS);
    setScrapedData(null);
    setFlowStep('socialLinks');
  };

  // Rendering Loader when generating final resume
  if (isComplete && !result) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[500px] space-y-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center animate-spin-slow">
            <Sparkles className="w-12 h-12 text-blue-400" />
          </div>
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight uppercase">Synthesizing Your Resume</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Agent Resu-Market Architect is optimizing matching vectors...</p>
        </div>
        {error && (
           <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold text-center">
             {error}
             <button onClick={() => generateFinalResume(answers)} className="block mx-auto mt-2 underline">Retry Session</button>
           </div>
        )}
      </div>
    );
  }

  // Rendering Final Results Screen
  if (result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-10 bg-slate-900 border border-white/5 rounded-[2rem] shadow-2xl space-y-8 font-sans">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <div className="space-y-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">Optimized Professional Resume</h2>
              <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Architect Synthesis Complete</p>
           </div>
           <div className="flex items-baseline gap-2 bg-slate-950/40 border border-white/5 px-4 py-2 rounded-2xl">
              <span className="text-4xl font-black text-white tracking-tighter">{result.atsScore}%</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ATS Compatibility</span>
           </div>
        </div>

        {/* Validated Portfolio & Credentials Links */}
        {(profile?.github || profile?.linkedin || profile?.leetcode || profile?.codeforces || profile?.portfolio) && (
          <div className="p-5 bg-slate-950/40 border border-white/5 rounded-2xl space-y-3">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Validated Professional Identifiers</span>
             </div>
             <div className="flex flex-wrap gap-3">
                {profile.linkedin && (
                  <a 
                    href={profile.linkedin.trim().startsWith('http') ? profile.linkedin.trim() : `https://${profile.linkedin.trim()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 rounded-xl text-xs text-blue-400 hover:text-blue-300 transition-all font-medium"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {profile.github && (
                  <a 
                    href={profile.github.trim().startsWith('http') ? profile.github.trim() : `https://${profile.github.trim()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-white/5 hover:bg-slate-700/50 rounded-xl text-xs text-slate-300 hover:text-white transition-all font-medium"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {profile.leetcode && (
                  <a 
                    href={profile.leetcode.trim().startsWith('http') ? profile.leetcode.trim() : `https://${profile.leetcode.trim()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/10 border border-amber-500/20 hover:bg-amber-600/20 rounded-xl text-xs text-amber-400 hover:text-amber-300 transition-all font-medium"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>LeetCode</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {profile.codeforces && (
                  <a 
                    href={profile.codeforces.trim().startsWith('http') ? profile.codeforces.trim() : `https://${profile.codeforces.trim()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600/20 rounded-xl text-xs text-rose-400 hover:text-rose-300 transition-all font-medium"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>CodeForces</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
                {profile.portfolio && (
                  <a 
                    href={profile.portfolio.trim().startsWith('http') ? profile.portfolio.trim() : `https://${profile.portfolio.trim()}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 rounded-xl text-xs text-emerald-400 hover:text-emerald-300 transition-all font-medium"
                  >
                    <Link className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                    <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                  </a>
                )}
             </div>
          </div>
        )}

        {/* Toggle View Mode & Download Section */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/60 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document View</span>
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'raw' 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Markdown View</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Direct PDF print/download */}
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Download Formatted PDF</span>
              </button>

              {/* Direct Plain Text / Markdown download */}
              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-200 hover:text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>{downloadingTxt ? "Downloading..." : "Download TXT/MD"}</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Raw"}</span>
              </button>
            </div>
          </div>

          {activeTab === 'preview' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 md:p-12 max-h-[600px] overflow-y-auto select-text text-slate-800 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <div 
                className="prose prose-sm max-w-none text-slate-800 font-sans"
                dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(result.content) }}
              />
            </div>
          ) : (
            <div className="p-1 bg-slate-950 rounded-3xl border border-white/5 relative group">
              <div className="max-h-[600px] overflow-y-auto p-8 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-mono select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {result.content}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
              <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest">Critical Optimization Tips</p>
              <ul className="space-y-3">
                {result.tips?.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="h-full bg-blue-600 rounded-2xl flex flex-col items-center justify-center gap-2 p-6 text-white hover:bg-blue-500 transition-all shadow-xl group"
           >
              <RotateCcw className="w-6 h-6 group-hover:rotate-45 transition-transform" />
              <span className="font-black uppercase text-xs tracking-widest">Build Another Resume Node</span>
           </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-20 font-sans text-slate-100">
      
      {/* Top Controller Header with Voice/Mute Status */}
      <div className="flex justify-between items-center bg-slate-900/60 border border-white/5 rounded-2xl px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-400 font-medium">Resume Builder Active</span>
        </div>
        <button 
          onClick={toggleMute}
          className="p-2 bg-slate-950 border border-white/10 hover:border-white/20 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
          title={isMuted ? "Unmute Coach Voice" : "Mute Coach Voice"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          {isMuted ? "Muted" : "Voice On"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: Ask if the user has an existing resume */}
        {flowStep === 'hasResume' && (
          <motion.div 
            key="hasResume"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 md:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-xl font-bold text-white tracking-tight">Welcome to the voice resume architect</h2>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] pt-1">
                Select your entry point
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto pt-4">
              <button
                onClick={() => {
                  setHasExistingResume(true);
                  setFlowStep('resumeInput');
                }}
                className="flex flex-col items-center justify-center p-6 bg-slate-950 hover:bg-blue-950/20 border border-white/5 hover:border-blue-500/30 rounded-2xl transition-all group duration-300"
              >
                <span className="font-bold text-white text-sm">Yes, I have a resume</span>
                <span className="text-[10px] text-slate-500 mt-1">Study and rebuild my existing CV</span>
              </button>

              <button
                onClick={startScratchFlow}
                className="flex flex-col items-center justify-center p-6 bg-slate-950 hover:bg-slate-900 border border-white/5 hover:border-white/20 rounded-2xl transition-all group duration-300"
              >
                <span className="font-bold text-white text-sm">No, build from scratch</span>
                <span className="text-[10px] text-slate-500 mt-1">Create a brand new CV from scratch</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Scrape the Resume (File upload and text area input) */}
        {flowStep === 'resumeInput' && (
          <motion.div 
            key="resumeInput"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <button 
                onClick={() => setFlowStep('hasResume')}
                className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1.5"
              >
                ← Back to entry selection
              </button>
              <h2 className="text-2xl font-bold text-white tracking-tight">Study and Scrape Existing Resume</h2>
              <p className="text-xs text-slate-400">
                Upload your resume or paste its raw content. Agent Architect will study and parse your milestones before asking targeted enrichment questions.
              </p>
            </div>

            {/* Drag & Drop File Upload */}
            <div className="p-6 bg-slate-950/50 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 relative hover:border-blue-500/50 transition-all group">
              <input 
                type="file" 
                accept=".pdf,.txt,.docx"
                onChange={handleFileUpload}
                disabled={isExtracting || isScraping}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className={`w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors ${isExtracting ? 'animate-bounce' : ''}`} />
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-300">
                  {isExtracting ? "Extracting resume details..." : "Click to upload or drag resume file"}
                </p>
                <p className="text-[10px] text-slate-500">Supports PDF, DOCX, TXT</p>
              </div>
            </div>

            {/* Raw Text Input */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Or paste your resume content directly:</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your professional experience, work history, skills, projects, and education text here..."
                disabled={isExtracting || isScraping}
                className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-mono"
                rows={8}
              />
            </div>

            {scrapeError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {scrapeError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={startScratchFlow}
                className="flex-1 py-3 px-6 bg-slate-950 border border-white/10 hover:bg-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 transition-all text-center"
              >
                Skip Scraping
              </button>

              <button
                onClick={handleScrapeResume}
                disabled={isExtracting || isScraping || !resumeText.trim()}
                className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isScraping ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Studying Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Study & Scrape Resume
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Confirm scraped summary findings */}
        {flowStep === 'scrapedSummary' && scrapedData && (
          <motion.div 
            key="scrapedSummary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-8"
          >
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Milestones Extracted Successfully</p>
                <h3 className="text-xl font-bold text-white tracking-tight">Resume Studies Complete</h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Scraped Primary Role</span>
                  <p className="text-sm font-extrabold text-white">{scrapedData.role || "Not determined"}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Education Milestone</span>
                  <p className="text-xs text-slate-300 font-medium line-clamp-2">{scrapedData.education || "Not found"}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl space-y-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Experience Highlight</span>
                <p className="text-slate-300 leading-relaxed font-medium line-clamp-3">{scrapedData.experience || "Not specified"}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl space-y-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Technical / Skill Stack Found</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {scrapedData.skills?.map((s: string, idx: number) => (
                    <span key={idx} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {s}
                    </span>
                  )) || <span className="text-slate-500 italic">None found</span>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl space-y-2">
               <div className="flex items-center gap-2 text-blue-400">
                 <HelpCircle className="w-4 h-4" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Interactive Follow-up Strategy</p>
               </div>
               <p className="text-xs text-slate-400 leading-relaxed">
                 To build an exceptional resume draft, we will now proceed to a 3-question guided interview where you can dictate or type clarifications, accomplishments, and specifics.
               </p>
            </div>

            <button
              onClick={() => setFlowStep('socialLinks')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group"
            >
              Start Follow-up Session
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* STEP 3.5: Ask for Links before proceeding */}
        {flowStep === 'socialLinks' && (
          <motion.div 
            key="socialLinks"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-2xl space-y-8"
          >
            <div className="space-y-2">
              <button 
                onClick={() => setFlowStep(hasExistingResume ? 'scrapedSummary' : 'hasResume')}
                className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 font-semibold"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-white tracking-tight">Confirm Professional & Code Links</h2>
              <p className="text-xs text-slate-400">
                Please review and provide the contact channels and coding/portfolio links to display in your final resume header.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Yash Koparde"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="e.g. name@domain.com"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1 flex items-center gap-1">
                  <Github className="w-3 h-3 text-slate-400" /> GitHub URL
                </label>
                <input
                  type="url"
                  value={profile.github || ''}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  placeholder="github.com/username"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* LinkedIn */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1 flex items-center gap-1">
                  <Linkedin className="w-3 h-3 text-blue-400" /> LinkedIn URL
                </label>
                <input
                  type="url"
                  value={profile.linkedin || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Portfolio */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1 flex items-center gap-1">
                  <Link className="w-3 h-3 text-emerald-400" /> Portfolio URL
                </label>
                <input
                  type="url"
                  value={profile.portfolio || ''}
                  onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                  placeholder="yourportfolio.com"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* LeetCode */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1">LeetCode Profile</label>
                <input
                  type="url"
                  value={profile.leetcode || ''}
                  onChange={(e) => setProfile({ ...profile, leetcode: e.target.value })}
                  placeholder="leetcode.com/username"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Codeforces */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1">Codeforces Profile</label>
                <input
                  type="url"
                  value={profile.codeforces || ''}
                  onChange={(e) => setProfile({ ...profile, codeforces: e.target.value })}
                  placeholder="codeforces.com/profile/username"
                  className="w-full bg-slate-950 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-300 outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                />
              </div>

              {/* Phone from Onboarding */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-black pl-1 flex items-center gap-1">
                  Phone Number
                </label>
                <div className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-400 select-none">
                  {profile.phone ? profile.phone : "Using phone number from onboarding profile"}
                </div>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!profile.name || !profile.email) {
                  alert("Please enter Name and Email to proceed.");
                  return;
                }
                // Save/Synchronize profile changes to local storage & backend
                try {
                  localStorage.setItem('awaken-onboarding-profile', JSON.stringify(profile));
                  if (auth.currentUser) {
                    await supabase.from('profiles').upsert({
                      id: auth.currentUser.uid,
                      email: profile.email,
                      display_name: profile.name,
                      role: profile.role || 'Software Engineer',
                      experience: profile.experience || 'Entry Level',
                      domain: profile.domain || 'Tech',
                      target_job: profile.targetJob || '',
                      github: profile.github || '',
                      leetcode: profile.leetcode || '',
                      codeforces: profile.codeforces || '',
                      linkedin: profile.linkedin || '',
                      portfolio: profile.portfolio || '',
                      phone: profile.phone || '',
                      updated_at: new Date().toISOString()
                    });
                  }
                } catch (err) {
                  console.error("Failed to sync profile on step complete:", err);
                }
                // Move to questions step
                setFlowStep('questions');
              }}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group"
            >
              Start Guided Interview
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* STEP 4: Ask follow-up questions (with voice or text input) */}
        {flowStep === 'questions' && (
          <motion.div 
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 md:p-12 min-h-[500px] flex flex-col justify-between shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                     <AudioLines className={`w-5 h-5 ${isSynthesizing ? 'animate-pulse' : ''}`} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Question {currentStage + 1} of {questions.length}</p>
                    <p className="text-xs font-bold text-slate-400">{hasExistingResume ? 'Personalized Resume Tuning' : 'Scratch Build Session'}</p>
                  </div>
                </div>
                <button 
                  onClick={handleSkip}
                  className="text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider"
                >
                  Skip
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-relaxed">{questions[currentStage]}</h3>
                  <button 
                    onClick={() => {
                      spokenStageRef.current = null;
                      lastSpokenRef.current = null;
                      speak(questions[currentStage]);
                    }}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 text-slate-400 hover:text-blue-400 transition-all shrink-0"
                    title="Replay this question"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dictation Textarea Box */}
              <div className="p-6 bg-slate-950/50 border border-white/5 rounded-2xl min-h-[160px] flex flex-col items-stretch justify-between relative group/input">
                 <textarea
                   value={transcript}
                   onChange={(e) => setTranscript(e.target.value)}
                   placeholder="Click the microphone button below to talk and transcribe, or type/edit your response directly here..."
                   className="w-full bg-transparent text-slate-200 text-sm md:text-base font-medium leading-relaxed outline-none border-none resize-none placeholder:text-slate-600 focus:placeholder:opacity-0 focus:ring-0 select-text z-10"
                   rows={4}
                 />
                 
                 {isRecording && (
                   <div className="absolute inset-0 flex items-center justify-center bg-blue-500/5 rounded-2xl pointer-events-none z-20">
                      <div className="flex gap-1.5 items-end h-8">
                         {[...Array(5)].map((_, i) => (
                           <div 
                             key={i} 
                             className="w-1.5 bg-blue-500 rounded-full animate-wave" 
                             style={{ animationDelay: `${i * 0.15}s`, height: i % 2 === 0 ? '50%' : '100%' }} 
                           />
                         ))}
                      </div>
                   </div>
                 )}
              </div>

              {/* Troubleshooting Mic Warning */}
              {micError && (
                <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-400 flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Mic Status Warning</span>
                    {micError}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-6 mt-8 relative z-10">
               <div className="flex items-center gap-6">
                  {/* Glowing Microphone Button */}
                  <button 
                    onClick={handleToggleRecording}
                    disabled={isSynthesizing || isGeneratingResume}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording ? 'bg-rose-500 text-white shadow-[0_0_35px_rgba(244,63,94,0.4)] animate-pulse' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:scale-105 active:scale-95'
                    }`}
                    title={isRecording ? "Stop voice input" : "Start voice input"}
                  >
                    {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  
                  {/* Submit / Proceed Button */}
                  <button 
                    onClick={nextStep}
                    disabled={isGeneratingResume}
                    className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all disabled:opacity-20"
                    title="Submit answer and proceed"
                  >
                     <Send className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">
                 {isRecording ? 'Listening...' : 'Ready for dictation or typing'}
               </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
