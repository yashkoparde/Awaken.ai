import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  Compass, 
  DollarSign, 
  BarChart, 
  ArrowUpRight, 
  FileText,
  Building,
  Target,
  Search,
  MapPin
} from 'lucide-react';
import { groqChatCompletion } from '../lib/groq';
import JobLocationMap, { LocalJobOpening } from './JobLocationMap';

interface RoleRecommendation {
  roleTitle: string;
  matchScore: number;
  marketDemand: 'Very High' | 'High' | 'Moderate';
  salaryRange: string;
  summary: string;
  keyMatchingStrengths: string[];
  recommendedCertificationsOrSkills: string[];
  sampleJobTitles: string[];
}

const DEFAULT_RECOMMENDATIONS: RoleRecommendation[] = [
  {
    roleTitle: "Full-Stack Software Engineer",
    matchScore: 94,
    marketDemand: "Very High",
    salaryRange: "$95,000 - $145,000",
    summary: "High synergy with modern web ecosystems, TypeScript/JavaScript frameworks, database design, and end-to-end API lifecycle execution.",
    keyMatchingStrengths: ["React / TypeScript Frontends", "Node.js Microservices", "SQL Database Schema Design", "REST API Development"],
    recommendedCertificationsOrSkills: ["AWS Certified Developer", "Docker / Kubernetes Containerization", "GraphQL APIs"],
    sampleJobTitles: ["Full Stack Developer", "Software Engineer II", "Frontend/Fullstack Specialist"]
  },
  {
    roleTitle: "Backend Systems Engineer",
    matchScore: 88,
    marketDemand: "Very High",
    salaryRange: "$105,000 - $160,000",
    summary: "Strong potential in high-concurrency architectures, server-side data models, query optimization, and resilient API contracts.",
    keyMatchingStrengths: ["Relational Database Optimization", "Server-Side Logic", "Git Workflows", "Modular Architecture"],
    recommendedCertificationsOrSkills: ["Redis Caching Strategies", "System Design & P99 Latency Tuning", "Kafka / Event Streaming"],
    sampleJobTitles: ["Backend Developer", "Distributed Systems Engineer", "API Platform Engineer"]
  },
  {
    roleTitle: "Data Analyst & Business Intelligence Engineer",
    matchScore: 82,
    marketDemand: "High",
    salaryRange: "$80,000 - $125,000",
    summary: "Exceptional quantitative reasoning and database query aptitude. Translates raw metrics into actionable organizational intelligence.",
    keyMatchingStrengths: ["SQL Data Aggregation", "Analytical Problem Solving", "Pattern Recognition", "Telemetry Metrics"],
    recommendedCertificationsOrSkills: ["Python for Data Science (Pandas)", "PowerBI / Tableau Dashboarding", "Statistical Hypothesis Testing"],
    sampleJobTitles: ["Junior Data Analyst", "BI Developer", "Product Analytics Specialist"]
  },
  {
    roleTitle: "QA Automation & Test Systems Engineer",
    matchScore: 85,
    marketDemand: "High",
    salaryRange: "$85,000 - $130,000",
    summary: "Systematic edge-case mindset with keen eye for test harnesses, integration assertions, and automated CI/CD safety rails.",
    keyMatchingStrengths: ["Code Review Acumen", "Unit & Integration Testing", "Attention to Regression Bugs", "Process Compliance"],
    recommendedCertificationsOrSkills: ["Cypress / Playwright E2E", "Selenium Automation", "Performance & Load Testing with k6"],
    sampleJobTitles: ["Software Development Engineer in Test (SDET)", "QA Automation Engineer", "Test Architect"]
  }
];

export default function CareerRecommendations() {
  const [profile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('awaken-onboarding-profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [skillsInput, setSkillsInput] = useState(
    profile?.role ? `${profile.role}, ${profile.domain}, ${profile.experience}, React, TypeScript, Python, SQL` : "TypeScript, React, Node.js, SQL, Problem Solving, Data Structures"
  );
  const [selectedCity, setSelectedCity] = useState<string>('Bangalore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<RoleRecommendation[]>(DEFAULT_RECOMMENDATIONS);
  const [selectedRole, setSelectedRole] = useState<RoleRecommendation>(DEFAULT_RECOMMENDATIONS[0]);

  const CITIES_DATA: Record<string, { coords: [number, number]; openings: (role: string) => LocalJobOpening[] }> = {
    'Bangalore': {
      coords: [12.9716, 77.5946],
      openings: (role: string) => [
        { id: 'blr-1', title: `Lead ${role}`, company: 'Infosys Innovation Lab', location: 'Electronic City Phase 1', salary: '₹18 - ₹28 LPA', lat: 12.8452, lng: 77.6602, type: 'Full-time', distance: '4.2 km' },
        { id: 'blr-2', title: `Senior ${role}`, company: 'Flipkart Tech Hub', location: 'Bellandur / Outer Ring Rd', salary: '₹24 - ₹36 LPA', lat: 12.9260, lng: 77.6762, type: 'Hybrid', distance: '6.8 km' },
        { id: 'blr-3', title: `${role} - Platform Architecture`, company: 'Razorpay Systems', location: 'Koramangala 4th Block', salary: '₹22 - ₹32 LPA', lat: 12.9352, lng: 77.6245, type: 'Full-time', distance: '3.1 km' },
        { id: 'blr-4', title: `Associate ${role}`, company: 'Swiggy HQ', location: 'Marathahalli Tech Corridor', salary: '₹14 - ₹20 LPA', lat: 12.9591, lng: 77.6974, type: 'Hybrid', distance: '8.5 km' },
      ]
    },
    'Mumbai': {
      coords: [19.0760, 72.8777],
      openings: (role: string) => [
        { id: 'mum-1', title: `Senior ${role}`, company: 'Tata Consultancy Systems', location: 'BKC Financial Center', salary: '₹20 - ₹30 LPA', lat: 19.0657, lng: 72.8683, type: 'Full-time', distance: '2.5 km' },
        { id: 'mum-2', title: `${role} - Cloud Fintech`, company: 'Jio Platforms Innovation', location: 'Navi Mumbai Hub', salary: '₹18 - ₹26 LPA', lat: 19.1484, lng: 73.0089, type: 'Hybrid', distance: '12 km' },
        { id: 'mum-3', title: `Principal ${role}`, company: 'Morgan Stanley Tech', location: 'Powai Business Park', salary: '₹28 - ₹42 LPA', lat: 19.1176, lng: 72.9060, type: 'Full-time', distance: '7.4 km' },
      ]
    },
    'Hyderabad': {
      coords: [17.3850, 78.4867],
      openings: (role: string) => [
        { id: 'hyd-1', title: `Enterprise ${role}`, company: 'Microsoft India R&D', location: 'Gachibowli Tech Campus', salary: '₹26 - ₹38 LPA', lat: 17.4401, lng: 78.3489, type: 'Hybrid', distance: '5.2 km' },
        { id: 'hyd-2', title: `${role} - Core Services`, company: 'Amazon Development Centre', location: 'HITEC City Phase 2', salary: '₹22 - ₹34 LPA', lat: 17.4474, lng: 78.3762, type: 'Full-time', distance: '4.1 km' },
        { id: 'hyd-3', title: `Staff ${role}`, company: 'ServiceNow Hub', location: 'Financial District, Nanakramguda', salary: '₹25 - ₹35 LPA', lat: 17.4156, lng: 78.3427, type: 'Full-time', distance: '6.0 km' },
      ]
    },
    'Pune': {
      coords: [18.5204, 73.8567],
      openings: (role: string) => [
        { id: 'pune-1', title: `Lead ${role}`, company: 'Barclays Global Service', location: 'Hinjawadi Phase 1', salary: '₹18 - ₹27 LPA', lat: 18.5912, lng: 73.7389, type: 'Hybrid', distance: '14 km' },
        { id: 'pune-2', title: `${role} - Backend Systems`, company: 'Persistent Systems', location: 'Senapati Bapat Road', salary: '₹14 - ₹22 LPA', lat: 18.5314, lng: 73.8298, type: 'Full-time', distance: '3.8 km' },
        { id: 'pune-3', title: `Senior ${role}`, company: 'Tech Mahindra Innovations', location: 'Magarpatta Cybercity', salary: '₹16 - ₹25 LPA', lat: 18.5158, lng: 73.9272, type: 'Full-time', distance: '8.1 km' },
      ]
    },
    'Delhi NCR': {
      coords: [28.6139, 77.2090],
      openings: (role: string) => [
        { id: 'del-1', title: `Senior ${role}`, company: 'Google India', location: 'Cyber City, Gurugram', salary: '₹30 - ₹48 LPA', lat: 28.4952, lng: 77.0891, type: 'Hybrid', distance: '16 km' },
        { id: 'del-2', title: `Lead ${role}`, company: 'Zomato Tech Headquarters', location: 'Golf Course Road, Gurugram', salary: '₹22 - ₹35 LPA', lat: 28.4595, lng: 77.0945, type: 'Full-time', distance: '18 km' },
        { id: 'del-3', title: `${role} - Enterprise Cloud`, company: 'Paytm Payments Hub', location: 'Sector 62, Noida', salary: '₹16 - ₹24 LPA', lat: 28.6280, lng: 77.3649, type: 'Full-time', distance: '15 km' },
      ]
    }
  };

  const activeCityData = CITIES_DATA[selectedCity] || CITIES_DATA['Bangalore'];
  const localJobs = activeCityData.openings(selectedRole.roleTitle);

  const generateRecommendations = async () => {
    if (!skillsInput.trim()) return;
    setIsGenerating(true);

    try {
      const systemPrompt = `You are a Career Architect and Placement Director. 
Based on the candidate's skills, qualifications, and profile, recommend 4 distinct, optimal job roles (e.g. Software Developer, Data Analyst, QA Automation Engineer, Cloud/DevOps Engineer, Network Engineer, etc.).
Output ONLY valid JSON containing an array under the key "roles":
{
  "roles": [
    {
      "roleTitle": string,
      "matchScore": number (70 to 98),
      "marketDemand": "Very High" | "High" | "Moderate",
      "salaryRange": string (e.g. "$90,000 - $135,000"),
      "summary": string,
      "keyMatchingStrengths": string[],
      "recommendedCertificationsOrSkills": string[],
      "sampleJobTitles": string[]
    }
  ]
}`;

      const userPrompt = `Candidate Profile: Role=${profile?.role || 'Software Engineer'}, Experience=${profile?.experience || 'Entry Level'}, Domain=${profile?.domain || 'Technology'}.
Candidate Skills & Highlights:
${skillsInput}`;

      const rawJson = await groqChatCompletion(systemPrompt, userPrompt, true);
      const parsed = JSON.parse(rawJson);
      if (parsed.roles && parsed.roles.length > 0) {
        setRecommendations(parsed.roles);
        setSelectedRole(parsed.roles[0]);
      }
    } catch (e) {
      console.warn("Groq recommendation generation fallback:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Compass className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] uppercase font-mono tracking-widest font-black">Module 10</span>
            <span className="text-white/20">•</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold">Career & Role Recommendation Engine</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Target Career & Role Alignment</h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            AI-driven trajectory mapping that analyzes candidate qualifications, skills, and resume attributes to identify optimal target roles (Software Developer, Data Analyst, QA Engineer, Solutions Architect) with compensation insights.
          </p>
        </div>
      </div>

      {/* Input / Filter Bar */}
      <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl space-y-4 shadow-xl">
        <label className="text-xs uppercase font-black tracking-widest text-blue-400 flex items-center gap-2">
          <Target className="w-3.5 h-3.5" />
          Candidate Skills, Technologies & Background Input
        </label>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. TypeScript, React, Python, Data Analysis, SQL, Git..."
            className="flex-1 bg-slate-950/60 border border-white/10 rounded-2xl px-5 py-3 text-xs text-white focus:border-blue-500 outline-none transition-all placeholder:text-slate-600 font-medium"
          />
          <button
            onClick={generateRecommendations}
            disabled={isGenerating || !skillsInput.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-40 flex items-center justify-center gap-2 shrink-0"
          >
            {isGenerating ? (
              <span className="animate-pulse">Synthesizing Roles...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Suitable Roles
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Interface: Role List on Left, Deep Dive on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Role Cards */}
        <div className="lg:col-span-5 space-y-3.5">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">
            Recommended Roles ({recommendations.length})
          </p>
          {recommendations.map((role, idx) => {
            const isSelected = selectedRole.roleTitle === role.roleTitle;
            return (
              <button
                key={idx}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isSelected 
                    ? 'bg-slate-900 border-blue-500 shadow-xl shadow-blue-600/10' 
                    : 'bg-slate-900/50 border-white/5 hover:border-white/15 hover:bg-slate-900'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                )}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className={`text-base font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {role.roleTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{role.salaryRange}</p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xl font-black text-blue-400">{role.matchScore}%</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Match</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                  <span className={`font-black uppercase tracking-wider ${
                    role.marketDemand === 'Very High' ? 'text-emerald-400' : 'text-blue-400'
                  }`}>
                    {role.marketDemand} Demand
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 group-hover:text-slate-300">
                    View Blueprint <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Selected Role Deep Dive */}
        <div className="lg:col-span-7">
          <motion.div
            key={selectedRole.roleTitle}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl space-y-8 sticky top-28"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] text-blue-400 uppercase font-mono font-bold tracking-widest">
                  Candidate Fit Profile
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">{selectedRole.roleTitle}</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl pt-1">
                  {selectedRole.summary}
                </p>
              </div>
              <div className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl text-center shrink-0">
                <span className="text-3xl font-black text-emerald-400">{selectedRole.matchScore}%</span>
                <span className="text-[9px] block uppercase text-slate-500 font-bold tracking-widest mt-0.5">Synergy</span>
              </div>
            </div>

            {/* Compensation & Market Health */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Market Compensation</p>
                <p className="text-base font-bold text-white mt-1">{selectedRole.salaryRange}</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Competitive Baseline
                </p>
              </div>
              <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Market Demand</p>
                <p className="text-base font-bold text-blue-400 mt-1">{selectedRole.marketDemand}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Active hiring surges across tech hubs</p>
              </div>
            </div>

            {/* Key Strengths */}
            <div className="space-y-3">
              <p className="text-xs text-slate-300 uppercase font-black tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Validated Candidate Strengths for this Role
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedRole.keyMatchingStrengths.map((st, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-wider">
                    {st}
                  </span>
                ))}
              </div>
            </div>

            {/* High-Impact Certifications & Skills to acquire */}
            <div className="space-y-3">
              <p className="text-xs text-slate-300 uppercase font-black tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Recommended Upskill Vectors & Certifications
              </p>
              <div className="space-y-2">
                {selectedRole.recommendedCertificationsOrSkills.map((cert, i) => (
                  <div key={i} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center gap-3 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Leaflet City Map Radar */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs uppercase font-black tracking-wider text-white">
                    Live Job Radar & City Map
                  </span>
                </div>
                
                {/* City Picker */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
                  {['Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi NCR'].map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        selectedCity === city
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map View Container */}
              <JobLocationMap
                city={selectedCity}
                roleTitle={selectedRole.roleTitle}
                jobs={localJobs}
                centerCoords={activeCityData.coords}
              />
            </div>

            {/* Sample Positions to Apply */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                Target Search Query Titles:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedRole.sampleJobTitles.map((title, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white/[0.03] border border-white/10 rounded-lg text-[10px] text-slate-300 font-mono">
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
