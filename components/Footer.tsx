import Link from 'next/link';
import { COMPANY } from '@/lib/constants';
import { PUBLIC_COPY, ROUTES, localizeHref, type Locale } from '@/lib/i18n';

export default function Footer({ locale = 'fr' }: { locale?: Locale }) {
  const copy = PUBLIC_COPY[locale];
  const linksLeft = [
    { href: ROUTES.home.fr, label: copy.footer.home },
    { href: ROUTES.jobs.fr, label: copy.nav.jobs },
    { href: ROUTES.apply.fr, label: copy.footer.sendProfile },
    { href: ROUTES.facilities.fr, label: copy.nav.facilities },
    { href: ROUTES.login.fr, label: copy.footer.candidateSpace },
  ];
  const seoLinks =
    locale === 'en'
      ? [
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
          { href: '/emplois-infirmieres-quebec', label: 'Emplois infirmières Québec' },
          { href: '/emplois-infirmieres-auxiliaires-quebec', label: 'Emplois infirmières auxiliaires' },
          { href: '/emplois-pab-quebec', label: 'Emplois PAB Québec' },
          { href: '/emplois-asss-quebec', label: 'Emplois ASSS Québec' },
          { href: '/mandats-infirmiers-region-eloignee', label: 'Mandats en région éloignée' },
          { href: '/agence-placement-sante-laval', label: 'Agence placement santé Laval' },
          { href: '/recrutement-personnel-sante-quebec', label: 'Recrutement personnel santé' },
          { href: '/faq-candidats', label: 'FAQ candidats' },
          { href: '/faq-etablissements', label: 'FAQ établissements' },
        ];
  const linksRight = [
    { href: ROUTES.about.fr, label: copy.nav.about },
    { href: ROUTES.contact.fr, label: copy.nav.contact },
    { href: ROUTES.privacy.fr, label: copy.footer.privacy },
  ];

  return (
    <footer className="border-t border-border bg-bg mt-auto">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-[18px] font-semibold tracking-tight text-fg">{COMPANY.name}</p>
            <p className="mt-1 text-[15px] text-fg-muted">
              {locale === 'en' ? 'Healthcare staffing agency' : COMPANY.tagline}
            </p>
            <div className="mt-6 space-y-1.5 text-[15px] text-fg-muted">
              <p>
                <a href={COMPANY.phoneHref} className="hover:text-fg">
                  {COMPANY.phone}
                </a>
              </p>
              <p>
                <a href={COMPANY.emailHref} className="hover:text-fg">
                  {COMPANY.email}
                </a>
              </p>
              <p>
                {COMPANY.address.line1}, {COMPANY.address.line2}
                <br />
                {COMPANY.address.city}, {COMPANY.address.province}, {COMPANY.address.postal}
              </p>
              <p className="pt-3 text-[13.5px] text-fg-subtle">
                {copy.footer.cnesst} ·{' '}
                <span className="font-medium text-fg-muted">{COMPANY.cnesstPermit}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-fg-subtle">
              {copy.footer.site}
            </p>
            <ul className="mt-4 space-y-2 text-[15px]">
              {linksLeft.map((l) => (
                <li key={l.href}>
                  <Link href={localizeHref(locale, l.href)} className="text-fg-muted hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
              {seoLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-fg-muted hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-fg-subtle">
              {copy.footer.information}
            </p>
            <ul className="mt-4 space-y-2 text-[15px]">
              {linksRight.map((l) => (
                <li key={l.href}>
                  <Link href={localizeHref(locale, l.href)} className="text-fg-muted hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hr-soft mt-12 pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-fg-subtle">
            © {new Date().getFullYear()} {COMPANY.name}. {copy.footer.rights}
          </p>
          <Link href="/admin/login" className="text-[13px] text-fg-subtle hover:text-fg-muted">
            {copy.footer.recruiterSpace}
          </Link>
        </div>
      </div>
    </footer>
  );
}
