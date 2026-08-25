-- Supabase Auth + RBAC + RLS migration for AI Business Discovery.
-- Run this in the Supabase SQL editor against the existing project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.prevent_profile_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Role changes are restricted to a trusted administrator operation';
  end if;
  return new;
end;
$$;
drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change before update on public.profiles for each row execute procedure public.prevent_profile_role_change();

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(), name text not null, slug text unique, industry text, website text, size text,
  owner_id uuid references auth.users(id) on delete cascade, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.companies add column if not exists owner_id uuid references auth.users(id) on delete cascade;
-- Existing pre-auth rows may not have an owner. Backfill them in a trusted migration
-- before enforcing NOT NULL; RLS keeps orphaned legacy rows inaccessible meanwhile.

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(), company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null, respondent_name text, respondent_role text, respondent_email text, respondent_phone text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned', 'analysis_pending', 'analyzed')),
  current_question_id text, started_at timestamptz not null default now(), last_activity_at timestamptz not null default now(), completed_at timestamptz,
  target_duration_seconds integer not null default 900, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.interviews add column if not exists created_by uuid references auth.users(id) on delete set null;

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  question_key text not null, question_text text not null, question_type text not null, sequence_number integer not null,
  displayed_at timestamptz not null default now(), answered_at timestamptz
);
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  question_id uuid not null references public.interview_questions(id) on delete cascade, answer_text text, answer_json jsonb, created_at timestamptz not null default now()
);
create table if not exists public.business_facts (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  category text not null, key text not null, value jsonb, source_answer_id uuid references public.answers(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  title text not null, description text, frequency text, severity integer, people_affected integer, time_impact_hours_per_week numeric,
  financial_impact numeric, current_solution text, created_at timestamptz not null default now()
);
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  title text not null, type text not null, problem_solved text, evidence jsonb, why_it_matters text, expected_impact jsonb,
  implementation_difficulty text, priority text, suggested_approach text, risks jsonb, next_step text, created_at timestamptz not null default now()
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  executive_summary text, business_snapshot jsonb, major_problems jsonb, opportunities jsonb, roadmap jsonb, raw_ai_output jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.decision_logs (
  id uuid primary key default gen_random_uuid(), interview_id uuid not null references public.interviews(id) on delete cascade,
  phase text not null, objective text not null, reason_code text not null, state_change jsonb default '{}'::jsonb, confidence float default 1.0,
  model_latency_ms integer, token_usage jsonb default '{}'::jsonb, created_at timestamptz not null default now()
);

create index if not exists companies_owner_id_idx on public.companies(owner_id);
create index if not exists interviews_company_id_idx on public.interviews(company_id);
create index if not exists interviews_created_by_idx on public.interviews(created_by);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.answers enable row level security;
alter table public.business_facts enable row level security;
alter table public.problems enable row level security;
alter table public.recommendations enable row level security;
alter table public.reports enable row level security;
alter table public.decision_logs enable row level security;

do $$ declare item record; begin
  for item in select tablename, policyname from pg_policies where schemaname = 'public' and tablename in ('profiles','companies','interviews','interview_questions','answers','business_facts','problems','recommendations','reports','decision_logs') loop
    execute format('drop policy if exists %I on public.%I', item.policyname, item.tablename);
  end loop;
end $$;

create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "companies_owner_or_admin" on public.companies for all to authenticated using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "interviews_owner_or_admin" on public.interviews for all to authenticated using (public.is_admin() or exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())) with check (public.is_admin() or (created_by = auth.uid() and exists (select 1 from public.companies c where c.id = company_id and c.owner_id = auth.uid())));

create policy "questions_owner_or_admin" on public.interview_questions for all to authenticated using (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid())) with check (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid()));
create policy "answers_owner_or_admin" on public.answers for all to authenticated using (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid())) with check (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid()));
create policy "facts_owner_or_admin" on public.business_facts for all to authenticated using (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid())) with check (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid()));
create policy "problems_owner_or_admin" on public.problems for all to authenticated using (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid())) with check (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid()));
create policy "recommendations_owner_or_admin" on public.recommendations for select to authenticated using (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid()));
create policy "reports_owner_or_admin" on public.reports for select to authenticated using (public.is_admin() or exists (select 1 from public.interviews i join public.companies c on c.id = i.company_id where i.id = interview_id and c.owner_id = auth.uid()));
create policy "logs_admin_only" on public.decision_logs for select to authenticated using (public.is_admin());

-- Promote an initial administrator only from the trusted SQL editor:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
