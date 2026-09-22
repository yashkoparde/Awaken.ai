import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, ShieldQuestion, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import { supabase, auth } from '../lib/supabase';
import { api } from '../lib/api';
import { generateWrittenTestViaGroq } from '../lib/groq';


export default function WrittenTest({ defaultCategory = 'mcq' }: { defaultCategory?: 'coding' | 'mcq' | 'sql' | 'debugging' | 'quant' | 'logical' | 'verbal' }) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<'coding' | 'mcq' | 'sql' | 'debugging' | 'quant' | 'logical' | 'verbal'>(defaultCategory);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const startTest = async () => {
    const activeTopic = topic || (category === 'quant' ? 'Quantitative Aptitude' : category === 'logical' ? 'Logical Reasoning' : category === 'verbal' ? 'Verbal Ability' : category === 'sql' ? 'SQL Databases' : 'Software Engineering');
    setIsGenerating(true);
    setAnswers({});
    setShowResults(false);
    try {
      const data = await generateWrittenTestViaGroq(activeTopic, category, difficulty);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitTest = async () => {
    setShowResults(true);
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });
    
    const finalScore = Math.round((score / questions.length) * 100);
    setEvaluation({ score: finalScore });

    // Sync to PHP Backend
    const activeTopic = topic || category.toUpperCase();
    await api.saveTestScore(`${activeTopic} (${difficulty.toUpperCase()})`, finalScore);

    if (auth.currentUser) {
      try {
        await supabase.from('tests').insert({
          id: `test_${Date.now()}`,
          user_id: auth.currentUser.uid,
          topic: `${activeTopic} (${difficulty.toUpperCase()})`,
          score: finalScore,
          created_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Supabase tests save skipped:", dbErr);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20 font-sans">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest">
              {['quant', 'logical', 'verbal'].includes(category) ? 'Module 9: Aptitude Preparation' : 'Module 8: Coding & Technical Assessment'}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {['quant', 'logical', 'verbal'].includes(category) ? 'Aptitude Preparation & Diagnostic Engine' : 'Coding & Technical Assessment'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {['quant', 'logical', 'verbal'].includes(category) 
              ? 'Generate quantitative aptitude, logical reasoning, and verbal ability questions with difficulty levels and performance tracking.'
              : 'Generate role-specific coding questions, algorithmic problems, SQL challenges, and debugging tasks.'}
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'mcq', label: 'Technical MCQs' },
            { id: 'coding', label: 'Coding Problems' },
            { id: 'sql', label: 'SQL Challenges' },
            { id: 'debugging', label: 'Debugging Tasks' },
            { id: 'quant', label: 'Quantitative Aptitude' },
            { id: 'logical', label: 'Logical Reasoning' },
            { id: 'verbal', label: 'Verbal Ability' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id as any);
                if (c.id === 'quant' && !topic) setTopic('Arithmetic & Probability');
                if (c.id === 'logical' && !topic) setTopic('Patterns & Syllogisms');
                if (c.id === 'verbal' && !topic) setTopic('Reading Comprehension & Grammar');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                category === c.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md' 
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Difficulty Selector and Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl">
            {(['easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  difficulty === d 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <input 
            value={topic} 
            onChange={e => setTopic(e.target.value)}
            className="flex-1 w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
            placeholder="Custom subtopic (e.g. Binary Trees, Joins, Probability) or leave empty for auto-picks"
          />
          
          <button 
            onClick={startTest}
            disabled={isGenerating}
            className="w-full sm:w-auto py-2.5 px-6 bg-blue-600 border border-blue-500 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isGenerating ? 'Synthesizing...' : 'Generate Assessment'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {questions.map((q, i) => (
              <div key={i} className={`p-8 bg-slate-900 border border-white/5 rounded-3xl transition-all ${showResults ? 'pointer-events-none' : ''}`}>
                 <div className="flex gap-4 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                       {i + 1}
                    </div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{q.question}</h4>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt: string, j: number) => {
                      const isSelected = answers[i] === opt;
                      const isCorrect = opt === q.correctAnswer;
                      const showCorrect = showResults && isCorrect;
                      const showWrong = showResults && isSelected && !isCorrect;

                      return (
                        <button
                          key={j}
                          onClick={() => setAnswers({...answers, [i]: opt})}
                          className={`p-4 rounded-xl border text-sm font-medium transition-all text-left flex justify-between items-center ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-500 text-white' 
                              : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10'
                          } ${showCorrect ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : ''} ${showWrong ? 'bg-rose-500/20 border-rose-500 text-rose-400' : ''}`}
                        >
                          {opt}
                          {showCorrect && <CheckCircle2 className="w-4 h-4" />}
                          {showWrong && <XCircle className="w-4 h-4" />}
                        </button>
                      );
                    })}
                 </div>

                 {showResults && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <p className="text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Deep Logic Explanation</p>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">{q.explanation}</p>
                   </motion.div>
                 )}
              </div>
            ))}

            {!showResults ? (
              <button 
                onClick={submitTest}
                disabled={Object.keys(answers).length < 5}
                className="w-full py-5 bg-blue-600 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl disabled:opacity-20"
              >
                Complete Submission
              </button>
            ) : (
              <div className="p-10 bg-slate-900 border border-white/5 rounded-[2rem] text-center space-y-4">
                 <div className="text-6xl font-black text-white tracking-tighter shimmer">{evaluation.score}%</div>
                 <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.4em]">Test Integrity Result</p>
                 <button 
                   onClick={() => setQuestions([])}
                   className="px-8 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-blue-400 font-bold uppercase text-[10px] tracking-widest hover:bg-white/[0.05] transition-all"
                 >
                   Return to Terminal
                 </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!questions.length && !isGenerating && (
        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/5 bg-slate-900/50 rounded-[3rem] opacity-30">
           <Terminal className="w-16 h-16 mb-4 text-slate-600" />
           <p className="text-sm uppercase font-black tracking-widest text-slate-500">Awaiting Simulation Initialization</p>
        </div>
      )}
    </div>
  );
}
