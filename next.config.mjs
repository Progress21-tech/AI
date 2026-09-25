/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
