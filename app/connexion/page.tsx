import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import LoginForm from './LoginForm';
import { getCurrentUser } from '@/lib/auth';
import { getSafeRedirectPath } from '@/lib/auth-redirects';
import {
  CheckCircleIcon,
  ChecklistIcon,
  ClipboardIcon,
  DecorativeBlob,
} from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre espace candidat Agence Sanitas.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { redirect?: string };
}

export default async function ConnexionPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) {
    redirect(getSafeRedirectPath(searchParams.redirect, '/mon-profil'));
  }

  const goingToApply = searchParams.redirect?.includes('/postuler');

  return (
    <PublicLayout>
      <section className="relative section pt-12 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-5xl relative">
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <div className="order-2 lg:order-1">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                Espace candidat
              </p>
              <h1 className="mt-2 text-display-md text-fg">
                {goingToApply ? 'Plus qu’une étape avant de postuler' : 'Bienvenue chez Sanitas'}
              </h1>
              <p className="mt-3 text-[16px] leading-relaxed text-fg-muted max-w-prose">
                On utilise ton compte Google pour sécuriser ton dossier et te faire gagner du
                temps à chaque candidature. Pas de mot de passe à retenir, pas de courriels
                marketing imposés.
              </p>

              <ul className="mt-8 space-y-4 max-w-xl">
                <Benefit
                  icon={<ClipboardIcon className="h-5 w-5" />}
                  title="Ton CV et tes documents, une seule fois"
                  body="Téléverse-les la première fois. À la prochaine candidature, ils sont déjà là — tu valides et tu envoies."
                />
                <Benefit
                  icon={<ChecklistIcon className="h-5 w-5" />}
                  title="Suis tes candidatures en direct"
                  body="Tu vois où en est chaque dossier (reçu, contacté, présenté, placé) sans avoir à rappeler."
                />
                <Benefit
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                  title="Tes données protégées (Loi 25)"
                  body="Stockage chiffré au Canada. Tu peux corriger ou supprimer ton dossier à tout moment."
                />
              </ul>

              <p className="mt-8 text-[13px] text-fg-subtle">
                Tu n’as pas de compte Google ?{' '}
                <a href="tel:+14509739696" className="font-medium text-fg underline">
                  Appelle-nous au 450 973-9696
                </a>{' '}
                — un recruteur prend tes infos en 5 minutes.
              </p>
            </div>

            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
                <h2 className="text-[18px] font-semibold text-fg">Connexion sécurisée</h2>
                <p className="mt-1.5 text-[13.5px] text-fg-muted">
                  Tu seras redirigé(e) vers Google, puis ramené(e) ici automatiquement.
                </p>
                <div className="mt-5">
                  <LoginForm redirectTo={searchParams.redirect} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-fg">{title}</p>
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-fg-muted">{body}</p>
      </div>
    </li>
  );
}
