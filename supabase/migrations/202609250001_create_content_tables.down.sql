-- Roll back only the content objects created by 202609250001.
-- This removes content stored in these two new tables.

drop trigger if exists posts_updated_at on public.posts;
drop trigger if exists case_studies_updated_at on public.case_studies;
drop function if exists public.set_content_updated_at();

drop table if exists public.posts;
drop table if exists public.case_studies;
