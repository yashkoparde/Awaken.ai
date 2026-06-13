<p align="center">
  <svg width="800" height="180" viewBox="0 0 800 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="180" rx="16" fill="#090D16"/>
    <defs>
      <linearGradient id="neon-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#38BDF8"/>
        <stop offset="50%" stop-color="#6366F1"/>
        <stop offset="100%" stop-color="#A855F7"/>
      </linearGradient>
      <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#334155" fill-opacity="0.4"/>
      </pattern>
    </defs>
    <rect width="800" height="180" rx="16" fill="url(#dot-pattern)"/>
    <path d="M 0 90 Q 200 40 400 90 T 800 90" stroke="url(#neon-cyan)" stroke-width="1.5" stroke-opacity="0.3" fill="none"/>
    <rect x="40" y="32" width="110" height="26" rx="6" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="52" y="49" fill="#38BDF8" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" letter-spacing="0.1em">SYSTEM CORE</text>
    <text x="40" y="105" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="-0.03em">AWAKEN.AI</text>
    <text x="40" y="136" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="14" font-weight="500">Autonomous Interview Intelligence & High-Stakes Career Simulation Infrastructure</text>
    <circle cx="730" cy="90" r="42" stroke="#1E293B" stroke-width="2" fill="#0B132B"/>
    <circle cx="730" cy="90" r="28" stroke="#38BDF8" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
    <circle cx="730" cy="90" r="8" fill="#6366F1"/>
    <line x1="688" y1="90" x2="772" y2="90" stroke="#334155" stroke-width="1"/>
    <line x1="730" y1="48" x2="730" y2="132" stroke="#334155" stroke-width="1"/>
  </svg>
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
- [2. Multi-Agent Topology](#2-multi-agent-topology)
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
