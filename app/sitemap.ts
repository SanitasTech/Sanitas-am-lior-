import type { MetadataRoute } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getLocalSeoRoutes } from '@/lib/local-seo-pages';
import { absoluteUrl, languageAlternates } from '@/lib/seo';
import type { Job } from '@/types';

type SitemapItem = MetadataRoute.Sitemap[number];

const staticRoutes: Array<{
  fr: string;
  en: string;
  priority: number;
  changeFrequency: SitemapItem['changeFrequency'];
}> = [
  { fr: '/', en: '/en', priority: 1, changeFrequency: 'weekly' },
  { fr: '/postes', en: '/en/jobs', priority: 0.95, changeFrequency: 'daily' },
  { fr: '/etablissements', en: '/en/facilities', priority: 0.8, changeFrequency: 'monthly' },
  { fr: '/a-propos', en: '/en/about', priority: 0.6, changeFrequency: 'monthly' },
  { fr: '/contact', en: '/en/contact', priority: 0.7, changeFrequency: 'monthly' },
  { fr: '/faq-candidats', en: '/en/candidate-faq', priority: 0.75, changeFrequency: 'monthly' },
  { fr: '/faq-etablissements', en: '/en/facility-faq', priority: 0.75, changeFrequency: 'monthly' },
  { fr: '/politique-confidentialite', en: '/en/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { fr: '/emplois-infirmieres-quebec', en: '/en/nursing-agency-jobs-quebec', priority: 0.9, changeFrequency: 'weekly' },
  {
    fr: '/emplois-infirmieres-auxiliaires-quebec',
    en: '/en/licensed-practical-nurse-jobs-quebec',
    priority: 0.88,
    changeFrequency: 'weekly',
  },
  { fr: '/emplois-pab-quebec', en: '/en/pab-jobs-quebec', priority: 0.85, changeFrequency: 'weekly' },
  { fr: '/emplois-asss-quebec', en: '/en/asss-jobs-quebec', priority: 0.82, changeFrequency: 'weekly' },
  {
    fr: '/mandats-infirmiers-region-eloignee',
    en: '/en/remote-region-nursing-assignments-quebec',
    priority: 0.85,
    changeFrequency: 'weekly',
  },
  { fr: '/agence-placement-sante-laval', en: '/en/healthcare-staffing-laval', priority: 0.85, changeFrequency: 'monthly' },
  {
    fr: '/recrutement-personnel-sante-quebec',
    en: '/en/healthcare-recruitment-quebec',
    priority: 0.85,
    changeFrequency: 'monthly',
  },
];

const allStaticRoutes = [...staticRoutes, ...getLocalSeoRoutes()];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [];

  for (const route of allStaticRoutes) {
    pages.push({
      url: absoluteUrl(route.fr),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.fr, route.en) },
    });
    pages.push({
      url: absoluteUrl(route.en),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: Math.max(route.priority - 0.05, 0.2),
      alternates: { languages: languageAlternates(route.fr, route.en) },
    });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('jobs')
      .select('id, updated_at, created_at, status')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1000);

    for (const job of ((data || []) as Pick<Job, 'id' | 'updated_at' | 'created_at'>[])) {
      const lastModified = new Date(job.updated_at || job.created_at || now);
      const fr = `/postes/${job.id}`;
      const en = `/en/jobs/${job.id}`;
      pages.push({
        url: absoluteUrl(fr),
        lastModified,
        changeFrequency: 'daily',
        priority: 0.75,
        alternates: { languages: languageAlternates(fr, en) },
      });
      pages.push({
        url: absoluteUrl(en),
        lastModified,
        changeFrequency: 'daily',
        priority: 0.7,
        alternates: { languages: languageAlternates(fr, en) },
      });
    }
  } catch {
    // Keep the sitemap available even if Supabase is temporarily unavailable.
  }

  return pages;
}
