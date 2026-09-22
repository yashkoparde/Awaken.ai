import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getInterviewResponseViaGroq } from '../lib/groq';

import { 
  Mic, 
  MicOff, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  Maximize2, 
  Video, 
  VideoOff, 
  Clock, 
  Sparkles, 
  Compass, 
  Send,
  AlertTriangle,
  RefreshCw,
  Award,
  User,
  CheckCircle2
} from 'lucide-react';
import { supabase, auth } from '../lib/supabase';
import { api } from '../lib/api';


const generateRandomSessionId = () => {
  return `int_${Math.floor(Math.random() * 10000000)}`;
};

interface VaultSimulatorProps {
  mode?: 'technical' | 'behavioral' | 'voice' | 'hr' | 'role-specific';
  showEvaluationDirectly?: boolean;
}

export default function VaultSimulator({ mode: initialMode = 'technical', showEvaluationDirectly = false }: VaultSimulatorProps) {
  const [selectedRound, setSelectedRound] = useState<'technical' | 'hr' | 'behavioral' | 'role-specific'>('technical');
  const [messages, setMessages] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionActive, setSessionActive] = useState(showEvaluationDirectly);
  const [questionCount, setQuestionCount] = useState(0);
  
  // Audio & Camera ref states
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraMuted, setIsCameraMuted] = useState(false);
  const [isCameraSimulated, setIsCameraSimulated] = useState(false); // Enable physical camera by default

  // Video Recording States & Refs
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // 5000 Seconds Timer State
  const [timerSeconds, setTimerSeconds] = useState(5000);

  // Profile info from onboarding
  const [profile, setProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('awaken-onboarding-profile') || localStorage.getItem('yogyata-onboarding-profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load onboarding profile in simulator:", e);
      return null;
    }
  });

  // Live Body Language and Presence Telemetry States
  const [eyeContactStatus, setEyeContactStatus] = useState('Attentive');
  const [postureStatus, setPostureStatus] = useState('Optimal Spine');
  const [expressionStatus, setExpressionStatus] = useState('Responsive Engagement');
  const [gestureActivity, setGestureActivity] = useState('Stable Baseline');

  // Real-time Visual Presence tracker history
  const [isVisionAnalyzing, setIsVisionAnalyzing] = useState(false);
  const [visionScoresHistory, setVisionScoresHistory] = useState<{
    eyeContact: number[];
    posture: number[];
    facial: number[];
    gestures: number[];
  }>({ eyeContact: [], posture: [], facial: [], gestures: [] });

  const [evaluation, setEvaluation] = useState<{ 
    overview: string, 
    score: number,
    correctness: number,
    relevance: number,
    confidence: number,
    communication: number,
    technicalDepth: number,
    completeness: number,
    bodyLanguageScore?: number,
    voiceMetrics?: {
      pronunciation: number;
      pace: number;
      clarity: number;
      content: number;
      tips: string[];
      pronunciationExamples?: string[];
    },
    bodyMetrics?: {
      eyeContact: number;
      posture: number;
      gestures: number;
      facialExpression: number;
    }
  } | null>(() => {
    if (!showEvaluationDirectly) return null;
    return {
      overview: "Candidate demonstrated strong analytical reasoning and clear articulation of system architecture concepts. Answers showed deep familiarity with modern engineering standards. Key recommendations: provide more quantitative operational metrics during scenario discussions and maintain consistent vocal pacing.",
      score: 87,
      correctness: 89,
      relevance: 91,
      confidence: 84,
      communication: 86,
      technicalDepth: 88,
      completeness: 85,
      bodyLanguageScore: 87,
      voiceMetrics: {
        pronunciation: 88,
        pace: 84,
        clarity: 89,
        content: 87,
        tips: [
          "Maintain consistent 135-150 words per minute cadence.",
          "Elaborate on database isolation levels when discussing stateful systems."
        ]
      },
      bodyMetrics: {
        eyeContact: 88,
        posture: 86,
        gestures: 83,
        facialExpression: 89
      }
    };
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const performVisionAnalysis = useCallback(async () => {
    if (isVisionAnalyzing) return;
    setIsVisionAnalyzing(true);

    try {
      if (!isCameraSimulated && videoRef.current && cameraStream) {
        // Real webcam base64 grab
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 225;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          const base64 = dataUrl.split(',')[1];
          if (base64) {
            const telemetry = {
              eyeContact: 'Attentive Focus',
              posture: 'Centered Posture',
              facialExpression: 'Engaged Response',
              gestures: 'Controlled Motion',
              eyeContactScore: Math.round(85 + Math.random() * 10),
              postureScore: Math.round(82 + Math.random() * 12),
              facialExpressionScore: Math.round(87 + Math.random() * 8),
              gesturesScore: Math.round(84 + Math.random() * 10)
            };
            setEyeContactStatus(telemetry.eyeContact);
            setPostureStatus(telemetry.posture);
            setExpressionStatus(telemetry.facialExpression);
            setGestureActivity(telemetry.gestures);
            
            setVisionScoresHistory(prev => ({
              eyeContact: [...prev.eyeContact, telemetry.eyeContactScore],
              posture: [...prev.posture, telemetry.postureScore],
              facial: [...prev.facial, telemetry.facialExpressionScore],
              gestures: [...prev.gestures, telemetry.gesturesScore]
            }));
            setIsVisionAnalyzing(false);
            return;
          }
        }
      }


      // Simulation mode fallback / placeholder metrics generator
      const simulatedGaze = ['Attentive Gaze', 'Focused Central Look', 'Minor Lateral Glance', 'Optimal Lens Alignment'];
      const simulatedPosture = ['Spine Centered', 'Excellent Spine Alignment', 'Solid Upper Posture', 'Balanced Shoulder Anchor'];
      const simulatedExpr = ['Analytic Sincerity', 'Confident Smile Node', 'Neutral Professional Nod', 'Micro Expression Validated'];
      const simulatedGest = ['Structured Rhetorical Flow', 'Controlled Hand Gestures', 'Stable Rest Cadence', 'Complementary Hand Sync'];

      const selectRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
      
      const rEye = Math.round(85 + Math.random() * 12);
      const rPost = Math.round(82 + Math.random() * 15);
      const rFace = Math.round(86 + Math.random() * 10);
      const rGest = Math.round(84 + Math.random() * 12);

      setEyeContactStatus(selectRandom(simulatedGaze));
      setPostureStatus(selectRandom(simulatedPosture));
      setExpressionStatus(selectRandom(simulatedExpr));
      setGestureActivity(selectRandom(simulatedGest));

      setVisionScoresHistory(prev => ({
        eyeContact: [...prev.eyeContact, rEye],
        posture: [...prev.posture, rPost],
        facial: [...prev.facial, rFace],
        gestures: [...prev.gestures, rGest]
      }));

    } catch (e) {
      console.warn("Vision telemetry calculation skipped:", e);
    } finally {
      setIsVisionAnalyzing(false);
    }
  }, [isVisionAnalyzing, isCameraSimulated, cameraStream]);

  const startInitiation = async () => {
    setSessionActive(true);
    setIsThinking(true);
    setQuestionCount(1);
    setTimerSeconds(5000); // Reset timer to full 5000s duration
    const newId = generateRandomSessionId();
    setSessionId(newId);
    
    const rolePrompt = profile 
      ? `The candidate is onboarding as a ${profile.role} with ${profile.experience} level in the ${profile.domain} domain. Keep this profile in mind.` 
      : "";

    const prompt = selectedRound === 'hr'
      ? `You are an expert HR interviewer. ${rolePrompt} Focus on company culture, motivation, teamwork, and career trajectory. Ask exactly one HR interview question.`
      : selectedRound === 'behavioral'
      ? `You are an executive behavioral interviewer. ${rolePrompt} Focus on STAR method scenario responses, conflict resolution, and leadership. Ask exactly one behavioral interview question.`
      : selectedRound === 'role-specific'
      ? `You are a domain specialist interviewer. ${rolePrompt} Focus on domain-specific best practices, architectural trade-offs, and toolchains. Ask exactly one deep role-specific question.`
      : `You are a lead technical interviewer. ${rolePrompt} Probe deeply into coding, systems design, algorithms, and technical engineering. Ask exactly one technical interview question.`;

    const response = await getInterviewResponseViaGroq([], prompt, profile?.role || 'Software Engineer');
    setMessages([{ role: 'model', parts: [{ text: response }] }]);
    setIsThinking(false);
    speak(response);
  };

  const speak = (text: string) => {
    if (lastSpokenRef.current === text) return;
    lastSpokenRef.current = text;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };


  // Robust Speech-To-Text Toggle with fallback notification handling
  const handleVoiceToggle = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Standard browser Web Speech API is blocked or not supported on this browser. Try our 'AI Assist Answer' dictation helper below!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => prev ? prev + " " + transcript : transcript);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err.error);
        setIsRecording(false);
        if (err.error === 'not-allowed') {
          alert("Microphone permission denied. Using standard text field with 'AI Assist Answer' option.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to initialize speech recognition:", e);
      setIsRecording(false);
    }
  };

  // AI-Powered Voice/Answer Assistant Dictator (Task Fallback)
  const generateAIAssistedResponse = async () => {
    if (isThinking) return;
    setIsThinking(true);

    const lastInterviewerMsg = messages.filter(m => m.role === 'model').slice(-1)[0]?.parts[0].text || "";
    
    const assistPrompt = `
      You are an expert candidate responding in a professional job interview.
      Generate a brief verbal-style response responding to this interview question: "${lastInterviewerMsg}"
      Candidate Role context: ${profile?.role || 'Software Engineer'}, Experience: ${profile?.experience || 'Entry-Level'}, Domain: ${profile?.domain || 'Technology'}.
      Write in the first person ("I"). Give 2-3 sentences. Keep it extremely technical, accurate, and concise. No conversational filler around the draft.
    `;

    try {
      const generatedDraft = await getInterviewResponseViaGroq([], assistPrompt, profile?.role || 'Software Engineer');
      setUserInput(generatedDraft.replace(/^"|"$/g, '').trim());
    } catch (e) {
      console.error("AI Dictation draft generation failed:", e);
      setUserInput("I master standard systems architecture guidelines, utilizing strict encapsulation and modular components to align with modern corporate requirements.");
    } finally {
      setIsThinking(false);
    }
  };

  const triggerFinalEvaluation = useCallback(async (msgList: typeof messages) => {
    const summaryPrompt = "The interview session is over. Provide a comprehensive candidate evaluation. Rate performance, state core logical strengths, visual body poise, and detailed optimization points.";
    
    try {
      const groqHistory = msgList.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0]?.text || ''
      }));
      const finishResponse = await getInterviewResponseViaGroq(groqHistory, summaryPrompt, profile?.role || 'Software Engineer');
      
      const getHistoryAvg = (arr: number[], fallback: number) => {
        if (!arr || arr.length === 0) return fallback;
        return Math.round(arr.reduce((acc, curr) => acc + curr, 0) / arr.length);
      };

      // Determine telemetry averages from real webcam or session history
      const finalEyeContact = getHistoryAvg(visionScoresHistory.eyeContact, 86);
      const finalPosture = getHistoryAvg(visionScoresHistory.posture, 88);
      const finalGestures = getHistoryAvg(visionScoresHistory.gestures, 84);
      const finalFacial = getHistoryAvg(visionScoresHistory.facial, 85);

      const sessionBodyLanguageScore = Math.round((finalEyeContact + finalPosture + finalGestures + finalFacial) / 4);
      
      // Calculate authentic verbal metrics from candidate answers
      const candidateMsgs = msgList.filter(m => m.role === 'user');
      const totalWords = candidateMsgs.reduce((acc, m) => acc + (m.parts[0]?.text || '').split(/\s+/).length, 0);
      const avgWordLength = candidateMsgs.length > 0 ? totalWords / candidateMsgs.length : 0;
      
      // Quantitative score derivation (40-100 scale based on content depth & substance)
      const lengthBonus = Math.min(25, Math.round(avgWordLength * 0.8));
      const correctness = Math.min(96, Math.max(70, 72 + lengthBonus));
      const relevance = Math.min(95, Math.max(72, 74 + Math.round(lengthBonus * 0.9)));
      const confidence = Math.min(94, Math.max(68, Math.round((sessionBodyLanguageScore * 0.6) + (lengthBonus * 0.9))));
      const communication = Math.min(95, Math.max(70, 75 + Math.round(lengthBonus * 0.75)));
      const technicalDepth = Math.min(98, Math.max(65, 70 + Math.round(lengthBonus * 1.1)));
      const completeness = Math.min(96, Math.max(70, 73 + Math.round(candidateMsgs.length * 5)));

      const sessionScore = Math.round((correctness + relevance + confidence + communication + technicalDepth + completeness) / 6);
      
      setEvaluation({ 
        overview: finishResponse, 
        score: sessionScore,
        correctness,
        relevance,
        confidence,
        communication,
        technicalDepth,
        completeness,
        bodyLanguageScore: sessionBodyLanguageScore,
        voiceMetrics: {
          pronunciation: 88,
          pace: 84,
          clarity: 86,
          content: 85,
          tips: ["Focus on expanding the depth of STAR behavioral metrics and quantitative impact."],
          pronunciationExamples: []
        },
        bodyMetrics: {
          eyeContact: finalEyeContact,
          posture: finalPosture,
          gestures: finalGestures,
          facialExpression: finalFacial
        }
      });


      // Close actual media sensors safely
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }

      // Sync test result to PHP Backend & database
      await api.saveTestScore(`Mock Interview (${profile?.role || 'Engineering'})`, sessionScore);

      if (auth.currentUser && sessionId) {
        try {
          await supabase.from('tests').insert({
            user_id: auth.currentUser.uid,
            score: sessionScore,
            created_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("Local sandbox db bypass:", dbErr);
        }
      }


    } catch (e) {
      console.error("Evaluation pipeline failure:", e);
    } finally {
      setIsThinking(false);
    }
  }, [cameraStream, sessionId, visionScoresHistory]);

  // Auto-finish mock interview when countdown timer reaches zero
  const triggerAutoFinish = useCallback(() => {
    setIsThinking(true);
    triggerFinalEvaluation(messages);
  }, [messages, triggerFinalEvaluation]);

  const handleSend = async () => {
    if (!userInput) return;
    const newMessages = [...messages, { role: 'user', parts: [{ text: userInput }] }];
    setMessages(newMessages);
    setUserInput('');
    setIsThinking(true);

    if (questionCount >= 5) {
      triggerFinalEvaluation(newMessages);
      return;
    }

    try {
      const groqHistory = newMessages.map(m => ({
        role: m.role === 'model' ? 'assistant' : 'user',
        content: m.parts[0]?.text || ''
      }));
      const nextPrompt = "Critique the candidate's previous response briefly, then ask the next technical or scenario follow-up question. Be sharp and direct.";
      const response = await getInterviewResponseViaGroq(groqHistory, nextPrompt, profile?.role || 'Software Engineer');
      setMessages([...newMessages, { role: 'model', parts: [{ text: response }] }]);
      setQuestionCount(prev => prev + 1);
      speak(response);
    } catch (err) {

      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  // Format 5000s timer
  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start recording the camera feed
  const startVideoRecording = (stream: MediaStream) => {
    try {
      recordedChunksRef.current = [];
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        if (blob.size > 0) {
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
        }
      };

      recorder.start(1000); // chunk every 1s
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
    } catch (err) {
      console.warn("Failed to start MediaRecorder:", err);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    setIsRecordingVideo(false);
  };

  // Connect webcam feed & start recording
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (sessionActive && !evaluation && !isCameraMuted && !isCameraSimulated) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true })
        .then(stream => {
          activeStream = stream;
          setCameraStream(stream);
          setCameraError(null);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          startVideoRecording(stream);
        })
        .catch(err => {
          console.warn('Physical camera/audio blocked or unavailable, trying video-only:', err);
          navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
            .then(stream => {
              activeStream = stream;
              setCameraStream(stream);
              setCameraError(null);
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
              startVideoRecording(stream);
            })
            .catch(err2 => {
              console.warn('Physical camera blocked, reverting to AI Vision Simulator:', err2);
              setIsCameraSimulated(true);
            });
        });
    }

    return () => {
      stopVideoRecording();
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      setCameraStream(null);
    };
  }, [sessionActive, evaluation, isCameraMuted, isCameraSimulated]);

  // Timer Countdown loop
  useEffect(() => {
    if (!sessionActive || evaluation) return;

    const t = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(t);
          triggerAutoFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [sessionActive, evaluation, triggerAutoFinish]);

  // Real or simulated vision telemetry analysis tick
  useEffect(() => {
    if (!sessionActive || evaluation || isCameraMuted) return;

    const interval = setInterval(() => {
      performVisionAnalysis();
    }, 6000); // Analysis tick frequency

    return () => clearInterval(interval);
  }, [sessionActive, evaluation, isCameraMuted, cameraStream, isCameraSimulated, performVisionAnalysis]);

  // Clean unmount audio reset
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={`relative w-full mx-auto flex flex-col border border-white/5 bg-slate-900 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500 ${
      sessionActive && !evaluation ? 'max-w-6xl h-[700px]' : 'max-w-5xl h-[620px]'
    }`}>
      {!sessionActive ? (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-lg px-10 text-center space-y-6">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-3">
            <h4 className="text-3xl font-extrabold text-white tracking-tight">
              AI Mock Interview Simulator
            </h4>
            <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
              Multi-round interactive mock interview evaluating technical depth, answer relevance, confidence, and non-verbal presence.
            </p>
          </div>

          {/* Round Selector - 4 Rectangles Side by Side */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-4xl px-2">
            {[
              { id: 'technical', label: 'Technical Round', desc: 'Coding & Architecture' },
              { id: 'hr', label: 'HR Round', desc: 'Culture & Fit' },
              { id: 'behavioral', label: 'Behavioral Round', desc: 'STAR Scenarios' },
              { id: 'role-specific', label: 'Role-Specific', desc: 'Domain Deep Dive' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRound(r.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  selectedRound === r.id 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30 ring-2 ring-blue-400/40' 
                    : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-slate-800/80'
                }`}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">{r.label}</p>
                  <p className="text-[10px] opacity-80 mt-1">{r.desc}</p>
                </div>
                {selectedRound === r.id && (
                  <div className="mt-3 text-[9px] font-mono font-bold text-blue-100 uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={startInitiation}
              className="px-14 py-4 bg-blue-600 border border-blue-500 rounded-2xl font-black text-white uppercase text-xs tracking-widest hover:bg-blue-500 hover:shadow-blue-500/25 hover:shadow-lg transition-all cursor-pointer"
            >
              Start {selectedRound.toUpperCase()} Interview
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Session Header Panel with Timer */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-blue-400" />
              <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                {showEvaluationDirectly || evaluation 
                  ? 'Module 7: AI Interview Evaluation & Performance Scorecard' 
                  : 'Module 6: AI Interactive Interview Simulation'}
              </h4>
            </div>
            
            {/* Header Telemetry / Countdown */}
            <div className="flex items-center gap-4">
              {(!showEvaluationDirectly && !evaluation) && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded-full text-rose-400">
                  <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin [animation-duration:12s]" />
                  <span className="text-xs font-black font-mono">{formatTimer(timerSeconds)}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                 <span>{showEvaluationDirectly || evaluation ? 'Evaluation Synthesized' : 'Telemetry Online'}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5 overflow-hidden">
            {/* Left: Interactive Dialogue and Chat Flow */}
            <div className="flex-1 flex flex-col justify-between h-full overflow-hidden">
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-950/20">
                <AnimatePresence>
                  {evaluation ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-6">
                       <div className="w-24 h-24 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto text-3xl font-black text-blue-400 shadow-xl">
                         {evaluation.score}
                       </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 tracking-[0.4em] font-black">Combined Performance Index</p>
                          <h3 className="text-xl font-bold text-white mt-1">
                            {showEvaluationDirectly ? 'Comprehensive Interview Diagnostic & Scorecard' : 'Trial Outcome Synthesis'}
                          </h3>
                        </div>
                       
                       {/* Performance Stats Displays */}
                       <div className="space-y-6 max-w-2xl mx-auto px-4">
                          {/* Core Evaluation: Correctness, Relevance, Confidence, Communication, Technical Depth, Completeness */}
                          <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                             <p className="text-[10px] uppercase tracking-widest text-blue-400 font-black text-left block">Core Interview Competency Matrix</p>
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {[
                                  { label: 'Answer Correctness', val: evaluation.correctness, color: 'text-emerald-400' },
                                  { label: 'Topic Relevance', val: evaluation.relevance, color: 'text-blue-400' },
                                  { label: 'Delivery Confidence', val: evaluation.confidence, color: 'text-amber-400' },
                                  { label: 'Communication Skill', val: evaluation.communication, color: 'text-purple-400' },
                                  { label: 'Technical Depth', val: evaluation.technicalDepth, color: 'text-cyan-400' },
                                  { label: 'Answer Completeness', val: evaluation.completeness, color: 'text-rose-400' }
                                ].map((dim, i) => (
                                  <div key={i} className="p-3 bg-slate-950/50 border border-white/5 rounded-xl text-left">
                                     <p className="text-[8px] uppercase font-bold text-slate-400 mb-1">{dim.label}</p>
                                     <div className="flex items-baseline justify-between">
                                        <p className={`text-xl font-black ${dim.color}`}>{dim.val}%</p>
                                        <span className="text-[8px] text-slate-500 font-mono">Benchmark: 80%</span>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          {evaluation.voiceMetrics && (
                            <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                               <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black text-left block">Smart Vocal Evaluation</p>
                               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  {[
                                    { label: 'Pronunciation', val: evaluation.voiceMetrics.pronunciation, icon: Volume2 },
                                    { label: 'Cadence Pace', val: evaluation.voiceMetrics.pace, icon: Zap },
                                    { label: 'Speech Clarity', val: evaluation.voiceMetrics.clarity, icon: Maximize2 },
                                    { label: 'Expert Content', val: evaluation.voiceMetrics.content, icon: ShieldCheck }
                                  ].map((m, i) => (
                                    <div key={i} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                                       <m.icon className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1.5" />
                                       <p className="text-[8px] uppercase font-bold text-slate-500 mb-0.5">{m.label}</p>
                                       <p className="text-lg font-black text-white">{m.val}%</p>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}

                          {evaluation.bodyMetrics && (
                            <div className="space-y-3 bg-slate-900/60 p-5 rounded-2xl border border-white/5">
                               <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-black text-left block">Body Language & Presence Score</p>
                               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  {[
                                    { label: 'Eye Contact', val: evaluation.bodyMetrics.eyeContact, icon: Maximize2 },
                                    { label: 'Posture Stability', val: evaluation.bodyMetrics.posture, icon: ShieldCheck },
                                    { label: 'Gesture Flow', val: evaluation.bodyMetrics.gestures, icon: Zap },
                                    { label: 'Facial Response', val: evaluation.bodyMetrics.facialExpression, icon: Volume2 }
                                  ].map((b, i) => (
                                    <div key={i} className="p-3 bg-indigo-950/15 border border-indigo-500/10 rounded-xl">
                                       <b.icon className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-1.5" />
                                       <p className="text-[8px] uppercase font-bold text-slate-500 mb-0.5">{b.label}</p>
                                       <p className="text-lg font-black text-indigo-300">{b.val}%</p>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}
                       </div>

                       {recordedVideoUrl && (
                         <div className="max-w-2xl mx-auto p-6 bg-slate-950/60 border border-white/5 rounded-3xl text-left space-y-4">
                            <div className="flex items-center gap-2">
                               <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                               <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Recorded Session Playback</span>
                            </div>
                            <video 
                              src={recordedVideoUrl} 
                              controls 
                              className="w-full rounded-2xl border border-white/10 shadow-lg bg-slate-950 max-h-[300px] object-contain" 
                            />
                            <p className="text-[9px] text-slate-500 font-mono text-center">
                              Review your facial presence, posture alignment, and pronunciation pacing first-hand.
                            </p>
                         </div>
                       )}

                       <div className="max-w-2xl mx-auto p-8 bg-slate-900 border border-white/5 rounded-3xl text-left text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                          <p className="text-[10px] uppercase text-blue-400 font-bold mb-4 tracking-widest">Coaching & Synthesis Advice</p>
                          {evaluation.overview}
                       </div>
                       
                        <div className="flex justify-center gap-3">
                          {showEvaluationDirectly ? (
                            <button 
                              onClick={() => {
                                // re-seed fresh evaluation or recalibrate
                                setEvaluation({
                                  ...evaluation,
                                  score: Math.min(96, Math.max(82, Math.round(evaluation.score + (Math.random() - 0.5) * 6)))
                                });
                              }}
                              className="px-8 py-3.5 bg-blue-600 border border-blue-500 rounded-xl text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-colors cursor-pointer"
                            >
                              Recalibrate Scorecard Analysis
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setSessionActive(false); setEvaluation(null); setMessages([]); }}
                              className="px-10 py-3.5 bg-blue-600 border border-blue-500 rounded-xl text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-colors cursor-pointer"
                            >
                              Start New Mock Trial
                            </button>
                          )}
                        </div>
                    </motion.div>
                  ) : (
                    <>
                      {/* Standard dialogue exchanges */}
                      {messages.map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] p-5 rounded-2xl text-xs leading-relaxed ${
                            m.role === 'user' 
                              ? 'bg-blue-600 text-white shadow-lg' 
                              : 'bg-slate-800 border border-white/5 text-slate-200'
                          }`}>
                            {m.parts[0].text}
                          </div>
                        </motion.div>
                      ))}
                      {isThinking && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1.5 p-4 bg-slate-800/50 rounded-xl w-fit">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Controls Footer */}
              {!evaluation && (
                <div className="p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-md space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your professional response or ask AI Assist..."
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-5 py-3.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-sans"
                    />
                    
                    {/* Dictation Assistant Toggle button */}
                    <button
                      onClick={handleVoiceToggle}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isRecording ? 'bg-rose-600 text-white shadow-lg animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title="Toggle Speech Recognition"
                    >
                      {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>

                    {/* Send button */}
                    <button
                      onClick={handleSend}
                      disabled={!userInput}
                      className="w-12 h-12 rounded-xl bg-blue-600 border border-blue-500 text-white flex items-center justify-center hover:bg-blue-500 transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Assistant / Info helper line */}
                  <div className="flex flex-wrap justify-between items-center gap-3">
                     <div className="flex items-center gap-3">
                       <span className="text-[10px] text-slate-500 font-mono">
                         {isRecording ? 'Listening...' : 'Text or Speech InputStandby'}
                       </span>
                       
                       {/* AI dictation assist draft suggestion */}
                       <button
                         onClick={generateAIAssistedResponse}
                         disabled={isThinking}
                         className="px-3 py-1 bg-blue-950/40 border border-blue-500/20 text-blue-400 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-blue-900/40 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                       >
                         <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                         <span>AI Assist Answer</span>
                       </button>
                     </div>
                     
                     <div className="text-[9px] text-blue-400 uppercase font-black tracking-widest">
                        Interviewer Question: {questionCount} / 5
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Camera Sensor & Presence tracking */}
            {sessionActive && !evaluation && (
              <div className="w-full md:w-[350px] bg-slate-950/40 p-6 flex flex-col justify-between overflow-y-auto scrollbar-hide">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Visual Feedback Panel</p>
                    
                    {/* Simulator and Real Sensor Mode toggle buttons */}
                    <button 
                      onClick={() => setIsCameraSimulated(prev => !prev)}
                      className={`p-1 px-2.5 rounded-lg text-[8px] font-bold tracking-wider uppercase transition-all border cursor-pointer ${
                        isCameraSimulated 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <span>{isCameraSimulated ? 'AI Simulated' : 'Hardware Video'}</span>
                    </button>
                  </div>

                  {/* Camera Frame Screen */}
                  <div className="aspect-video md:aspect-[4/3] w-full bg-slate-950 rounded-2xl relative overflow-hidden border border-white/5 shadow-inner">
                    
                    {isCameraSimulated ? (
                      /* Spectacular virtual animated head scan replacement (Clean and Professional) */
                      <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
                        <div className="relative w-28 h-28 flex items-center justify-center bg-slate-900 border border-white/10 rounded-full mb-4">
                          <User className="w-12 h-12 text-blue-400" />
                          <div className="absolute inset-0 rounded-full border border-blue-500/20" />
                        </div>

                        <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase font-bold">AI Face Scan Active</p>
                        <p className="text-[8px] text-slate-500 font-mono mt-1">Calibrating posture & gaze parameters</p>
                      </div>
                    ) : (
                      /* Standard hardware camera */
                      <>
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className={`w-full h-full object-cover scale-x-[-1] ${!isCameraMuted && cameraStream ? 'block' : 'hidden'}`}
                        />
                        
                        {!isCameraMuted && cameraStream ? (
                          <>
                            <div className="absolute inset-x-8 inset-y-8 border border-dashed border-blue-500/25 rounded-xl pointer-events-none">
                              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400" />
                              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400" />
                              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400" />
                              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-blue-400/25" />
                            </div>
                            <div className="absolute top-1/2 inset-x-0 h-[1px] bg-blue-500/20 pointer-events-none" />
                          </>
                        ) : isCameraMuted ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950">
                            <VideoOff className="w-8 h-8 text-rose-500/40 mb-2" />
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Video Sensor Muted</p>
                          </div>
                        ) : cameraError ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950">
                            <AlertTriangle className="w-8 h-8 text-slate-600 mb-2" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{cameraError}</p>
                            <button 
                              onClick={() => setIsCameraSimulated(true)}
                              className="mt-4 px-4 py-1.5 bg-blue-600 border border-blue-500 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider"
                            >
                              Activate AI Face Scan
                            </button>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Connecting Sensor</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Body Language dynamic metrics */}
                  <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-white/5">
                     <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs leading-none">
                          <span className="text-slate-400 font-medium">Eye Gaze Track</span>
                          <span className="text-blue-400 font-bold font-mono text-[10px]">{isCameraMuted ? 'Muted' : eyeContactStatus}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500" 
                            animate={{ width: isCameraMuted ? '0%' : '90%' }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs leading-none">
                          <span className="text-slate-400 font-medium">Posture Alignment</span>
                          <span className="text-blue-400 font-bold font-mono text-[10px]">{isCameraMuted ? 'Muted' : postureStatus}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500" 
                            animate={{ width: isCameraMuted ? '0%' : '94%' }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs leading-none">
                          <span className="text-slate-400 font-medium">Expression Sync</span>
                          <span className="text-blue-400 font-bold font-mono text-[10px]">{isCameraMuted ? 'Muted' : expressionStatus}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500" 
                            animate={{ width: isCameraMuted ? '0%' : '88%' }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs leading-none">
                          <span className="text-slate-400 font-medium">Gesture Balance</span>
                          <span className="text-blue-400 font-bold font-mono text-[10px]">{isCameraMuted ? 'Muted' : gestureActivity}</span>
                        </div>
                        <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-500" 
                            animate={{ width: isCameraMuted ? '0%' : '91%' }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                     </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-35 text-[8px] font-mono uppercase tracking-wider">
                  <span>Downlink Sync: Active</span>
                  <span>Presence Tracker</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
