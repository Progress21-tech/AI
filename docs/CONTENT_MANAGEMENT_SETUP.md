# ProbeTech content management

The Insights and Work content lives in Supabase, so creating or publishing an item does not require a deployment. Apply `supabase/migrations/202609250001_create_content_tables.sql` before using the admin sections. The rollback file removes both new tables and their content; do not run it after creating content unless that data can be discarded.

## Admin access

Sign in with an account whose `profiles.role` is `admin`, then type `/admin/posts` or `/admin/case-studies` in the address bar. The new sections are inside the existing admin workspace. There are no admin links on the public site. Draft previews require the same admin role.

## Image uploads

Set `SUPABASE_SERVICE_ROLE_KEY` as a server-only Vercel environment variable. The first authenticated upload creates a public `probetech-content` Supabase Storage bucket, limited to JPG, PNG, WebP, or AVIF files up to 5 MB. The upload route verifies the image signature, and requires alt text before accepting the image. Do not expose the service-role key with a `NEXT_PUBLIC_` prefix.

The approved content schema has image URL fields but no separate alt-text columns. The admin stores alt text in the URL fragment (`#alt=...`); fragments are not sent to the storage server, and public pages split the fragment back into the accessible `alt` attribute. Keep image URLs in that format when editing content directly in SQL.

Next Image serves responsive optimized variants from the bucket. `NEXT_PUBLIC_SUPABASE_URL` is used to allow only this bucket's image host. Set `NEXT_PUBLIC_SITE_URL` to ProbeTech's canonical HTTPS origin when the official domain is ready; until then links and canonical metadata use the current Vercel origin.

## Draft starter records

After the content migration is present, run `supabase/seeds/20260925_content_draft_templates.sql` once in the Supabase SQL editor. It inserts an unpublished post outline and an EventFlow case-study draft. The EventFlow record contains only the supplied project facts and has `client_approved_public = false`. The seed uses `ON CONFLICT DO NOTHING`, so rerunning it will not overwrite edits.

## Publishing and cache behavior

Public queries filter to published posts and to published, client-approved case studies. Case-study publication is checked by both the editor action and a database constraint. Content is cached for up to five minutes; saving or deleting content also invalidates the public pages and sitemap. Draft items are excluded from the public nav, home previews, RSS feed, and sitemap. Empty listing sections return 404. The canonical public paths are `/blogs` and `/case-studies`; `/insights` and `/work` redirect to those paths for compatibility.

Markdown is stored as plain text. The renderer supports headings, paragraphs, lists, block quotes, inline emphasis, links, and fenced code blocks. Raw HTML is rendered as text, and links with unsafe protocols are not made clickable.
