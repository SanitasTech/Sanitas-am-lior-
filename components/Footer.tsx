import Link from 'next/link';
import { COMPANY } from '@/lib/constants';

const LINKS_LEFT = [
  { href: '/', label: 'Accueil' },
  { href: '/postes', label: 'Postes' },
  { href: '/postuler', label: 'Envoyer mon profil' },
  { href: '/etablissements', label: 'Établissements' },
  { href: '/connexion', label: 'Espace candidat' },
];

const LINKS_RIGHT = [
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
  { href: '/politique-confidentialite', label: 'Politique de confidentialité' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg mt-auto">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-[18px] font-semibold tracking-tight text-fg">{COMPANY.name}</p>
            <p className="mt-1 text-[15px] text-fg-muted">{COMPANY.tagline}</p>
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
                Permis CNESST · <span className="font-medium text-fg-muted">{COMPANY.cnesstPermit}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-fg-subtle">Site</p>
            <ul className="mt-4 space-y-2 text-[15px]">
              {LINKS_LEFT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-fg-muted hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-fg-subtle">Information</p>
            <ul className="mt-4 space-y-2 text-[15px]">
              {LINKS_RIGHT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-fg-muted hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hr-soft mt-12 pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[13px] text-fg-subtle">
            © {new Date().getFullYear()} {COMPANY.name}. Tous droits réservés.
          </p>
          <Link
            href="/admin/login"
            className="text-[13px] text-fg-subtle hover:text-fg-muted"
          >
            Espace recruteur
          </Link>
        </div>
      </div>
    </footer>
  );
}
