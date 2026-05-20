import type { MetadataRoute } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getLocalSeoRoutes } from '@/lib/local-seo-pages';
import { INDEXABLE_STATIC_ROUTES, STATIC_SEO_LAST_MODIFIED } from '@/lib/indexation';
import { absoluteUrl, languageAlternates } from '@/lib/seo';
import type { Job } from '@/types';

const allStaticRoutes = [...INDEXABLE_STATIC_ROUTES, ...getLocalSeoRoutes()];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [];

  for (const route of allStaticRoutes) {
    pages.push({
      url: absoluteUrl(route.fr),
      lastModified: STATIC_SEO_LAST_MODIFIED,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languageAlternates(route.fr, route.en) },
    });
    pages.push({
      url: absoluteUrl(route.en),
      lastModified: STATIC_SEO_LAST_MODIFIED,
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
