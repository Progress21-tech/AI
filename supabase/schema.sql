-- AI Business Discovery Agent - Database Schema Migration
-- Supabase / PostgreSQL

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT DEFAULT 'Accounting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'Owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Interviews
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'validation', 'completed')),
    phase TEXT DEFAULT 'overview' CHECK (phase IN ('overview', 'team', 'operations', 'problem_detection', 'deep_dive', 'validation')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER DEFAULT 15, -- in minutes
    actual_duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Questions
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'short_text', 'open_ended')),
    options JSONB DEFAULT '[]'::jsonb,
    objective TEXT NOT NULL,
    category TEXT NOT NULL,
    phase TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Answers
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    answer_text TEXT,
    selected_options JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Business Facts (Structured State)
CREATE TABLE IF NOT EXISTS public.business_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    confidence FLOAT DEFAULT 1.0 NOT NULL,
    source_answer_id UUID REFERENCES public.answers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Workflows
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    confidence FLOAT DEFAULT 0.8 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Workflow Steps
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
    step_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    responsible_role TEXT,
    tool TEXT,
    description TEXT,
    pain_level INTEGER DEFAULT 0 CHECK (pain_level BETWEEN 0 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Problems
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    severity INTEGER DEFAULT 5 CHECK (severity BETWEEN 1 AND 10),
    frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'ad_hoc')),
    time_impact TEXT DEFAULT 'medium',
    financial_impact TEXT DEFAULT 'unknown',
    customer_impact TEXT DEFAULT 'unknown',
    solution_gap TEXT DEFAULT 'unknown',
    confidence FLOAT DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
    status TEXT DEFAULT 'suspected' CHECK (status IN ('suspected', 'investigating', 'confirmed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Problem Evidence
CREATE TABLE IF NOT EXISTS public.problem_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE NOT NULL,
    answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE NOT NULL,
    evidence TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    summary TEXT NOT NULL,
    business_profile JSONB NOT NULL,
    team_summary JSONB NOT NULL,
    technology_summary JSONB NOT NULL,
    workflow_summary JSONB NOT NULL,
    problem_summary JSONB NOT NULL,
    opportunity_summary JSONB NOT NULL,
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Decision / Observability Logs
CREATE TABLE IF NOT EXISTS public.decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
    phase TEXT NOT NULL,
    objective TEXT NOT NULL,
    reason_code TEXT NOT NULL,
    state_change JSONB DEFAULT '{}'::jsonb,
    confidence FLOAT DEFAULT 1.0,
    model_latency_ms INTEGER,
    token_usage JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_logs ENABLE ROW LEVEL SECURITY;
