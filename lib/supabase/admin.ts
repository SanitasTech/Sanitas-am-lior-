// =====================================================================
// Supabase client admin (service_role) — SERVEUR UNIQUEMENT
// =====================================================================
// Ne jamais importer ce module dans un Client Component.
// Bypass RLS. À n'utiliser que dans les routes API contrôlées.

import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error('Supabase env vars manquantes (admin).');
  }
  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
