const PRODUCTION_SITE_URL = 'https://www.agencesanitas.com';
const LOCAL_SITE_URL = 'http://localhost:3000';

function normalizeProductionSiteUrl(value: string) {
  const siteUrl = value.replace(/\/$/, '');
  return siteUrl === 'https://agencesanitas.com' ? PRODUCTION_SITE_URL : siteUrl;
}

export function isLocalOrigin(origin: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

export function getCanonicalSiteUrl(runtimeOrigin = '') {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (configured && !isLocalOrigin(configured)) return normalizeProductionSiteUrl(configured);
  if (configured && process.env.NODE_ENV !== 'production') return configured;
  if (runtimeOrigin && !isLocalOrigin(runtimeOrigin)) return normalizeProductionSiteUrl(runtimeOrigin);
  return process.env.NODE_ENV === 'production' ? PRODUCTION_SITE_URL : LOCAL_SITE_URL;
}

export function getSafeRedirectPath(value: string | null | undefined, fallback = '/mon-profil') {
  if (!value) return fallback;

  try {
    const parsed = new URL(value, 'https://sanitas.local');
    const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return path.startsWith('/') && !path.startsWith('//') ? path : fallback;
  } catch {
    return fallback;
  }
}

export function buildAuthCallbackUrl(redirectTo?: string | null, runtimeOrigin = '') {
  const siteUrl = getCanonicalSiteUrl(runtimeOrigin);
  const callbackUrl = new URL('/auth/callback', siteUrl);
  callbackUrl.searchParams.set('next', '1');
  if (redirectTo) {
    callbackUrl.searchParams.set('redirect', getSafeRedirectPath(redirectTo));
  }
  return callbackUrl.toString();
}
