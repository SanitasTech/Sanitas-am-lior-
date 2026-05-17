// =====================================================================
// Agence Sanitas - Utilitaires
// =====================================================================

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function initials(first?: string | null, last?: string | null): string {
  const a = (first || '').trim().charAt(0).toUpperCase();
  const b = (last || '').trim().charAt(0).toUpperCase();
  return (a + b) || '·';
}

export function urgencyOrder(u?: string | null): number {
  switch (u) {
    case 'urgent':
      return 0;
    case 'high':
      return 1;
    default:
      return 2;
  }
}

export function safeJson<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(String(value)) as T;
  } catch {
    return fallback;
  }
}

export function truncate(str: string, len = 80): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1).trimEnd() + '…' : str;
}

export function normalizeJobMandate(mandate?: string | null): string {
  return (mandate || '').toLowerCase();
}

export function mandateRequiresWeekendCheck(mandate?: string | null): boolean {
  const m = normalizeJobMandate(mandate);
  return m.includes('remplacement') || m.includes('long terme');
}

/**
 * Calcule un score de complétion 0-100 pour une soumission, basé sur les
 * réponses utiles. Sert d'indicateur UX, pas d'algorithme de matching.
 */
export function computeCompletionScore(args: {
  hasContact: boolean;
  hasResidence: boolean;
  hasProfession: boolean;
  hasAvailability: boolean;
  hasRegions: boolean;
  hasExperience: boolean;
  cvProvided: boolean;
  consent: boolean;
  postingQuestionsAnswered: boolean;
}): number {
  const weights = {
    hasContact: 15,
    hasResidence: 10,
    hasProfession: 10,
    hasAvailability: 15,
    hasRegions: 10,
    hasExperience: 10,
    cvProvided: 15,
    consent: 10,
    postingQuestionsAnswered: 5,
  };
  let score = 0;
  for (const k of Object.keys(weights) as Array<keyof typeof weights>) {
    if (args[k]) score += weights[k];
  }
  return Math.min(100, score);
}

export function computeCandidateProfileCompletion(args: {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  city_residence?: string | null;
  region_residence?: string | null;
  profession?: string | null;
  qualified_professions?: string[] | null;
  years_experience?: string | null;
  start_availability?: string | null;
  preferred_shifts?: string[] | null;
  preferred_regions?: Array<{ region?: string | null }> | null;
  work_authorization?: string | null;
  languages?: string[] | null;
  mobility?: string | null;
  preferred_departments?: string[] | null;
}): number {
  let completion = 0;
  if (args.first_name && args.last_name) completion += 10;
  if (args.phone || args.email) completion += 10;
  if (args.city_residence && args.region_residence) completion += 10;
  if (args.profession || (args.qualified_professions || []).length > 0) completion += 15;
  if (args.years_experience) completion += 10;
  if (args.start_availability && (args.preferred_shifts || []).length > 0) completion += 15;
  if ((args.preferred_regions || []).some((r) => r.region)) completion += 10;
  if (args.work_authorization) completion += 5;
  if ((args.languages || []).length > 0) completion += 5;
  if (args.mobility) completion += 5;
  if ((args.preferred_departments || []).length > 0) completion += 5;
  return Math.min(100, completion);
}
