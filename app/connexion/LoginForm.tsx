'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { COMPANY } from '@/lib/constants';

interface Props {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
      setError(e instanceof Error ? e.message : 'Connexion Google indisponible.');
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
        {loading ? 'Connexion...' : 'Continuer avec Google'}
      </button>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-[14.5px] font-medium text-fg">
          Vous préférez ne pas postuler en ligne ?
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">
          Appelez-nous et notre équipe prendra vos informations directement.
        </p>
        <a href={COMPANY.phoneHref} className="btn-secondary btn-sm mt-3">
          Appeler {COMPANY.phone}
        </a>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
          {error}
        </div>
      )}

      <p className="text-[12.5px] text-fg-subtle text-center">
        En vous connectant, vous acceptez notre{' '}
        <a href="/politique-confidentialite" className="underline">politique de confidentialité</a>.
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
