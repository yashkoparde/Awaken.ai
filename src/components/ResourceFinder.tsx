import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Zap, ExternalLink, Library, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { groqChatCompletion } from '../lib/groq';
import { supabase, auth } from '../lib/supabase';

interface ResourceItem {
  title: string;
  type: string;
  source: string;
  url: string;
  relevance: string;
}

const CURATED_RESOURCE_CATALOG: Record<string, ResourceItem[]> = {
  frontend: [
    {
      title: "React Official Core Architecture Guide",
      type: "DOCUMENTATION",
      source: "React Documentation",
      url: "https://react.dev/learn",
      relevance: "Deep dive into component lifecycles, hooks synchronization, and reactive state management paradigms."
    },
    {
      title: "MDN Web Docs - Advanced JavaScript",
      type: "DOCUMENTATION",
      source: "Mozilla Developer Network",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      relevance: "Covers memory layout, event loops, promises, asynchronous execution, and modern ECMAScript standards."
    },
    {
      title: "TypeScript Deep Dive",
      type: "BOOK / GUIDE",
      source: "Basarat Ali Syed",
      url: "https://basarat.gitbook.io/typescript",
      relevance: "Comprehensive guide to structural typing, generics, AST, and enterprise-grade TypeScript engineering."
    },
    {
      title: "Web.dev Performance Optimization & Core Web Vitals",
      type: "ARTICLE",
      source: "Google Web Developers",
      url: "https://web.dev/explore/fast",
      relevance: "Master rendering performance, bundle splitting, hydration strategies, and lighthouse scoring."
    }
  ],
  backend: [
    {
      title: "System Design Primer",
      type: "DOCUMENTATION",
      source: "GitHub / Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      relevance: "Crucial guide for scaling web services, microservices design, caching layers, and high-availability architecture."
    },
    {
      title: "Designing Data-Intensive Applications",
      type: "BOOK / ARCHITECTURE",
      source: "Martin Kleppmann / O'Reilly",
      url: "https://dataintensive.net/",
      relevance: "Foundational theory on consistency models, replication, partitioning, distributed transactions, and stream processing."
    },
    {
      title: "Node.js Best Practices Architecture Guide",
      type: "DOCUMENTATION",
      source: "GitHub Node Best Practices",
      url: "https://github.com/goldbergyoni/nodebestpractices",
      relevance: "Production battle-tested patterns for error handling, security, code style, and Docker deployment."
    },
    {
      title: "PostgreSQL Official Administration & Performance Tuning",
      type: "DOCUMENTATION",
      source: "PostgreSQL Global Development",
      url: "https://www.postgresql.org/docs/current/",
      relevance: "Indexing strategies (B-Tree, GiST, GIN), EXPLAIN query analysis, connection pooling, and ACID durability."
    }
  ],
  ai: [
    {
      title: "Deep Learning Specialization Lecture Notes",
      type: "COURSE",
      source: "DeepLearning.AI / Andrew Ng",
      url: "https://www.deeplearning.ai/",
      relevance: "Foundational mastery in neural network backpropagation, convolutional layers, and sequence models."
    },
    {
      title: "Hugging Face Transformers Documentation & Tasks",
      type: "DOCUMENTATION",
      source: "Hugging Face",
      url: "https://huggingface.co/docs/transformers/index",
      relevance: "Hands-on guide for fine-tuning LLMs, attention mechanisms, tokenization, and pipeline deployments."
    },
    {
      title: "LangChain & LlamaIndex Official Documentation",
      type: "DOCUMENTATION",
      source: "LangChain AI",
      url: "https://python.langchain.com/docs/get_started/introduction",
      relevance: "RAG architectures, vector store embeddings, agentic orchestrations, and tool-calling primitives."
    },
    {
      title: "Stanford CS229: Machine Learning Course Material",
      type: "ACADEMIC",
      source: "Stanford University",
      url: "https://cs229.stanford.edu/",
      relevance: "Rigorous mathematical derivations for supervised/unsupervised learning, kernels, and reinforcement learning."
    }
  ],
  devops: [
    {
      title: "Kubernetes The Hard Way",
      type: "TUTORIAL",
      source: "Kelsey Hightower",
      url: "https://github.com/kelseyhightower/kubernetes-the-hard-way",
      relevance: "Step-by-step cluster bootstrap without automation scripts to understand control plane and etcd internals."
    },
    {
      title: "Docker Curriculum & Container Isolation Deep Dive",
      type: "GUIDE",
      source: "Docker Official Community",
      url: "https://docker-curriculum.com/",
      relevance: "Namespaces, cgroups, multi-stage image optimization, and container security best practices."
    },
    {
      title: "Terraform Infrastructure as Code Architecture",
      type: "DOCUMENTATION",
      source: "HashiCorp",
      url: "https://developer.hashicorp.com/terraform/docs",
      relevance: "Declarative cloud provisioning, state lock mechanisms, reusable modules, and multi-region deployment."
    }
  ],
  general: [
    {
      title: "Coding Interview University",
      type: "GUIDE",
      source: "GitHub / John Washam",
      url: "https://github.com/jwasham/coding-interview-university",
      relevance: "Complete computer science study path, data structures guide, and technical interview roadmap."
    },
    {
      title: "NeetCode DSA Roadmap & Patterns",
      type: "PLATFORM",
      source: "NeetCode",
      url: "https://neetcode.io/roadmap",
      relevance: "Structured algorithms and data structures questions categorized by algorithmic pattern and difficulty."
    },
    {
      title: "Tech Interview Handbook",
      type: "DOCUMENTATION",
      source: "Yangshun Tay",
      url: "https://www.techinterviewhandbook.org/",
      relevance: "Carefully curated algorithm cheat sheets, behavioral answer frameworks, and technical interview playbooks."
    },
    {
      title: "System Design Primer",
      type: "DOCUMENTATION",
      source: "GitHub / Donne Martin",
      url: "https://github.com/donnemartin/system-design-primer",
      relevance: "Crucial guide for scaling web services, microservices design, and technical interview architecture preparation."
    }
  ]
};

function getCuratedMatches(query: string): ResourceItem[] {
  const q = query.toLowerCase();
  if (q.includes('react') || q.includes('front') || q.includes('web') || q.includes('ui') || q.includes('css') || q.includes('html') || q.includes('next')) {
    return [...CURATED_RESOURCE_CATALOG.frontend, ...CURATED_RESOURCE_CATALOG.general.slice(0, 2)];
  }
  if (q.includes('ai') || q.includes('ml') || q.includes('machine') || q.includes('data') || q.includes('llm') || q.includes('deep learning')) {
    return [...CURATED_RESOURCE_CATALOG.ai, ...CURATED_RESOURCE_CATALOG.general.slice(0, 2)];
  }
  if (q.includes('cloud') || q.includes('devops') || q.includes('k8s') || q.includes('docker') || q.includes('infra') || q.includes('kubernetes')) {
    return [...CURATED_RESOURCE_CATALOG.devops, ...CURATED_RESOURCE_CATALOG.general.slice(0, 2)];
  }
  if (q.includes('backend') || q.includes('node') || q.includes('sql') || q.includes('api') || q.includes('system') || q.includes('spring') || q.includes('java') || q.includes('python')) {
    return [...CURATED_RESOURCE_CATALOG.backend, ...CURATED_RESOURCE_CATALOG.general.slice(0, 2)];
  }
  return [...CURATED_RESOURCE_CATALOG.general, ...CURATED_RESOURCE_CATALOG.backend.slice(0, 2)];
}

const QUICK_TOPIC_PILLS = [
  'Full Stack Software Engineer',
  'Frontend Architecture & React',
  'Backend & Distributed Systems',
  'AI / ML & LLM Engineering',
  'Cloud Infrastructure & DevOps',
  'Data Structures & Algorithms'
];

export default function ResourceFinder() {
  const [resources, setResources] = useState<ResourceItem[]>(getCuratedMatches('software engineer'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      let role = "";
      try {
        const saved = localStorage.getItem('awaken-onboarding-profile') || localStorage.getItem('yogyata-onboarding-profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          role = parsed.role || parsed.targetJob || "";
        }
      } catch (e) {
        console.error("Failed to parse local profile:", e);
      }

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
        setResources(getCuratedMatches(role));
      }
    };
    loadProfile();
  }, []);

  const syncResources = async (overrideQuery?: string) => {
    const activeQuery = (overrideQuery !== undefined ? overrideQuery : targetRole).trim();
    if (!activeQuery) return;

    setIsSyncing(true);
    setConfirmationMessage(null);

    try {
      const system = `You are a Principal Career Librarian & Technical Mentor. Suggest 5 to 6 verified, authoritative learning resources (Documentation, Academic, Guided Courses, or Reference Specifications) for: "${activeQuery}".
Return ONLY a valid JSON array of objects with keys:
- title: clear title of the resource
- type: "COURSE" | "DOCUMENTATION" | "ARTICLE" | "BOOK" | "PLATFORM"
- source: authoritative source (e.g. GitHub, Mozilla, MIT OCW, Stanford, Official Docs)
- url: direct authentic web link
- relevance: 2 concise sentences explaining specifically why this prepares an engineer for high-stakes interviews and industry jobs in this domain.`;

      const prompt = `Target Role / Topic: ${activeQuery}`;
      const raw = await groqChatCompletion(system, prompt, true);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setResources(parsed);
        setConfirmationMessage(`Discovered ${parsed.length} verified learning resources for "${activeQuery}" via Groq Engine`);
      } else {
        const fallback = getCuratedMatches(activeQuery);
        setResources(fallback);
        setConfirmationMessage(`Loaded ${fallback.length} curated resources for "${activeQuery}"`);
      }
    } catch (err) {
      console.warn("Groq resource search fallback to curated index:", err);
      const fallback = getCuratedMatches(activeQuery);
      setResources(fallback);
      setConfirmationMessage(`Loaded ${fallback.length} curated resources for "${activeQuery}"`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-20 font-sans">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400">
              <Compass className="w-4 h-4" />
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest">
                Module 15: AI Resource Hub & Technical Library
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Recommended Resources</h2>
            <p className="text-xs text-slate-400">
              Live neural resource discovery powered by Groq Llama-3 with curated computer science syllabi
            </p>
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              syncResources();
            }}
            className="flex gap-3 w-full md:w-auto"
          >
            <input 
              value={targetRole} 
              onChange={e => setTargetRole(e.target.value)}
              className="flex-1 md:w-72 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
              placeholder="Search topic or role (e.g. React, Docker, ML)..."
            />
            <button 
              type="submit"
              disabled={isSyncing || !targetRole.trim()}
              className="py-3 px-6 bg-blue-600 border border-blue-500 rounded-xl text-white font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl cursor-pointer shrink-0"
            >
              {isSyncing ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Discover</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Topic Filters */}
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_TOPIC_PILLS.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setTargetRole(topic);
                syncResources(topic);
              }}
              className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 border border-white/5 text-slate-400 hover:text-white hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Dynamic Confirmation Message */}
        <AnimatePresence>
          {confirmationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 text-xs text-blue-300 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{confirmationMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loading Radar Animation */}
      {isSyncing && (
        <div className="p-12 border border-blue-500/20 bg-blue-950/10 rounded-3xl flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute w-16 h-16 rounded-full border border-blue-500/30 animate-ping" />
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-white tracking-wide">Synthesizing Technical Library</p>
            <p className="text-xs text-slate-400 font-mono">Querying Groq neural index for curated syllabi and documentation</p>
          </div>
        </div>
      )}

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group p-7 bg-slate-900 border border-white/5 rounded-3xl hover:border-blue-500/40 transition-all shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-5">
               <div className="flex justify-between items-start">
                  <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                     <Library className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-full text-[8px] font-mono font-bold tracking-widest text-slate-400 group-hover:text-blue-300 transition-colors">
                     {res.type}
                  </span>
               </div>
               
               <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono font-semibold uppercase tracking-wider">
                    {res.source}
                  </p>
               </div>

               <p className="text-xs text-slate-300 leading-relaxed font-normal bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-mono font-bold text-blue-400 block mb-1">
                    Relevance Note
                  </span>
                  {res.relevance}
               </p>
            </div>

            <a 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 w-full py-3 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
               <span>Open Resource</span>
               <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        ))}
      </div>

      {!resources.length && !isSyncing && (
        <div className="h-[320px] flex flex-col items-center justify-center border border-white/5 bg-slate-900/50 rounded-3xl opacity-40 shadow-xl">
            <BookOpen className="w-12 h-12 mb-3 text-slate-500" />
            <p className="text-xs uppercase font-bold tracking-widest text-center text-slate-400 max-w-[260px]">
              Enter target role or technical domain to discover curated learning resources.
            </p>
        </div>
      )}
    </div>
  );
}
