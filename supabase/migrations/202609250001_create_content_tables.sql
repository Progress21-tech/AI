-- Add database-backed Insights posts and Work case studies.
-- Existing ProbeTech and discovery data is untouched.

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  body text not null default '',
  cover_image_url text,
  category text not null,
  tags text[] not null default '{}'::text[],
  author text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_status_published_at_idx
  on public.posts(status, published_at desc);

create index posts_category_published_at_idx
  on public.posts(category, published_at desc)
  where status = 'published';

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  client_name text,
  project_title text not null,
  summary text not null,
  problem text not null default '',
  solution text not null default '',
  tech_used text[] not null default '{}'::text[],
  result text,
  testimonial_quote text,
  testimonial_author text,
  testimonial_role text,
  service_type text not null
    check (service_type in ('automation', 'chatbot', 'custom_software')),
  screenshots text[] not null default '{}'::text[],
  client_approved_public boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint case_studies_publication_requires_approval
    check (status <> 'published' or client_approved_public = true)
);

create index case_studies_status_published_at_idx
  on public.case_studies(status, published_at desc);

create index case_studies_service_published_at_idx
  on public.case_studies(service_type, published_at desc)
  where status = 'published';

alter table public.posts enable row level security;
alter table public.case_studies enable row level security;

-- Public visitors can read published content. Drafts and edits stay admin-only.
create policy "posts_public_read_published"
  on public.posts for select to anon, authenticated
  using (status = 'published');
create policy "posts_admin_manage"
  on public.posts for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "case_studies_public_read_published_approved"
  on public.case_studies for select to anon, authenticated
  using (status = 'published' and client_approved_public = true);
create policy "case_studies_admin_manage"
  on public.case_studies for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.set_content_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_content_updated_at();
create trigger case_studies_updated_at
  before update on public.case_studies
  for each row execute procedure public.set_content_updated_at();
