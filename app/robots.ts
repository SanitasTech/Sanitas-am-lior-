import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/auth',
          '/connexion',
          '/en/login',
          '/mon-profil',
          '/mes-documents',
          '/mes-candidatures',
          '/en/my-profile',
          '/en/my-documents',
          '/en/my-applications',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
