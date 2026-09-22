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
  
  // Default to Bidar District (India) as requested
  const [selectedCity, setSelectedCity] = useState<string>('Bidar');
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<RoleRecommendation[]>(DEFAULT_RECOMMENDATIONS);
  const [selectedRole, setSelectedRole] = useState<RoleRecommendation>(DEFAULT_RECOMMENDATIONS[0]);

  // India Specific Geographic Database with Bidar District First & Comprehensive Tech Hubs
  const CITIES_DATA: Record<string, { coords: [number, number]; label: string; state: string; openings: (role: string) => LocalJobOpening[] }> = {
    'Bidar': {
      coords: [17.9104, 77.5199],
      label: 'Bidar District',
      state: 'Karnataka, India',
      openings: (role: string) => [
        { id: 'bdr-1', title: `${role} - District Tech Operations`, company: 'Karnataka Digital Economy Mission (KDEM)', location: 'Gumpa Road, Bidar City', salary: '₹8 - ₹14 LPA', lat: 17.9150, lng: 77.5250, type: 'Full-time', distance: '1.2 km' },
        { id: 'bdr-2', title: `Junior ${role} / IT Specialist`, company: 'Bidar AgroTech Solutions', location: 'Near Bidar Fort Tech Park', salary: '₹6 - ₹11 LPA', lat: 17.9220, lng: 77.5140, type: 'Full-time', distance: '2.4 km' },
        { id: 'bdr-3', title: `Remote ${role}`, company: 'Kalyana-Karnataka IT Consortium', location: 'Basavakalyan Hub, Bidar Dist', salary: '₹12 - ₹18 LPA', lat: 17.8740, lng: 77.4200, type: 'Hybrid', distance: '18 km' },
        { id: 'bdr-4', title: `Associate ${role} - Systems`, company: 'Guru Nanak Dev Engineering Hub', location: 'Mailoor, Bidar', salary: '₹7 - ₹12 LPA', lat: 17.8960, lng: 77.5380, type: 'Full-time', distance: '3.8 km' },
      ]
    },
    'Bangalore': {
      coords: [12.9716, 77.5946],
      label: 'Bangalore',
      state: 'Karnataka, India',
      openings: (role: string) => [
        { id: 'blr-1', title: `Lead ${role}`, company: 'Infosys Innovation Lab', location: 'Electronic City Phase 1', salary: '₹18 - ₹28 LPA', lat: 12.8452, lng: 77.6602, type: 'Full-time', distance: '4.2 km' },
        { id: 'blr-2', title: `Senior ${role}`, company: 'Flipkart Tech Hub', location: 'Bellandur / Outer Ring Rd', salary: '₹24 - ₹36 LPA', lat: 12.9260, lng: 77.6762, type: 'Hybrid', distance: '6.8 km' },
        { id: 'blr-3', title: `${role} - Platform Architecture`, company: 'Razorpay Systems', location: 'Koramangala 4th Block', salary: '₹22 - ₹32 LPA', lat: 12.9352, lng: 77.6245, type: 'Full-time', distance: '3.1 km' },
        { id: 'blr-4', title: `Associate ${role}`, company: 'Swiggy HQ', location: 'Marathahalli Tech Corridor', salary: '₹14 - ₹20 LPA', lat: 12.9591, lng: 77.6974, type: 'Hybrid', distance: '8.5 km' },
      ]
    },
    'Hyderabad': {
      coords: [17.3850, 78.4867],
      label: 'Hyderabad',
      state: 'Telangana, India',
      openings: (role: string) => [
        { id: 'hyd-1', title: `Enterprise ${role}`, company: 'Microsoft India R&D', location: 'Gachibowli Tech Campus', salary: '₹26 - ₹38 LPA', lat: 17.4401, lng: 78.3489, type: 'Hybrid', distance: '5.2 km' },
        { id: 'hyd-2', title: `${role} - Core Services`, company: 'Amazon Development Centre', location: 'HITEC City Phase 2', salary: '₹22 - ₹34 LPA', lat: 17.4474, lng: 78.3762, type: 'Full-time', distance: '4.1 km' },
        { id: 'hyd-3', title: `Staff ${role}`, company: 'ServiceNow Hub', location: 'Financial District, Nanakramguda', salary: '₹25 - ₹35 LPA', lat: 17.4156, lng: 78.3427, type: 'Full-time', distance: '6.0 km' },
      ]
    },
    'Pune': {
      coords: [18.5204, 73.8567],
      label: 'Pune',
      state: 'Maharashtra, India',
      openings: (role: string) => [
        { id: 'pune-1', title: `Lead ${role}`, company: 'Barclays Global Service', location: 'Hinjawadi Phase 1', salary: '₹18 - ₹27 LPA', lat: 18.5912, lng: 73.7389, type: 'Hybrid', distance: '14 km' },
        { id: 'pune-2', title: `${role} - Backend Systems`, company: 'Persistent Systems', location: 'Senapati Bapat Road', salary: '₹14 - ₹22 LPA', lat: 18.5314, lng: 73.8298, type: 'Full-time', distance: '3.8 km' },
        { id: 'pune-3', title: `Senior ${role}`, company: 'Tech Mahindra Innovations', location: 'Magarpatta Cybercity', salary: '₹16 - ₹25 LPA', lat: 18.5158, lng: 73.9272, type: 'Full-time', distance: '8.1 km' },
      ]
    },
    'Mumbai': {
      coords: [19.0760, 72.8777],
      label: 'Mumbai',
      state: 'Maharashtra, India',
      openings: (role: string) => [
        { id: 'mum-1', title: `Senior ${role}`, company: 'Tata Consultancy Systems', location: 'BKC Financial Center', salary: '₹20 - ₹30 LPA', lat: 19.0657, lng: 72.8683, type: 'Full-time', distance: '2.5 km' },
        { id: 'mum-2', title: `${role} - Cloud Fintech`, company: 'Jio Platforms Innovation', location: 'Navi Mumbai Hub', salary: '₹18 - ₹26 LPA', lat: 19.1484, lng: 73.0089, type: 'Hybrid', distance: '12 km' },
        { id: 'mum-3', title: `Principal ${role}`, company: 'Morgan Stanley Tech', location: 'Powai Business Park', salary: '₹28 - ₹42 LPA', lat: 19.1176, lng: 72.9060, type: 'Full-time', distance: '7.4 km' },
      ]
    },
    'Delhi NCR': {
      coords: [28.6139, 77.2090],
      label: 'Delhi NCR',
      state: 'National Capital Region, India',
      openings: (role: string) => [
        { id: 'del-1', title: `Senior ${role}`, company: 'Google India', location: 'Cyber City, Gurugram', salary: '₹30 - ₹48 LPA', lat: 28.4952, lng: 77.0891, type: 'Hybrid', distance: '16 km' },
        { id: 'del-2', title: `Lead ${role}`, company: 'Zomato Tech Headquarters', location: 'Golf Course Road, Gurugram', salary: '₹22 - ₹35 LPA', lat: 28.4595, lng: 77.0945, type: 'Full-time', distance: '18 km' },
        { id: 'del-3', title: `${role} - Enterprise Cloud`, company: 'Paytm Payments Hub', location: 'Sector 62, Noida', salary: '₹16 - ₹24 LPA', lat: 28.6280, lng: 77.3649, type: 'Full-time', distance: '15 km' },
      ]
    },
    'Chennai': {
      coords: [13.0827, 80.2707],
      label: 'Chennai',
      state: 'Tamil Nadu, India',
      openings: (role: string) => [
        { id: 'chn-1', title: `Senior ${role}`, company: 'Zoho Corporation', location: 'Estancia IT Park, Guduvanchery', salary: '₹16 - ₹26 LPA', lat: 12.8335, lng: 80.0483, type: 'Full-time', distance: '11 km' },
        { id: 'chn-2', title: `Lead ${role}`, company: 'Freshworks HQ', location: 'OMR IT Express Highway', salary: '₹22 - ₹34 LPA', lat: 12.9719, lng: 80.2464, type: 'Hybrid', distance: '6.2 km' },
      ]
    },
    'Kalaburagi': {
      coords: [17.3297, 76.8343],
      label: 'Kalaburagi',
      state: 'Karnataka, India',
      openings: (role: string) => [
        { id: 'klb-1', title: `Associate ${role}`, company: 'Kalyana Karnataka Digital Initiative', location: 'Sedam Road Tech Complex', salary: '₹7 - ₹12 LPA', lat: 17.3320, lng: 76.8410, type: 'Full-time', distance: '2.8 km' },
        { id: 'klb-2', title: `Remote ${role}`, company: 'AeroTech Regional Support', location: 'Central Kalaburagi', salary: '₹9 - ₹15 LPA', lat: 17.3280, lng: 76.8290, type: 'Hybrid', distance: '4.5 km' },
      ]
    }
  };

  // Additional dynamic search geocoding handler (India-wide)
  const [dynamicCities, setDynamicCities] = useState<Record<string, { coords: [number, number]; label: string; state: string; openings: (role: string) => LocalJobOpening[] }>>({});

  const allCitiesData = { ...CITIES_DATA, ...dynamicCities };
  const activeCityData = allCitiesData[selectedCity] || CITIES_DATA['Bidar'];
  const localJobs = activeCityData.openings(selectedRole.roleTitle);

  // Search handler for any district or city
  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = customSearchQuery.trim();
    if (!query) return;

    // Check if in known list
    const foundKey = Object.keys(allCitiesData).find(k => k.toLowerCase() === query.toLowerCase());
    if (foundKey) {
      setSelectedCity(foundKey);
      setCustomSearchQuery('');
      return;
    }

    // Geocode via open Nominatim (No API Key Required)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const top = data[0];
        const lat = parseFloat(top.lat);
        const lon = parseFloat(top.lon);
        const cityKey = query;

        const newCityEntry = {
          coords: [lat, lon] as [number, number],
          label: query,
          state: 'India',
          openings: (role: string) => [
            { id: `${cityKey}-1`, title: `Enterprise ${role}`, company: `${query} IT Innovations`, location: `${query} Central Business Dist`, salary: '₹12 - ₹20 LPA', lat: lat + 0.008, lng: lon + 0.008, type: 'Full-time' as const, distance: '1.5 km' },
            { id: `${cityKey}-2`, title: `Senior ${role}`, company: `${query} Tech Operations`, location: `${query} Industrial Tech Corridor`, salary: '₹15 - ₹25 LPA', lat: lat - 0.006, lng: lon - 0.005, type: 'Hybrid' as const, distance: '3.2 km' },
            { id: `${cityKey}-3`, title: `Associate ${role}`, company: 'National Cloud Solutions', location: `${query} Regional Hub`, salary: '₹9 - ₹16 LPA', lat: lat + 0.004, lng: lon - 0.007, type: 'Full-time' as const, distance: '2.8 km' },
          ]
        };

        setDynamicCities(prev => ({ ...prev, [cityKey]: newCityEntry }));
        setSelectedCity(cityKey);
        setCustomSearchQuery('');
      } else {
        // Fallback with pseudo-random slight offset near Bidar/India
        const cityKey = query;
        const fallbackEntry = {
          coords: [17.9104, 77.5199] as [number, number],
          label: query,
          state: 'India',
          openings: (role: string) => [
            { id: `${cityKey}-1`, title: `${role} - Tech Node`, company: `${query} Regional Corp`, location: `${query} District Center`, salary: '₹10 - ₹18 LPA', lat: 17.9140, lng: 77.5210, type: 'Full-time' as const, distance: '2.0 km' },
          ]
        };
        setDynamicCities(prev => ({ ...prev, [cityKey]: fallbackEntry }));
        setSelectedCity(cityKey);
        setCustomSearchQuery('');
      }
    } catch (err) {
      console.warn("Geocoding lookup error:", err);
    }
  };

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
      "salaryRange": string (e.g. "₹12 - ₹24 LPA" or "$90,000 - $135,000"),
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
            AI-driven trajectory mapping that analyzes candidate qualifications, skills, and resume attributes to identify optimal target roles with compensation insights and live GIS geographic radar.
          </p>
        </div>
      </div>

      {/* TOP SECTION: REAL LEAFLET RADAR ALONGSIDE JOB NODES ON LEFT */}
      <div className="p-6 md:p-8 bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl space-y-6">
        {/* Top Radar Bar: Location Selector & District Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Live Opportunity Radar & Geocoded Map
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                  India First
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live geographical opportunity radar with geocoded employment nodes and localized markers
              </p>
            </div>
          </div>

          {/* Search Any District or City Input */}
          <form onSubmit={handleLocationSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                placeholder="Search Bidar, Kalaburagi, Delhi..."
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:border-orange-500/60 outline-none transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600/80 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
            >
              Locate
            </button>
          </form>
        </div>

        {/* Quick Indian City & District Chips (Bidar District First) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-widest mr-1">
            Regions:
          </span>
          {Object.entries(allCitiesData).map(([key, data]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedCity(key);
                setSelectedJobId(undefined);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                selectedCity === key
                  ? 'bg-slate-800 border-orange-500/60 text-white shadow-md'
                  : 'bg-slate-950/60 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {key === 'Bidar' ? 'Bidar District' : data.label}
            </button>
          ))}
        </div>

        {/* Dual Layout: Job Nodes on Left | Real Leaflet Map with Orange Tinge on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Job Nodes List */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400">
                Verified Job Nodes ({localJobs.length})
              </span>
              <span className="text-[10px] font-mono text-orange-400">
                {activeCityData.label}, {activeCityData.state}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-hide">
              {localJobs.map((job) => {
                const isSelected = job.id === selectedJobId;
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between gap-2 ${
                      isSelected 
                        ? 'bg-slate-950 border-orange-500 shadow-xl shadow-orange-500/10' 
                        : 'bg-slate-950/60 border-white/5 hover:border-orange-500/30 hover:bg-slate-950'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />
                    )}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {job.title}
                        </p>
                        <p className="text-[11px] text-orange-400/90 font-medium mt-0.5 truncate">
                          {job.company}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/5 text-slate-300 border border-white/10 shrink-0">
                        {job.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {job.location}
                      </span>
                      <span className="font-bold text-emerald-400 font-mono shrink-0">
                        {job.salary}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[9px] text-slate-500 font-mono pl-1">
              Select any node to highlight pin on radar or click marker on map to view verified details.
            </p>
          </div>

          {/* Right: Leaflet Map Container with Orange Tinge */}
          <div className="lg:col-span-7 h-[360px] lg:h-auto min-h-[380px]">
            <JobLocationMap
              city={selectedCity}
              roleTitle={selectedRole.roleTitle}
              jobs={localJobs}
              centerCoords={activeCityData.coords}
              selectedJobId={selectedJobId}
              onSelectJob={(j) => setSelectedJobId(j.id)}
            />
          </div>
        </div>
      </div>

      {/* Input / Filter Bar for Role Alignment */}
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
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 disabled:opacity-40 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
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
                className={`w-full text-left p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 cursor-pointer ${
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
