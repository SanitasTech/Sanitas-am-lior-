import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOrCreateCandidate } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getPublicOrigin(callbackOrigin: string) {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || callbackOrigin;
}

function getSafeRedirectPath(value: string | null) {
  if (!value) return '/mon-profil';

  try {
    const parsed = new URL(value, 'https://sanitas.local');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/mon-profil';
  }
}

/**
 * Callback OAuth (Google) + magic link.
 *
 * Supabase redirige ici après authentification réussie avec un code dans
 * l'URL. On l'échange contre une session, puis on s'assure qu'un row
 * candidates existe pour ce user, et on redirige vers la destination.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const redirectTo = getSafeRedirectPath(url.searchParams.get('redirect'));

  if (code) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    // Crée le candidat lié si premier login
    await getOrCreateCandidate();
  }

  return NextResponse.redirect(new URL(redirectTo, getPublicOrigin(url.origin)));
}
