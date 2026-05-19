import 'server-only';

import {
  makePreferenceSetFromFlat,
  normalizeCandidatePreferenceSets,
} from '@/lib/ats';
import type { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Candidate, CandidatePreferenceSet } from '@/types';

type SupabaseAdmin = ReturnType<typeof createSupabaseAdminClient>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function buildFallbackPreferenceSet(
  candidateId: string,
  fallback: Partial<Candidate>
): CandidatePreferenceSet {
  return makePreferenceSetFromFlat({ ...fallback, id: candidateId }, { candidate_id: candidateId });
}

export function normalizePreferenceSetsForSave(args: {
  candidateId: string;
  preferenceSets?: CandidatePreferenceSet[] | null;
  fallback: Partial<Candidate>;
}): CandidatePreferenceSet[] {
  const sets = normalizeCandidatePreferenceSets(args.preferenceSets, {
    ...args.fallback,
    id: args.candidateId,
  });
  const resolved = sets.length > 0 ? sets : [buildFallbackPreferenceSet(args.candidateId, args.fallback)];
  return resolved.map((set, index) => ({
    ...set,
    candidate_id: args.candidateId,
    label: set.label || (index === 0 ? 'Choix principal' : `Choix ${index + 1}`),
    priority: index + 1,
    active: set.active !== false,
  }));
}

export async function syncCandidatePreferenceSets(
  supabase: SupabaseAdmin,
  args: {
    candidateId: string;
    preferenceSets?: CandidatePreferenceSet[] | null;
    fallback: Partial<Candidate>;
    replaceExisting?: boolean;
  }
): Promise<CandidatePreferenceSet[]> {
  const sets = normalizePreferenceSetsForSave(args);
  const saved: CandidatePreferenceSet[] = [];

  for (const set of sets) {
    const payload = {
      candidate_id: args.candidateId,
      label: set.label,
      priority: set.priority,
      professions: set.professions || [],
      regions: set.regions || [],
      departments: set.departments || [],
      shifts: set.shifts || [],
      mandate_types: set.mandate_types || [],
      start_date: set.start_date || null,
      mobility: set.mobility || null,
      salary_floor: set.salary_floor || null,
      constraints: set.constraints || null,
      active: set.active !== false,
    };

    if (set.id && UUID_RE.test(set.id)) {
      await supabase
        .from('candidate_preference_sets')
        .upsert({ id: set.id, ...payload }, { onConflict: 'id' });
      saved.push({ ...set, id: set.id, ...payload });
    } else {
      const { data } = await supabase
        .from('candidate_preference_sets')
        .insert(payload)
        .select('*');
      const row = Array.isArray(data) ? data[0] : data;
      saved.push(row ? (row as CandidatePreferenceSet) : { ...set, ...payload });
    }
  }

  if (args.replaceExisting !== false) {
    const keepIds = saved.map((set) => set.id).filter((id): id is string => !!id && UUID_RE.test(id));
    const { data: existing } = await supabase
      .from('candidate_preference_sets')
      .select('id')
      .eq('candidate_id', args.candidateId);

    for (const row of (Array.isArray(existing) ? existing : []) as Array<{ id?: string }>) {
      if (row.id && !keepIds.includes(row.id)) {
        await supabase
          .from('candidate_preference_sets')
          .update({ active: false })
          .eq('id', row.id);
      }
    }
  }

  return saved;
}
