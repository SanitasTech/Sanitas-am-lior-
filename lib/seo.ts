import type { Metadata } from 'next';
import { COMPANY } from '@/lib/constants';
import {
  displayValue,
  jobBenefits,
  jobDescription,
  jobParticularities,
  jobRequirements,
  jobSalary,
  jobSchedule,
  jobTitle,
  type Locale,
} from '@/lib/i18n';
import type { Job } from '@/types';

function normalizePublicSiteUrl(value: string) {
  const siteUrl = value.replace(/\/+$/, '');
  return siteUrl === 'https://agencesanitas.com' ? 'https://www.agencesanitas.com' : siteUrl;
}

export const SITE_URL = normalizePublicSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.agencesanitas.com',
);

export const SOCIAL_IMAGE_PATH = '/opengraph-image';

const HEALTHCARE_SERVICE_AREAS = [
  'Mandats infirmiers au Québec',
  'Nursing assignments in Quebec',
  'Placement infirmier',
  'Placement infirmière auxiliaire',
  'Placement PAB',
  'Placement ASSS',
  'Personnel de santé temporaire',
  'Healthcare staffing for Quebec facilities',
  'Recrutement personnel de santé Québec',
  'Mandats en région éloignée',
  'International registered nurse opportunities',
];

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
      alternateLocale: locale === 'en' ? ['fr_CA'] : ['en_CA'],
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
    legalName: COMPANY.name,
    url: SITE_URL,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    image: absoluteUrl(SOCIAL_IMAGE_PATH),
    logo: absoluteUrl(SOCIAL_IMAGE_PATH),
    priceRange: '$$',
    description:
      'Agence de placement en santé basée à Laval, spécialisée dans les mandats pour professionnels de la santé au Québec.',
    slogan: 'Mandats en santé au Québec pour professionnels de la santé.',
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
    availableLanguage: ['fr-CA', 'en-CA'],
    knowsAbout: HEALTHCARE_SERVICE_AREAS,
    keywords: HEALTHCARE_SERVICE_AREAS.join(', '),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services de recrutement et mandats en santé',
      itemListElement: [
        offerCatalogItem(
          'Mandats pour candidats en santé',
          'Accès aux mandats pour infirmières, infirmières auxiliaires, PAB, ASSS et autres professionnels de la santé.'
        ),
        offerCatalogItem(
          'Recherche de personnel pour établissements',
          'Accompagnement des établissements de santé pour les besoins ponctuels, urgents, récurrents ou planifiés.'
        ),
        offerCatalogItem(
          'Mandats infirmiers internationaux',
          'Opportunités internationales pour infirmiers et infirmières autorisés selon les critères du mandat.'
        ),
      ],
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
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
      {
        '@type': 'ContactPoint',
        telephone: COMPANY.phone,
        email: COMPANY.email,
        contactType: 'customer service',
        areaServed: ['CA', 'QC'],
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
    alternateName: ['Agence de placement Sanitas', 'Sanitas healthcare staffing'],
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['fr-CA', 'en-CA'],
    about: HEALTHCARE_SERVICE_AREAS.map((name) => ({ '@type': 'Thing', name })),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/postes?profession={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function offerCatalogItem(name: string, description: string) {
  return {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name,
      description,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Québec' },
        { '@type': 'Country', name: 'Canada' },
      ],
    },
  };
}

export function webPageJsonLd({
  name,
  description,
  url,
  locale = 'fr',
}: {
  name: string;
  description: string;
  url: string;
  locale?: Locale;
}) {
  return {
    '@type': 'WebPage',
    '@id': `${absoluteUrl(url)}#webpage`,
    url: absoluteUrl(url),
    name,
    description,
    inLanguage: locale === 'en' ? 'en-CA' : 'fr-CA',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function collectionPageJsonLd({
  name,
  description,
  url,
  locale = 'fr',
}: {
  name: string;
  description: string;
  url: string;
  locale?: Locale;
}) {
  return {
    '@type': ['WebPage', 'CollectionPage'],
    '@id': `${absoluteUrl(url)}#collection`,
    url: absoluteUrl(url),
    name,
    description,
    inLanguage: locale === 'en' ? 'en-CA' : 'fr-CA',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    about: HEALTHCARE_SERVICE_AREAS.map((name) => ({ '@type': 'Thing', name })),
  };
}

export function serviceJsonLd({
  name,
  description,
  url,
  locale = 'fr',
  serviceType = 'Healthcare staffing',
  audience = 'candidates',
  areaServed = ['Québec', 'Canada'],
}: {
  name: string;
  description: string;
  url: string;
  locale?: Locale;
  serviceType?: string;
  audience?: 'candidates' | 'facilities' | 'both';
  areaServed?: string[];
}) {
  const audienceType =
    audience === 'facilities'
      ? 'Healthcare facilities and institutions'
      : audience === 'both'
        ? 'Healthcare candidates and healthcare facilities'
        : 'Healthcare candidates';

  return {
    '@type': 'Service',
    '@id': `${absoluteUrl(url)}#service`,
    name,
    description,
    url: absoluteUrl(url),
    serviceType,
    inLanguage: locale === 'en' ? 'en-CA' : 'fr-CA',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: areaServed.map((name) => ({
      '@type': name === 'Canada' ? 'Country' : 'AdministrativeArea',
      name,
    })),
    audience: {
      '@type': audience === 'facilities' ? 'BusinessAudience' : 'PeopleAudience',
      audienceType,
    },
  };
}

export function contactPageJsonLd({
  name,
  description,
  url,
  locale = 'fr',
}: {
  name: string;
  description: string;
  url: string;
  locale?: Locale;
}) {
  return {
    '@type': ['WebPage', 'ContactPage'],
    '@id': `${absoluteUrl(url)}#contact`,
    url: absoluteUrl(url),
    name,
    description,
    inLanguage: locale === 'en' ? 'en-CA' : 'fr-CA',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntity: {
      '@id': `${SITE_URL}/#organization`,
    },
  };
}

export function itemListJsonLd(items: Array<{ name: string; url: string; description?: string }>) {
  return {
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(item.url),
      name: item.name,
      description: item.description,
    })),
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
  const country = job.country || 'Canada';
  const location = [job.city, job.region, country !== 'Canada' ? displayValue(locale, country) : null].filter(Boolean).join(', ');
  const parts =
    locale === 'en'
      ? [
          `${profession} assignment${department ? ` in ${department}` : ''}`,
          location,
          shift ? `${shift} shift` : '',
          jobSalary(job, locale) || '',
          'Apply with Agence Sanitas.',
        ]
      : [
          `Mandat ${profession}${department ? ` en ${department}` : ''}`,
          location,
          shift ? `quart ${shift.toLowerCase()}` : '',
          jobSalary(job, locale) || '',
          'Postulez avec Agence Sanitas.',
        ];

  return parts.filter(Boolean).join(' · ').slice(0, 160);
}

function countryCode(country?: string | null): string {
  const value = (country || 'Canada')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (value.includes('arabie') || value.includes('saudi')) return 'SA';
  if (value.includes('etats') || value.includes('united states') || value === 'us') return 'US';
  if (value.includes('royaume') || value.includes('united kingdom') || value === 'uk') return 'GB';
  if (value.includes('france')) return 'FR';
  return 'CA';
}

export function jobPostingJsonLd(job: Job, locale: Locale) {
  const title = jobTitle(job, locale);
  const country = job.country || 'Canada';
  const applicantCountries =
    job.eligible_countries && job.eligible_countries.length > 0 ? job.eligible_countries : ['Canada'];
  const jobUrl = absoluteUrl(locale === 'en' ? `/en/jobs/${job.id}` : `/postes/${job.id}`);
  const requirements = jobRequirements(job, locale);
  const benefits = jobBenefits(job, locale);
  const particularities = jobParticularities(job, locale);
  const description = [
    title,
    jobDescription(job, locale),
    jobMetaDescription(job, locale),
    requirements,
    benefits,
    particularities,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    '@type': 'JobPosting',
    '@id': `${jobUrl}#job`,
    url: jobUrl,
    mainEntityOfPage: jobUrl,
    identifier: {
      '@type': 'PropertyValue',
      name: COMPANY.name,
      value: job.id,
    },
    title,
    description,
    datePosted: job.created_at,
    directApply: true,
    employmentType: employmentTypeForMandate(job.mandate_type),
    hiringOrganization: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: COMPANY.name,
      sameAs: SITE_URL,
      logo: absoluteUrl(SOCIAL_IMAGE_PATH),
    },
    industry: 'Healthcare staffing',
    occupationalCategory: displayValue(locale, job.profession),
    qualifications: requirements || undefined,
    benefits: benefits || undefined,
    jobBenefits: benefits || undefined,
    responsibilities: particularities || undefined,
    workHours: jobSchedule(job, locale) || job.shift || undefined,
    baseSalary: baseSalaryFromText(jobSalary(job, locale)),
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.city || undefined,
        addressRegion: job.region || COMPANY.address.province,
        addressCountry: countryCode(country),
      },
    },
    applicantLocationRequirements: applicantCountries.map((name) => ({
      '@type': 'Country',
      name: displayValue(locale, name),
    })),
    applicationContact: {
      '@type': 'ContactPoint',
      telephone: COMPANY.phone,
      email: COMPANY.email,
      contactType: 'recruitment',
      availableLanguage: locale === 'en' ? ['en-CA', 'fr-CA'] : ['fr-CA', 'en-CA'],
    },
  };
}

function baseSalaryFromText(salary?: string | null) {
  if (!salary) return undefined;
  const numbers = (salary.match(/\d[\d\s,.]*/g) || [])
    .map(parseSalaryNumber)
    .filter((value) => Number.isFinite(value) && value > 0);
  if (numbers.length === 0) return undefined;
  const isMaximum = /jusqu|up to|max/i.test(salary);
  const minValue = Math.min(...numbers);
  const maxValue = Math.max(...numbers);
  const hasRange = numbers.length > 1 && minValue !== maxValue;

  return {
    '@type': 'MonetaryAmount',
    currency: 'CAD',
    value: {
      '@type': 'QuantitativeValue',
      ...(hasRange ? { minValue, maxValue } : isMaximum ? { maxValue } : { value: maxValue }),
      unitText: salaryUnitText(salary),
    },
  };
}

function parseSalaryNumber(raw: string): number {
  let value = raw.trim().replace(/\s/g, '');
  const hasComma = value.includes(',');
  const hasDot = value.includes('.');

  if (hasComma && hasDot) {
    value =
      value.lastIndexOf('.') > value.lastIndexOf(',')
        ? value.replace(/,/g, '')
        : value.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    const decimalPart = value.split(',').pop() || '';
    value = decimalPart.length === 3 ? value.replace(/,/g, '') : value.replace(',', '.');
  } else if (hasDot) {
    const decimalPart = value.split('.').pop() || '';
    if (decimalPart.length === 3) value = value.replace(/\./g, '');
  }

  return Number(value);
}

function salaryUnitText(salary: string): 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' {
  const value = salary.toLowerCase();
  if (/\/\s*h|\bh\b|\bhr\b|heure|hour/.test(value)) return 'HOUR';
  if (/mois|mensuel|monthly|month|\/\s*mo/.test(value)) return 'MONTH';
  if (/semaine|weekly|week/.test(value)) return 'WEEK';
  if (/annee|année|annuel|annual|year|\/\s*yr/.test(value)) return 'YEAR';
  return 'DAY';
}

function employmentTypeForMandate(mandateType?: string | null): string {
  if (!mandateType) return 'CONTRACTOR';
  if (mandateType === 'Permanent') return 'FULL_TIME';
  if (mandateType.includes('Temporaire') || mandateType.includes('Remplacement')) return 'TEMPORARY';
  return 'CONTRACTOR';
}
