import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { applicationSchema } from '@/lib/validation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth';
import { sendEmail, renderEmailHtml } from '@/lib/email';
import { COMPANY } from '@/lib/constants';
import {
  candidateFromApplicationAnswers,
  computeAtsProfileCompletion,
  computeMatchScore,
  hydrateCandidate,
} from '@/lib/ats';
import type { Candidate, CandidateDocument, Job, SubmissionAnswers } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_NOTIF_EMAIL = process.env.RESEND_TO || COMPANY.email;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

interface DocumentInput {
  document_id?: string | null;
  document_type: string;
  status: 'À recevoir' | 'Reçu' | 'À renouveler' | 'Non applicable';
  file_path?: string | null;
  file_name?: string | null;
}

async function ensureCandidateDocumentId(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  candidateId: string,
  doc: DocumentInput,
  now: string
) {
  if (doc.document_id) return doc.document_id;
  if (doc.status !== 'Reçu' || !doc.file_path) return null;

  const { data: existing } = await supabase
    .from('candidate_documents')
    .select('id')
    .eq('candidate_id', candidateId)
    .eq('document_type', doc.document_type)
    .eq('file_path', doc.file_path)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  await supabase
    .from('candidate_documents')
    .update({ is_current: false, archived_at: now })
    .eq('candidate_id', candidateId)
    .eq('document_type', doc.document_type)
    .eq('is_current', true);

  const { data: created } = await supabase
    .from('candidate_documents')
    .insert({
      candidate_id: candidateId,
      document_type: doc.document_type,
      status: 'Reçu',
      file_path: doc.file_path,
      file_name: doc.file_name || null,
      uploaded_at: now,
      is_current: true,
    })
    .select('id')
    .maybeSingle();
  return (created?.id as string | undefined) || null;
}

export async function POST(req: Request) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    return NextResponse.json({ ok: false, error: 'Connexion requise.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
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
  const normalizedEmail = input.candidate.email ? input.candidate.email.toLowerCase().trim() : null;
  const normalizedPhone = input.candidate.phone ? input.candidate.phone.trim() : null;

  let job: Job | null = null;
  let jobId: string | null = null;
  let postingSnapshot: Record<string, unknown> | null = null;
  if (input.submission_type === 'posting' && input.job_id) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', input.job_id)
      .maybeSingle();
    if (error || !data) {
      return NextResponse.json({ ok: false, error: 'Mandat introuvable.' }, { status: 404 });
    }
    job = data as Job;
    if (job.status !== 'active') {
      return NextResponse.json({ ok: false, error: "Ce mandat n'est plus actif." }, { status: 410 });
    }
    jobId = job.id;
    postingSnapshot = {
      id: job.id,
      title: job.title,
      profession: job.profession,
      region: job.region,
      city: job.city,
      establishment: job.establishment,
      department: job.department,
      shift: job.shift,
      schedule: job.schedule,
      mandate_type: job.mandate_type,
      start_date: job.start_date,
      duration: job.duration,
      salary: job.salary,
      urgency: job.urgency,
      requirements: job.requirements,
      particularities: job.particularities,
      required_documents: job.required_documents,
      extra_questions: job.extra_questions,
      captured_at: now,
    };
  }

  let candidateId: string | null = null;
  const { data: linked } = await supabase
    .from('candidates')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .maybeSingle();
  if (linked?.id) candidateId = linked.id as string;

  if (!candidateId && normalizedEmail) {
    const { data } = await supabase
      .from('candidates')
      .select('id')
      .eq('email', normalizedEmail)
      .is('auth_user_id', null)
      .maybeSingle();
    if (data?.id) candidateId = data.id as string;
  }

  if (!candidateId && normalizedPhone) {
    const { data } = await supabase
      .from('candidates')
      .select('id')
      .eq('phone', normalizedPhone)
      .is('auth_user_id', null)
      .maybeSingle();
    if (data?.id) candidateId = data.id as string;
  }

  const candidatePayload = {
    first_name: input.candidate.first_name,
    last_name: input.candidate.last_name,
    phone: normalizedPhone,
    email: normalizedEmail,
    preferred_contact: input.candidate.preferred_contact || input.answers.preferred_contact || null,
    best_contact_time: input.candidate.best_contact_time || input.answers.best_contact_time || null,
    city_residence: input.candidate.city_residence || input.answers.city_residence || null,
    region_residence: input.candidate.region_residence || input.answers.region_residence || null,
    postal_code: input.candidate.postal_code || input.answers.postal_code || null,
    consent_data: !!input.candidate.consent_data,
    consent_data_at: input.candidate.consent_data ? now : null,
    mailing_list_opt_in: !!input.candidate.mailing_list_opt_in,
    mailing_list_opt_in_at: input.candidate.mailing_list_opt_in ? now : null,
    auth_user_id: authUser.id,
    last_active_at: now,
  };

  if (candidateId) {
    const { error } = await supabase.from('candidates').update(candidatePayload).eq('id', candidateId);
    if (error) {
      return NextResponse.json({ ok: false, error: 'Impossible de mettre à jour le candidat.' }, { status: 500 });
    }
  } else {
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidatePayload)
      .select('id')
      .single();
    if (error || !data) {
      return NextResponse.json({ ok: false, error: 'Impossible de créer le candidat.' }, { status: 500 });
    }
    candidateId = data.id as string;
  }

  await Promise.all([
    supabase.from('candidate_profiles').upsert({
      candidate_id: candidateId,
      profession: input.candidate.profession || input.answers.profession || null,
      qualified_professions:
        input.candidate.qualified_professions && input.candidate.qualified_professions.length > 0
          ? input.candidate.qualified_professions
          : input.answers.qualified_professions && input.answers.qualified_professions.length > 0
            ? input.answers.qualified_professions
            : input.candidate.profession || input.answers.profession
              ? [input.candidate.profession || input.answers.profession].filter(Boolean)
              : [],
      years_experience: input.answers.years_experience || null,
      permit_status: input.answers.permit_status || null,
      permit_number: input.answers.permit_number || null,
      work_authorization: input.candidate.work_authorization || input.answers.work_authorization || null,
      languages: input.candidate.languages || input.answers.languages || [],
      mobility: input.answers.mobility || null,
      preferred_establishments: input.answers.preferred_establishments || null,
      avoided_establishments: input.answers.avoided_establishments || null,
      salary_expectations: input.answers.salary_expectations || null,
    }),
    supabase.from('candidate_availability').upsert({
      candidate_id: candidateId,
      start_availability: input.answers.start_availability || null,
      preferred_hours: input.answers.preferred_hours || null,
      exact_start_date: input.answers.exact_start_date || null,
      preferred_shifts: input.answers.shifts_accepted || [],
      preferred_regions: input.answers.region_choices || [],
      preferred_departments: input.answers.preferred_departments || [],
      housing_required: input.answers.housing_required || null,
      transport_available: input.answers.transport_available || null,
      constraints: input.answers.constraints || null,
    }),
  ]);

  let applicationId: string;
  let eventType: 'application_created' | 'application_updated' = 'application_created';
  if (input.submission_type === 'posting' && jobId) {
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          already_applied: true,
          error:
            "Vous avez déjà manifesté votre intérêt pour ce mandat. Notre équipe vous contactera après l'analyse du dossier.",
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        candidate_id: candidateId,
        application_type: 'posting',
        job_id: jobId,
        posting_snapshot: postingSnapshot,
        answers: input.answers,
        completion_score: input.completion_score,
        status: 'Nouveau',
        source: input.source || 'web',
      })
      .select('id')
      .single();
    if (error || !data) {
      return NextResponse.json({ ok: false, error: 'Impossible de créer la candidature.' }, { status: 500 });
    }
    applicationId = data.id as string;
  } else {
    const { data: existing } = await supabase
      .from('applications')
      .select('id, status')
      .eq('candidate_id', candidateId)
      .eq('application_type', 'spontaneous')
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('applications')
        .update({
          answers: input.answers,
          completion_score: input.completion_score,
          source: input.source || 'web',
          submitted_at: now,
        })
        .eq('id', existing.id);
      if (error) {
        return NextResponse.json({ ok: false, error: 'Impossible de mettre à jour la candidature.' }, { status: 500 });
      }
      applicationId = existing.id as string;
      eventType = 'application_updated';
      await supabase.from('application_documents').delete().eq('application_id', applicationId);
    } else {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          candidate_id: candidateId,
          application_type: 'spontaneous',
          job_id: null,
          posting_snapshot: null,
          answers: input.answers,
          completion_score: input.completion_score,
          status: 'Nouveau',
          source: input.source || 'web',
        })
        .select('id')
        .single();
      if (error || !data) {
        return NextResponse.json({ ok: false, error: 'Impossible de créer la candidature.' }, { status: 500 });
      }
      applicationId = data.id as string;
    }
  }

  const appDocRows = [];
  for (const documentInput of input.documents as DocumentInput[]) {
    const candidateDocumentId = await ensureCandidateDocumentId(
      supabase,
      candidateId,
      documentInput,
      now
    );
    appDocRows.push({
      application_id: applicationId,
      candidate_document_id: candidateDocumentId,
      document_type: documentInput.document_type,
      status: documentInput.status,
      file_path: documentInput.file_path || null,
      file_name: documentInput.file_name || null,
    });
  }
  if (appDocRows.length > 0) {
    await supabase
      .from('application_documents')
      .upsert(appDocRows, { onConflict: 'application_id,document_type' });
  }

  const { data: currentDocs } = await supabase
    .from('candidate_documents')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('is_current', true);

  const candidate = candidateFromApplicationAnswers(
    hydrateCandidate(
      {
        id: candidateId,
        ...candidatePayload,
        status: 'active',
        created_at: now,
        updated_at: now,
      },
      {
        candidate_id: candidateId,
        profession: input.candidate.profession || input.answers.profession || null,
        qualified_professions:
          input.candidate.qualified_professions && input.candidate.qualified_professions.length > 0
            ? input.candidate.qualified_professions
            : input.answers.qualified_professions && input.answers.qualified_professions.length > 0
              ? input.answers.qualified_professions
              : input.candidate.profession || input.answers.profession
                ? [input.candidate.profession || input.answers.profession].filter(Boolean)
                : [],
        years_experience: input.answers.years_experience || null,
        permit_status: input.answers.permit_status || null,
        permit_number: input.answers.permit_number || null,
        work_authorization: input.candidate.work_authorization || input.answers.work_authorization || null,
        languages: input.candidate.languages || input.answers.languages || [],
        mobility: input.answers.mobility || null,
      },
      {
        candidate_id: candidateId,
        start_availability: input.answers.start_availability || null,
        preferred_hours: input.answers.preferred_hours || null,
        preferred_shifts: input.answers.shifts_accepted || [],
        preferred_regions: input.answers.region_choices || [],
        preferred_departments: input.answers.preferred_departments || [],
        housing_required: input.answers.housing_required || null,
        transport_available: input.answers.transport_available || null,
      }
    ) as Candidate,
    input.answers as SubmissionAnswers
  );

  const docs = (currentDocs || []) as CandidateDocument[];
  const completion = computeAtsProfileCompletion(candidate, docs);
  await supabase
    .from('candidates')
    .update({ profile_completion_score: completion, last_active_at: now })
    .eq('id', candidateId);

  if (job) {
    const match = computeMatchScore(candidate, job, docs);
    await supabase.from('match_scores').upsert({
      candidate_id: candidateId,
      job_id: job.id,
      score: match.score,
      reasons: match.reasons,
      blockers: match.blockers,
      calculated_at: now,
    });
  }

  await supabase.from('activity_events').insert({
    candidate_id: candidateId,
    application_id: applicationId,
    job_id: jobId,
    actor_id: null,
    event_type: eventType,
    event_payload: {
      application_type: input.submission_type,
      job_id: jobId,
      completion_score: completion,
    },
  });

  const candidateFullName = `${input.candidate.first_name} ${input.candidate.last_name}`;
  const isPosting = input.submission_type === 'posting';
  sendEmail({
    to: ADMIN_NOTIF_EMAIL,
    replyTo: input.candidate.email || undefined,
    subject: isPosting
      ? `Nouvelle candidature : ${(postingSnapshot?.title as string) || 'mandat'}`
      : `Profil candidat activé : ${candidateFullName}`,
    html: renderEmailHtml({
      title: isPosting ? 'Nouvelle candidature sur mandat précis' : 'Profil candidat activé',
      intro: `${candidateFullName} vient de soumettre son dossier.`,
      rows: [
        { label: 'Type', value: isPosting ? 'Mandat précis' : 'Candidature spontanée' },
        { label: 'Profession', value: input.candidate.profession || input.answers.profession },
        { label: 'Téléphone', value: input.candidate.phone || null },
        { label: 'Courriel', value: input.candidate.email || null },
        { label: 'Disponibilité', value: input.answers.start_availability || null },
        { label: 'Profil complété', value: `${completion}%` },
      ],
      ctaLabel: 'Ouvrir la fiche candidat',
      ctaUrl: `${SITE_URL}/admin/candidats/${candidateId}`,
      footer: 'Vous recevez ce courriel parce que vous êtes admin Agence Sanitas.',
    }),
  }).catch(() => undefined);

  revalidatePath('/admin');
  revalidatePath('/admin/candidats');
  revalidatePath('/admin/applications');
  revalidatePath(`/admin/candidats/${candidateId}`);
  revalidatePath('/mes-candidatures');
  revalidatePath('/mon-profil');
  return NextResponse.json({ ok: true, application_id: applicationId, submission_id: applicationId });
}
