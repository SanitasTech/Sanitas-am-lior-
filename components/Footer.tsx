import Link from 'next/link';
import { COMPANY } from '@/lib/constants';
import { PUBLIC_COPY, ROUTES, localizeHref, type Locale } from '@/lib/i18n';
import { LOCAL_SEO_FOOTER_LINKS } from '@/lib/local-seo-pages';

export default function Footer({ locale = 'fr' }: { locale?: Locale }) {
  const copy = PUBLIC_COPY[locale];
  const candidateLinks = [
    { href: ROUTES.jobs.fr, label: copy.nav.viewJobs },
    { href: ROUTES.apply.fr, label: copy.footer.sendProfile },
    { href: ROUTES.login.fr, label: copy.footer.candidateSpace },
  ];
  const facilityLinks = [
    { href: ROUTES.facilities.fr, label: copy.nav.staffing },
    { href: ROUTES.contact.fr, label: copy.nav.contact },
  ];
  const infoLinks = [
    { href: ROUTES.home.fr, label: copy.footer.home },
    { href: ROUTES.about.fr, label: copy.nav.about },
    { href: ROUTES.privacy.fr, label: copy.footer.privacy },
  ];
  const seoLinks =
    locale === 'en'
      ? [
          { href: '/en/nursing-agency-quebec', label: 'Nursing agency Quebec' },
          { href: '/en/nursing-agency-jobs-quebec', label: 'Nursing jobs Quebec' },
          { href: '/en/licensed-practical-nurse-jobs-quebec', label: 'LPN jobs Quebec' },
          { href: '/en/pab-jobs-quebec', label: 'PAB jobs Quebec' },
          { href: '/en/asss-jobs-quebec', label: 'ASSS jobs Quebec' },
          { href: '/en/remote-region-nursing-assignments-quebec', label: 'Remote nursing assignments' },
          { href: '/en/healthcare-staffing-laval', label: 'Healthcare staffing Laval' },
          { href: '/en/healthcare-staffing-agency-quebec', label: 'Healthcare staffing Quebec' },
          { href: '/en/healthcare-recruitment-quebec', label: 'Healthcare recruitment Quebec' },
          { href: '/en/candidate-faq', label: 'Candidate FAQ' },
          { href: '/en/facility-faq', label: 'Facility FAQ' },
        ]
      : [
          { href: '/agence-infirmiere-quebec', label: 'Agence infirmière Québec' },
          { href: '/emplois-infirmieres-quebec', label: 'Emplois infirmières Québec' },
          { href: '/emplois-infirmieres-auxiliaires-quebec', label: 'Emplois infirmières auxiliaires' },
          { href: '/emplois-pab-quebec', label: 'Emplois PAB Québec' },
          { href: '/emplois-asss-quebec', label: 'Emplois ASSS Québec' },
          { href: '/mandats-infirmiers-region-eloignee', label: 'Mandats en régions éloignées' },
          { href: '/agence-placement-sante-laval', label: 'Agence placement santé Laval' },
          { href: '/recrutement-personnel-sante-quebec', label: 'Recrutement personnel santé' },
          { href: '/faq-candidats', label: 'FAQ candidats' },
          { href: '/faq-etablissements', label: 'FAQ établissements' },
        ];
  const localSeoLinks = LOCAL_SEO_FOOTER_LINKS[locale];
  const searchLinks = [...seoLinks, ...localSeoLinks];

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p
              className="text-[19px] font-bold uppercase tracking-[0.11em] text-fg"
              style={{
                fontFamily:
                  'Gotham, "Gotham SSm", "Avenir Next", Montserrat, "SF Pro Display", "Segoe UI", sans-serif',
              }}
            >
              SANITAS
            </p>
            <p className="mt-1.5 text-[15px] text-fg-muted">
              {locale === 'en' ? 'Healthcare staffing agency' : COMPANY.tagline}
            </p>
            <div className="mt-5 space-y-1.5 text-[14.5px] text-fg-muted">
              <p>
                <a href={COMPANY.phoneHref} className="font-medium text-fg transition-colors hover:text-accent">
                  {COMPANY.phone}
                </a>
              </p>
              <p>
                <a href={COMPANY.emailHref} className="transition-colors hover:text-accent">
                  {COMPANY.email}
                </a>
              </p>
              <p>
                {COMPANY.address.line1}, {COMPANY.address.line2}
                <br />
                {COMPANY.address.city}, {COMPANY.address.province}, {COMPANY.address.postal}
              </p>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-[13px] text-accent ring-1 ring-inset ring-accent/15">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 3 3 5-5" />
              </svg>
              {copy.footer.cnesst} <span className="font-semibold">{COMPANY.cnesstPermit}</span>
            </p>
          </div>

          <FooterColumn
            title={locale === 'en' ? 'Candidates' : 'Candidats'}
            links={candidateLinks}
            locale={locale}
          />
          <FooterColumn title={copy.nav.facilities} links={facilityLinks} locale={locale} />
          <FooterColumn title={copy.footer.information} links={infoLinks} locale={locale} />
        </div>

        <div className="mt-10 border-t border-border pt-8">
          <p className="eyebrow-subtle">
            {locale === 'en' ? 'Popular searches' : 'Recherches populaires'}
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 text-[13.5px] sm:grid-cols-2 lg:grid-cols-3">
            {searchLinks.map((l) => (
              <li key={l.href} className="min-w-0">
                <Link href={l.href} className="text-fg-muted transition-colors hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hr-soft mt-10 pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-fg-subtle">
            © {new Date().getFullYear()} {COMPANY.name}. {copy.footer.rights}
          </p>
          <Link href="/admin/login" className="text-[13px] text-fg-subtle transition-colors hover:text-fg-muted">
            {copy.footer.recruiterSpace}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  locale,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
  locale: Locale;
}) {
  return (
    <div>
      <p className="eyebrow-subtle">{title}</p>
      <ul className="mt-4 space-y-2.5 text-[14.5px]">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={localizeHref(locale, l.href)}
              className="text-fg-muted transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
