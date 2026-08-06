# 🌟 Awaken.ai - AI Career & Interview Platform

> **Simple, All-in-One Guide for Team Members & Stakeholders**  
> Welcome to **Awaken.ai**! This project includes an **AI Resume ATS Scanner**, **Mock Interview Simulator**, and a **PHP Account Server** to save candidate details.

---

## 🔑 1. Which API Key Do You Need?

You only need **one primary API key**:

### 👉 **Groq API Key** (Free & Fast)
- **Where to get it**: [https://console.groq.com/keys](https://console.groq.com/keys)
- **How much does it cost?**: Free.
- **Where to put it**: Open the file named `.env` in the project folder, find `VITE_GROQ_API_KEY=`, and paste your key inside the quotation marks:
  ```env
  VITE_GROQ_API_KEY="gsk_your_actual_groq_key_here"
  ```
*(If you run the app without a key, the system automatically uses smart built-in responses, so nothing will crash!)*

---

## 🚀 2. Quick Start (Run in 3 Steps)

### Step 1: Install Dependencies
Open your terminal (PowerShell, Command Prompt, or VS Code terminal) in the project folder and type:
```bash
npm install
```

### Step 2: Add your API key
Make sure your `.env` file has your Groq API key:
```env
VITE_GROQ_API_KEY="your_groq_key_here"
VITE_PHP_API_URL="http://127.0.0.1:8000/api"
```

### Step 3: Run the Project
- **Option A (Easiest)**: Double-click **`start-project.bat`** in the project folder.  
  *(This automatically launches both the PHP backend and the web app!)*
- **Option B (Manual)**:
  1. In Terminal 1 (Backend):
     ```bash
     cd server
     php -S 127.0.0.1:8000 index.php
     ```
  2. In Terminal 2 (Frontend):
     ```bash
     npm run dev
     ```
  3. Open your browser at **`http://localhost:3000`**!

---

## 📁 3. Simple Project Folder Structure

Here is an easy-to-read explanation of the folder layout:

```
Awaken.ai/
│
├── 📂 server/                     # 🐘 PHP BACKEND SERVER
│   ├── config.php                 # Database settings (SQLite / MySQL)
│   ├── db.php                     # Database tables (Users, Profiles, Scans, Tests)
│   ├── index.php                  # Server endpoints (Login, Register, Scans)
│   ├── run-server.bat             # Double-click to start PHP server alone
│   └── database.sqlite            # Auto-generated database file (stores accounts)
│
├── 📂 src/                        # 💻 FRONTEND (REACT & USER INTERFACE)
│   ├── components/                # Visual screens of the application:
│   │   ├── WarMap.tsx             # Main dashboard navigation
│   │   ├── NeuralLink.tsx         # Sign-in & Sign-up screen
│   │   ├── ProfileSetup.tsx       # Profile details (name, target role, links)
│   │   ├── ResumeBuilder.tsx      # ATS Resume Scanner (Calculates match score)
│   │   ├── VoiceResumeBuilder.tsx # Voice/Oral resume builder
│   │   ├── QAGenerator.tsx        # Interview prep question generator
│   │   ├── WrittenTest.tsx        # Technical domain tests & scoring
│   │   ├── VaultSimulator.tsx     # Mock interview simulation (Webcam/Audio)
│   │   ├── ResourceFinder.tsx     # Recommended tutorials & study links
│   │   └── AnalyticsVault.tsx     # Performance charts & score history
│   │
│   └── lib/                       # 🧠 CORE LOGIC & INTELLIGENCE
│       ├── atsAlgorithm.ts        # The ATS Resume Scoring math & rules
│       ├── groq.ts                # Connects to Groq AI (Llama 3.3)
│       └── api.ts                 # Talks to the PHP backend
│
├── ⚙️ .env                        # Secret keys file (Put your Groq key here)
├── 🚀 start-project.bat           # 1-Click launcher for Windows
├── 📦 package.json                # Project dependencies list
└── 📄 README.md                   # This instruction guide
```

---

## 🎯 4. What Does the ATS Algorithm Check?

When a user scans their resume against a job description, the system grades it on 4 areas:
1. **Keyword Match (40%)**: Compares the skills in the job description to the resume.
2. **Standard Section Headers (25%)**: Checks for Contact, Summary, Experience, Skills, Education, and Projects.
3. **Quantifiable Impact (20%)**: Checks for real numbers, percentages (`%`), revenue (`$`), and metric improvements.
4. **Action Power Verbs (15%)**: Looks for strong action verbs (`Architected`, `Spearheaded`, `Optimized`).

---

## 🌐 5. How to Host Online

### For Shared Hosting (cPanel / Apache):
1. Run `npm run build` in your terminal.
2. Upload the files inside `dist/` to your `public_html` folder.
3. Upload the `server/` folder to your website directory (e.g. `public_html/api`).
4. Update `VITE_PHP_API_URL` to `https://yourdomain.com/api/api`.
5. Done! The included `.htaccess` file handles all routing automatically.

---

## 💬 Need Help?
- **Groq API**: Free sign-up at [console.groq.com](https://console.groq.com).
- **Node.js**: Ensure Node.js (v18 or higher) is installed on your computer.
- **PHP**: Ensure PHP (v8.0 or higher) is installed.
