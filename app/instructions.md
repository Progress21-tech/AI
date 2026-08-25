AI Business Discovery Agent

No-Authentication + Company Identity + Supabase Implementation

Purpose: Replace the current authentication-dependent flow with a simple company-first identity system while keeping Supabase as the persistent database.

1. Architecture Decision

For the current V1, do not require authentication.

The product is being validated with real businesses. The first identity should therefore be the business itself.

The new flow is:

LANDING PAGE
    ↓
ENTER COMPANY NAME
    ↓
Create Company
    ↓
Create Interview
    ↓
Generate Interview ID
    ↓
Start Discovery
    ↓
Save every answer
    ↓
Complete Interview
    ↓
AI Diagnosis
    ↓
Recommendations

The company name becomes the first required piece of information.

2. What Changes

Remove authentication requirements from the discovery experience.

Do not require:

email/password

Google login

magic link

account creation

Supabase Auth session

user login before starting an interview

Instead collect:

Required

Company Name

Recommended

Respondent Name
Respondent Role
Email
Phone

The additional fields can be optional during V1.

3. Important Security Principle

No authentication does NOT mean no security.

Do not expose the Supabase service-role key in the browser.

Never use:

NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=

The service-role key must remain server-side only.

The browser should never receive it.

4. Recommended Architecture

                    BROWSER
                       |
                       | HTTPS
                       v
                NEXT.JS SERVER
                       |
          +------------+------------+
          |                         |
      Supabase                  Gemini
          |                         |
          v                         v
    Business Data             AI Analysis

The browser talks to your Next.js application.

Your Next.js server communicates with Supabase.

This makes it possible to change the database/security architecture later without rewriting the UI.

5. Company-First User Experience

The first screen of discovery should be extremely simple.

Example:

Let's start with the business.

What is the name of your company?

┌──────────────────────────────────────┐
│ Enter company name                   │
└──────────────────────────────────────┘

                    Continue →

After Continue:

Great.

Who are you?

┌──────────────────────────────────────┐
│ Your name (optional)                 │
└──────────────────────────────────────┘

What is your role?

┌──────────────────────────────────────┐
│ Owner / Director / Manager / Other   │
└──────────────────────────────────────┘

                    Continue →

Then the actual business discovery begins.

6. Company Table

Create a companies table.

Recommended fields:

id
name
slug
industry
website
size
created_at
updated_at

SQL:

create table public.companies (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  slug text unique,

  industry text,
  website text,
  size text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

The company name is mandatory.

7. Interview Table

Create an interviews table.

create table public.interviews (
  id uuid primary key default gen_random_uuid(),

  company_id uuid not null
    references public.companies(id)
    on delete cascade,

  respondent_name text,
  respondent_role text,
  respondent_email text,
  respondent_phone text,

  status text not null default 'in_progress',

  current_question_id text,

  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  completed_at timestamptz,

  target_duration_seconds integer not null default 900,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

Status values:

in_progress
completed
abandoned
analysis_pending
analyzed

8. Questions Table

You can either keep the question bank in TypeScript files or store it in Supabase.

For V1, keeping the authoritative question definitions in code is simpler.

However, store the questions actually used in an interview.

Create:

create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),

  interview_id uuid not null
    references public.interviews(id)
    on delete cascade,

  question_key text not null,

  question_text text not null,

  question_type text not null,

  sequence_number integer not null,

  displayed_at timestamptz not null default now(),

  answered_at timestamptz
);

This gives you a historical record of exactly what the interview asked.

9. Answers Table

Create:

create table public.answers (
  id uuid primary key default gen_random_uuid(),

  interview_id uuid not null
    references public.interviews(id)
    on delete cascade,

  question_id uuid not null
    references public.interview_questions(id)
    on delete cascade,

  answer_text text,
  answer_json jsonb,

  created_at timestamptz not null default now()
);

Use answer_json for structured responses such as:

{
  "selected": ["whatsapp", "excel"]
}

For a text answer:

{
  "text": "We currently use spreadsheets."
}

10. Business Facts

Create a structured facts table:

create table public.business_facts (
  id uuid primary key default gen_random_uuid(),

  interview_id uuid not null
    references public.interviews(id)
    on delete cascade,

  category text not null,
  key text not null,
  value jsonb,

  source_answer_id uuid
    references public.answers(id)
    on delete set null,

  created_at timestamptz not null default now()
);

Examples:

employee_count = 14
industry = accounting
uses_payroll = true
uses_inventory = false

11. Problems

Create:

create table public.problems (
  id uuid primary key default gen_random_uuid(),

  interview_id uuid not null
    references public.interviews(id)
    on delete cascade,

  title text not null,
  description text,

  frequency text,
  severity integer,
  people_affected integer,
  time_impact_hours_per_week numeric,
  financial_impact numeric,

  current_solution text,

  created_at timestamptz not null default now()
);

These can initially be populated from structured interview answers.

Later, AI can enrich or classify them.

12. Recommendations

Create:

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),

  interview_id uuid not null
    references public.interviews(id)
    on delete cascade,

  title text not null,
  type text not null,

  problem_solved text,
  evidence jsonb,

  why_it_matters text,

  expected_impact jsonb,

  implementation_difficulty text,
  priority text,

  suggested_approach text,
  risks jsonb,
  next_step text,

  created_at timestamptz not null default now()
);

13. Reports

Create:

create table public.reports (
  id uuid primary key default gen_random_uuid(),

  interview_id uuid not null
    references public.interviews(id)
    on delete cascade,

  executive_summary text,

  business_snapshot jsonb,
  major_problems jsonb,
  opportunities jsonb,
  roadmap jsonb,

  raw_ai_output jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

14. Database Relationship

The final structure becomes:

COMPANY
   |
   +---- INTERVIEW
           |
           +---- INTERVIEW QUESTIONS
           |
           +---- ANSWERS
           |
           +---- BUSINESS FACTS
           |
           +---- PROBLEMS
           |
           +---- RECOMMENDATIONS
           |
           +---- REPORT

This is much better than trying to identify everything through a user account.

15. Starting an Interview

When the user enters:

Company: Example Accounting Ltd

The frontend calls:

POST /api/interview/start

Payload:

{
  "companyName": "Example Accounting Ltd",
  "respondentName": "John Doe",
  "respondentRole": "Managing Director"
}

The server:

validates the input

searches for the company

creates it if it doesn't exist

creates an interview

returns the interview ID

Response:

{
  "interviewId": "uuid",
  "companyId": "uuid"
}

Then redirect:

/discovery/{interviewId}

16. Do Not Use Company Name as the Primary Key

The company name is an identity field, not a database identifier.

Do NOT do:

company name → primary key

Instead:

company name
     ↓
company UUID
     ↓
interview UUID

Company names can change and two businesses can have similar names.

UUIDs remain stable.

17. Company Deduplication

When a company name is entered, do not blindly create duplicates.

For V1:

Normalize name
     ↓
Search existing company
     ↓
If found → use existing company
If not found → create company

Example normalization:

"ABC ACCOUNTING LTD"
"ABC Accounting Ltd."
"abc accounting ltd"

should be treated as potentially the same company.

Do not automatically merge businesses with ambiguous names.

18. Interview Identity

Every interview receives its own UUID.

This is important.

A company can eventually have:

Company
  |
  +-- Interview 2026-01
  |
  +-- Interview 2026-06
  |
  +-- Interview 2027-01

This allows you to perform future assessments and compare progress.

19. Resume Without Authentication

Because there is no login, use the interview ID.

The URL:

/discovery/8c4c...uuid

identifies the interview.

Store the ID locally as well:

localStorage.setItem(
  "discovery_interview_id",
  interviewId
);

If the browser is refreshed, the application can resume the same interview.

20. Optional Resume Code

For a more polished system, generate a short resume code:

ABC-4829

The user can use:

Resume my interview

and enter:

ABC-4829

This can be added later.

For the first version, the UUID-based URL is sufficient.

21. Supabase Client Architecture

Use two clients.

Browser client

Use only the public anon key.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

Server client

Use the service-role key only inside server-side code.

SUPABASE_SERVICE_ROLE_KEY=

Never prefix it with:

NEXT_PUBLIC_

Never import server-only Supabase code into a Client Component.

22. Recommended Next.js Separation

Client Component
       |
       ↓
/api/interview/start
       |
       ↓
Server
       |
       ↓
Supabase

Not:

Client Component
       |
       ↓
Supabase service role

The second architecture is unsafe.

23. Supabase Environment Variables

Use:

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

SUPABASE_SERVICE_ROLE_KEY=...

The service-role key is server-only.

For the current unauthenticated interview flow, most database mutations should happen through your Next.js API routes.

24. RLS Strategy

Because the public user does not authenticate, do not simply enable unrestricted anonymous access to every table.

Recommended V1 approach:

Browser
  ↓
Next.js API
  ↓
Server-side Supabase client
  ↓
Database

The server validates:

interview ID

request data

question ID

answer format

interview status

allowed state transitions

Then performs database operations.

This prevents arbitrary clients from directly manipulating your database.

25. RLS

Enable RLS:

alter table public.companies enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.answers enable row level security;
alter table public.business_facts enable row level security;
alter table public.problems enable row level security;
alter table public.recommendations enable row level security;
alter table public.reports enable row level security;

For the V1 server-mediated architecture, keep public direct database permissions minimal.

Do not create a policy such as:

Anyone can read everything.
Anyone can update everything.

The server should control access.

26. API Validation

Every API route must validate input.

For example:

/company/start

must reject:

empty company name
extremely long company name
invalid data types
malformed UUIDs

Use Zod.

Example:

const startInterviewSchema = z.object({
  companyName: z.string().trim().min(2).max(200),
  respondentName: z.string().trim().max(150).optional(),
  respondentRole: z.string().trim().max(150).optional(),
  respondentEmail: z.string().email().optional(),
  respondentPhone: z.string().max(40).optional()
});

27. Interview Answer Security

When receiving:

POST /api/interview/[id]/answer

the server must verify:

interview exists

interview is still active

question belongs to that interview

question has not already been answered

answer matches the question type

answer is within size limits

next question is valid

Only then save it.

28. Current Question

Store:

current_question_id

inside interviews.

When the user submits an answer:

current_question_id
        ↓
validate
        ↓
save answer
        ↓
calculate next question
        ↓
update current_question_id

This makes the server the source of truth.

29. Deterministic Interview Engine

Create:

src/lib/interview/engine.ts

Responsibilities:

getInitialQuestion()
getNextQuestion()
evaluateConditions()
validateAnswer()
calculateProgress()
isInterviewComplete()

The engine must not call Gemini.

30. Example Question Condition

{
  id: "payroll_004",
  question: "How is payroll currently prepared?",
  conditions: [
    {
      questionId: "payroll_001",
      operator: "equals",
      value: true
    }
  ]
}

If payroll is not used:

skip payroll_004

31. AI Analysis Input

After the interview is complete, create a clean analysis object:

{
  company: {
    name,
    industry,
    size
  },

  respondent: {
    name,
    role
  },

  businessFacts: [],

  workflows: [],

  problems: [],

  answers: [],

  technologyStack: [],

  goals: []
}

Send this to Gemini.

Do not simply dump random chat messages into the model.

Give the AI structured business information.

32. AI Failure Behavior

If Gemini fails:

Interview remains completed.
Answers remain saved.
Company remains saved.

Set:

status = analysis_pending

Then retry analysis.

Never force the user to repeat the interview because an AI request failed.

33. Interview Status

Use:

in_progress
completed
analysis_pending
analyzed

Flow:

in_progress
      ↓
completed
      ↓
analysis_pending
      ↓
analyzed

If analysis fails:

analysis_pending
      ↓
retry
      ↓
analyzed

34. Company Dashboard — Later

Do not build a full dashboard yet.

But structure the database so you can eventually have:

Company
  ↓
Business Profile
  ↓
Discovery History
  ↓
Problems
  ↓
Recommendations
  ↓
Implementation Projects

This becomes useful when you start offering technology implementation services.

35. Future Authentication

Authentication should be a later layer.

V1:

Company → Interview

V2:

User
  ↓
Company
  ↓
Interviews

V3:

Organization
   ↓
Users
   ↓
Companies
   ↓
Interviews
   ↓
Projects

Do not build the V3 architecture before validating V1.

36. Recommended Folder Structure

src/
├── app/
│   ├── page.tsx
│   ├── discovery/
│   │   └── [interviewId]/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── interview/
│       │   ├── start/
│       │   │   └── route.ts
│       │   └── [interviewId]/
│       │       ├── route.ts
│       │       └── answer/
│       │           └── route.ts
│       │
│       └── analysis/
│           └── [interviewId]/
│               └── route.ts
│
├── components/
│   └── interview/
│
├── data/
│   └── questions/
│
├── lib/
│   ├── interview/
│   │   ├── engine.ts
│   │   ├── conditions.ts
│   │   ├── validation.ts
│   │   └── timer.ts
│   │
│   ├── ai/
│   │   ├── analyzer.ts
│   │   └── providers/
│   │       └── gemini.ts
│   │
│   └── supabase/
│       ├── server.ts
│       └── browser.ts
│
└── types/

37. Supabase Server Client

Create a server-only module.

Conceptually:

import "server-only";

Then create the Supabase client using:

SUPABASE_SERVICE_ROLE_KEY

This module must never be imported by browser components.

38. Supabase Browser Client

If the frontend needs direct public Supabase functionality, use:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

However, for this V1, prefer going through Next.js API routes for interview mutations.

This keeps the security model simpler.

39. First Screen Implementation

Create a dedicated component:

CompanyIdentityStep

Fields:

Company Name *
Respondent Name
Respondent Role
Email
Phone

Only company name is required.

On submit:

POST /api/interview/start

Then:

router.push(`/discovery/${interviewId}`)

40. Do Not Ask Company Name Again

Once stored, the interview context should contain:

companyName
companyId
interviewId

The rest of the discovery should reference that information.

The question engine should never ask:

What is your company name?

again.

41. Data Lifecycle

Company entered
       ↓
Company record created
       ↓
Interview created
       ↓
Question displayed
       ↓
Answer saved
       ↓
Next question
       ↓
...
       ↓
Interview completed
       ↓
AI analysis
       ↓
Recommendations saved
       ↓
Report saved

Every important stage is persisted.

42. Implementation Order

Follow this exact order:

Phase 1 — Database

Create companies.

Create interviews.

Create interview_questions.

Create answers.

Create business_facts.

Create problems.

Create recommendations.

Create reports.

Enable RLS.

Verify the schema in Supabase.

Phase 2 — Server

Configure server Supabase client.

Configure browser client if needed.

Build /api/interview/start.

Build /api/interview/[id].

Build /api/interview/[id]/answer.

Add validation.

Add interview state management.

Phase 3 — UI

Build Company Identity step.

Connect it to /api/interview/start.

Redirect to interview.

Load saved interview.

Display one question.

Save answers.

Display next question.

Add progress.

Add timer.

Add resume behavior.

Phase 4 — AI

Complete interview without Gemini.

Test database persistence.

Build analysis input.

Connect Gemini.

Validate AI output.

Save recommendations.

Generate report.

43. Acceptance Criteria

The implementation is successful when:

No login is required.

Company name is the first required field.

A company is created/stored in Supabase.

An interview is created and linked to that company.

Every answer is linked to that interview.

Refreshing does not lose progress.

Interview IDs uniquely identify sessions.

No service-role key reaches the browser.

RLS is enabled.

Server routes validate all incoming data.

The question engine works without AI.

Gemini is only used for analysis/recommendations.

AI failures do not destroy interview data.

A completed interview can be analyzed again without repeating it.

44. Testing Checklist

Database

[ ] Company created
[ ] Interview created
[ ] Foreign keys work
[ ] Answers save
[ ] Data survives refresh
[ ] RLS enabled

Interview

[ ] Company name required
[ ] Optional respondent information works
[ ] First question loads
[ ] One question shown
[ ] Conditional logic works
[ ] Progress works
[ ] Timer works
[ ] Resume works

Security

[ ] Service-role key is server-only
[ ] No service-role key in NEXT_PUBLIC variables
[ ] API validates UUIDs
[ ] API validates answer types
[ ] API prevents answers to unrelated interviews
[ ] API prevents modifying completed interviews

AI

[ ] Interview works with Gemini disabled
[ ] Analysis starts after completion
[ ] Gemini output is validated
[ ] Recommendations save
[ ] Failed analysis can be retried

45. Exact Coding-Agent Instruction

Give your coding agent this instruction:

Refactor the current project so that authentication is NOT required for the discovery interview.

The first step of the interview must be a Company Identity screen where the user enters the company name. Company name is required. Respondent name, role, email and phone are optional.

When the user submits the company name, call a server-side Next.js API route. The server must create or find the company in Supabase, create a new interview linked to that company, and return an interview UUID.

Redirect the user to /discovery/[interviewId].

Create a companies table and an interviews table, with interviews.company_id referencing companies.id. Create interview_questions and answers tables so every question and answer is linked to the interview.

Do not use Supabase Auth for this V1 interview flow.

Do not expose the Supabase service-role key to the browser. Use the service-role key only in server-side modules. Never create a NEXT_PUBLIC service-role variable.

Enable Supabase Row Level Security and keep direct public database access restricted. Prefer performing interview mutations through Next.js server API routes.

The browser should not directly perform privileged database mutations.

Implement:
POST /api/interview/start
GET /api/interview/[interviewId]
POST /api/interview/[interviewId]/answer
POST /api/interview/[interviewId]/complete
POST /api/analysis/[interviewId]

The interview must work without Gemini.

Use the deterministic question bank and conditional interview engine. Gemini must only be called after the interview is completed for business analysis and recommendations.

Persist interview state, answers, problems, recommendations and reports in Supabase.

Use Zod to validate all API inputs.

Do not allow an answer to be submitted to an interview it does not belong to.

Do not allow modification of a completed interview.

Make the application recover the interview after a page refresh using the interview UUID.

Preserve the existing landing page and visual design: white/black theme, clean sans-serif typography, glassmorphism cards, motion, responsiveness and one-question-at-a-time experience.

Do not add authentication back into the discovery flow.

Build the database and server architecture first, test it, then connect the UI.

46. Final Architecture

                    USER
                     |
                     v
              COMPANY NAME
                     |
                     v
              NEXT.JS SERVER
                     |
              +------+------+
              |             |
              v             v
           COMPANY       INTERVIEW
              |             |
              +------+------+
                     |
                     v
              DISCOVERY ENGINE
                     |
              PREDEFINED QUESTIONS
                     |
              CONDITIONAL LOGIC
                     |
                     v
                  ANSWERS
                     |
                     v
                  SUPABASE
                     |
                     v
                INTERVIEW DONE
                     |
                     v
                GEMINI ANALYZER
                     |
          +----------+----------+
          |          |          |
       Problems  Opportunities Strategy
          |          |          |
          +----------+----------+
                     |
                     v
                FINAL REPORT

Final Product Principle

For your current stage, a business does not need an account to be diagnosed.

You only need to know:

Which company is being analyzed?

That gives you enough identity to store the discovery, build the diagnosis, and later return to that company's history.

Authentication can come when you turn this into a real SaaS platform.