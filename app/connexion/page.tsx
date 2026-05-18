import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import LoginForm from './LoginForm';
import { getCurrentUser } from '@/lib/auth';
import { getSafeRedirectPath } from '@/lib/auth-redirects';
import { DecorativeBlob } from '@/components/Icons';

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

  return (
    <PublicLayout>
      <section className="relative section pt-16 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-md relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Espace candidat
          </p>
          <h1 className="mt-2 text-display-md text-fg">Connexion</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">
            Connectez-vous avec Google pour postuler en ligne, gérer votre profil et réutiliser
            vos documents sans tout ressaisir à chaque mandat.
          </p>

          <div className="mt-8">
            <LoginForm redirectTo={searchParams.redirect} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
