/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/insights/rss.xml', destination: '/blogs/rss.xml', permanent: true },
      { source: '/insights', destination: '/blogs', permanent: true },
      { source: '/insights/:slug', destination: '/blogs/:slug', permanent: true },
      { source: '/work', destination: '/case-studies', permanent: true },
      { source: '/work/:slug', destination: '/case-studies/:slug', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co').hostname,
        pathname: '/storage/v1/object/public/probetech-content/**',
      },
    ],
  },
};

export default nextConfig;
