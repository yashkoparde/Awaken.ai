<p align="center">
  <img src="assets/hero_banner.svg" alt="Awaken.ai High-Precision Core Banner" width="800" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Distributed%20Multi--Agent-0ea5e9?style=for-the-badge&labelColor=0f172a" alt="Architecture" />
  <img src="https://img.shields.io/badge/ATS%20Scoring-Deterministic%20%2B%20LLM-6366f1?style=for-the-badge&labelColor=0f172a" alt="ATS Scoring" />
  <img src="https://img.shields.io/badge/Engine-Groq%20%7C%20Llama--3.3%20%7C%20GPT--OSS-8b5cf6?style=for-the-badge&labelColor=0f172a" alt="Groq Engine" />
  <img src="https://img.shields.io/badge/Storage-SQLite%20%7C%20MySQL%20%7C%20Supabase-10b981?style=for-the-badge&labelColor=0f172a" alt="Storage" />
  <img src="https://img.shields.io/badge/Interface-React%2019%20%7C%20Tailwind%20v4-38bdf8?style=for-the-badge&labelColor=0f172a" alt="Interface" />
</p>

---

## Technical Index

- [1. Architectural Foundation](#1-architectural-foundation)
- [2. Multi-Agent Topology & Neural Dispatch](#2-multi-agent-topology--neural-dispatch)
- [3. Full System Interaction Flow](#3-full-system-interaction-flow)
- [4. Deterministic ATS Scoring Equation & Weights](#4-deterministic-ats-scoring-equation--weights)
- [5. Module Matrix & Functional Specifications](#5-module-matrix--functional-specifications)
- [6. High-Frequency Interview Vault Architecture](#6-high-frequency-interview-vault-architecture)
- [7. Dual-Engine Data Storage Topology](#7-dual-engine-data-storage-topology)
- [8. Hardware & Browser Media Pipeline](#8-hardware--browser-media-pipeline)
- [9. Quick Start & Execution Modes](#9-quick-start--execution-modes)
- [10. Production Deployment Specifications](#10-production-deployment-specifications)

---

## 1. Architectural Foundation

Awaken.ai is built as a dual-tier distributed interview coaching engine. It decouples high-throughput client-side audio/video processing from deterministic evaluation pipelines and distributed AI inference nodes.

```mermaid
graph TB
    subgraph Client_Workspace["Client Runtime (Vite + React 19 + TypeScript)"]
        UI["WarMap Orchestrator UI"]
        Sub1["NeuralLink Auth"]
        Sub2["Voice Resume Wizard"]
        Sub3["ATS Diagnostic Core"]
        Sub4["Written Assessment Node"]
        Sub5["Vault Simulator (AV Stream)"]
        Sub6["Analytics Vault"]
    end

    subgraph Inference_Mesh["LLM Inference Mesh (Groq High-Speed Fabric)"]
        M1["Primary: openai/gpt-oss-120b"]
        M2["Fast: openai/gpt-oss-20b"]
        M3["Fallback 1: llama-3.3-70b-versatile"]
        M4["Fallback 2: llama-3.1-8b-instant"]
    end

    subgraph Persistence_Tier["Dual Backend & Persistence Plane"]
        PHP["PHP 8.2+ High-Throughput REST Gateway"]
        SQLITE[("Local SQLite Instance")]
        MYSQL[("Production MySQL")]
        SUPA[("Supabase Edge Authentication")]
    end

    UI --> Sub1 & Sub2 & Sub3 & Sub4 & Sub5 & Sub6
    Sub2 & Sub3 & Sub4 & Sub5 --> Inference_Mesh
    M1 -.->|Rate Limit / Timeout| M2 -.-> M3 -.-> M4
    Sub1 & Sub2 & Sub3 & Sub4 & Sub6 --> PHP
    PHP --> SQLITE
    PHP --> MYSQL
    Sub1 -.-> SUPA
```

---

## 2. Multi-Agent Topology & Neural Dispatch

The platform coordinates five specialized neural agents configured with distinct system prompts, operational tones, and domain tasks:

<p align="center">
  <img src="assets/multi_agent_topology.svg" alt="Multi-Agent Topology" width="780" />
</p>

```mermaid
graph LR
    subgraph Agent_Cluster["Specialized Neural Agents"]
        direction TB
        A1["Orchestrator<br/>Tone: Supportive<br/>Task: State Harmony"]
        A2["Resume Auditor<br/>Tone: Analytical<br/>Task: Forensic Parsing"]
        A3["Resume Architect<br/>Tone: Supportive<br/>Task: Oral Extraction"]
        A4["Mock Interviewer<br/>Tone: Adversarial<br/>Task: Pressure Probing"]
        A5["Speech Coach<br/>Tone: Analytical<br/>Task: Cadence Metrics"]
    end

    subgraph Module_Target["Target WarMap Modules"]
        direction TB
        T1["WarMap Dashboard State"]
        T2["ATS Scanner (ResumeBuilder.tsx)"]
        T3["Oral Profile (VoiceResumeBuilder.tsx)"]
        T4["High-Stakes Sim (VaultSimulator.tsx)"]
        T5["Audio Analytics Stream"]
    end

    A1 --> T1
    A2 --> T2
    A3 --> T3
    A4 --> T4
    A5 --> T5
```

| Agent Identifier | Tactical Persona | Operational Tone | Primary Functionality | Core Dependency |
| :--- | :--- | :--- | :--- | :--- |
| `orchestrator` | System Orchestrator | Supportive | Synchronizes telemetry across all 9 WarMap tabs | `src/lib/agents.ts` |
| `forensic_auditor` | Resume Auditor | Analytical | Deconstructs resumes to compute structural & skill gaps | `src/lib/atsAlgorithm.ts` |
| `resume_architect` | Resume Architect | Supportive | Synthesizes oral responses into high-density ATS bullets | `src/lib/groq.ts` |
| `vault_adversary` | Mock Interviewer | Adversarial | Runs multi-turn high-stakes technical interrogation | `src/components/VaultSimulator.tsx` |
| `comm_coach` | Speech Coach | Analytical | Evaluates audio cadence, latency, and pacing metrics | Web Speech Recognition API |

---

## 3. Full System Interaction Flow

The operational sequence illustrates how a candidate authenticates, conducts an ATS analysis, undergoes a simulated interview round, and compiles an executive evaluation report:

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate
    participant UI as WarMap Dashboard
    participant ATS as ATS Engine (Math + NLP)
    participant LLM as Groq Inference Mesh
    participant Backend as PHP REST Service
    participant Storage as SQLite / MySQL DB

    Candidate->>UI: Submit credentials at NeuralLink
    UI->>Backend: POST /api/login {email, password}
    Backend->>Storage: Verify hash & query candidate
    Storage-->>Backend: Account record & auth token
    Backend-->>UI: Return JWT token & cached profile
    UI-->>Candidate: Render WarMap Mission Interface

    Candidate->>UI: Upload resume file & job description
    UI->>ATS: Execute deterministic lexical tokenization
    ATS-->>UI: Calculate keyword density, structure & metrics
    UI->>LLM: Dispatch audit prompt with extracted tokens
    LLM-->>UI: Return critical review & optimized bullet points
    UI->>Backend: POST /api/scans {scores, serialized analysis}
    Backend->>Storage: Persist ATS record to resume_scans

    Candidate->>UI: Launch Vault Simulator (Mock Interview)
    UI->>Candidate: Capture Video & Audio streams
    Candidate->>UI: Speak response (Speech-to-Text streaming)
    UI->>LLM: Multi-turn prompt + conversation memory
    LLM-->>UI: Synthesize adversarial follow-up question
    UI->>Candidate: Play synthetic speech & render transcript

    Candidate->>UI: Navigate to Analytics Vault
    UI->>Backend: GET /api/scans & GET /api/tests
    Backend->>Storage: Read candidate audit timeline
    Storage-->>Backend: Return chronological datasets
    Backend-->>UI: Render Recharts AreaChart & KPI Gauges
    UI-->>Candidate: Export formal Candidate Evaluation Report
```

---

## 4. Deterministic ATS Scoring Equation & Weights

The ATS algorithm calculates an audit score bounded between `0` and `100` points using a four-factor deterministic equation coupled with LLM contextual validation:

<p align="center">
  <img src="assets/ats_weights_gauge.svg" alt="ATS Scoring Weights" width="780" />
</p>

### Formula Definition

```text
Final ATS Score = (KeywordScore * 0.40) + (StructureScore * 0.25) + (ImpactScore * 0.20) + (VerbScore * 0.15)
```

Where:
- **KeywordScore**: Ratio of matched non-stopword n-grams against job requirements.
- **StructureScore**: Normalized detection of mandatory ATS section boundaries.
- **ImpactScore**: Metric density derived from occurrences of `[0-9]+%`, `\$[0-9]+[kKmMbB]?`, and scale integers.
- **VerbScore**: Density of active leadership power verbs initiating bullet points.

---

## 5. Module Matrix & Functional Specifications

The WarMap interface hosts nine specialized modules accessible via sidebar navigation and keyboard hotkeys (`Alt+1` through `Alt+9`):

```mermaid
graph LR
    subgraph Core_Navigation["WarMap 9-Node Navigation Grid"]
        direction TB
        N1["1. Onboarding & Target Roles"]
        N2["2. Voice Resume Builder"]
        N3["3. Hybrid ATS Scanner"]
        N4["4. Practice Q&A Generator"]
        N5["5. Written Assessment Test"]
        N6["6. High-Stakes Vault Simulator"]
        N7["7. Curated Learning Hub"]
        N8["8. Career Roadmap Matrix"]
        N9["9. Performance Analytics"]
    end

    subgraph Data_Flow["Data Exchange Plane"]
        D1["Candidate Profile State"]
        D2["Generated Speech-to-Markdown"]
        D3["4-Part Forensic Breakdown"]
        D4["Multi-Turn Q&A History"]
        D5["Timed Evaluation Result"]
        D6["Webcam & Audio AV Stream"]
        D7["Dynamic Role Curations"]
        D8["Milestone Task Progress"]
        D9["Recharts Historical Trendlines"]
    end

    N1 --> D1
    N2 --> D2
    N3 --> D3
    N4 --> D4
    N5 --> D5
    N6 --> D6
    N7 --> D7
    N8 --> D8
    N9 --> D9
```

<details>
<summary><strong>Detailed Module Breakdown (Click to Expand)</strong></summary>

### Node 1: Onboarding (`ProfileSetup.tsx`)
- Captures candidate experience tiers: `Entry Level`, `Mid Level`, `Senior`, `Staff / Lead`, and `Principal`.
- Normalizes external platform handles: GitHub, LinkedIn, LeetCode, Codeforces, and portfolio domains.
- Dual-persists state into user-scoped `localStorage` keys and the backend `profiles` database table.

### Node 2: Voice Resume (`VoiceResumeBuilder.tsx`)
- 5-step guided wizard: resume presence check, text extractor, summary reviewer, social links, and oral questions.
- Browser SpeechRecognition pipeline with volume-reactive animated waveform visualizer.
- Generates compliant ATS markdown resumes with one-click clipboard copy and `.txt` blob export.

### Node 3: ATS Scanner (`ResumeBuilder.tsx`)
- Client-side drag-and-drop document upload with Base64 document parser.
- Deterministic 4-part scoring combined with Groq LLM deep forensic gap review.
- Suggests categorized missing skills across programming, aptitude, soft skills, and systems knowledge.

### Node 4: Practice Q&A (`QAGenerator.tsx`)
- Generates role-specific behavioral and technical interview questions based on candidate profile.
- Displays ideal answer outlines with bulleted evaluation criteria.
- Hosts an interactive follow-up chat thread beneath each question for conversational deep dives.

### Node 5: Written Test (`WrittenTest.tsx`)
- Dynamic MCQ examination generator across Coding, SQL, Aptitude, Verbal, and System Design topics.
- Automated client-side scoring engine with instant rationale display for incorrect selections.
- Automatically synchronizes finished test scores to the backend `test_scores` table.

### Node 6: Vault Simulator (`VaultSimulator.tsx`)
- Multi-round high-stakes simulator covering Technical, Behavioral, HR, and Role-Specific rounds.
- Video webcam streaming via `getUserMedia` with optional in-memory `MediaRecorder` video capture.
- Configurable countdown timer with animated pulse indicator.

### Node 7: Resource Finder (`ResourceFinder.tsx`)
- Pre-compiled engineering curriculum (System Design Primer, MDN Advanced JS, CS Interview University).
- Real-time client-side search query indexer filtering titles, descriptions, and domains.
- Groq AI integration dynamically discovering targeted resources matching candidate profile goals.

### Node 8: Career Roadmap (`CareerRoadmap.tsx`)
- Generates 5 distinct career progression milestones customized to candidate domain and seniority.
- Interactive task completion checklists with persistent state tracking.
- Visual milestone progression tracker calculating percentage readiness towards target roles.

### Node 9: Performance Analytics (`AnalyticsVault.tsx`)
- High-resolution Recharts historical AreaChart tracking readiness progression over time.
- KPI cards computing aggregate technical depth, readiness index, and assessment counts.
- Executive Candidate Evaluation Report generator supporting native print styles and JSON data export.

</details>

---

## 6. High-Frequency Interview Vault Architecture

The Vault Simulator operates as an integrated hardware and AI feedback loop:

```mermaid
stateDiagram-v2
    [*] --> Idle_State: Initialize Module

    state "Session Setup" as Setup {
        Select_Round: Select Round (Technical / HR / Behavioral)
        Check_Hardware: Request Camera & Mic Permissions
        Start_Timer: Initialize Session Clock (5000s)
    }

    state "Active Interrogation Loop" as Loop {
        Interviewer_Speaks: Voice Synthesizer Generates Question
        Candidate_Records: Web Speech API Streams Spoken Response
        Thinking_Indicator: Groq Model Computes Adversarial Probing
    }

    state "Round Finalization" as Final {
        Evaluate_Performance: Compute Depth & Coherence
        Persist_Metrics: Write Telemetry to Backend
        Render_Summary: Display Diagnostic Overview
    }

    Idle_State --> Setup
    Setup --> Loop
    Loop --> Loop: Next Question Turn
    Loop --> Final: Complete All Questions / End Early
    Final --> [*]
```

---

## 7. Dual-Engine Data Storage Topology

The platform provides complete operational capability in both online and air-gapped / offline configurations:

<p align="center">
  <img src="assets/storage_topology.svg" alt="Storage Topology" width="780" />
</p>

```mermaid
graph TB
    subgraph Client_Boundary["Client Execution Context"]
        LS["localStorage Engine<br/>- awaken_php_token<br/>- awaken-profile-{uid}<br/>- awaken-roadmap-progress"]
        APICLI["BackendClient (src/lib/api.ts)<br/>Offline Fallback Handler"]
    end

    subgraph Backend_Gateway["PHP 8.2+ Gateway (server/index.php)"]
        AUTH["Bearer Token Middleware"]
        ROUTES["REST Endpoints (/api/profile, /api/scans, /api/tests)"]
        ADMIN["Visual Admin Dashboard (/admin)"]
    end

    subgraph Database_Layer["Storage Targets"]
        SQLITE[("SQLite Database<br/>server/database.sqlite<br/>WAL Journal Mode")]
        MYSQL[("Production MySQL<br/>cPanel / Cloud SQL<br/>UTF-8mb4 Charset")]
    end

    LS <--> APICLI
    APICLI -->|HTTP Authorization: Bearer| AUTH
    AUTH --> ROUTES
    ROUTES --> SQLITE
    ROUTES --> MYSQL
    ADMIN --> SQLITE
    ADMIN --> MYSQL
```

### Database Table Schemas

```sql
-- Users and authentication tokens
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Candidate profiles and career targets
CREATE TABLE profiles (
    user_id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(150),
    experience VARCHAR(100),
    domain VARCHAR(150),
    target_job VARCHAR(150),
    github VARCHAR(255),
    leetcode VARCHAR(255),
    linkedin VARCHAR(255),
    portfolio VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ATS diagnostic scan records
CREATE TABLE resume_scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64),
    type VARCHAR(50),
    ats_score INTEGER,
    analysis_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Domain assessment test evaluations
CREATE TABLE test_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(64),
    topic VARCHAR(150),
    score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. Hardware & Browser Media Pipeline

The application interacts with browser hardware subsystems following strict permission protocols defined in `metadata.json`:

```mermaid
graph TD
    subgraph Browser_Peripherals["Physical Devices"]
        CAM["Webcam Video Feed"]
        MIC["Microphone Audio Feed"]
        SPK["Audio Output Speakers"]
    end

    subgraph Security_Gate["Browser Security Handshake"]
        PERM{"User Grants Permission?"}
    end

    subgraph Audio_Pipeline["Audio Processing Stream"]
        SR["SpeechRecognition API"]
        SS["SpeechSynthesisUtterance"]
        WAV["Visualizer Waveform Canvas"]
    end

    subgraph Video_Pipeline["Video Processing Stream"]
        VID["HTMLVideoElement Preview"]
        MR["MediaRecorder Buffer Blob"]
    end

    CAM & MIC --> PERM
    PERM -- Yes --> VID & SR & WAV
    PERM -- No --> SIM["Simulated Hardware Fallback"]
    SR --> TXT["Real-time Transcript Buffer"]
    SS --> SPK
    VID --> MR
```

---

## 9. Quick Start & Execution Modes

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **PHP**: `v8.0.0` or higher with `pdo_sqlite` extension enabled
- **Groq API Key**: Free tier available from [console.groq.com](https://console.groq.com)

### Execution Matrix

```mermaid
graph LR
    A["git clone https://github.com/yashkoparde/Awaken.ai.git"] --> B["Configure .env"]
    B --> C1["Mode 1: Windows One-Click"]
    B --> C2["Mode 2: Manual Terminal"]
    B --> C3["Mode 3: Production Build"]

    C1 --> O1["Double-click start-project.bat"]
    C2 --> O2["Terminal 1: cd server && php -S 127.0.0.1:8000<br/>Terminal 2: npm run dev"]
    C3 --> O3["npm run build && vite preview"]
```

### Environment Variable Specification (`.env`)

```env
# Primary LLM API configuration (Groq Cloud)
VITE_GROQ_API_KEY="gsk_your_actual_groq_key_here"

# PHP Backend Gateway endpoint
VITE_PHP_API_URL="http://127.0.0.1:8000/api"

# Optional: Supabase credentials (fallback authentication)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

---

## 10. Production Deployment Specifications

### Shared Hosting (Apache / cPanel)
1. Execute `npm run build` to generate the production artifact directory `dist/`.
2. Deploy the contents of `dist/` into your web server root (`public_html/`).
3. Deploy the `server/` directory into `public_html/api/`.
4. Configure database settings in `server/config.php` (set `DB_TYPE` to `mysql` for MySQL installations).
5. The included `server/.htaccess` file routes all `/api/*` endpoints through `server/index.php`.

### Static Edge Deployment (Netlify / Vercel)
- **Netlify**: Configuration managed via `netlify.toml` with single-page application redirect rules:
  ```toml
  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```
- **Vercel**: Configuration managed via `vercel.json` routing all routes to index.

---

<p align="center">
  <sub>Architected and engineered by <a href="https://github.com/yashkoparde">yashkoparde</a>. Built for technical candidates navigating high-stakes interview processes.</sub>
</p>
