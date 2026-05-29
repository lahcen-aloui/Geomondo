import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://geomondo.it';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Game screens — no SEO value; also avoids bots triggering Street View loads
          '/gioca/',
          '/en/gioca/',
          // Results page — ephemeral, tied to a specific session
          '/risultato',
          '/en/risultato',
          // Auth pages
          '/accedi',
          '/en/accedi',
          // API and auth callback routes
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
