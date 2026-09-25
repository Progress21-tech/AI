-- Run once after 202609250001_create_content_tables.sql.
-- These records are drafts and are excluded from every public query.

insert into public.posts (
  slug, title, excerpt, body, category, tags, author, status
)
values (
  'draft-post-template',
  '[POST TITLE]',
  '[POST EXCERPT]',
  E'## The problem\n\n## Why it happens\n\n## How to fix it\n\n## When to get help',
  '[CATEGORY]',
  '{}'::text[],
  'Progress Oni',
  'draft'
)
on conflict (slug) do nothing;

insert into public.case_studies (
  slug, client_name, project_title, summary, problem, solution,
  tech_used, service_type, screenshots, client_approved_public, status
)
values (
  'eventflow-custom-cms-react-marketing-site-draft',
  'EventFlow',
  'Custom CMS and React marketing site',
  'Custom CMS and React marketing site',
  '',
  '',
  array['React', 'Custom CMS']::text[],
  'custom_software',
  '{}'::text[],
  false,
  'draft'
)
on conflict (slug) do nothing;
