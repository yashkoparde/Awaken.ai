import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, MessageSquare, Send, X } from 'lucide-react';
import { supabase, auth } from '../lib/supabase';
import { generateQuestionsViaGroq, groqChatCompletion } from '../lib/groq';


export default function QAGenerator() {
  const [role, setRole] = useState('');
  const [experience, setExperience] = useState('Entry');
  const [domain, setDomain] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<{
    question: string;
    type: "technical" | "behavioral";
    idealAnswer: string;
    criteria: string[];
  }[]>([]);
  
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [chatInputs, setChatInputs] = useState<Record<number, string>>({});
  const [chatHistories, setChatHistories] = useState<Record<number, { role: string, text: string }[]>>({});
  const [isChatThinking, setIsChatThinking] = useState(false);

  const generateQA = async () => {
    setIsGenerating(true);
    try {
      const data = await generateQuestionsViaGroq(role, experience, domain);
      setQuestions(data);

      if (auth.currentUser) {
        try {
          const sessionId = `qa_${Date.now()}`;
          await supabase.from('qa_sessions').insert({
            id: sessionId,
            user_id: auth.currentUser.uid,

            target_role: role,
            questions: data,
            created_at: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("Supabase qa_sessions save skipped (expected if tables are not yet created):", dbErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFollowUp = async (index: number) => {
    const query = chatInputs[index];
    if (!query) return;

    const history = chatHistories[index] || [];
    const newHistory = [...history, { role: 'user', text: query }];
    
    setChatHistories(prev => ({ ...prev, [index]: newHistory }));
    setChatInputs(prev => ({ ...prev, [index]: '' }));
    setIsChatThinking(true);

    try {
      const system = `You are an expert interview coach helping a candidate understand: "${questions[index].question}". The ideal answer benchmark was: "${questions[index].idealAnswer}". Provide concise, insightful, and practical advice.`;
      const response = await groqChatCompletion(system, query);
      
      setChatHistories(prev => ({
        ...prev,
        [index]: [...newHistory, { role: 'ai', text: response }]
      }));
    } catch (err) {

      console.error(err);
    } finally {
      setIsChatThinking(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20 font-sans">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-white">Interview Q&A Generator</h2>
        <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Global Question Bank Engine</p>
      </div>

      <div className="bg-slate-900 border border-white/5 p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-wider">Target Career Role</label>
            <input 
              value={role} onChange={e => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500/50 outline-none text-white placeholder:text-slate-700"
              placeholder="e.g. Full Stack Architect"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-wider">Expertise Domain</label>
            <input 
              value={domain} onChange={e => setDomain(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500/50 outline-none text-white placeholder:text-slate-700"
              placeholder="e.g. Distributed Systems / React"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-wider">Career Tier</label>
            <select 
              value={experience} onChange={e => setExperience(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm focus:border-blue-500/50 outline-none text-white"
            >
              <option>Entry Level</option>
              <option>Professional</option>
              <option>Senior</option>
              <option>Executive</option>
            </select>
          </div>
          <button 
            onClick={generateQA}
            disabled={isGenerating || !role}
            className="w-full py-4 bg-blue-600 border border-blue-500 rounded-xl text-white font-bold uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-lg profession-glow"
          >
            {isGenerating ? 'Synthesizing Data...' : 'Generate Questions'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-2xl" />
          <div className="relative h-full flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-2xl bg-slate-950/50">
             <Brain className="w-12 h-12 text-blue-500/40 mb-4" />
             <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Engine Status: {isGenerating ? 'PROCESSING' : 'READY'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group block bg-slate-900 border-l-4 border-l-blue-600 border border-white/5 p-8 rounded-r-2xl shadow-xl transition-all hover:bg-slate-800/50"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs ring-offset-slate-900">
                {i + 1}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-white tracking-tight">{q.question}</h4>
                  <span className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full text-[9px] uppercase font-black tracking-widest text-blue-400">{q.type}</span>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Recommended Professional Response</p>
                  <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-white/10 pl-5">{q.idealAnswer}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {q.criteria.map((c: string, j: number) => (
                      <span key={j} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-slate-950 border border-white/5 rounded-lg text-slate-500">
                        {c}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveChat(activeChat === i ? null : i)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-lg text-[9px] uppercase font-black tracking-widest text-blue-400 hover:bg-blue-600/20"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Mentor Clarification
                  </button>
                </div>

                <AnimatePresence>
                  {activeChat === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-6"
                    >
                       <div className="p-6 bg-slate-950/50 border border-white/5 rounded-xl space-y-4">
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-[9px] uppercase font-bold text-blue-500 tracking-widest">Follow-up Dialogue</p>
                             <button onClick={() => setActiveChat(null)}><X className="w-3 h-3 text-slate-500" /></button>
                          </div>
                          
                          <div className="space-y-4 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                             {(chatHistories[i] || []).map((msg, k) => (
                               <div key={k} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] px-4 py-2 rounded-xl text-[11px] font-medium leading-relaxed ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                                  }`}>
                                     {msg.text}
                                  </div>
                               </div>
                             ))}
                             {isChatThinking && <div className="text-[8px] text-blue-500 animate-pulse font-bold tracking-widest">ANALYZING QUERY...</div>}
                          </div>

                          <div className="flex gap-2">
                             <input 
                               value={chatInputs[i] || ''} 
                               onChange={e => setChatInputs(prev => ({ ...prev, [i]: e.target.value }))}
                               onKeyDown={e => e.key === 'Enter' && handleFollowUp(i)}
                               placeholder="Ask the mentor for details..."
                               className="flex-1 bg-slate-900 border border-white/5 rounded-lg px-4 py-2 text-[11px] text-white focus:border-blue-500/50 outline-none"
                             />
                             <button 
                               onClick={() => handleFollowUp(i)}
                               className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500"
                             >
                                <Send className="w-3 h-3" />
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

  );
}
