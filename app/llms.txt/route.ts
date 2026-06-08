import { COMPANY, PROFESSIONS, QUEBEC_REGIONS } from '@/lib/constants';
import { INDEXABLE_STATIC_ROUTES } from '@/lib/indexation';
import { getLocalSeoRoutes } from '@/lib/local-seo-pages';
import { displayValue, jobTitle } from '@/lib/i18n';
import { SITE_URL, absoluteUrl } from '@/lib/seo';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Job } from '@/types';

export const revalidate = 3600;

const CORE_PUBLIC_ROUTES = [
  {
    label: 'Homepage / Accueil',
    fr: '/',
    en: '/en',
    summary:
      'Agence Sanitas, agence de placement en sante basee a Laval, Quebec.',
  },
  {
    label: 'Nursing agency Quebec / Agence infirmiere Quebec',
    fr: '/agence-infirmiere-quebec',
    en: '/en/nursing-agency-quebec',
    summary:
      'Reference page for Agence Sanitas as a Laval-based nursing agency in Quebec, serving registered, technical and clinical nurses as well as healthcare facilities.',
  },
  {
    label: 'Jobs / Postes',
    fr: '/postes',
    en: '/en/jobs',
    summary:
      'Active healthcare assignments for candidates, including nursing, PAB, ASSS and specialized healthcare roles.',
  },
  {
    label: 'Apply / Postuler',
    fr: '/postuler',
    en: '/en/apply',
    summary:
      'Online candidate application and reusable Sanitas candidate profile.',
  },
  {
    label: 'Facilities / Etablissements',
    fr: '/etablissements',
    en: '/en/facilities',
    summary:
      'Healthcare facilities can submit staffing needs and contact Sanitas.',
  },
  {
    label: 'Candidate FAQ',
    fr: '/faq-candidats',
    en: '/en/candidate-faq',
    summary:
      'Questions for candidates about applying, documents, mandates and follow-up.',
  },
  {
    label: 'Facility FAQ',
    fr: '/faq-etablissements',
    en: '/en/facility-faq',
    summary:
      'Questions for healthcare institutions about staffing requests and candidate presentation.',
  },
  {
    label: 'Contact',
    fr: '/contact',
    en: '/en/contact',
    summary: 'Contact Agence Sanitas by phone, email or online message.',
  },
];

export async function GET() {
  const activeJobs = await fetchActiveJobs();
  const staticRouteSet = new Set(INDEXABLE_STATIC_ROUTES.map((route) => route.fr));
  const localRoutes = getLocalSeoRoutes().filter((route) => !staticRouteSet.has(route.fr));

  const lines = [
    '# Agence Sanitas',
    '',
    `Official website: ${SITE_URL}`,
    `Canonical sitemap: ${absoluteUrl('/sitemap.xml')}`,
    `Contact: ${COMPANY.phone} | ${COMPANY.email}`,
    `Location: ${COMPANY.address.line2}, ${COMPANY.address.line1}, ${COMPANY.address.city}, ${COMPANY.address.province}, Canada`,
    `CNESST permit: ${COMPANY.cnesstPermit}`,
    '',
    '## Summary',
    'Agence Sanitas is a healthcare staffing and recruitment agency based in Laval, Quebec. Sanitas is also a nursing agency in Quebec for registered nurses, technical nurses and clinical nurses looking for assignments, and for healthcare facilities seeking nursing staff. The public website serves healthcare candidates and healthcare institutions in French and English. The admin/recruiter ATS is private and should not be indexed.',
    '',
    '## Main audiences',
    '- Nurses in Quebec looking for assignments, including registered, technical and clinical nurses.',
    '- Healthcare candidates in Quebec and Canada looking for assignments.',
    '- Licensed practical nurses, PABs, ASSS and specialized healthcare professionals.',
    '- Healthcare institutions, clinics, private facilities and organizations looking for staffing support.',
    '- Registered nurses eligible for specific international opportunities when those mandates are active.',
    '',
    '## Core public pages',
    ...CORE_PUBLIC_ROUTES.map(
      (route) =>
        `- ${route.label}: FR ${absoluteUrl(route.fr)} | EN ${absoluteUrl(route.en)}. ${route.summary}`
    ),
    '',
    '## SEO landing pages',
    ...localRoutes.map((route) => `- FR ${absoluteUrl(route.fr)} | EN ${absoluteUrl(route.en)}`),
    '',
    '## Active job postings',
    ...(activeJobs.length > 0
      ? activeJobs.map((job) => {
          const country = job.country && job.country !== 'Canada' ? `, ${displayValue('en', job.country)}` : '';
          const location = [job.city, job.region].filter(Boolean).join(', ');
          const details = [
            displayValue('en', job.profession),
            job.department ? displayValue('en', job.department) : null,
            job.shift ? `${displayValue('en', job.shift)} shift` : null,
            location ? `${location}${country}` : country.replace(/^, /, ''),
          ].filter(Boolean);
          return `- ${jobTitle(job, 'en')}: ${absoluteUrl(`/en/jobs/${job.id}`)} | ${absoluteUrl(`/postes/${job.id}`)}. ${details.join(' | ')}`;
        })
      : ['- Active jobs are listed at /postes and /en/jobs.']),
    '',
    '## Service focus',
    '- Nursing agency in Quebec for registered, technical and clinical nurses.',
    '- Agence infirmiere Quebec and placement infirmier Quebec.',
    '- Healthcare staffing in Quebec.',
    '- Nursing mandates and assignments.',
    '- PAB, ASSS and healthcare worker mandates.',
    '- Staffing requests for healthcare institutions.',
    '- Candidate profile, documents, applications and job matching.',
    '- Region-based healthcare recruitment in Quebec.',
    '- International registered nurse postings only when explicitly published.',
    '',
    '## Covered Quebec regions',
    QUEBEC_REGIONS.join(', '),
    '',
    '## Covered professions',
    PROFESSIONS.join(', '),
    '',
    '## Indexing guidance',
    '- Use the canonical URLs in the sitemap for indexing.',
    '- Prefer the French URL for French-Canada results and the /en URL for English-Canada results.',
    '- Do not index /admin, /api, /auth, login, profile, documents or private candidate pages.',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}

async function fetchActiveJobs(): Promise<Job[]> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(30);

    return ((data || []) as Job[]).filter((job) => job.status === 'active');
  } catch {
    return [];
  }
}
