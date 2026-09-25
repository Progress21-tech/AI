-- Add a dedicated lead table without changing existing interview data or status values.
create table public.discovery_call_requests (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references public.interviews(id) on delete set null,
  name text not null,
  business_name text not null,
  email text not null,
  whatsapp text,
  business_description text not null,
  biggest_problem text not null,
  preferred_call_datetime timestamptz not null,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'completed', 'proposal_sent', 'won', 'lost')),
  source text not null default 'website',
  interested_service text not null default 'unsure'
    check (interested_service in ('automation', 'chatbot', 'custom_software', 'unsure')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index discovery_call_requests_status_idx
  on public.discovery_call_requests(status);

create index discovery_call_requests_created_at_idx
  on public.discovery_call_requests(created_at desc);

alter table public.discovery_call_requests enable row level security;

create policy "discovery_call_requests_admin_only"
  on public.discovery_call_requests
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
