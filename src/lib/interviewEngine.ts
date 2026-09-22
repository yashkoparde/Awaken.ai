/**
 * Structured Interview Turn Evaluator & Question Bank
 * Provides domain-specific curated multi-stage questions,
 * rubric-based instant feedback on candidate responses,
 * model sample answers, and contextual follow-up questions.
 */

export interface InterviewTurnResponse {
  understanding: string;
  feedback: {
    strengths: string[];
    gaps: string[];
    rating: number; // 0-100
  };
  modelAnswer: string;
  nextQuestion: string;
}

export interface QuestionBankItem {
  question: string;
  topic: string;
  idealAnswer: string;
  criteria: string[];
}

export const ROUND_QUESTIONS: Record<string, QuestionBankItem[]> = {
  technical: [
    {
      question: "How would you design a high-throughput, low-latency URL shortening service (like Bitly) handling 100M daily writes?",
      topic: "System Design & Scalability",
      idealAnswer: "A robust design uses distributed Base62 encoding with Snowflake-style 64-bit ID generation to prevent collisions, multi-region Redis caching with an LRU eviction strategy for top 20% URLs, horizontally partitioned relational/NoSQL storage (e.g. Cassandra or DynamoDB) keyed on hash, and reverse-proxy rate limiting using token bucket algorithms.",
      criteria: ["ID generation uniqueness", "Cache hierarchy & eviction", "Database schema & partitioning", "Handling concurrent writes"]
    },
    {
      question: "Can you explain how the JavaScript Event Loop works under heavy async workloads, particularly regarding Microtasks vs Macrotasks?",
      topic: "Runtime Internals & Async Performance",
      idealAnswer: "The V8 engine operates on a single execution thread with a Call Stack and Event Loop. When asynchronous callbacks arrive, Microtasks (Promise.then, MutationObserver, queueMicrotask) enter the microtask queue, which is completely drained to exhaustion after the current stack frame and before any Macrotask (setTimeout, setInterval, I/O, UI render) is dequeued. Starvation can occur if recursive microtasks starve macrotasks and render cycles.",
      criteria: ["Microtask vs Macrotask queue priority", "Call stack lifecycle", "Starvation risks", "Browser repaint boundary"]
    },
    {
      question: "In distributed databases, how do you manage data consistency and transactions across microservices without relying on 2-Phase Commit (2PC)?",
      topic: "Distributed Systems & Consistency",
      idealAnswer: "In place of synchronous 2PC (which hurts availability and introduces single points of failure under CAP theorem), modern systems implement the Saga Pattern (either Orchestrated via Temporal/Cadence or Choreographed via Kafka events) coupled with idempotent compensation transactions, Outbox Pattern with Change Data Capture (Debezium), and eventual consistency guarantees.",
      criteria: ["Saga pattern orchestration/choreography", "Compensating transactions", "Outbox pattern / CDC", "Idempotency handling"]
    },
    {
      question: "Walk me through how you isolate, profile, and fix a memory leak or CPU spike in a production Node.js or browser web application.",
      topic: "Performance Profiling & Observability",
      idealAnswer: "First, inspect APM telemetry (Grafana, Datadog) to pinpoint the affected container. Take two heap snapshots (or V8 CPU profiles using Chrome DevTools / node --inspect) 10 minutes apart to perform delta comparison. Look for retained DOM elements, unclosed event listeners, runaway closures, or unbounded in-memory caches. After verifying the root cause, add automated load tests to verify memory stays bounded.",
      criteria: ["APM / metric verification", "Heap snapshot delta analysis", "Common leak vectors (closures, listeners)", "Verification via load testing"]
    },
    {
      question: "What are the core security vulnerabilities described in the OWASP Top 10, and how do you protect RESTful and GraphQL APIs against them?",
      topic: "Application Security & Hardening",
      idealAnswer: "Key vectors include Broken Object Level Authorization (BOLA/IDOR), Injection, and Security Misconfiguration. Defense-in-depth requires strict role-based access control (RBAC/ABAC) verified on every resource query, parameterized queries or ORM sanitization, TLS termination, cryptographic JWT verification with short TTLs and refresh rotation, rate limiting per IP/API token, and GraphQL query depth limiting to prevent recursive DoS.",
      criteria: ["BOLA/IDOR mitigation", "Input sanitization & parameterization", "Auth & Token security", "Rate limiting & Query complexity limits"]
    }
  ],
  hr: [
    {
      question: "Tell me about yourself, your career path so far, and what specifically motivated you to pursue this engineering role?",
      topic: "Career Narrative & Motivation",
      idealAnswer: "A strong response follows the Present-Past-Future framework: describe current technical responsibilities and high-impact wins, concisely highlight foundational experiences and pivotal engineering decisions in the past, and explain how this company's product trajectory and technical challenges directly align with your long-term career growth.",
      criteria: ["Clear concise narrative structure", "Specific value proposition", "Genuine knowledge of the role/domain", "Professional enthusiasm"]
    },
    {
      question: "Can you describe a situation where you had a significant technical disagreement with a team member or manager, and how you resolved it?",
      topic: "Collaboration & Conflict Management",
      idealAnswer: "Using the STAR format: describe the technical architectural disagreement (e.g. choice of database or state management), emphasize keeping egos aside and focusing on empirical data/benchmarks/prototyping rather than opinions, listening actively to the other perspective, finding consensus, and fully committing once the decision was made ('disagree and commit').",
      criteria: ["Constructive, egoless dialogue", "Data-driven resolution", "Active listening", "Commitment to team outcomes"]
    },
    {
      question: "How do you prioritize competing deadlines and manage high-pressure deliverables when multiple stakeholders demand urgent delivery?",
      topic: "Time Management & Stakeholder Alignment",
      idealAnswer: "Categorize deliverables using the Eisenhower matrix and business impact metrics. Communicate proactively with stakeholders to set realistic expectations, negotiate scope or milestones into iterative MVPs rather than sacrificing code quality, and maintain transparency through backlog grooming and risk registers.",
      criteria: ["Proactive stakeholder communication", "Scope negotiation / MVPs", "Maintaining quality under pressure", "Systematic prioritization"]
    },
    {
      question: "Where do you envision yourself in 2 to 3 years from an engineering and leadership standpoint?",
      topic: "Career Vision & Growth Trajectory",
      idealAnswer: "Articulate desire to grow as a technical leader or senior engineer who architects resilient core systems, mentors junior developers, drives technical roadmaps, and champions engineering excellence, while deepening domain mastery in distributed systems and platform reliability.",
      criteria: ["Realistic yet ambitious trajectory", "Desire for mentorship and impact", "Commitment to engineering crafts", "Alignment with company growth"]
    },
    {
      question: "Why should we hire you over other qualified candidates who have similar technical experience?",
      topic: "Unique Value Proposition",
      idealAnswer: "Highlight a combination of strong technical rigor, extreme ownership of production outcomes, quick adaptability in fast-paced environments, and empathetic communication that bridges the gap between engineering, product, and end-user value.",
      criteria: ["Authentic differentiation", "Extreme ownership mindset", "Cross-functional communication", "Business impact focus"]
    }
  ],
  behavioral: [
    {
      question: "Tell me about a high-severity production failure or major bug you were responsible for, and how you handled the post-mortem.",
      topic: "Accountability & Crisis Management",
      idealAnswer: "Situation: A migration script caused elevated latency and partial service degradation. Task: Mitigate immediate customer impact. Action: Rolled back the deployment within 4 minutes, alerted customer success, and initiated a blameless post-mortem. Result: Identified missing staging indexes, added automated pre-deployment schema validation in CI, and shared lessons across teams.",
      criteria: ["Immediate mitigation speed", "Blameless post-mortem culture", "Systemic automated safeguards", "Extreme personal ownership"]
    },
    {
      question: "Describe a time when you took the initiative to improve a broken legacy process or codebase without being asked.",
      topic: "Proactivity & Technical Stewardship",
      idealAnswer: "Situation: The local developer onboarding and test suite took over 45 minutes to run, slowing down daily PR velocity. Task: Modernize the local DX. Action: Containerized local dependencies with Docker Compose and modularized test runners to execute in parallel. Result: Reduced test runtime to 6 minutes, saving hundreds of engineering hours monthly.",
      criteria: ["Identified systemic friction", "Self-directed execution", "Quantified business/time impact", "Long-term team benefit"]
    },
    {
      question: "Give an example of how you mentored a junior engineer or helped an underperforming teammate improve their deliverables.",
      topic: "Mentorship & Team Uplift",
      idealAnswer: "Situation: A junior developer struggled with asynchronous patterns and PR reviews. Task: Uplift their technical confidence and code output. Action: Set up bi-weekly pair programming sessions, broke complex features into digestible milestone tasks, and provided constructive, empathetic code reviews. Result: Within 6 weeks, the engineer independently shipped a core feature with zero regressions.",
      criteria: ["Empathetic coaching", "Structured pair programming / milestones", "Safe psychological learning environment", "Measurable improvement"]
    },
    {
      question: "Describe a project where requirements were vague, ambiguous, or constantly shifting. How did you deliver successfully?",
      topic: "Navigating Ambiguity & Agile Execution",
      idealAnswer: "Situation: Client required an analytics module but had no clear specifications. Task: Define actionable scope and deliver on time. Action: Built rapid wireframe prototypes, scheduled short 15-minute weekly feedback loops with key stakeholders, and implemented modular architecture so future pivots had minimal refactoring cost. Result: Delivered an MVP ahead of schedule that achieved 90% stakeholder satisfaction.",
      criteria: ["Prototyping & feedback loops", "De-risking technical assumptions", "Modular decoupled design", "Delivering iterative customer value"]
    }
  ],
  'role-specific': [
    {
      question: "When building a frontend application that renders large data tables (50,000+ rows) with live updates, what strategies do you apply to maintain 60 FPS?",
      topic: "Frontend Rendering & DOM Optimization",
      idealAnswer: "Apply DOM virtualization (rendering only items in the active viewport using react-window or tanstack-virtual), debounce/throttle live incoming WebSocket events, utilize Web Workers for heavy data filtering/sorting outside the main thread, and ensure CSS will-change or GPU compositing is leveraged appropriately without layout thrashing.",
      criteria: ["DOM Virtualization", "Web Workers off-threading", "Throttled WebSocket ingestion", "Zero layout thrashing"]
    },
    {
      question: "How do you structure database indexes on a high-traffic table, and how do you determine when an index degrades write performance?",
      topic: "Database Indexing & Query Plans",
      idealAnswer: "Analyze EXPLAIN ANALYZE execution plans to look for sequential scans, high cost filters, and index scans. Create compound indexes ordering by equality predicates first followed by range predicates. Monitor index bloat and write degradation using pg_stat_user_indexes; prune unused or redundant indexes to reduce write I/O and disk write amplification.",
      criteria: ["EXPLAIN ANALYZE interpretation", "Equality-Range-Sort index ordering", "Write amplification awareness", "Pruning redundant indexes"]
    },
    {
      question: "How do you design an end-to-end CI/CD deployment pipeline with zero-downtime releases and automated rollback capabilities?",
      topic: "DevOps, CI/CD & Reliability",
      idealAnswer: "Pipeline stages include linting, automated unit/integration tests, container vulnerability scans (Trivy), and staging deployment. For production, execute Blue/Green or Canary deployments behind a Kubernetes ingress or AWS ALB. Health check probes automatically trigger traffic diversion, and automated canary analysis (Prometheus error rate > 0.5%) triggers instant rollback before full rollout.",
      criteria: ["Blue/Green or Canary strategy", "Automated health checks / canary analysis", "Container security scanning", "Instant automated rollback"]
    }
  ]
};

/**
 * Generate comprehensive multi-stage interview turn feedback:
 * 1. Understands candidate response
 * 2. Gives feedback (strengths + gaps + rating)
 * 3. Provides model reference answer
 * 4. Poses targeted follow-up question
 */
export function evaluateCandidateTurnLocally(
  question: string,
  userResponse: string,
  round: string,
  questionIdx: number
): InterviewTurnResponse {
  const cleanResponse = userResponse.trim();
  const wordCount = cleanResponse.split(/\s+/).filter(Boolean).length;
  
  // Find current question details
  const questionsList = ROUND_QUESTIONS[round] || ROUND_QUESTIONS.technical;
  const currentQ = questionsList[questionIdx % questionsList.length];
  const nextQ = questionsList[(questionIdx + 1) % questionsList.length];

  // Derive feedback metrics
  const strengths: string[] = [];
  const gaps: string[] = [];
  let rating = 70;

  if (wordCount < 15) {
    gaps.push("Response was overly brief; lacks the concrete architectural depth and trade-offs expected in senior rounds.");
    gaps.push("Did not cite quantitative metrics, operational examples, or edge case handling.");
    rating = Math.max(45, Math.min(65, 40 + wordCount * 2));
  } else if (wordCount >= 15 && wordCount < 50) {
    strengths.push("Directly answered the core prompt without extraneous conversational filler.");
    gaps.push("Could expand on failover strategies, performance implications, and real-world trade-offs.");
    rating = Math.min(82, 65 + Math.round(wordCount * 0.3));
  } else {
    strengths.push("Thorough technical explanation with clear structural reasoning and domain awareness.");
    strengths.push("Demonstrated structured problem breakdown and familiarity with production standards.");
    gaps.push("Ensure you mention specific monitoring tools (Prometheus, Grafana, OpenTelemetry) to verify this in production.");
    rating = Math.min(95, 78 + Math.round(wordCount * 0.15));
  }

  // Check keywords for extra credit
  const lower = cleanResponse.toLowerCase();
  const keywords = ["trade-off", "latency", "scale", "cache", "redis", "database", "async", "metric", "monitor", "test", "security", "failover", "index", "microservice", "docker", "star", "team"];
  const matched = keywords.filter(k => lower.includes(k));
  if (matched.length >= 3) {
    strengths.push(`Strong vocabulary in domain fundamentals: highlighted ${matched.slice(0, 3).join(", ")}.`);
    rating = Math.min(98, rating + 6);
  }

  const understanding = `You approached this question with a focus on ${matched.length > 0 ? matched.slice(0, 2).join(" and ") : "core engineering mechanics"}, articulating your stance in approximately ${wordCount} words.`;

  return {
    understanding,
    feedback: {
      strengths: strengths.length > 0 ? strengths : ["Communicated thoughts in a professional tone."],
      gaps: gaps.length > 0 ? gaps : ["Consider elaborating on rollback procedures and error budgets."],
      rating
    },
    modelAnswer: currentQ.idealAnswer,
    nextQuestion: nextQ.question
  };
}
