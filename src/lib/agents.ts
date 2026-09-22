import { 
  ShieldAlert, 
  Search, 
  Mic, 
  Terminal, 
  Code2, 
  BrainCircuit,
  BarChart3,
  SearchCode
} from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  designation: string;
  description: string;
  icon: any;
  tone: 'adversarial' | 'supportive' | 'analytical';
  status: 'idle' | 'processing' | 'done';
}

export const AGENTS: Record<string, Agent> = {
  orchestrator: {
    id: 'orchestrator',
    name: 'Orchestrator',
    designation: 'Orchestrator',
    description: 'Manages state synchronization across modules.',
    icon: BrainCircuit,
    tone: 'supportive',
    status: 'idle'
  },
  forensic_auditor: {
    id: 'forensic_auditor',
    name: 'Resume Auditor',
    designation: 'Resume Auditor',
    description: 'Deconstructs resumes to identify structural gaps.',
    icon: SearchCode,
    tone: 'analytical',
    status: 'idle'
  },
  resume_architect: {
    id: 'resume_architect',
    name: 'Resume Builder',
    designation: 'Resume Builder',
    description: 'Transforms professional inputs into professional resumes.',
    icon: Mic,
    tone: 'supportive',
    status: 'idle'
  },
  vault_adversary: {
    id: 'vault_adversary',
    name: 'Mock Interviewer',
    designation: 'Mock Interviewer',
    description: 'A simulator that tests your technical knowledge.',
    icon: ShieldAlert,
    tone: 'adversarial',
    status: 'idle'
  },
  comm_coach: {
    id: 'comm_coach',
    name: 'Speech Coach',
    designation: 'Speech Coach',
    description: 'Analyzes vocal clarity and professional resonance metrics.',
    icon: Terminal,
    tone: 'analytical',
    status: 'idle'
  },
  curriculum_designer: {
    id: 'curriculum_designer',
    name: 'Study Guide',
    designation: 'Study Guide',
    description: 'Generates targeted practice sets and adaptive learning resources.',
    icon: Code2,
    tone: 'supportive',
    status: 'idle'
  }
};

export const getAgentForModule = (moduleId: string): Agent => {
  switch (moduleId) {
    case 'profile-setup': return AGENTS.orchestrator;
    case 'voice-resume': return AGENTS.resume_architect;
    case 'resume-analyzer': return AGENTS.forensic_auditor;
    case 'jd-analyzer': return AGENTS.forensic_auditor;
    case 'job-match': return AGENTS.forensic_auditor;
    case 'skill-gap': return AGENTS.forensic_auditor;
    case 'prep-plan': return AGENTS.curriculum_designer;
    case 'interview-sim': return AGENTS.vault_adversary;
    case 'interview-eval': return AGENTS.vault_adversary;
    case 'coding-assessment': return AGENTS.curriculum_designer;
    case 'aptitude-prep': return AGENTS.curriculum_designer;
    case 'career-recommend': return AGENTS.curriculum_designer;
    case 'progress-dashboard': return AGENTS.orchestrator;
    case 'readiness-score': return AGENTS.orchestrator;
    case 'resource-hub': return AGENTS.curriculum_designer;
    default: return AGENTS.orchestrator;
  }
};
