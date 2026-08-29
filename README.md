# Migrant Saathi AI
## Smart Migrant Labour Welfare & Skill Mapping Platform

> **Domain:** Social Governance | **AI:** IBM watsonx.ai + IBM Granite | **Stack:** React + FastAPI + PostgreSQL

---

### Overview

Migrant Saathi AI is an Agentic AI-powered platform that:
- Maps migrant worker skills and locations across Gujarat
- Identifies potentially relevant government welfare schemes using deterministic eligibility filtering + IBM Granite
- Monitors potential wage discrepancies using verified reference data
- Allows workers to report workplace safety issues and grievances
- Provides government authorities with a centralized intelligence dashboard
- Generates AI-powered insights for labour officials

> **Important:** The AI uses cautious language ("Potentially Eligible", "Needs Verification", "Potential Wage Discrepancy") and never makes unsupported legal conclusions.

---

### Quick Start (Docker)

```bash
# 1. Clone and enter directory
cd migrant-saathi-ai

# 2. Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env — add your IBM watsonx credentials

# 3. Start all services
docker-compose up -d

# 4. Run database migrations
docker-compose exec backend alembic upgrade head

# 5. Seed demo data
docker-compose exec backend python -m app.database.seed

# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

### Manual Setup (without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
alembic upgrade head
python -m app.database.seed
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

### IBM watsonx.ai Configuration

Edit `backend/.env`:

```env
WATSONX_API_KEY=your-ibm-cloud-api-key
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=your-watsonx-project-id
WATSONX_MODEL_ID=ibm/granite-3-8b-instruct
```

**Finding your credentials:**
1. Log into [IBM Cloud](https://cloud.ibm.com)
2. Navigate to watsonx.ai
3. Open your project → Manage → General → Project ID
4. Create an API key: Account → Manage → Access → API Keys
5. Confirm available model IDs in the Model Catalog

> If watsonx credentials are not set, the platform runs in **deterministic-only mode** — all eligibility filtering and wage analysis still works; only natural language explanations are replaced with generic messages.

---

### User Roles & Demo Credentials

| Role | Login | Demo Credentials |
|------|-------|-----------------|
| Migrant Worker | Mobile + OTP | Any mobile number; OTP shown in console (mock mode) |
| Government Official | Email + Password | `official@gujarat.gov.in` / `Demo@1234` |
| Labour Inspector | Email + Password | `inspector@gujarat.gov.in` / `Demo@1234` |
| System Admin | Email + Password | `admin@saathi.ai` / `Admin@1234` |

---

### Architecture

```
REACT FRONTEND (Vite + TypeScript + Tailwind)
       ↓ HTTPS REST
FASTAPI BACKEND (Python 3.11)
       ↓                    ↓
PostgreSQL 15          IBM watsonx.ai
+ pgvector             IBM Granite LLM
(RAG welfare)
       ↓
Redis (OTP / cache)
```

---

### AI Agents

| Agent | Responsibility | Granite Usage |
|-------|---------------|---------------|
| Skill Agent | Extract occupation/skills from natural language | NL extraction |
| Welfare Agent | Match schemes via deterministic filter + explain | Explanation only |
| Wage Agent | Compute discrepancy against reference data + explain | Explanation only |
| Grievance Agent | Classify complaints by category and severity | Classification |
| Dashboard Insight Agent | Generate insights from aggregated stats | Summarization |

---

### ⚠️ Important Notices

- **Welfare scheme data** is labelled `DEMO DATA` — verify against official Gujarat/Central government sources before production use
- **Reference wage data** is labelled `DEMO DATA` — integrate official Minimum Wages Act notifications for production
- **OTP SMS** is mocked for the hackathon demo — integrate MSG91 or Twilio for production
- The AI **never** makes legal conclusions — all outputs use cautious language

---

### Folder Structure

```
migrant-saathi-ai/
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── pages/     # All page components
│       ├── layouts/   # Worker / Gov / Admin layouts
│       ├── components/# Reusable UI components
│       ├── services/  # API service functions
│       ├── store/     # Zustand state stores
│       ├── types/     # TypeScript types
│       └── i18n/      # EN / HI / GU translations
├── backend/           # Python + FastAPI
│   └── app/
│       ├── api/       # Route handlers
│       ├── models/    # SQLAlchemy models
│       ├── schemas/   # Pydantic schemas
│       ├── services/  # AI agents + business logic
│       ├── core/      # Config, security, dependencies
│       └── database/  # Engine, migrations, seed
├── scripts/           # DB init scripts
├── docker-compose.yml
└── README.md
```

---

### License
MIT — Built for hackathon demonstration purposes.
