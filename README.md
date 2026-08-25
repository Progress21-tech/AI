# AI Business Discovery Agent

An adaptive AI interviewer web application that conducts a 10–15 minute, one-question-at-a-time operational discovery session with business owners and operators. The AI understands how a business operates, identifies friction points and manual bottlenecks, quantifies their impact, and produces a structured **Business Discovery Report**.

---

## 🌟 Overview & Product Vision

Traditional questionnaires and fixed surveys present long lists of static questions that miss critical operational context. The **AI Business Discovery Agent** operates on a dynamic loop:

$$\text{Answer} \longrightarrow \text{Understand} \longrightarrow \text{Reason} \longrightarrow \text{Ask the best next question}$$

### Primary Capabilities:
- **One Question at a Time**: Ensures a focused, conversational experience without overwhelming the user.
- **Understand Before Solving**: Prevents premature software proposals by investigating workflow, frequency, root causes, and workarounds.
- **Adaptive AI Reasoning**: Dynamically ranks candidate questions based on known facts, missing information, detected problems, and time budget (~10-15 mins).
- **Evidence-Based Opportunity Scoring**: Calculates priority scores for every identified problem using the PRD formula:
  $$\text{Opportunity Score} = \text{Pain/Severity} \times \text{Frequency} \times \text{Impact} \times \text{Solution Gap} \times \text{Confidence}$$
- **Pre-Report Human Validation**: Summarizes the AI's understanding before report generation, allowing users to verify accuracy or provide targeted corrections.
- **Comprehensive Business Discovery Report**: Renders an executive summary, business profile, team structure matrix, tech stack information flow map, visual workflow map, scored problems with evidence citations, and an opportunity validation roadmap.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------------+
|                               USER BROWSER                              |
|   Next.js React UI  |  Framer Motion Card Transitions  | Local Storage  |
+------------------------------------+------------------------------------+
                                     |
                         HTTP POST / API Calls
                                     |
+------------------------------------v------------------------------------+
|                             NEXT.JS SERVER                              |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                     INTERVIEW CONTROLLER API                      |  |
|  |  1. Validate Answer   2. Extract Facts     3. Detect Problems    |  |
|  |  4. Rank Unknowns     5. Select Objective   6. Generate Question   |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|               +--------------------+--------------------+               |
|               |                                         |               |
|  +------------v-------------+            +--------------v-------------+ |
|  |    AI PROVIDER LAYER     |            |    SUPABASE / POSTGRESQL   | |
|  | (OpenAI SDK + Structured |            |   Organizations, Users,    | |
|  |  Output + Fallback Engine|            |   Interviews, Questions,   | |
|  +--------------------------+            |   Answers, Facts, Reports  | |
|                                          +----------------------------+ |
+-------------------------------------------------------------------------+
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router), TypeScript, React 18
- **UI & Motion**: Tailwind CSS, Framer Motion (`framer-motion`), Lucide Icons (`lucide-react`), Geist / Inter typography
- **AI Engine**: OpenAI Node API SDK (`openai`), Zod schema validation, `AIProvider` abstraction with deterministic accounting firm fallback engine
- **Database & Auth**: Supabase PostgreSQL (`@supabase/supabase-js`, `@supabase/ssr`) with Row-Level Security (RLS)
- **State Persistence**: React state + `localStorage` synchronization (survives page refreshes F5)

---

## 🗄️ Database Schema

The database schema (`supabase/schema.sql`) includes 12 relational tables with RLS data isolation:

1. **`organizations`**: Business entity details.
2. **`users`**: User profiles associated with organizations.
3. **`interviews`**: Session metadata, status (`in_progress`, `validation`, `completed`), and phase tracking.
4. **`questions`**: Generated questions with objective, category, question type, and sequence.
5. **`answers`**: Recorded text answers and selected option arrays.
6. **`business_facts`**: Structured facts extracted by the AI with confidence scores.
7. **`workflows`**: Operational processes identified during discovery.
8. **`workflow_steps`**: Sequential steps, responsible roles, tools, and pain levels (1-10).
9. **`problems`**: Detected operational problems, severity, frequency, time impact, financial impact, workaround, root cause, and confidence.
10. **`problem_evidence`**: Links specific answers as supporting evidence for detected problems.
11. **`reports`**: Final generated discovery report payloads and quality scores.
12. **`decision_logs`**: Admin/developer observability logs capturing model latency, phase transitions, and decision metadata.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18.0.0 or higher
- npm or yarn

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```env
# OpenAI API Key (Optional: system automatically uses deterministic engine if omitted)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Credentials (Optional: system runs with local storage fallback if omitted)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Test
```bash
npm run build
npm run start
```

---

## 📋 Interview Experience Flow

1. **Landing Screen (`/`)**:
   - Introduction text: *"Let's understand how your business actually works. I'll ask one question at a time and adapt the interview based on your answers."*
   - Estimated duration: 10–15 minutes.
   - Privacy guarantee: No passwords, bank details, tax IDs, or sensitive client names requested.

2. **One-Question Interview Card (`/interview/[id]`)**:
   - Header displaying live progress bar, phase badge, and `~8 min left` time estimate.
   - Question types:
     - **Single Choice (60–70%)**: Selectable radio cards for fast responses.
     - **Multiple Choice**: Checkbox options for multi-factor selections.
     - **Short Text / Numeric (20–30%)**: Inputs for team size, client count, hours/week, software names.
     - **Open-Ended (5–10%)**: Textarea for rich natural explanations.
   - Motion animation: Smooth `fade + translateY` transitions between questions.

3. **Human Validation Screen**:
   - Displays: *"Here is what I believe I understand about your business and its biggest operational challenges."*
   - Asks: *"Is this accurate?"*
   - Options:
     1. *"Yes, that's accurate"*
     2. *"Mostly accurate, but something is missing"*
     3. *"No, I need to correct it"*

4. **Business Discovery Report**:
   - **Executive Summary**: High-level overview of operational bottlenecks.
   - **Business Profile & Team Matrix**: Industry, team size, client count, task assignment methods.
   - **Tech Stack & Information Flow Map**: Software tools and manual data entry gaps.
   - **Workflow Map**: Sequential step breakdown highlighting pain points.
   - **Ranked Problems**: Ranked by Opportunity Score with supporting interview evidence citations.
   - **Opportunity Validation Roadmap**: Actionable experiment recommendations.
   - **Core Quality Feedback**: 1–5 score rating prompt (*"How accurately did this interview identify the most important problems in your business?"*).

---

## 🔒 Guardrails & Observability

- **No Invented Facts**: The AI strictly extracts stated facts and marks missing values as unknown.
- **Privacy First**: Explicitly avoids requesting passwords, credentials, bank accounts, tax IDs, or private client names.
- **No Chain-of-Thought Leakage**: System instructions and reasoning steps remain server-side.
- **Observability Logging**: Telemetry captures model latency, token usage, objective rationale, and confidence scores for ongoing evaluation.

---

## 📜 License

MIT License. Built with Next.js and Antigravity AI Architecture.
