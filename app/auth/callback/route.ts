import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getOrCreateCandidateForUser } from '@/lib/auth';
import { getCanonicalSiteUrl, getSafeRedirectPath } from '@/lib/auth-redirects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Callback OAuth (Google) + magic link.
 *
 * Supabase redirects here after successful authentication with a code in the
 * URL. We exchange it for a session, ensure the candidate row exists, then
 * redirect to a safe internal destination on the canonical public site.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const redirectTo = getSafeRedirectPath(url.searchParams.get('redirect'));

  if (code) {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await getOrCreateCandidateForUser(data.user);
    }
  }

  return NextResponse.redirect(new URL(redirectTo, getCanonicalSiteUrl(url.origin)));
}
