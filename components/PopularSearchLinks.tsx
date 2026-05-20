import Link from 'next/link';
import { LOCAL_SEO_FOOTER_LINKS } from '@/lib/local-seo-pages';
import type { Locale } from '@/lib/i18n';

const CORE_LINKS: Record<Locale, Array<{ label: string; href: string }>> = {
  fr: [
    { label: 'Emplois infirmières Québec', href: '/emplois-infirmieres-quebec' },
    { label: 'Emplois infirmières auxiliaires', href: '/emplois-infirmieres-auxiliaires-quebec' },
    { label: 'Emplois PAB Québec', href: '/emplois-pab-quebec' },
    { label: 'Emplois ASSS Québec', href: '/emplois-asss-quebec' },
    { label: 'Mandats en région éloignée', href: '/mandats-infirmiers-region-eloignee' },
  ],
  en: [
    { label: 'Nursing jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
    { label: 'LPN jobs Quebec', href: '/en/licensed-practical-nurse-jobs-quebec' },
    { label: 'PAB jobs Quebec', href: '/en/pab-jobs-quebec' },
    { label: 'ASSS jobs Quebec', href: '/en/asss-jobs-quebec' },
    { label: 'Remote nursing assignments', href: '/en/remote-region-nursing-assignments-quebec' },
  ],
};

export default function PopularSearchLinks({ locale = 'fr' }: { locale?: Locale }) {
  const links = [...CORE_LINKS[locale], ...LOCAL_SEO_FOOTER_LINKS[locale]];

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-fg">
            {locale === 'en' ? 'Popular searches' : 'Recherches populaires'}
          </h2>
          <p className="mt-1 max-w-prose text-[14.5px] leading-relaxed text-fg-muted">
            {locale === 'en'
              ? 'Browse common searches by role and Quebec region.'
              : 'Explorez les recherches fréquentes par profession et par région du Québec.'}
          </p>
        </div>
        <Link href={locale === 'en' ? '/en/candidate-faq' : '/faq-candidats'} className="text-[14px] font-medium text-accent hover:text-fg">
          {locale === 'en' ? 'Candidate FAQ' : 'FAQ candidats'}
        </Link>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="chip-link">
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
