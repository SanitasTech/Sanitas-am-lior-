'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { COMPANY } from '@/lib/constants';
import { ROUTES, type Locale } from '@/lib/i18n';
import { useLocale } from '@/components/I18nProvider';

interface Props {
  redirectTo?: string;
  locale?: Locale;
}

export default function LoginForm({ redirectTo, locale: localeProp }: Props) {
  const contextLocale = useLocale();
  const locale = localeProp || contextLocale;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const runtimeIsLocal =
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(runtimeOrigin);
  const productionFallback =
    process.env.NODE_ENV === 'production' ? 'https://www.agencesanitas.com' : 'http://localhost:3000';
  const siteUrl = configuredSiteUrl || (!runtimeIsLocal ? runtimeOrigin : '') || productionFallback;
  const redirect = redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : '';
  const callbackUrl = `${siteUrl}/auth/callback?next=1${redirect}`;

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl },
      });
      if (error) throw error;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : locale === 'en' ? 'Google sign-in is unavailable.' : 'Connexion Google indisponible.');
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-border bg-surface px-5 py-3 text-[16px] font-medium text-fg hover:bg-muted transition-colors disabled:opacity-50"
      >
        <GoogleIcon />
        {loading ? (locale === 'en' ? 'Signing in...' : 'Connexion...') : locale === 'en' ? 'Continue with Google' : 'Continuer avec Google'}
      </button>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-[14.5px] font-medium text-fg">
          {locale === 'en' ? 'Prefer not to apply online?' : 'Vous preferez ne pas postuler en ligne ?'}
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">
          {locale === 'en'
            ? 'Call us and our team will collect your information directly.'
            : 'Appelez-nous et notre equipe prendra vos informations directement.'}
        </p>
        <a href={COMPANY.phoneHref} className="btn-secondary btn-sm mt-3">
          {locale === 'en' ? 'Call' : 'Appeler'} {COMPANY.phone}
        </a>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
          {error}
        </div>
      )}

      <p className="text-[12.5px] text-fg-subtle text-center">
        {locale === 'en' ? 'By signing in, you accept our ' : 'En vous connectant, vous acceptez notre '}
        <a href={ROUTES.privacy[locale]} className="underline">
          {locale === 'en' ? 'privacy policy' : 'politique de confidentialite'}
        </a>
        .
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path d="M22 12a10 10 0 1 1-3-7.1l-2.8 2.7A6 6 0 1 0 18 12h-6V9.5h9.4c.1.8.1 1.6.1 2.5z" fill="#4285F4" />
    </svg>
  );
}
