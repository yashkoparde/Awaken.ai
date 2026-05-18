/**
 * Comprehensive Resume ATS Scoring and Parsing Engine
 * Calculates deterministic match scores, structural compliance, keyword density,
 * quantifiable impact metrics, and action verb density.
 */

export interface ATSSectionCheck {
  name: string;
  found: boolean;
  weight: number;
}

export interface SkillGapCategories {
  technicalSkills: string[];
  programming: string[];
  aptitude: string[];
  communication: string[];
  softSkills: string[];
  domainKnowledge: string[];
}

export interface ATSAnalysisResult {
  atsScore: number;
  keywordScore: number;
  structureScore: number;
  impactScore: number;
  verbScore: number;
  wordCount: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  categorizedGaps: SkillGapCategories;
  sections: ATSSectionCheck[];
  quantifiableMetricsFound: string[];
  actionVerbsCount: number;
  criticalReview: string[];
  optimizedBulletPoints: string[];
}

const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't", 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'looking', 'work', 'job', 'company', 'role', 'team', 'candidate', 'responsibilities', 'requirements', 'years'
]);

const ACTION_VERBS = [
  'accelerated', 'achieved', 'architected', 'automated', 'built', 'championed', 'collaborated',
  'configured', 'constructed', 'converted', 'coordinated', 'created', 'decreased', 'delivered',
  'deployed', 'designed', 'developed', 'devised', 'doubled', 'drove', 'engineered', 'enhanced',
  'established', 'executed', 'expanded', 'expedited', 'facilitated', 'formulated', 'generated',
  'guided', 'implemented', 'improved', 'increased', 'initiated', 'innovated', 'installed',
  'instituted', 'integrated', 'launched', 'lead', 'led', 'managed', 'maximized', 'mentored',
  'migrated', 'minimized', 'modernized', 'negotiated', 'optimized', 'orchestrated', 'overhauled',
  'pioneered', 'produced', 'programmed', 'reduced', 'refactored', 'resolved', 'restructured',
  'revamped', 'scaled', 'simplified', 'spearheaded', 'standardized', 'streamlined', 'strengthened',
  'surpassed', 'transformed', 'upgraded', 'validated'
];

const STANDARD_SECTIONS = [
  { name: 'Contact Information', regex: /(email|phone|linkedin|github|portfolio|contact)/i, weight: 10 },
  { name: 'Professional Summary / Objective', regex: /(summary|objective|about me|profile|overview)/i, weight: 10 },
  { name: 'Work Experience', regex: /(experience|employment|work history|career history)/i, weight: 20 },
  { name: 'Technical Skills', regex: /(skills|technical skills|technologies|proficiencies|competencies)/i, weight: 20 },
  { name: 'Education', regex: /(education|academic|degree|university|college|b\.?s|m\.?s|bachelor|master)/i, weight: 15 },
  { name: 'Projects', regex: /(projects|personal projects|key projects|portfolio)/i, weight: 10 },
  { name: 'Certifications & Training', regex: /(certifications|certificate|certified|training|licenses)/i, weight: 10 },
  { name: 'Internships & Practical Exposure', regex: /(internship|intern|apprentice|practical exposure|trainee)/i, weight: 5 }
];

export function extractKeywords(text: string): string[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9+#.\s]/g, ' ');
  const words = clean.split(/\s+/).filter(w => w.length > 1 && !COMMON_STOP_WORDS.has(w));
  
  const frequency: Record<string, number> = {};
  for (const w of words) {
    frequency[w] = (frequency[w] || 0) + 1;
  }

  const technicalTerms = [
    'react', 'vue', 'angular', 'nextjs', 'next.js', 'typescript', 'javascript', 'python',
    'java', 'c++', 'c#', 'golang', 'rust', 'php', 'laravel', 'sql', 'mysql', 'postgresql',
    'mongodb', 'redis', 'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'git',
    'rest api', 'graphql', 'node', 'express', 'spring', 'django', 'fastapi', 'tailwind',
    'linux', 'html', 'css', 'agile', 'scrum', 'tdd', 'microservices', 'unit testing'
  ];

  const lower = text.toLowerCase();
  for (const term of technicalTerms) {
    if (lower.includes(term)) {
      frequency[term] = (frequency[term] || 0) + 3;
    }
  }

  return Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);
}

export function calculateATSScore(resumeText: string, jobDescription: string): ATSAnalysisResult {
  const resumeLower = resumeText.toLowerCase();
  const jdKeywords = extractKeywords(jobDescription);
  
  const topJdKeywords = jdKeywords.slice(0, 30);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of topJdKeywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(resumeLower) || resumeLower.includes(kw)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordScore = topJdKeywords.length > 0 
    ? Math.round((matchedKeywords.length / topJdKeywords.length) * 100)
    : 75;

  const sections: ATSSectionCheck[] = STANDARD_SECTIONS.map(sec => ({
    name: sec.name,
    found: sec.regex.test(resumeText),
    weight: sec.weight
  }));

  const structureScore = sections.reduce((acc, curr) => curr.found ? acc + curr.weight : acc, 0);

  const impactRegex = /(\b\d+(?:\.\d+)?%\b|\$\d+(?:,\d{3})*(?:\.\d+)?(?:\s*[kmbt])?|\b\d+\s*(?:x|times|users|requests|ms|seconds|hours|clients|members)\b)/gi;
  const metricsFound = Array.from(new Set(resumeText.match(impactRegex) || []));
  const impactScore = Math.min(100, metricsFound.length * 20);

  let actionVerbsFoundCount = 0;
  for (const verb of ACTION_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(resumeLower)) {
      actionVerbsFoundCount++;
    }
  }
  const verbScore = Math.min(100, Math.round((actionVerbsFoundCount / 8) * 100));

  const words = resumeText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const rawScore = (keywordScore * 0.40) + (structureScore * 0.25) + (impactScore * 0.20) + (verbScore * 0.15);
  const atsScore = Math.max(15, Math.min(99, Math.round(rawScore)));

  const criticalReview: string[] = [];
  if (keywordScore < 70) {
    criticalReview.push(`Hard keyword alignment is ${keywordScore}%. Recommended target is >=75% for automated filter stages.`);
  }
  
  const missingSections = sections.filter(s => !s.found).map(s => s.name);
  if (missingSections.length > 0) {
    criticalReview.push(`Missing key ATS headers: ${missingSections.join(', ')}. Standard headers ensure correct applicant tracking parsing.`);
  }

  if (metricsFound.length < 3) {
    criticalReview.push(`Found only ${metricsFound.length} quantifiable metrics. Enhance bullet points with measured percentages (%), revenue, or performance gains.`);
  }

  if (verbScore < 60) {
    criticalReview.push(`Found ${actionVerbsFoundCount} strong action verbs. Use power action verbs (e.g. 'Architected', 'Spearheaded', 'Optimized') at the start of each bullet point.`);
  }

  if (wordCount < 250) {
    criticalReview.push(`Resume word count (${wordCount}) is below standard ATS target (400-800 words).`);
  } else if (wordCount > 1200) {
    criticalReview.push(`Resume word count (${wordCount}) is too lengthy. Recommended to keep under 1000 words.`);
  }

  if (criticalReview.length === 0) {
    criticalReview.push('Excellent keyword alignment, structural layout, and metric indicators.');
  }

  // Categorize missing keywords into the 6 standard placement gap buckets
  const programmingTerms = new Set(['python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'golang', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'sql']);
  const techTerms = new Set(['react', 'vue', 'angular', 'nextjs', 'next.js', 'node', 'express', 'spring', 'django', 'fastapi', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'git', 'redis', 'mongodb', 'postgresql', 'mysql', 'microservices', 'rest api', 'graphql', 'tailwind']);
  const aptitudeTerms = new Set(['quantitative', 'logical', 'analytical', 'reasoning', 'math', 'statistics', 'algorithms', 'data structures', 'problem solving', 'dsa', 'complexity', 'optimization']);
  const commTerms = new Set(['communication', 'presentation', 'writing', 'verbal', 'articulation', 'interpersonal', 'stakeholder', 'client facing']);
  const softTerms = new Set(['leadership', 'teamwork', 'collaboration', 'adaptability', 'mentorship', 'time management', 'ownership', 'critical thinking', 'empathy']);

  const categorizedGaps: SkillGapCategories = {
    technicalSkills: [],
    programming: [],
    aptitude: [],
    communication: [],
    softSkills: [],
    domainKnowledge: []
  };

  for (const kw of missingKeywords) {
    const lk = kw.toLowerCase();
    if (programmingTerms.has(lk)) {
      categorizedGaps.programming.push(kw);
    } else if (techTerms.has(lk)) {
      categorizedGaps.technicalSkills.push(kw);
    } else if (aptitudeTerms.has(lk)) {
      categorizedGaps.aptitude.push(kw);
    } else if (commTerms.has(lk)) {
      categorizedGaps.communication.push(kw);
    } else if (softTerms.has(lk)) {
      categorizedGaps.softSkills.push(kw);
    } else {
      categorizedGaps.domainKnowledge.push(kw);
    }
  }

  // Ensure default feedback in categories if empty
  if (categorizedGaps.technicalSkills.length === 0 && missingKeywords.length > 0) {
    categorizedGaps.technicalSkills = missingKeywords.slice(0, 2);
  }

  const sampleKeywords = missingKeywords.slice(0, 3);
  const optimizedBulletPoints: string[] = sampleKeywords.map(kw => 
    `Spearheaded development utilizing ${kw.toUpperCase()}, enhancing execution efficiency and cutting turnaround latency by 28%.`
  );

  return {
    atsScore,
    keywordScore,
    structureScore,
    impactScore,
    verbScore,
    wordCount,
    matchedKeywords,
    missingKeywords,
    categorizedGaps,
    sections,
    quantifiableMetricsFound: metricsFound,
    actionVerbsCount: actionVerbsFoundCount,
    criticalReview,
    optimizedBulletPoints
  };
}
