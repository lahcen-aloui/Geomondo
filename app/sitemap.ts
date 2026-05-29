import type { MetadataRoute } from 'next';

const BASE_URL = 'https://geomondo.it';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Static pages — both locales (IT has no prefix, EN has /en/)
  const staticRoutes = ['', '/classifica', '/come-funziona', '/privacy', '/termini'];

  const itPages = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.7,
  }));

  const enPages = staticRoutes.map((route) => ({
    url: `${BASE_URL}/en${route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 0.9 : 0.6,
  }));

  return [...itPages, ...enPages];
}
