import type { MetadataRoute } from 'next';

type SitemapItem = MetadataRoute.Sitemap[number];

export type IndexableRoute = {
  fr: string;
  en: string;
  priority: number;
  changeFrequency: SitemapItem['changeFrequency'];
};

export const STATIC_SEO_LAST_MODIFIED = new Date('2026-05-20T00:00:00.000Z');

export const INDEXABLE_STATIC_ROUTES: IndexableRoute[] = [
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

export const ROBOTS_DISALLOW_PATHS = [
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
];
