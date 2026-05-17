import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { noteSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }

  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Données invalides.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const applicationId = parsed.data.application_id || parsed.data.submission_id || null;
  let candidateId = parsed.data.candidate_id || null;
  let jobId = parsed.data.job_id || null;

  if (applicationId && !candidateId) {
    const { data: app } = await supabase
      .from('applications')
      .select('candidate_id, job_id')
      .eq('id', applicationId)
      .maybeSingle();
    candidateId = app?.candidate_id || null;
    jobId = jobId || app?.job_id || null;
  }

  const { error } = await supabase.from('internal_notes').insert({
    candidate_id: candidateId,
    application_id: applicationId,
    job_id: jobId,
    recruiter_id: session.user.id,
    note: parsed.data.note,
  });
  if (error) {
    return NextResponse.json({ ok: false, error: "Échec de l'ajout de la note." }, { status: 500 });
  }

  await supabase.from('activity_events').insert({
    candidate_id: candidateId,
    application_id: applicationId,
    job_id: jobId,
    actor_id: session.user.id,
    event_type: 'note_added',
    event_payload: { length: parsed.data.note.length },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/candidats');
  if (candidateId) revalidatePath(`/admin/candidats/${candidateId}`);
  return NextResponse.json({ ok: true });
}
