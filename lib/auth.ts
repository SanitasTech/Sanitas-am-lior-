// =====================================================================
// Helpers d'authentification (admin + candidat)
// =====================================================================

import 'server-only';
import { createSupabaseServerClient } from './supabase/server';
import { createSupabaseAdminClient } from './supabase/admin';
import { hydrateCandidate } from '@/lib/ats';
import type { Candidate } from '@/types';

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Vérifie que l'utilisateur courant est un admin (présent dans profiles_admin).
 * Retourne l'objet user ou null si non autorisé.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('profiles_admin')
    .select('id, role, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return { user, profile: data };
}

/**
 * Récupère le candidat lié à l'utilisateur connecté. Crée un row vide
 * la première fois (à la première connexion Google/magic link).
 *
 * Retourne null si l'utilisateur n'est pas connecté.
 */
export async function getOrCreateCandidate(): Promise<Candidate | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const admin = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await admin
    .from('candidates')
    .select('*, profile:candidate_profiles(*), availability:candidate_availability(*)')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (existingError) {
    console.error('[auth] Candidate lookup failed:', existingError.message);
    return null;
  }

  if (existing) {
    const row = existing as Record<string, unknown>;
    return hydrateCandidate(row, row.profile as Record<string, unknown>, row.availability as Record<string, unknown>);
  }

  // Premier login : créer un candidat vide. On utilise les metadata Google
  // si disponibles pour pré-remplir nom/courriel. Sinon on prend le préfixe
  // du courriel comme fallback (ex. "moncef@gmail.com" → "moncef") plutôt
  // qu'un mot générique qui ferait croire à un nom déjà saisi.
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const fullName = typeof meta.full_name === 'string' ? meta.full_name : '';
  const [metaFirst, ...metaRest] = fullName.split(' ').filter(Boolean);
  const emailPrefix = (user.email || '').split('@')[0] || '';
  // first_name est NOT NULL ; en dernier recours on met une chaîne vide
  // pour signaler clairement au candidat qu'il doit la remplir.
  const firstName = metaFirst || emailPrefix || '';
  const lastName = metaRest.join(' ');

  const { data: created, error } = await admin
    .from('candidates')
    .insert({
      auth_user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      email: user.email || null,
      consent_data: true,
      consent_data_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error || !created) return null;
  await Promise.all([
    admin.from('candidate_profiles').upsert({
      candidate_id: created.id,
      qualified_professions: [],
      languages: [],
    }),
    admin.from('candidate_availability').upsert({
      candidate_id: created.id,
      preferred_regions: [],
      preferred_shifts: [],
      preferred_departments: [],
    }),
  ]);

  return hydrateCandidate(created as Record<string, unknown>, null, null);
}

/**
 * Comme getOrCreateCandidate mais sans création. Pour les pages qui veulent
 * juste lire le profil (read-only).
 */
export async function getCurrentCandidate(): Promise<Candidate | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('candidates')
    .select('*, profile:candidate_profiles(*), availability:candidate_availability(*)')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return hydrateCandidate(row, row.profile as Record<string, unknown>, row.availability as Record<string, unknown>);
}
