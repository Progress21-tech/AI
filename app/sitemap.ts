import type { MetadataRoute } from 'next';

const baseUrl = 'https://aibusinessdiscoveryfor.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/services`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/services/ai-automation`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services/ai-chatbots`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/services/custom-software`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/how-we-work`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/book-a-call`, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
