Supabase Auth + RBAC + RLS + Admin Panel
Migration PRD
Implementation specification for the AI Business Discovery platform
Mission: Secure the existing deterministic discovery platform with authentication, ownership-based RLS, role-based
admin access, and a protected /admin workspace—without breaking the question bank. Gemini remains the
recommendation/diagnosis layer, not the question generator.
1. Product Context
The platform interviews business owners using a grounded question bank. Responses are stored in Supabase and later
analyzed by Gemini to produce a business diagnosis and technology recommendations. This migration adds identity,
authorization, database security, and internal administration.
2. Objectives
• Add Supabase Auth: sign-up, sign-in, sign-out and persistent sessions.
• Create profiles linked 1:1 to auth.users.
• Introduce roles: user and admin.
• Enable RLS on every sensitive public table and create least-privilege policies.
• Ensure a user can only access their own company, interview and answers.
• Create a protected /admin area where the administrator can inspect all authorized business data.
• Preserve the existing deterministic one-question-at-a-time question engine.
• Call Gemini only from the trusted server side for post-interview analysis.
• Never expose service-role, secret, or Gemini API keys to browser code.
3. Target Architecture
NEXT.JS
Public: / /sign-up /sign-in
User: /dashboard /company /interview/[id] /recommendations/[id]
Admin: /admin /admin/companies /admin/companies/[id]
/admin/interviews /admin/interviews/[id]
Browser → Supabase Auth → profile/role → PostgreSQL + RLS
↓
deterministic question bank
↓
completed interview
↓
Next.js server → Gemini
↓
recommendations
4. Roles and Permissions
Permission user admin
Sign up/sign in Yes Yes
Create own company Yes Yes
View/edit own data Yes Yes
View all companies No Yes
View all interviews/answers No Yes
Permission user admin
Access /admin No Yes
Manage question bank No Later
5. Database Model
profiles — id references auth.users.id; full_name; email; role; created_at; updated_at.
role text not null default 'user'
CHECK (role IN ('user','admin'))
companies — id; owner_id → auth.users.id; name; industry; created_at; updated_at.
interviews — id; company_id → companies.id; created_by → auth.users.id; status; started_at; completed_at; timestamps.
answers — id; interview_id → interviews.id; question_id; answer; timestamps.
recommendations — id; interview_id → interviews.id; summary; diagnosis; recommendations; roadmap; model;
created_at.
6. RLS Strategy
Do not disable RLS to silence the Supabase warning. Enable RLS and create policies describing exactly who may access
each row. Company access uses owner_id; interview access derives through its company; answers derive through their
interview.
alter table public.companies enable row level security;
create policy "Users can view own companies"
on public.companies for select to authenticated
using (owner_id = (select auth.uid()));
create policy "Users can create own companies"
on public.companies for insert to authenticated
with check (owner_id = (select auth.uid()));
create policy "Users can update own companies"
on public.companies for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
Create equivalent least-privilege policies for interviews, answers, and recommendations. Do not use a broad
authenticated-can-read-everything policy.
7. Authentication Flow
Landing → Sign Up → account creation → profile creation → /dashboard. Returning users go through Sign In →
/dashboard. Protected routes redirect unauthenticated visitors to /sign-in. Sign-out clears the session.
Profile creation should be automatic and secure. New accounts must default to role=user. Never allow a public client
request to assign itself admin.
8. RBAC and Admin
Use profiles.role for the initial implementation. Admin authorization must be checked server-side; hiding links in React is
not security. During initial setup, manually promote your own account through a trusted database/admin operation.
requireAdmin():
user = authenticated user or redirect('/sign-in')
profile = load profile for user.id
if profile.role != 'admin': redirect('/dashboard')
return user
9. Next.js Routes
Public:
/ /sign-up /sign-in
Authenticated:
/dashboard
/company
/interview/[id]
/recommendations/[id]
Admin:
/admin
/admin/companies
/admin/companies/[id]
/admin/interviews
/admin/interviews/[id]
Protect routes at the server/middleware boundary. UI guards are supplementary only.
10. Admin Panel Requirements
• Dashboard metrics: total companies, active interviews, completed interviews, recommendations generated.
• Companies list with search/filter and status.
• Company detail with business metadata and all related interviews.
• Interview detail showing questions and answers in order.
• Recommendation/diagnosis section showing Gemini output.
• Status states: not started, in progress, completed, analysis pending, analyzed.
• Normal users must never access admin pages or data.
11. Preserve the Question Engine
Do not replace the current question bank. The interview remains deterministic: question bank → one question → answer
saved → next question. This is intentional for V1 because it is predictable, testable, and easy to improve from real user
data.
Authenticated user
↓
Company
↓
Interview
↓
Question Bank
↓
One question at a time
↓
Persist answer
↓
Complete interview
↓
Structured context
↓
Gemini diagnosis/recommendation
12. Gemini Server-Side Integration
The browser should send only an interview identifier to a server endpoint. The server authenticates the requester, checks
ownership or admin role, retrieves the interview and answers, builds the structured Gemini prompt, validates the returned
JSON, and stores the recommendation.
POST /api/interviews/:id/analyze
Browser → Next.js server
→ authenticate
→ verify ownership/admin
→ load interview + answers
→ call Gemini with server-only key
→ validate structured response
→ save recommendation
Suggested response contract: executive_summary, key_problems, root_causes, technology_opportunities,
recommended_solutions, priority, expected_impact, implementation_roadmap, assumptions, confidence.
13. Environment Variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # server only, if required
GEMINI_API_KEY=... # server only
Use the variable names compatible with the project's installed Supabase SDK. Never use NEXT_PUBLIC_ for a secret
credential.
14. Security Requirements
• Enable RLS on every sensitive public table.
• Never expose service-role/secret keys to client bundles.
• Never expose GEMINI_API_KEY to the browser.
• Never let the client assign or change its own role.
• Never authorize admin access only by comparing an email in frontend code.
• Validate ownership before loading any interview by ID.
• Prevent users from changing owner_id/company_id to gain access to another company's records.
• Use foreign keys and deliberate cascading deletes.
• Validate Gemini JSON before persistence.
• Do not log passwords, access tokens, or unnecessary sensitive business information.
15. Migration Order
1. Inspect the existing schema, migrations, question bank, auth state and environment variables.
2. Create profiles and secure default user role.
3. Add owner_id/created_by relationships where missing.
4. Enable RLS table-by-table.
5. Write and test least-privilege RLS policies.
6. Implement sign-up/sign-in/sign-out/session handling.
7. Protect authenticated and admin routes.
8. Build /admin company and interview inspection.
9. Reconnect the existing question engine to authenticated ownership.
10. Implement server-side Gemini analysis and recommendation persistence.
11. Run cross-user access and privilege-escalation tests.
12. Run lint/typecheck/build and fix regressions.
16. Acceptance Tests
1. A new account can sign up and receives role=user.
2. A profile is created for the authenticated account.
3. A user can create a company and owner_id equals auth.uid().
4. A user can only read/update their own company.
5. Changing a company/interview ID in a request cannot reveal another user's data.
6. A user can complete the existing interview and answers persist.
7. A normal user cannot open /admin.
8. An admin can open /admin and inspect all authorized companies/interviews.
9. A normal user cannot promote themselves to admin.
10. Sensitive tables have RLS enabled and appropriate policies.
11. The existing question bank remains unchanged in behavior.
12. Gemini is called only after sufficient interview data exists.
13. Gemini secrets are never included in client code.
14. Gemini output is validated and persisted.
15. Admin can inspect the saved diagnosis/recommendation.
17. Coding-Agent Instruction
Copy this section directly into your coding agent:
Implement this migration in the existing Next.js + Supabase project. First inspect the repository, current
schema/migrations, question bank, interview flow, authentication state, and environment variables. Do not rewrite working
features unnecessarily.
Add Supabase Auth with sign-up/sign-in/sign-out and protected routes. Create profiles linked to auth.users with a secure
default role=user. Add ownership relationships to existing company/interview/answer data. Enable RLS on all sensitive
tables and write least-privilege policies. Add secure admin authorization and a protected /admin area. Preserve the
deterministic one-question-at-a-time question bank exactly as the current V1 source of truth.
Create a server-side Gemini analysis endpoint. It must authenticate the requester, verify that the requester owns the
interview or is an admin, load the structured interview data, call Gemini using a server-only key, validate the structured
response, and save the recommendation. Never expose secret credentials to client code.
Before changing the database, inspect existing migrations and adapt the schema rather than creating duplicates. After
implementation, run typecheck/lint/build where available. Provide a migration summary, changed files, SQL policies,
required environment variables, and manual test steps. Explicitly test a normal user, an admin, cross-user data access,
and attempted privilege escalation.
18. Definition of Done
The migration is complete when users can authenticate, ownership is enforced by RLS, admin access is role-protected,
/admin exposes the required internal data, the existing discovery interview remains functional, Gemini recommendations
work through a server-side boundary, and cross-user/privilege-escalation attempts are rejected.
19. Important Principle
The Supabase warning is a security configuration problem, not a cosmetic UI issue. Fix it with explicit RLS policies,
then test the policies from both a normal user session and an admin session.