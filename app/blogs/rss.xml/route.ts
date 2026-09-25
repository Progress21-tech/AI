import { absoluteSiteUrl, getPublishedPosts } from '@/lib/content/data';

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export const revalidate = 300;

export async function GET() {
  const posts = await getPublishedPosts();
  if (!posts.length) return new Response('Not found', { status: 404 });
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${absoluteSiteUrl(`/blogs/${post.slug}`)}</link>
      <guid isPermaLink="true">${absoluteSiteUrl(`/blogs/${post.slug}`)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${new Date(post.published_at || post.created_at).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(post.author)}</dc:creator>
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel>
    <title>ProbeTech Blogs</title>
    <link>${absoluteSiteUrl('/blogs')}</link>
    <description>Findings and practical advice drawn from real conversations with business owners.</description>
    <language>en-ng</language>${items}
  </channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } });
}
