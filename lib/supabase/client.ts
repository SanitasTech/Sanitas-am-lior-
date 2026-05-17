// =====================================================================
// Supabase client navigateur (clé anonyme)
// =====================================================================
// Utilisable côté Client Component uniquement.

import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Supabase env vars manquantes côté client.');
  }
  return createBrowserClient(url, anon);
}
