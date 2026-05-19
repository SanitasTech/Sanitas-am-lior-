import type { Metadata } from 'next';
import { COMPANY } from '@/lib/constants';
import { displayValue, jobTitle, type Locale } from '@/lib/i18n';
import type { Job } from '@/types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.agencesanitas.com')
  .replace(/\/+$/, '');

export const SOCIAL_IMAGE_PATH = '/opengraph-image';

export function absoluteUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function languageAlternates(frPath: string, enPath: string) {
  return {
    'fr-CA': absoluteUrl(frPath),
    fr: absoluteUrl(frPath),
    'en-CA': absoluteUrl(enPath),
    en: absoluteUrl(enPath),
    'x-default': absoluteUrl(frPath),
  };
}

export function publicPageMetadata({
  title,
  description,
  path,
  locale = 'fr',
  frPath,
  enPath,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
  frPath: string;
  enPath: string;
  imageAlt?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(path),
      languages: languageAlternates(frPath, enPath),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      locale: locale === 'en' ? 'en_CA' : 'fr_CA',
      type: 'website',
      siteName: COMPANY.name,
      images: [
        {
          url: SOCIAL_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt:
            imageAlt ||
            (locale === 'en'
              ? 'Agence Sanitas - Healthcare assignments in Quebec'
              : 'Agence Sanitas - Mandats en santé au Québec'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SOCIAL_IMAGE_PATH],
    },
  };
}

export function organizationJsonLd() {
  return {
    '@type': ['Organization', 'LocalBusiness', 'EmploymentAgency'],
    '@id': `${SITE_URL}/#organization`,
    name: COMPANY.name,
    url: SITE_URL,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    description:
      'Agence de placement en santé basée à Laval, spécialisée dans les mandats pour professionnels de la santé au Québec.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${COMPANY.address.line2}, ${COMPANY.address.line1}`,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.province,
      postalCode: COMPANY.address.postal,
      addressCountry: 'CA',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Québec' },
      { '@type': 'Country', name: 'Canada' },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: COMPANY.phone,
        email: COMPANY.email,
        contactType: 'recruitment',
        areaServed: 'CA',
        availableLanguage: ['fr-CA', 'en-CA'],
      },
    ],
    identifier: [
      {
        '@type': 'PropertyValue',
        propertyID: 'CNESST',
        value: COMPANY.cnesstPermit,
      },
    ],
  };
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: COMPANY.name,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['fr-CA', 'en-CA'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/postes?profession={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function faqPageJsonLd(questions: Array<{ question: string; answer: string }>) {
  return {
    '@type': 'FAQPage',
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function jobMetaDescription(job: Job, locale: Locale): string {
  const profession = displayValue(locale, job.profession);
  const department = displayValue(locale, job.department);
  const shift = displayValue(locale, job.shift);
  const location = [job.city, job.region].filter(Boolean).join(', ');
  const parts =
    locale === 'en'
      ? [
          `${profession} assignment${department ? ` in ${department}` : ''}`,
          location,
          shift ? `${shift} shift` : '',
          job.salary || '',
          'Apply with Agence Sanitas.',
        ]
      : [
          `Mandat ${profession}${department ? ` en ${department}` : ''}`,
          location,
          shift ? `quart ${shift.toLowerCase()}` : '',
          job.salary || '',
          'Postulez avec Agence Sanitas.',
        ];

  return parts.filter(Boolean).join(' · ').slice(0, 160);
}

export function jobPostingJsonLd(job: Job, locale: Locale) {
  const title = jobTitle(job, locale);
  const description = [
    title,
    jobMetaDescription(job, locale),
    locale === 'en' ? job.requirements_en || job.requirements : job.requirements,
    locale === 'en' ? job.particularities_en || job.particularities : job.particularities,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    '@type': 'JobPosting',
    '@id': `${absoluteUrl(locale === 'en' ? `/en/jobs/${job.id}` : `/postes/${job.id}`)}#job`,
    title,
    description,
    datePosted: job.created_at,
    directApply: true,
    employmentType: employmentTypeForMandate(job.mandate_type),
    hiringOrganization: { '@id': `${SITE_URL}/#organization` },
    industry: 'Healthcare staffing',
    occupationalCategory: displayValue(locale, job.profession),
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city || undefined,
        addressRegion: job.region || COMPANY.address.province,
        addressCountry: 'CA',
      },
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'Canada',
    },
  };
}

function employmentTypeForMandate(mandateType?: string | null): string {
  if (!mandateType) return 'CONTRACTOR';
  if (mandateType === 'Permanent') return 'FULL_TIME';
  if (mandateType.includes('Temporaire') || mandateType.includes('Remplacement')) return 'TEMPORARY';
  return 'CONTRACTOR';
}
