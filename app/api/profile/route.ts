import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentCandidate, getCurrentUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { computeAtsProfileCompletion, hydrateCandidate } from '@/lib/ats';
import { syncCandidatePreferenceSets } from '@/lib/preference-sets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const regionChoiceSchema = z.object({
  region: z.string().max(200).default(''),
  all_region: z.boolean().default(true),
  cities: z.array(z.string().max(200)).default([]),
});

const preferenceSetSchema = z.object({
  id: z.string().optional().nullable(),
  candidate_id: z.string().optional().nullable(),
  label: z.string().max(120).default('Choix principal'),
  priority: z.number().int().min(1).max(50).default(1),
  professions: z.array(z.string().max(200)).default([]),
  regions: z.array(regionChoiceSchema).default([]),
  departments: z.array(z.string().max(200)).default([]),
  shifts: z.array(z.string().max(200)).default([]),
  mandate_types: z.array(z.string().max(200)).default([]),
  start_date: z.string().max(2000).optional().nullable(),
  mobility: z.string().max(2000).optional().nullable(),
  salary_floor: z.string().max(2000).optional().nullable(),
  constraints: z.string().max(2000).optional().nullable(),
  active: z.boolean().default(true),
});

const profileSchema = z.object({
  first_name: z.string().min(1).max(200),
  last_name: z.string().min(1).max(200),
  phone: z.string().max(40).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.literal('')),
  preferred_contact: z.string().optional().nullable(),
  best_contact_time: z.string().optional().nullable(),
  city_residence: z.string().optional().nullable(),
  region_residence: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  qualified_professions: z.array(z.string()).default([]),
  years_experience: z.string().optional().nullable(),
  permit_status: z.string().optional().nullable(),
  permit_number: z.string().optional().nullable(),
  languages: z.array(z.string()).default([]),
  work_authorization: z.string().optional().nullable(),
  mobility: z.string().optional().nullable(),
  preferred_mandate_types: z.array(z.string()).default([]),
  preferred_establishments: z.string().optional().nullable(),
  avoided_establishments: z.string().optional().nullable(),
  salary_expectations: z.string().optional().nullable(),
  start_availability: z.string().optional().nullable(),
  preferred_hours: z.string().optional().nullable(),
  preferred_shifts: z.array(z.string()).default([]),
  preferred_regions: z.array(regionChoiceSchema).default([]),
  preferred_departments: z.array(z.string()).default([]),
  housing_required: z.string().optional().nullable(),
  transport_available: z.string().optional().nullable(),
  constraints: z.string().optional().nullable(),
  mailing_list_opt_in: z.boolean().default(false),
  preference_sets: z.array(preferenceSetSchema).default([]),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
  }
  const candidate = await getCurrentCandidate();
  return NextResponse.json({ ok: true, candidate });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Non authentifié.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: first?.message || 'Données invalides.' },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const normalizedEmail = input.email ? input.email.toLowerCase().trim() : null;

  const { data: existing } = await supabase
    .from('candidates')
    .select('id, mailing_list_opt_in')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  const candidatePayload = {
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    phone: input.phone || null,
    email: normalizedEmail,
    preferred_contact: input.preferred_contact || null,
    best_contact_time: input.best_contact_time || null,
    city_residence: input.city_residence || null,
    region_residence: input.region_residence || null,
    postal_code: input.postal_code || null,
    mailing_list_opt_in: !!input.mailing_list_opt_in,
    mailing_list_opt_in_at:
      input.mailing_list_opt_in && !existing?.mailing_list_opt_in ? now : undefined,
    last_active_at: now,
  };

  const profilePayload = {
    profession: input.profession || null,
    qualified_professions:
      input.qualified_professions && input.qualified_professions.length > 0
        ? input.qualified_professions
        : input.profession
          ? [input.profession]
          : [],
    years_experience: input.years_experience || null,
    permit_status: input.permit_status || null,
    permit_number: input.permit_number || null,
    languages: input.languages || [],
    work_authorization: input.work_authorization || null,
    mobility: input.mobility || null,
    preferred_mandate_types: input.preferred_mandate_types || [],
    preferred_establishments: input.preferred_establishments || null,
    avoided_establishments: input.avoided_establishments || null,
    salary_expectations: input.salary_expectations || null,
  };

  const availabilityPayload = {
    start_availability: input.start_availability || null,
    preferred_hours: input.preferred_hours || null,
    preferred_shifts: input.preferred_shifts || [],
    preferred_regions: input.preferred_regions || [],
    preferred_departments: input.preferred_departments || [],
    housing_required: input.housing_required || null,
    transport_available: input.transport_available || null,
    constraints: input.constraints || null,
  };

  let candidateId = existing?.id as string | undefined;
  if (candidateId) {
    const { error } = await supabase
      .from('candidates')
      .update(candidatePayload)
      .eq('id', candidateId);
    if (error) {
      return NextResponse.json({ ok: false, error: 'Échec de la sauvegarde.' }, { status: 500 });
    }
  } else {
    const { data, error } = await supabase
      .from('candidates')
      .insert({
        ...candidatePayload,
        auth_user_id: user.id,
        consent_data: true,
        consent_data_at: now,
      })
      .select('id')
      .single();
    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: 'Échec de la création du profil.' },
        { status: 500 }
      );
    }
    candidateId = data.id as string;
  }

  const [profileResult, availabilityResult] = await Promise.all([
    supabase.from('candidate_profiles').upsert({ candidate_id: candidateId, ...profilePayload }),
    supabase
      .from('candidate_availability')
      .upsert({ candidate_id: candidateId, ...availabilityPayload }),
  ]);

  if (profileResult.error || availabilityResult.error) {
    return NextResponse.json(
      { ok: false, error: 'Échec de la sauvegarde du dossier.' },
      { status: 500 }
    );
  }

  const savedPreferenceSets = await syncCandidatePreferenceSets(supabase, {
    candidateId,
    preferenceSets: input.preference_sets.map((set) => ({
      ...set,
      id: set.id || undefined,
      candidate_id: set.candidate_id || undefined,
    })),
    fallback: {
      id: candidateId,
      profession: profilePayload.profession,
      qualified_professions: profilePayload.qualified_professions,
      mobility: profilePayload.mobility,
      preferred_mandate_types: profilePayload.preferred_mandate_types,
      preferred_establishments: profilePayload.preferred_establishments,
      avoided_establishments: profilePayload.avoided_establishments,
      salary_expectations: profilePayload.salary_expectations,
      start_availability: availabilityPayload.start_availability,
      preferred_hours: availabilityPayload.preferred_hours,
      preferred_shifts: availabilityPayload.preferred_shifts,
      preferred_regions: availabilityPayload.preferred_regions,
      preferred_departments: availabilityPayload.preferred_departments,
      housing_required: availabilityPayload.housing_required,
      transport_available: availabilityPayload.transport_available,
      constraints: availabilityPayload.constraints,
    },
  });

  const hydrated = hydrateCandidate(
    {
      id: candidateId,
      ...candidatePayload,
      consent_data: true,
      consent_data_at: now,
      status: 'active',
      created_at: now,
      updated_at: now,
    },
    { candidate_id: candidateId, ...profilePayload },
    { candidate_id: candidateId, ...availabilityPayload },
    savedPreferenceSets as unknown as Record<string, unknown>[]
  );
  const completion = hydrated ? computeAtsProfileCompletion(hydrated) : 0;

  await supabase
    .from('candidates')
    .update({ profile_completion_score: completion, last_active_at: now })
    .eq('id', candidateId);

  return NextResponse.json({ ok: true, completion });
}
