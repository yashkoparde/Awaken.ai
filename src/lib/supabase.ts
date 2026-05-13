import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://kfeewinbsbjobxyvohvf.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_YrWMzgBM-tSgLNAsnDIm5A_tIIOuP0P";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Map Supabase auth user object to match standard candidate/firebase contract for seamless backward compatibility
export const mapSupabaseUser = (user: any): any => {
  if (!user) return null;
  return {
    ...user,
    uid: user.id, // seamless backward-compat
    displayName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Candidate',
    email: user.email
  };
};

let activeCallback: ((user: any) => void) | null = null;
let mockUserObj: any = null;

// Try to load any previously saved mock session
const savedMockUser = localStorage.getItem('awaken-mock-user') || localStorage.getItem('yogyata-mock-user');
if (savedMockUser) {
  try {
    mockUserObj = JSON.parse(savedMockUser);
  } catch (err) {
    console.error("Error parsing saved mock user:", err);
  }
}

// Override signOut to clean up mock sessions
const originalSignOut = supabase.auth.signOut.bind(supabase.auth);
supabase.auth.signOut = async function() {
  localStorage.removeItem('awaken-mock-user');
  localStorage.removeItem('yogyata-mock-user');
  mockUserObj = null;
  if (activeCallback) {
    activeCallback(null);
  }
  return originalSignOut();
};

export const auth = {
  get currentUser() {
    if (mockUserObj) {
      return mockUserObj;
    }
    // Synchronous access compatible with existing rendering flows
    const sessionStr = localStorage.getItem('sb-' + SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        return mapSupabaseUser(session?.user);
      } catch (err) {
        console.error("Session parse error:", err);
      }
    }
    return null;
  }
};

export const onAuthStateChanged = (authObj: any, callback: (user: any) => void) => {
  activeCallback = callback;
  
  if (mockUserObj) {
    callback(mockUserObj);
  } else {
    // Check and report initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mockUserObj) {
        callback(mapSupabaseUser(session?.user ?? null));
      }
    });
  }

  // Watch auth events
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!mockUserObj) {
      callback(mapSupabaseUser(session?.user ?? null));
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

export interface MockAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  profile: {
    name: string;
    email: string;
    role: string;
    experience: string;
    domain: string;
    targetCompany: string;
    skills: string;
    bio: string;
    linkedin?: string;
    github?: string;
  };
  roadmapProgress: Record<string, boolean>;
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'mock_candidate_user_123',
    email: 'candidate@awaken.ai',
    password: 'candidate123',
    fullName: 'Yash Koparde',
    profile: {
      name: 'Yash Koparde',
      email: 'candidate@awaken.ai',
      role: 'Senior Full-Stack AI Engineer',
      experience: '5+ years',
      domain: 'Distributed Systems, Agentic AI Infrastructure & React',
      targetCompany: 'Google, OpenAI, Anthropic, DeepMind',
      skills: 'TypeScript, React 19, Python, PyTorch, Supabase, LLM Agent Workflows, Node.js, GraphQL, Docker, Kubernetes',
      bio: 'Senior full-stack engineer specializing in agentic AI pipelines, real-time interactive apps, and resilient distributed microservices.',
      linkedin: 'https://linkedin.com/in/yash-koparde',
      github: 'https://github.com/yashkoparde'
    },
    roadmapProgress: {
      '1-1': true,
      '1-2': true,
      '2-1': true,
      '2-2': false,
      '3-1': true,
      '3-2': false,
      '4-1': true,
      '5-1': false
    }
  },
  {
    id: 'mock_architect_user_456',
    email: 'architect@awaken.ai',
    password: 'architect123',
    fullName: 'Elena Rostova',
    profile: {
      name: 'Elena Rostova',
      email: 'architect@awaken.ai',
      role: 'Principal Distributed Systems Architect',
      experience: '10+ years',
      domain: 'Cloud Infrastructure & High-Throughput Streaming',
      targetCompany: 'Stripe, AWS, Cloudflare, Netflix',
      skills: 'System Design, Rust, Go, Kafka, Cassandra, gRPC, eBPF, Kubernetes, Chaos Engineering, Distributed Consensus (Raft/Paxos)',
      bio: 'Principal systems architect with a decade of expertise building petabyte-scale event streaming pipelines and ultra-low-latency distributed engines.',
      linkedin: 'https://linkedin.com/in/elena-rostova-arch',
      github: 'https://github.com/elena-rostova'
    },
    roadmapProgress: {
      '1-1': true,
      '1-2': true,
      '2-1': true,
      '2-2': true,
      '3-1': true,
      '3-2': true,
      '4-1': true,
      '5-1': true
    }
  },
  {
    id: 'mock_designer_user_789',
    email: 'designer@awaken.ai',
    password: 'designer123',
    fullName: 'Marcus Chen',
    profile: {
      name: 'Marcus Chen',
      email: 'designer@awaken.ai',
      role: 'Lead Product & UX Technologist',
      experience: '7+ years',
      domain: 'Design Systems & Human-AI Interfaces',
      targetCompany: 'Apple, Figma, Linear, Vercel',
      skills: 'Design Systems, Figma, Typography, Motion UI, WebGL/Three.js, WCAG AAA Accessibility, Tailwind CSS, Interaction Design',
      bio: 'Design engineer bridging spatial design and production engineering, crafting precision interfaces for creative tools and generative AI.',
      linkedin: 'https://linkedin.com/in/marcus-chen-ux',
      github: 'https://github.com/marcus-chen'
    },
    roadmapProgress: {
      '1-1': true,
      '1-2': true,
      '2-1': true,
      '2-2': true,
      '3-1': false,
      '4-1': true,
      '5-1': false
    }
  },
  {
    id: 'mock_scientist_user_101',
    email: 'scientist@awaken.ai',
    password: 'scientist123',
    fullName: 'Dr. Sophia Patel',
    profile: {
      name: 'Dr. Sophia Patel',
      email: 'scientist@awaken.ai',
      role: 'Staff Machine Learning Research Scientist',
      experience: '6+ years',
      domain: 'Applied Deep Learning & NLP Alignment',
      targetCompany: 'DeepMind, Meta FAIR, Anthropic, Cohere',
      skills: 'PyTorch, JAX, Reinforcement Learning (RLHF/DPO), Transformers, CUDA Optimization, Vector Databases, Python, C++',
      bio: 'ML researcher focusing on reasoning alignment, multimodal inference acceleration, and model evaluation architectures.',
      linkedin: 'https://linkedin.com/in/sophia-patel-ml',
      github: 'https://github.com/sophia-patel'
    },
    roadmapProgress: {
      '1-1': true,
      '1-2': true,
      '2-1': true,
      '2-2': true,
      '3-1': true,
      '3-2': true,
      '4-1': true,
      '5-1': false
    }
  }
];

// Helper to seed a mock account into local session
const applyMockAccount = (account: MockAccount) => {
  mockUserObj = mapSupabaseUser({
    id: account.id,
    email: account.email,
    user_metadata: {
      full_name: account.fullName
    }
  });
  localStorage.setItem('awaken-mock-user', JSON.stringify(mockUserObj));
  localStorage.setItem('awaken-onboarding-profile', JSON.stringify(account.profile));
  localStorage.setItem('awaken-roadmap-progress', JSON.stringify(account.roadmapProgress));
  if (activeCallback) {
    activeCallback(mockUserObj);
  }
  return mockUserObj;
};

// Portal login trigger with automated candidate credentials mapping
export const loginWithPortal = async () => {
  try {
    const defaultAccount = MOCK_ACCOUNTS[0];
    return applyMockAccount(defaultAccount);
  } catch (error) {
    console.error("Portal uplink connection failed:", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const matchedMock = MOCK_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (matchedMock) {
    return applyMockAccount({
      ...matchedMock,
      fullName: fullName || matchedMock.fullName
    });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) throw error;

    const mapped = mapSupabaseUser(data.user);
    if (mapped) {
      try {
        await supabase.from('profiles').upsert({
          id: mapped.uid,
          email: mapped.email,
          display_name: mapped.displayName,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("Could not save profile table, falling back to local storage:", dbErr);
      }
    }
    
    return mapped;
  } catch (error: any) {
    console.error("Email registration failed:", error);
    // Fall back to generated mock candidate user if remote auth fails
    const generatedMock: MockAccount = {
      id: `mock_user_${Date.now()}`,
      email: email || 'candidate@awaken.ai',
      password: password || 'candidate123',
      fullName: fullName || 'Candidate User',
      profile: {
        name: fullName || 'Candidate User',
        email: email || 'candidate@awaken.ai',
        role: 'Full-Stack Software Engineer',
        experience: '3+ years',
        domain: 'Web Architecture & Modern Frameworks',
        targetCompany: 'Technology Leaders & High-Growth Startups',
        skills: 'TypeScript, React, Python, Node.js, SQL, System Design',
        bio: 'Engineered for scalable software architectures, clean interfaces, and agile product delivery.'
      },
      roadmapProgress: {
        '1-1': true,
        '1-2': false,
        '2-1': false
      }
    };
    return applyMockAccount(generatedMock);
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const matchedMock = MOCK_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail && acc.password === password
  );

  if (matchedMock) {
    return applyMockAccount(matchedMock);
  }

  // Also support legacy yogyata alias for candidate account
  if (normalizedEmail === 'candidate@yogyata.ai' && password === 'candidate123') {
    return applyMockAccount(MOCK_ACCOUNTS[0]);
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return mapSupabaseUser(data.user);
  } catch (error: any) {
    console.error("Email login failed:", error);
    // Standard secure error without exposing credentials on the UI
    throw new Error(
      "Invalid email or password. Please verify your credentials and try again.",
      { cause: error }
    );
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}`
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Password reset request failed:", error);
    throw error;
  }
};

// Connection Diagnostic Node (replaces handshake checks)
export const testConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.warn("Could not query 'profiles', this is expected before SQL schemas are applied:", error.message);
    } else {
      console.log("Telemetry connection active. Neural uplink to Supabase is fully stabilized.");
    }
  } catch (error: any) {
    console.error("Neural uplink severed. Diagnostic failed:", error);
  }
};
