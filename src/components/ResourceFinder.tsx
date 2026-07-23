import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Link2, Search, Zap, ExternalLink, Library } from 'lucide-react';
import { groqChatCompletion } from '../lib/groq';
import { supabase, auth } from '../lib/supabase';



const DEFAULT_RESOURCES = [
  {
    title: "System Design Primer",
    type: "DOCUMENTATION",
    source: "GitHub / Donne Martin",
    url: "https://github.com/donnemartin/system-design-primer",
    relevance: "Crucial guide for scaling web services, microservices design, and technical interview architecture preparation."
  },
  {
    title: "MDN Web Docs - Advanced JavaScript",
    type: "DOCUMENTATION",
    source: "Mozilla Developer Network",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    relevance: "Comprehensive standard documentation covering memory management, asynchronous patterns, and modern ES6+ concepts."
  },
  {
    title: "Awesome Coding Interview University",
    type: "ARTICLE",
    source: "GitHub Community",
    url: "https://github.com/jwasham/coding-interview-university",
    relevance: "Complete computer science study path, data structures guide, and technical interview roadmap curated by industry professionals."
  }
];

export default function ResourceFinder() {
  const [resources, setResources] = useState<any[]>(DEFAULT_RESOURCES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      let role = "";
      // Try local storage first as quick cache
      try {
        const saved = localStorage.getItem('awaken-onboarding-profile') || localStorage.getItem('yogyata-onboarding-profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          role = parsed.role || "";
        }
      } catch (e) {
        console.error("Failed to parse local profile:", e);
      }

      // Try database next
      const sessionUser = auth.currentUser;
      if (sessionUser) {
        try {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionUser.uid)
            .maybeSingle();
          if (dbProfile?.role) {
            role = dbProfile.role;
          }
        } catch (e) {
          console.warn("Could not fetch profile in resource finder:", e);
        }
      }

      if (role) {
        setTargetRole(role);
      }
    };
    loadProfile();
  }, []);

  const syncResources = async () => {
    setIsSyncing(true);
    try {
      const system = `You are a Professional Career Librarian. Suggest 5 high-quality, professional learning resources (Documentation, Courses, or Articles) for the target role. Return a JSON array of objects with keys: title, type ("COURSE" | "DOCUMENTATION" | "ARTICLE"), source, url, relevance. Only include authentic, real domains like mdn, github, freecodecamp, ocw.mit.edu, etc.`;
      const prompt = `Target Role: ${targetRole || 'Software Engineer'}`;
      const raw = await groqChatCompletion(system, prompt, true);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setResources(parsed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }

  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Recommended Resources</h2>
          <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest">Curated Learning Paths</p>
        </div>
        
        <div className="flex gap-3">
          <input 
            value={targetRole} onChange={e => setTargetRole(e.target.value)}
            className="md:w-64 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-700 font-medium"
            placeholder="Enter target role (e.g. Software Engineer)..."
          />
          <button 
            onClick={syncResources}
            disabled={isSyncing || !targetRole}
            className="py-3 px-8 bg-blue-600 border border-blue-500 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl"
          >
            {isSyncing ? (
              <Zap className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search Resources
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-8 bg-slate-900 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-6">
               <div className="flex justify-between items-start">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                     <Library className="w-5 h-5" />
                  </div>
                  <span className="px-3 py-1 bg-white/[0.02] border border-white/10 rounded-full text-[8px] font-black tracking-widest text-slate-500 group-hover:text-blue-400 transition-colors">
                     {res.type}
                  </span>
               </div>
               
               <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{res.title}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{res.source}</p>
               </div>

               <p className="text-xs text-slate-400 leading-relaxed font-normal bg-slate-950/50 p-4 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-black text-blue-500 block mb-1">Relevance Note</span>
                  {res.relevance}
               </p>
            </div>

            <a 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 w-full py-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center gap-3 text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all text-xs font-bold uppercase tracking-widest"
            >
               Resource Link <ExternalLink className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>

      {!resources.length && !isSyncing && (
        <div className="h-[400px] flex flex-col items-center justify-center border border-white/5 bg-slate-900/50 rounded-[3rem] opacity-20 shadow-xl">
            <BookOpen className="w-16 h-16 mb-4" />
            <p className="text-sm uppercase font-black tracking-widest text-center max-w-[200px]">Enter target role and search to find curated resources.</p>
        </div>
      )}
    </div>
  );
}
