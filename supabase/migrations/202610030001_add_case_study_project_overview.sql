-- Add a long-form Markdown overview to case studies without changing existing content.
alter table public.case_studies
  add column if not exists project_overview text not null default '';
