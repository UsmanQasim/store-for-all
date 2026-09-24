import type { MetadataRoute } from 'next';
import { listShops } from '@/lib/db';
import { site } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const shops = await listShops().catch(() => []);
  const page = (path: string, priority: number, languages?: Record<string, string>) => ({ url: `${site.url}${path}`, priority, ...(languages ? { alternates: { languages } } : {}) });
  const langs = { en: `${site.url}/`, ur: `${site.url}/ur` };
  return [
    page('/', 1, langs),
    page('/ur', 0.9, langs),
    page('/shops', 0.8),
    ...shops.map((s) => ({ url: `${site.url}/s/${s.slug}`, lastModified: s.updated_at, priority: 0.7 })),
    ...['privacy', 'terms', 'community-guidelines', 'delete-account'].map((p) => page(`/${p}`, 0.3)),
  ];
}
