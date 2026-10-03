-- Revert the project overview field. This removes overview text saved after the up migration.
alter table public.case_studies
  drop column if exists project_overview;
