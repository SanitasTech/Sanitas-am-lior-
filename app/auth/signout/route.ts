import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authCookieNames() {
  return cookies()
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name.startsWith('sb-') || name.includes('supabase'));
}

function clearAuthCookies(response: NextResponse, names: string[]) {
  for (const name of names) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
  }
}

function getSafeRedirectPath(value: string | null, fallback: string) {
  if (!value) return fallback;

  try {
    const parsed = new URL(value, 'https://sanitas.local');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

async function signOutResponse(req: Request, redirectFallback = '/') {
  const cookieNames = authCookieNames();
  const supabase = createSupabaseServerClient();
  try {
    await supabase.auth.signOut();
  } catch {
    // Une session locale expirée doit quand même vider les cookies côté app.
  }

  const url = new URL(req.url);
  const redirectTo = getSafeRedirectPath(url.searchParams.get('redirect'), redirectFallback);
  const response =
    req.method === 'GET'
      ? NextResponse.redirect(new URL(redirectTo, url.origin))
      : NextResponse.json({ ok: true });

  clearAuthCookies(response, cookieNames);
  return response;
}

export async function POST(req: Request) {
  return signOutResponse(req);
}

export async function GET(req: Request) {
  return signOutResponse(req);
}
