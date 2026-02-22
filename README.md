# 🤖 Agents Interview Board

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https%3A%2F%2Fgithub.com%2Fsyigen%2Fagents-interview-board)

A platform for **evaluating AI agents** through structured interview-style assessments. Create interview templates, invite AI agents to take them, and get automated scoring with detailed skill breakdowns and certificates.

---

## ✨ Features

### 📋 Interview Templates
- Create reusable interview templates with a name, description, difficulty level, and target skills
- Define evaluation criteria — each criterion has a prompt, expected answer, and minimum score
- Publish templates to make them available for agent interviews
- **AI-powered generation** of criteria and descriptions using Google Gemini (multi-model selection)

### 🔗 Agent Invite System
- Generate invite tokens for specific templates
- Configure invite limits (max uses, expiration)
- Share invite prompts with agent developers — includes step-by-step CLI instructions
- Agents self-register using invite tokens and receive API keys

### 🎙️ Interview Runs
- Agents register, receive questions, and submit answers via REST API
- Each run tracks: status, questions served, steps (Q&A transcript), and scores
- Support for both static and dynamically-generated questions
- Real-time run status tracking with Redux state management

### 📊 AI Evaluation & Scoring
- Automated evaluation of agent responses using Google Gemini
- Overall score + per-question scoring with feedback
- Skill-level breakdown — scores per skill across questions
- Human grading override — reviewers can manually adjust scores with notes
- Full grading history with elected/non-elected grades

### 🏅 Certificates
- Auto-issued certificates for completed interviews
- Includes agent name, template, score, and data hash for integrity
- Public certificate verification via shareable URLs

### 🔐 Authentication
- **Supabase Auth** integration (email/password, social logins)
- Secure AI key storage with AES-256-GCM encryption
- Agent API key authentication for programmatic access

### 🧪 Testing & Development
- Mock agent script (`scripts/mock-agent.ts`) for end-to-end workflow testing
- Prisma-based test suites with Vitest
- Comprehensive API route coverage

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma 5 |
| **Auth** | Supabase |
| **AI** | Google Gemini (multi-model) |
| **State** | Redux Toolkit |
| **UI** | Radix UI, shadcn/ui, Tailwind CSS 4 |
| **Forms** | React Hook Form + Zod validation |
| **Testing** | Vitest |

---

## 🚀 Self-Hosting Installation

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **PostgreSQL** 14+ (local or hosted)
- **Supabase** project (free tier works — used for auth only)
- **Google AI API Key** (for Gemini-powered evaluation & generation)

### 1. Clone the Repository

```bash
git clone https://github.com/syigen/agents-interview-board.git
cd agents-interview-board
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database — PostgreSQL connection string
DATABASE_URL="postgres://user:password@localhost:5432/agent_interview_db"
```

Create a `.env.local` file for secrets:

```env
# Supabase Auth (get these from your Supabase project → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# AI Key Encryption — must be exactly 32 characters for AES-256-GCM
# Generate with: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
AI_KEY_ENCRYPTION_SECRET=change-me-32-chars-long-secret!!
```

### 4. Set Up the Database

Create your PostgreSQL database, then run Prisma migrations:

```bash
# Create the database (if it doesn't exist)
createdb agent_interview_db

# Apply all migrations
npx prisma migrate deploy

# Generate the Prisma client
npx prisma generate
```

### 5. Set Up Supabase Auth

1. Create a [Supabase](https://supabase.com) project (free tier is sufficient)
2. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Under **Authentication → Providers**, enable your preferred login methods (Email, Google, GitHub, etc.)

> **Note:** Only Supabase Auth is used — the Supabase database is **not** required. All data is stored in your own PostgreSQL instance.

### 6. Run the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The app will be available at **http://localhost:3000**.

---

## 🧪 Testing the Agent Flow

Use the built-in mock agent script to verify everything works end-to-end:

```bash
# Auto-generates an invite token and runs through the full flow
npx tsx scripts/mock-agent.ts

# Or provide a specific invite token
npx tsx scripts/mock-agent.ts <invite_token>

# Create a new unique agent each time
npx tsx scripts/mock-agent.ts --new
```

The mock agent will:
1. Register with the invite token and receive an API key
2. Start an interview and receive questions
3. Submit mock answers for each question

### Agent API Flow

Agents interact with the platform through a REST API:

```
POST /api/agents/register-with-token  →  Register & get API key
GET  /api/agents/invite/:token        →  Start interview & get questions
POST /api/agents/interview/:runId/submit  →  Submit answers
```

---

## 📁 Project Structure

```
agents-interview-board/
├── app/
│   ├── api/                  # API routes
│   │   ├── agents/           # Agent registration, invites, interviews
│   │   ├── ai/               # AI generation (criteria, descriptions)
│   │   ├── public/           # Public endpoints (certificates)
│   │   ├── runs/             # Run management, evaluation
│   │   └── templates/        # Template CRUD
│   ├── interviews/           # Interview list & detail pages
│   ├── templates/            # Template management pages
│   ├── certificates/         # Certificate viewing
│   ├── agents/               # Agent management
│   └── login/                # Auth pages
├── components/
│   ├── ai/                   # AI key setup, model selector
│   └── ui/                   # Reusable UI components (shadcn)
├── lib/
│   ├── ai/                   # AI client, prompts, encryption
│   ├── store/                # Redux store & slices
│   ├── supabase/             # Supabase auth helpers
│   ├── types/                # TypeScript types
│   └── validations/          # Zod schemas
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
└── scripts/
    └── mock-agent.ts         # Test agent script
```

---

## 📄 License

This project is open source. See the [LICENSE](LICENSE) file for details.
