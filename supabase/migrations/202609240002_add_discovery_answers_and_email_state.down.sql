-- Do not remove captured answers or delivery logs during rollback.
do $$
begin
  if exists (
    select 1 from public.discovery_call_requests
    where discovery_answers <> '{}'::jsonb
       or confirmation_email_attempts > 0
       or owner_email_attempts > 0
       or confirmation_email_status <> 'pending'
       or owner_email_status <> 'pending'
       or confirmation_email_last_error is not null
       or owner_email_last_error is not null
  ) then
    raise exception
      'Rollback blocked: archive discovery answers and email delivery state before removing these columns.';
  end if;
end $$;

drop trigger discovery_call_requests_updated_at on public.discovery_call_requests;
drop function public.set_discovery_call_request_updated_at();
drop index public.discovery_call_requests_email_retry_idx;

alter table public.discovery_call_requests
  drop column discovery_answers,
  drop column confirmation_email_status,
  drop column owner_email_status,
  drop column confirmation_email_attempts,
  drop column owner_email_attempts,
  drop column confirmation_email_last_error,
  drop column owner_email_last_error,
  drop column email_retry_after,
  drop column email_lock_until;
