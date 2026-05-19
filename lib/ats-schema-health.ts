import 'server-only';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const REQUIRED_ATS_TABLES = [
  'candidates',
  'candidate_profiles',
  'candidate_availability',
  'candidate_preference_sets',
  'candidate_documents',
  'applications',
  'application_documents',
  'match_scores',
  'recruiter_tasks',
  'activity_events',
  'jobs',
];

export async function checkAtsSchemaHealth() {
  const supabase = createSupabaseAdminClient();
  const checks = await Promise.all(
    REQUIRED_ATS_TABLES.map(async (table) => {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      return { table, error };
    })
  );

  const missingTables = checks
    .filter(({ error }) => error?.code === 'PGRST205' || /Could not find the table/i.test(error?.message || ''))
    .map(({ table }) => table);

  const otherErrors = checks
    .filter(({ error }) => !!error)
    .filter(({ error }) => !(error?.code === 'PGRST205' || /Could not find the table/i.test(error?.message || '')))
    .map(({ table, error }) => `${table}: ${error?.message || 'Erreur inconnue'}`);

  return {
    ok: missingTables.length === 0 && otherErrors.length === 0,
    missingTables,
    otherErrors,
  };
}
