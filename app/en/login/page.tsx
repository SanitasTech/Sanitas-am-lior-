import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import LoginForm from '@/app/connexion/LoginForm';
import { getCurrentUser } from '@/lib/auth';
import { DecorativeBlob } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Agence Sanitas candidate portal.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { redirect?: string };
}

export default async function EnglishLoginPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) {
    redirect(searchParams.redirect || '/en/my-profile');
  }

  return (
    <PublicLayout locale="en">
      <section className="relative section pt-16 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-md relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Candidate portal</p>
          <h1 className="mt-2 text-display-md text-fg">Sign in</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted">
            Sign in with Google to apply online, manage your profile and reuse your documents without entering the same information for every assignment.
          </p>

          <div className="mt-8">
            <LoginForm redirectTo={searchParams.redirect} locale="en" />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
