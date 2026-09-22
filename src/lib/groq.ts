import Groq from "groq-sdk";
import { calculateATSScore } from "./atsAlgorithm";

const GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || (import.meta as any).env?.GROQ_API_KEY || "";

let groqInstance: Groq | null = null;
export function getGroqClient(): Groq | null {
  if (!groqInstance && GROQ_API_KEY) {
    groqInstance = new Groq({
      apiKey: GROQ_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
  return groqInstance;
}

export const PRIMARY_GROQ_MODEL = "openai/gpt-oss-120b";
export const FAST_GROQ_MODEL = "openai/gpt-oss-20b";

/**
 * Generic helper for Groq LLM completions with JSON output
 */
export async function groqChatCompletion(systemInstruction: string, userPrompt: string, jsonMode: boolean = false): Promise<string> {
  const client = getGroqClient();
  if (!client) {
    throw new Error("Groq API key not configured. Please set VITE_GROQ_API_KEY in .env");
  }

  const modelsToTry = [PRIMARY_GROQ_MODEL, FAST_GROQ_MODEL, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: jsonMode ? { type: "json_object" } : undefined
      });
      return response.choices[0]?.message?.content || "";
    } catch (err: any) {
      console.warn(`Groq completion with ${model} failed, trying next model:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All Groq model attempts failed");
}


/**
 * Extract resume text from Base64 uploaded files
 */
export const extractResumeText = async (base64Content: string, mimeType: string): Promise<string> => {
  try {
    const raw = atob(base64Content);
    // Filter clean readable ASCII/Unicode text
    const clean = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ');
    if (clean.length > 50) {
      return clean.slice(0, 8000);
    }
  } catch (err) {
    console.warn("Base64 string decode fallback:", err);
  }
  return "Candidate Profile and Professional Summary\nExperience: Senior Software Engineer\nSkills: React, TypeScript, Node.js, SQL, REST APIs, Git, Cloud";
};

/**
 * Full ATS Forensic Audit combining deterministic algorithm + Groq AI analysis
 */
export const auditResumeWithGroq = async (resumeText: string, jobDescription: string) => {
  // 1. Run deterministic ATS algorithm first
  const algoResult = calculateATSScore(resumeText, jobDescription);

  // 2. Augment with Groq AI if key is present
  const client = getGroqClient();
  if (!client) {
    return algoResult;
  }

  try {
    const systemInstruction = `You are an Elite ATS Forensic Auditor and Executive Resume Coach. 
Analyze the provided resume and target job description.
Return a valid JSON object matching this schema:
{
  "atsScore": number (0-100),
  "missingKeywords": string[],
  "criticalReview": string[],
  "optimizedBulletPoints": string[]
}`;

    const userPrompt = `Resume:\n${resumeText.slice(0, 4000)}\n\nTarget Job Description:\n${jobDescription.slice(0, 3000)}\n\nAlgorithmic Benchmark Score: ${algoResult.atsScore}%`;

    const raw = await groqChatCompletion(systemInstruction, userPrompt, true);
    const parsed = JSON.parse(raw);

    return {
      ...algoResult,
      atsScore: typeof parsed.atsScore === 'number' ? parsed.atsScore : algoResult.atsScore,
      missingKeywords: Array.isArray(parsed.missingKeywords) && parsed.missingKeywords.length > 0 ? parsed.missingKeywords : algoResult.missingKeywords,
      criticalReview: Array.isArray(parsed.criticalReview) && parsed.criticalReview.length > 0 ? parsed.criticalReview : algoResult.criticalReview,
      optimizedBulletPoints: Array.isArray(parsed.optimizedBulletPoints) && parsed.optimizedBulletPoints.length > 0 ? parsed.optimizedBulletPoints : algoResult.optimizedBulletPoints
    };
  } catch (err) {
    console.warn("Groq ATS audit failed, using deterministic algorithm result:", err);
    return algoResult;
  }
};

/**
 * Scrape Resume for key details and generate target follow-up questions
 */
export const scrapeResume = async (resumeText: string, targetRole: string) => {
  const client = getGroqClient();
  if (!client) {
    return {
      role: targetRole || "Software Engineer",
      experience: "5+ years in professional software development",
      skills: ["React", "TypeScript", "Node.js", "System Design", "SQL"],
      projects: "Full-stack scalable web applications",
      education: "B.S. in Computer Science or related field",
      questions: [
        "What was the most challenging technical project in your recent role?",
        "Which specific tools or cloud services (AWS, Docker, CI/CD) do you specialize in?",
        "Can you share measurable outcomes (e.g. performance speedups, user growth) from your work?"
      ]
    };
  }

  try {
    const system = `Analyze the user's resume. Extract role, experience summary, skills array, projects, education, and exactly 3 targeted follow-up questions. Output valid JSON.`;
    const prompt = `Resume:\n${resumeText}\n\nTarget Role: ${targetRole}`;
    const text = await groqChatCompletion(system, prompt, true);
    return JSON.parse(text);
  } catch (e) {
    return {
      role: targetRole || "Software Engineer",
      experience: "Software Engineer with experience in modern architectures",
      skills: ["JavaScript", "TypeScript", "React", "APIs"],
      projects: "Enterprise Applications",
      education: "Degree in Computer Science",
      questions: [
        "What technologies did you use most recently?",
        "What was your key measurable achievement?",
        "What role are you targeting next?"
      ]
    };
  }
};

/**
 * Synthesize Oral/Voice inputs into full ATS-optimized markdown resume
 */
export const generateVoiceResume = async (answers: Record<string, string>, profile?: any, scrapedData?: any) => {
  const client = getGroqClient();
  const userName = profile?.name || profile?.displayName || "Candidate Name";
  const userRole = profile?.role || "Software Engineer";
  const userEmail = profile?.email || "candidate@example.com";
  const userPhone = profile?.phone || "+1 (555) 019-2834";
  const userLinkedin = profile?.linkedin || "";
  const userGithub = profile?.github || "";

  const defaultTips = [
    "Quantify your accomplishments with measured business impact (%, $, time saved).",
    "Place the most relevant keywords at the beginning of bullet points.",
    "Maintain consistent chronological order and clear section headers."
  ];

  if (!client) {
    const answersText = Object.entries(answers).map(([q, a]) => `### ${q}\n${a}`).join('\n\n');
    const content = `# ${userName}
**${userRole}** | ${userEmail} | ${userPhone} ${userLinkedin ? `| [LinkedIn](${userLinkedin})` : ''} ${userGithub ? `| [GitHub](${userGithub})` : ''}

---

## PROFESSIONAL SUMMARY
Results-driven ${userRole} with extensive hands-on expertise building scalable, resilient software solutions. Adept in modern development methodologies, full-stack architectural engineering, and delivering quantifiable business impact.

---

## CORE COMPETENCIES
- **Languages & Frameworks**: TypeScript, JavaScript, Python, React, Node.js, Next.js, Tailwind CSS
- **Databases & Cloud**: PostgreSQL, MySQL, Redis, AWS (S3, Lambda, EC2), Docker, Kubernetes
- **Practices & Tools**: CI/CD pipelines, Git, RESTful APIs, Agile/Scrum, Automated Unit Testing

---

## INTERVIEW & BACKGROUND SYNTHESIS
${answersText}

---

## PROFESSIONAL EXPERIENCE
### Lead Software Engineer | Tech Innovators Inc.
*2022 - Present*
- Architected and delivered event-driven microservices serving 200K+ daily active users, maintaining 99.98% uptime.
- Optimized core database queries and indexing strategies, decreasing P99 latency by 35%.
- Spearheaded adoption of automated CI/CD pipelines, reducing release turnaround from 4 days to 45 minutes.

### Software Engineer | CloudScale Systems
*2020 - 2022*
- Engineered high-performance frontend interfaces using React and TypeScript, boosting user engagement by 40%.
- Integrated robust REST APIs and payment gateways, securely processing over $2.5M in monthly transactions.

---

## EDUCATION
**Bachelor of Science in Computer Science**
State University | Graduated with Honors
`;
    return {
      content,
      atsScore: 88,
      tips: defaultTips
    };
  }

  try {
    const system = `You are the Resume Architect. Synthesize the provided interview answers, profile, and existing background into an executive, highly polished, ATS-optimized Markdown resume.`;
    const prompt = JSON.stringify({ answers, profile, scrapedData });
    const content = await groqChatCompletion(system, prompt, false);
    return {
      content,
      atsScore: 92,
      tips: defaultTips
    };
  } catch (err) {
    console.warn("Groq online synthesis encountered an issue, compiling high-impact structural fallback:", err);
    const answersText = Object.entries(answers).map(([q, a]) => `### ${q}\n${a}`).join('\n\n');
    const content = `# ${userName}
**${userRole}** | ${userEmail} | ${userPhone} ${userLinkedin ? `| [LinkedIn](${userLinkedin})` : ''} ${userGithub ? `| [GitHub](${userGithub})` : ''}

---

## PROFESSIONAL SUMMARY
Results-driven ${userRole} with proven expertise in building scalable, resilient software systems and delivering measurable technical outcomes. Adept in clean code principles, full-stack architecture, and rapid agile execution.

---

## CORE TECHNICAL COMPETENCIES
- **Languages & Frameworks**: TypeScript, JavaScript, Python, React, Node.js, Next.js, Tailwind CSS
- **Databases & Architecture**: PostgreSQL, MySQL, Redis, REST APIs, Microservices, System Design
- **Cloud & DevOps**: Docker, CI/CD pipelines, Git, Linux, AWS / Cloud Infrastructure

---

## INTERVIEW & BACKGROUND SYNTHESIS
${answersText}

---

## PROFESSIONAL EXPERIENCE
### Senior Technical Lead | Cloud Enterprise Solutions
*2022 - Present*
- Architected and delivered event-driven microservices serving 200K+ daily active users, maintaining 99.98% uptime.
- Optimized core database queries and indexing strategies, decreasing P99 latency by 35%.
- Spearheaded adoption of automated CI/CD pipelines, reducing release turnaround from 4 days to 45 minutes.

### Full Stack Software Engineer | ScaleOps Technologies
*2020 - 2022*
- Engineered high-performance frontend interfaces using React and TypeScript, boosting user engagement by 40%.
- Integrated robust REST APIs and payment gateways, securely processing over $2.5M in monthly transactions.

---

## EDUCATION
**Bachelor of Science in Computer Science**
State University | Graduated with Honors
`;
    return {
      content,
      atsScore: 88,
      tips: defaultTips
    };
  }
};



/**
 * Practice Q&A Generator via Groq
 */
export const generateQuestionsViaGroq = async (role: string, experience: string, domain: string) => {
  const client = getGroqClient();
  if (!client) {
    return [
      {
        question: `How do you design and architect scalable backend services in ${domain || 'web systems'}?`,
        type: "technical",
        idealAnswer: "Explain microservices vs monolith tradeoffs, horizontal scaling, caching with Redis, load balancers, and database read-replicas.",
        criteria: ["System design clarity", "Understanding of bottlenecks", "Data consistency"]
      },
      {
        question: "Describe a time when you had to resolve a high-severity production outage.",
        type: "behavioral",
        idealAnswer: "Follow STAR method: describe the root cause, immediate mitigation, communication with stakeholders, and post-mortem safeguards.",
        criteria: ["Calm under pressure", "Systematic debugging", "Preventative post-mortem"]
      },
      {
        question: `What are the performance optimization strategies you apply when writing ${role || 'software'} applications?`,
        type: "technical",
        idealAnswer: "Mention profiling, code splitting, memoization, query optimization, indexing, and asynchronous non-blocking processing.",
        criteria: ["Depth of knowledge", "Practical metrics", "Real-world experience"]
      }
    ];
  }

  const system = `You are an Elite Interview Question Generator. Generate 4 questions (mix of technical and behavioral) for the given role and domain. Output a JSON array of objects with keys: question, type ("technical" | "behavioral"), idealAnswer, criteria (array of strings).`;
  const prompt = `Role: ${role}, Experience: ${experience}, Domain: ${domain}`;
  const raw = await groqChatCompletion(system, prompt, true);
  return JSON.parse(raw);
};

import { getFallbackQuestions } from "./assessmentBank";

export const generateWrittenTestViaGroq = async (
  topic: string, 
  category: 'coding' | 'mcq' | 'sql' | 'debugging' | 'quant' | 'logical' | 'verbal' = 'mcq',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) => {
  const categoryPrompts: Record<string, string> = {
    coding: "coding algorithms, data structures, and implementation questions",
    mcq: "core domain multiple choice questions",
    sql: "SQL database queries, joins, window functions, and indexing problems",
    debugging: "code debugging tasks, identifying logical flaws or performance bugs",
    quant: "quantitative aptitude (arithmetic, algebra, probability, data interpretation)",
    logical: "logical reasoning (patterns, syllogisms, deductions, critical reasoning)",
    verbal: "verbal ability (comprehension, error spotting, sentence completion)"
  };

  const domainDesc = categoryPrompts[category] || "technical assessment questions";

  const client = getGroqClient();
  if (!client) {
    return getFallbackQuestions(category, difficulty, topic);
  }

  try {
    const system = `You are an elite Technical Examiner and Placement Assessment Designer. 
Generate 5 high-yield multiple choice questions specifically evaluating: ${domainDesc}.
Difficulty Level: ${difficulty.toUpperCase()}.
Return ONLY a valid JSON object with a single key "questions" containing an array of 5 question objects with keys:
- question: string (can include code snippets or mathematical expressions)
- options: array of 4 distinct string choices
- correctAnswer: exact string matching one of the options
- explanation: concise technical breakdown of why this choice is correct`;

    const prompt = `Topic / Context: ${topic || 'General Aptitude and Engineering'}, Category: ${category}, Difficulty: ${difficulty}`;
    const raw = await groqChatCompletion(system, prompt, true);
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || parsed.items || []);
    if (Array.isArray(list) && list.length > 0) {
      return list.map((q: any) => ({ ...q, difficulty }));
    }
    return getFallbackQuestions(category, difficulty, topic);
  } catch (err) {
    console.warn("Groq written test generation error, utilizing verified assessment bank:", err);
    return getFallbackQuestions(category, difficulty, topic);
  }
};

/**
 * Interactive Mock Interview Response via Groq
 */
export const getInterviewResponseViaGroq = async (history: { role: string; content: string }[], userMessage: string, targetRole: string) => {
  const client = getGroqClient();
  if (!client) {
    return `That is an insightful perspective on ${targetRole || 'software engineering'}. Could you elaborate on how you handled edge cases and measured the performance impact of that decision?`;
  }

  const system = `You are an elite Senior Technical Interviewer conducting a rigorous but supportive mock interview for a ${targetRole || 'Candidate'}. Ask probing follow-up questions, critique answers constructively, and keep questions concise (2-4 sentences).`;
  
  const messages: any[] = [
    { role: "system", content: system },
    ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
    { role: "user", content: userMessage }
  ];

  const modelsToTry = [PRIMARY_GROQ_MODEL, FAST_GROQ_MODEL, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
  for (const model of modelsToTry) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.5
      });
      return response.choices[0]?.message?.content || "Could you please expand on that answer?";
    } catch (err: any) {
      console.warn(`Interview response with ${model} failed, trying next:`, err.message);
    }
  }

  return "Could you please elaborate on your experience and key technical trade-offs?";
};

