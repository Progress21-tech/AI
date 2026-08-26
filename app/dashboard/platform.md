Platform Redesign — No User Login, Short Interview, No AI, Admin-Only Dashboard

Objective

Redesign the platform around this simple flow:

Respondent: Open link → answer 10–15 questions → submit → done.

Admin: Sign in → see companies → click a company → see every question and every response.

The respondent should have almost zero friction. Remove respondent accounts, Google authentication, and AI from the interview experience. Keep authentication for the admin only.

1. Remove Respondent Authentication

Respondents must NOT need:

Sign up

Sign in

Google authentication

Email/password

Supabase user accounts

Respondent passwords

Respondent onboarding

The public discovery/interview must work without an authenticated Supabase session.

Keep admin authentication.

Public flow

Open discovery link
      ↓
Short introduction
      ↓
Start
      ↓
Question 1
      ↓
Question 2
      ↓
...
      ↓
Question 10–15
      ↓
Submit
      ↓
Thank-you screen

Admin flow

/sign-in
   ↓
/admin
   ↓
/admin/companies
   ↓
/admin/companies/[id]
   ↓
Full company + full responses

Do not remove the authentication infrastructure required by the admin.

2. Protect Only the Admin

Keep:

requireAdmin()

for admin routes.

Protect:

/admin
/admin/*

Do NOT protect the respondent interview.

The middleware should not redirect public respondents to /sign-in.

Conceptually:

const protectedPaths = ['/admin'];

Do not add /discovery to the protected paths.

3. Remove Google Authentication From the Respondent Experience

Remove Google login/signup from the respondent-facing product.

If Google OAuth is still useful for the admin account, keep it available for admin authentication.

Do not make respondents authenticate just to answer the interview.

4. Reduce the Interview to 10–15 Questions

Target approximately 10–12 questions, with an absolute maximum of around 15.

The interview should feel quick.

Avoid:

20+ questions

Long forms

Repeated questions

Unnecessary fields

Questions that do not help understand the business/problem

Use one question at a time.

Example:

Question 4 of 12

What is the biggest operational
challenge your company faces?

[ Type your answer... ]

                    Next →

At the end:

You're done.

[ Submit responses ]

5. Use Fixed Questions

Questions should be predefined.

Do not dynamically generate questions with AI.

They can live in the database or a clear TypeScript configuration.

Example:

const questions = [
  {
    key: 'company_name',
    text: 'What is the name of your company?',
  },
  {
    key: 'industry',
    text: 'What industry does your company operate in?',
  },
  {
    key: 'main_problem',
    text: 'What is the biggest problem your business is currently facing?',
  },
];

Use the existing question system if it already works; simply reduce and simplify it.

6. Remove AI From the Interview

The respondent experience must contain zero AI processing.

Remove AI calls from the active interview flow.

Do NOT:

Analyze every answer with AI

Generate follow-up questions with AI

Generate the next question with AI

Generate recommendations during the interview

Wait for an AI response before showing the next question

The flow should simply be:

Submit answer
    ↓
Save answer
    ↓
Show next question

No AI call in between.

Search the project for things such as:

generateContent
Gemini
GoogleGenerativeAI
generateDiscoveryReport
generateRecommendation
analyze

Determine what is actually used. Remove or isolate unused AI functionality so it cannot become part of the active interview flow.

7. Persist Every Answer

Every answer must be saved.

The source of truth should be Supabase, not only React/frontend state.

When a respondent answers:

Answer
  ↓
Save to Supabase
  ↓
Next question

The respondent should not lose all answers because of a refresh or temporary UI problem.

Use the existing:

companies
interviews
interview_questions
answers

structure where possible.

8. Public Interview Identification

Because respondents are no longer authenticated, do not depend on:

auth.user.id

to identify them.

Create an interview/session ID when the interview starts.

For example:

POST /api/interview/start
       ↓
create interview
       ↓
return interview_id

Use the interview UUID throughout the interview.

The relationship should remain:

Company
  ↓
Interview
  ↓
Questions
  ↓
Answers

9. Company Creation and Linking

Create or link the company to the interview.

Avoid creating duplicate companies unnecessarily.

Each completed response must be traceable to a company.

If the existing schema already supports:

company_id
interview_id

reuse it.

Do not add database columns blindly. Inspect the existing schema first.

10. Admin Dashboard

The admin dashboard is now the main internal product.

Route:

/admin

It should show useful high-level metrics such as:

Total companies

Total interviews

Active interviews

Completed interviews

Recent submissions

But the most important function is:

The admin must be able to inspect the complete responses from every company.

11. Admin Companies Page

Route:

/admin/companies

Show companies in a clean responsive list/table.

Include:

Company name

Industry

Size

Interview status

Submission date

Each company must be clickable.

Example:

Acme Healthcare
Healthcare · 11–50 employees
Completed · Aug 27, 2026

View responses →

Clicking should open:

/admin/companies/[id]

12. Company Detail Page

This is critical.

When the admin clicks a company, show:

Company information

Acme Healthcare

Industry:
Healthcare

Size:
11–50 employees

Website:
example.com

Status:
Completed

Submitted:
August 27, 2026

Then show:

Full interview responses

Question 1
What is the biggest problem your business is facing?

Answer:
We spend too much time manually processing...

Question 2
How are you currently solving it?

Answer:
We currently use spreadsheets...

Continue for every question and every answer.

The admin should not have to open separate pages for individual questions.

13. Never Show Only Aggregated Data

Do not reduce a company to:

Company: ABC Ltd
Industry: Healthcare

The admin needs the actual respondent answers.

The navigation should be:

Admin
  ↓
Companies
  ↓
Select company
  ↓
Interview
  ↓
Questions
  ↓
Full answers

14. Admin Interview Detail

Keep:

/admin/interviews
/admin/interviews/[id]

if useful.

The detail page should show:

Company

Interview status

Started time

Completed time

Every question

Every answer

Relevant respondent information

Submission metadata

The raw interview data should be the source of truth.

Do not depend on AI reports.

15. Remove AI Recommendation UI

Since AI is being removed from this MVP, remove/hide:

AI recommendation cards

AI diagnosis sections

"Generating recommendation..."

AI report loading states

AI recommendation buttons

AI-generated reports in the respondent flow

The admin should see the collected data instead.

If AI code is retained for a future version, isolate it from the current production flow.

16. Remove Unnecessary Respondent Pages

Potentially remove:

Respondent sign-up

Respondent sign-in

Respondent account/profile

Google login UI

Password reset for respondents

Respondent account onboarding

Before deleting shared auth code, verify that admin authentication still uses it.

17. Public vs Admin Routes

The architecture should look like:

PUBLIC

/
 /discovery
 /discovery/[id]
 /api/interview/start
 /api/interview/answer
 /api/interview/complete


ADMIN

/sign-in
/admin
/admin/companies
/admin/companies/[id]
/admin/interviews
/admin/interviews/[id]

Adjust route names to the actual project.

Public interview endpoints must not require a logged-in respondent.

Admin data endpoints must enforce admin authorization server-side.

18. Mobile UX

The respondent experience must be mobile-first.

Requirements:

Large readable questions

Large input controls

Large tap targets

No horizontal scrolling

One question per screen

Clear progress indicator

Comfortable spacing

Responsive textareas

Simple navigation

Avoid making respondents pinch/zoom or scroll through a giant form.

19. Admin Dashboard UX

The admin dashboard should prioritize information over decoration.

The admin should quickly answer:

Who responded?

Which company are they from?

Did they complete the interview?

What did they say?

When did they submit?

On desktop, a table/grid is fine.

On mobile, use stacked company cards.

20. Company Response Card

A good mobile-friendly company card can look like:

┌───────────────────────────────┐
│ Acme Healthcare               │
│ Healthcare · 11–50 employees  │
│                               │
│ Completed                     │
│ Aug 27, 2026                  │
│                               │
│ View responses →              │
└───────────────────────────────┘

21. Full Response UI

Prioritize readability.

Use:

QUESTION

What is the biggest operational
challenge your company faces?


ANSWER

We spend too much time manually
processing customer requests...

Repeat this for every question.

Do not truncate important answers.

Long answers must wrap correctly and preserve paragraph breaks where possible.

For structured answer_json, render a human-readable representation. Raw JSON may be placed in an optional secondary "Raw data" section.

22. Error Handling

Respondents should never see raw technical errors such as:

Could not find the column...

or:

500 Internal Server Error

Show a useful message:

We couldn't save your answer.
Please try again.

Log technical errors server-side.

23. Database Integrity

Before changing the schema:

Inspect the current schema.

Reuse existing tables and columns where possible.

Confirm relationships.

Only add genuinely necessary fields.

The desired data relationship is:

companies
   ↓
interviews
   ↓
interview_questions
   ↓
answers

If nested Supabase queries return incomplete/unexpected data, fetch the records separately and join them in application code rather than silently showing incomplete admin data.

24. Do Not Break Admin Authentication

The final product is not completely authentication-free.

It is:

Authentication-free for respondents, admin-authenticated for the platform owner.

The admin remains protected.

Do not make /admin accessible simply because the respondent flow is public.

25. Acceptance Criteria

The redesign is complete only when:

Respondents do not need accounts.

Respondents do not need to log in.

Google authentication is not required for respondents.

Admin authentication still works.

/admin remains protected.

Public interview pages work without authentication.

Interview has approximately 10–15 questions.

Questions are predefined.

One question is shown at a time.

Answer submission moves directly to the next question.

No AI call occurs between questions.

No AI call is required to complete the interview.

Every answer is persisted.

Company is linked to the interview.

Admin can see all companies.

Admin can click a company.

Admin can see full company details.

Admin can see every interview for that company.

Admin can see every question and answer.

Long answers remain fully readable.

Respondent flow works well on mobile.

Admin dashboard works well on mobile.

Respondents are never redirected to /sign-in.

AI recommendation UI is removed from the active product.

Raw technical errors are not exposed to respondents.

npm run build succeeds.

26. Implementation Order

Implement in this order:

Step 1 — Inspect

Inspect:

Existing routes

Middleware

Auth utilities

Supabase schema

Interview start route

Interview answer route

Interview completion route

Admin pages

Do not change the database until you understand the existing structure.

Step 2 — Separate Public and Admin

Make the respondent interview public while keeping /admin/* protected.

Step 3 — Remove Respondent Auth

Remove sign-in/sign-up requirements from the interview.

Step 4 — Simplify Questions

Reduce the interview to 10–15 fixed questions.

Step 5 — Remove AI

Remove AI calls from the active interview and completion flow.

Step 6 — Persist Answers

Make sure every response is reliably saved to Supabase.

Step 7 — Build Complete Admin View

Implement:

/admin
/admin/companies
/admin/companies/[id]

so the admin can see every response.

Step 8 — Improve Mobile UX

Test both respondent and admin experiences on a phone-sized viewport.

Step 9 — Remove Dead Code

Remove or isolate unused respondent-auth and AI UI/code.

Step 10 — Build/Test

Run:

npm run build

Then test:

Incognito browser
    ↓
Open public discovery URL
    ↓
Start interview
    ↓
Answer all questions
    ↓
Submit
    ↓
No login required
    ↓
Admin signs in separately
    ↓
Open company
    ↓
See every response

Final Product Principle

Do not optimize this MVP for technical sophistication.

Optimize for:

Low friction for respondents + complete data visibility for the admin.

The respondent should not need to understand accounts, AI, dashboards, or technology.

They should simply answer the questions.

The admin should have the complete dataset needed to understand what every respondent said.