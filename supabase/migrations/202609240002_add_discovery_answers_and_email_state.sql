-- Store the retained questionnaire answers and durable email retry state
-- alongside each request so a failed delivery never loses the lead.
alter table public.discovery_call_requests
  add column discovery_answers jsonb not null default '{}'::jsonb,
  add column confirmation_email_status text not null default 'pending'
    check (confirmation_email_status in ('pending', 'sent', 'failed')),
  add column owner_email_status text not null default 'pending'
    check (owner_email_status in ('pending', 'sent', 'failed')),
  add column confirmation_email_attempts integer not null default 0
    check (confirmation_email_attempts >= 0),
  add column owner_email_attempts integer not null default 0
    check (owner_email_attempts >= 0),
  add column confirmation_email_last_error text,
  add column owner_email_last_error text,
  add column email_retry_after timestamptz not null default now(),
  add column email_lock_until timestamptz;

create index discovery_call_requests_email_retry_idx
  on public.discovery_call_requests(email_retry_after)
  where confirmation_email_status = 'pending' or owner_email_status = 'pending';

create or replace function public.set_discovery_call_request_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger discovery_call_requests_updated_at
  before update on public.discovery_call_requests
  for each row execute procedure public.set_discovery_call_request_updated_at();
