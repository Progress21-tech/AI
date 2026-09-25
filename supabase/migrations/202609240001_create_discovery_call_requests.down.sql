-- Preserve submitted leads: refuse rollback until the new records are archived.
do $$
begin
  if exists (select 1 from public.discovery_call_requests limit 1) then
    raise exception
      'Rollback blocked: archive discovery_call_requests before removing this table.';
  end if;
end $$;

drop table public.discovery_call_requests;
