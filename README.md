# Migrant Saathi AI 🛡️
## Smart Migrant Labour Welfare & Skill Mapping Platform

> **Domain:** Social Governance & Labour Rights | **AI Engine:** IBM watsonx.ai + IBM Granite | **Stack:** React + Vite + TypeScript + FastAPI + SQLite/PostgreSQL

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![IBM watsonx](https://img.shields.io/badge/AI-IBM%20watsonx.ai-purple.svg)](https://cloud.ibm.com/watsonx)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)

---

## 🔗 Live Application Links

- 🚀 **Live Production Web App**: [https://migrant-saathi-ai.vercel.app](https://migrant-saathi-ai.vercel.app)
- 📦 **GitHub Source Repository**: [https://github.com/ohmsharma1401-rgb/migrant-saathi-ai](https://github.com/ohmsharma1401-rgb/migrant-saathi-ai)

---

## 📌 Executive Summary

**Migrant Saathi AI** is an AI-powered social governance platform designed to protect and empower over **6 million+ interstate migrant workers in Gujarat**. The platform bridges the critical gap between vulnerable unorganized labor, government welfare schemes, minimum wage compliance, workplace safety reporting, and state-level policy decision-making.

Powered by **IBM watsonx.ai** and **IBM Granite**, the system operates using specialized AI Agents that process multi-lingual queries (Hindi, Gujarati, English), perform deterministic scheme eligibility matching, detect minimum wage underpayment discrepancies, and provide government authorities with real-time labor intelligence.

---

## ✨ Key Platform Features

### 1. 👷 Migrant Worker Portal
- **Multilingual AI Assistant**: Ask questions naturally in Hindi, Gujarati, or English regarding labor laws, compensation, and worker rights.
- **Skill Mapping & Verification**: Micro-credentials and trade skill registration across Construction, Textile, Diamond, Manufacturing, and Agriculture sectors.
- **Welfare Scheme Discovery Engine**: Instant eligibility analysis for major state and central welfare schemes (BOCW Fund, PM-SYM Pension, Aam Aadmi Bima Yojana, NFSA Ration).
- **Wage Fairness & Discrepancy Analyzer**: Compare reported daily and monthly wages against official Gujarat government minimum wage notifications.
- **Safety Issue & Grievance Reporting**: Log unsafe working conditions, wage theft, or harassment with priority tracking and live status updates.

### 2. 🏛️ Government Portal & Inspections Control
- **Interactive Migration Heatmap**: Visual geographic analysis of worker concentration across Gujarat districts (Ahmedabad, Surat, Vadodara, Rajkot, etc.).
- **Labor Inspection & Grievance Management**: Assign official inspectors (`Insp. Sharma`, `Insp. Patel`), initiate site audits, and track complaint resolution.
- **District & Sector Analytics**: Real-time workforce demography, wage discrepancy metrics, and welfare enrollment statistics.
- **IBM Granite Executive Insights**: AI-generated summary reports and actionable policy recommendations for state administrators.

### 3. ⚙️ Admin Console
- **User & Role Management**: Provision and manage Worker, Official, Inspector, and System Admin accounts.
- **Welfare Scheme Registry**: Configure eligibility criteria, income caps, age brackets, and required documentation.
- **Reference Minimum Wages**: Dynamic management of state-level reference minimum wage rates with single-click government database synchronization.

---

## 🤖 AI Agent Architecture

```
                               ┌─────────────────────────────┐
                               │   IBM watsonx.ai Engine     │
                               │  (IBM Granite 3-8B Instruct)│
                               └──────────────┬──────────────┘
                                              │
           ┌──────────────────────────────────┼──────────────────────────────────┐
           │                                  │                                  │
┌──────────▼──────────┐            ┌──────────▼──────────┐            ┌──────────▼──────────┐
│  Skill Mapping      │            │ Welfare Matching    │            │ Wage Discrepancy    │
│  Agent              │            │ Agent               │            │ Agent               │
└──────────┬──────────┘            └──────────┬──────────┘            └──────────┬──────────┘
           │                                  │                                  │
           └──────────────────────────────────┼──────────────────────────────────┘
                                              │
                               ┌──────────────▼──────────────┐
                               │   FastAPI Business Logic    │
                               │   SQLite / PostgreSQL DB    │
                               └─────────────────────────────┘
```

| AI Agent | Role & Function | IBM Granite LLM Task |
| :--- | :--- | :--- |
| **Skill Agent** | Extracts trade skills, experience years, and certifications from natural language voice/text | Multilingual Entity Extraction |
| **Welfare Agent** | Matches worker profiles against scheme rules and provides grounded explanations | Grounded Explanation & Natural Language Reasoning |
| **Wage Discrepancy Agent** | Compares reported wages vs official Gazette rates and flags underpayment | Quantitative Discrepancy Explanation |
| **Grievance Agent** | Categorizes worker complaints by severity and assigns inspection priority | Complaint Categorization & Risk Assessment |
| **Executive Insight Agent**| Summarizes state-wide migration statistics into actionable policy briefings | Executive Summarization & Trend Analysis |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Zustand State Management
- **Backend**: Python 3.11, FastAPI, Uvicorn, SQLAlchemy (Async), Pydantic v2
- **Database**: SQLite (Development) / PostgreSQL 15 + pgvector (Production)
- **AI Infrastructure**: IBM watsonx.ai, IBM Granite 3-8B Instruct LLM Model
- **Security & Authentication**: JWT (JSON Web Tokens), Passlib (Bcrypt), OTP Verification

---

## ⚡ Quick Start & Installation

### Option 1: Local Development

```bash
# 1. Clone repository
git clone https://github.com/ohmsharma1401-rgb/migrant-saathi-ai.git
cd migrant-saathi-ai

# 2. Setup Backend
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env and supply your WATSONX_API_KEY and WATSONX_PROJECT_ID

# Seed database
python -m app.database.seed

# Run backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# 3. Setup Frontend (in a new terminal)
cd ../frontend
npm install
npm run dev
```

Visit:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Option 2: Docker Setup

```bash
cp backend/.env.example backend/.env
docker-compose up -d --build
docker-compose exec backend python -m app.database.seed
```

---

## 🔑 Demo Login Credentials

| Portal / Role | URL Route | Demo Credentials |
| :--- | :--- | :--- |
| **Migrant Worker** | `/worker` | Any mobile number (Simulated OTP auto-filled) |
| **Government Official** | `/gov` | `official@gujarat.gov.in` / Password: `Demo@1234` |
| **Labour Inspector** | `/gov/grievances` | `inspector@gujarat.gov.in` / Password: `Demo@1234` |
| **System Admin** | `/admin` | `admin@saathi.ai` / Password: `Admin@1234` |

---

## 📜 License
This project is licensed under the [MIT License](LICENSE). Built for hackathon demonstration.
