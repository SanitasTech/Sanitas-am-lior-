import Link from 'next/link';
import { LOCAL_SEO_FOOTER_LINKS } from '@/lib/local-seo-pages';
import type { Locale } from '@/lib/i18n';

const CORE_LINKS: Record<Locale, Array<{ label: string; href: string }>> = {
  fr: [
    { label: 'Agence infirmière Québec', href: '/agence-infirmiere-quebec' },
    { label: 'Emplois infirmières Québec', href: '/emplois-infirmieres-quebec' },
    { label: 'Emplois infirmières auxiliaires', href: '/emplois-infirmieres-auxiliaires-quebec' },
    { label: 'Emplois PAB Québec', href: '/emplois-pab-quebec' },
    { label: 'Emplois ASSS Québec', href: '/emplois-asss-quebec' },
    { label: 'Mandats en régions éloignées', href: '/mandats-infirmiers-region-eloignee' },
    { label: 'Agence placement santé Laval', href: '/agence-placement-sante-laval' },
    { label: 'Recrutement personnel santé Québec', href: '/recrutement-personnel-sante-quebec' },
  ],
  en: [
    { label: 'Nursing agency Quebec', href: '/en/nursing-agency-quebec' },
    { label: 'Nursing jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
    { label: 'LPN jobs Quebec', href: '/en/licensed-practical-nurse-jobs-quebec' },
    { label: 'PAB jobs Quebec', href: '/en/pab-jobs-quebec' },
    { label: 'ASSS jobs Quebec', href: '/en/asss-jobs-quebec' },
    { label: 'Remote nursing assignments', href: '/en/remote-region-nursing-assignments-quebec' },
    { label: 'Healthcare staffing Laval', href: '/en/healthcare-staffing-laval' },
    { label: 'Healthcare recruitment Quebec', href: '/en/healthcare-recruitment-quebec' },
  ],
};

const ADS_SEARCH_CLUSTERS: Record<Locale, Array<{ label: string; href: string }>> = {
  fr: [
    { label: 'Mandats infirmiers Baie-James', href: '/mandat-infirmiere-baie-james' },
    { label: 'Mandats infirmiers Grand Nord', href: '/mandat-infirmiere-grand-nord' },
    { label: 'Mandats infirmiers Outaouais', href: '/mandat-infirmiere-outaouais' },
    { label: 'Mandats infirmiers Gaspésie', href: '/mandat-infirmiere-gaspesie' },
    { label: 'Mandats infirmiers Abitibi', href: '/mandat-infirmiere-abitibi' },
    { label: 'Mandats infirmiers Côte-Nord', href: '/mandat-infirmiere-cote-nord' },
    { label: 'Mandats infirmiers Bas-Saint-Laurent', href: '/mandat-infirmiere-bas-saint-laurent' },
    { label: 'Mandats infirmiers Îles-de-la-Madeleine', href: '/mandat-infirmiere-iles-de-la-madeleine' },
    { label: 'Mandats infirmiers urgence', href: '/mandats-infirmiers-urgence-quebec' },
    { label: 'Mandats infirmiers soins intensifs', href: '/mandats-infirmiers-soins-intensifs-quebec' },
    { label: 'Mandats infirmiers bloc opératoire', href: '/mandats-infirmiers-bloc-operatoire-quebec' },
    { label: 'Mandats infirmiers obstétrique', href: '/mandats-infirmiers-obstetrique-quebec' },
    { label: 'Mandats infirmiers CHSLD', href: '/mandats-infirmiers-chsld-quebec' },
  ],
  en: [
    { label: 'Nursing assignments Baie-James', href: '/en/nursing-assignments-baie-james' },
    { label: 'Nursing assignments Northern Quebec', href: '/en/nursing-assignments-northern-quebec' },
    { label: 'Nursing assignments Outaouais', href: '/en/nursing-assignments-outaouais' },
    { label: 'Nursing assignments Gaspesie', href: '/en/nursing-assignments-gaspesie' },
    { label: 'Nursing assignments Abitibi', href: '/en/nursing-assignments-abitibi' },
    { label: 'Nursing assignments Cote-Nord', href: '/en/nursing-assignments-cote-nord' },
    { label: 'Emergency nursing assignments', href: '/en/emergency-nursing-assignments-quebec' },
    { label: 'Intensive care nursing', href: '/en/intensive-care-nursing-assignments-quebec' },
    { label: 'Operating room nursing', href: '/en/operating-room-nursing-assignments-quebec' },
  ],
};

export default function PopularSearchLinks({ locale = 'fr' }: { locale?: Locale }) {
  const links = [...CORE_LINKS[locale], ...ADS_SEARCH_CLUSTERS[locale], ...LOCAL_SEO_FOOTER_LINKS[locale]];

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
