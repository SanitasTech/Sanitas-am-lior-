import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { computeMatchScore, hydrateCandidate } from '@/lib/ats';
import { isCandidateEligibleForMatching } from '@/lib/ats-operating-model';
import type { CandidateDocument, Job } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const candidateId = typeof body?.candidate_id === 'string' ? body.candidate_id : null;
  const jobId = typeof body?.job_id === 'string' ? body.job_id : null;
  if (!candidateId || !jobId) {
    return NextResponse.json({ ok: false, error: 'candidate_id et job_id requis.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const [{ data: candidateRow }, { data: job }, { data: docs }] = await Promise.all([
    supabase
      .from('candidates')
      .select('*, profile:candidate_profiles(*), availability:candidate_availability(*), applications(*)')
      .eq('id', candidateId)
      .maybeSingle(),
    supabase.from('jobs').select('*').eq('id', jobId).maybeSingle(),
    supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('is_current', true),
  ]);

  const row = candidateRow as Record<string, unknown> | null;
  const candidate = hydrateCandidate(
    row,
    row?.profile as Record<string, unknown>,
    row?.availability as Record<string, unknown>
  );
  if (!candidate || !job) {
    return NextResponse.json({ ok: false, error: 'Candidat ou poste introuvable.' }, { status: 404 });
  }
  const applications = ((row?.applications as Array<{ job_id: string | null; status: string; application_type: string }> | undefined) || []);
  const { data: deletedEvents } = await supabase
    .from('activity_events')
    .select('id')
    .eq('event_type', 'application_deleted')
    .eq('candidate_id', candidateId)
    .eq('job_id', jobId);
  if (!isCandidateEligibleForMatching({
    candidate,
    applications,
    jobId,
    deletedJobIds: deletedEvents && deletedEvents.length > 0 ? [jobId] : [],
  })) {
    await supabase.from('match_scores').delete().eq('candidate_id', candidateId).eq('job_id', jobId);
    return NextResponse.json(
      { ok: false, error: 'Candidat non eligible au matching pour ce mandat.' },
      { status: 409 }
    );
  }

  const match = computeMatchScore(candidate, job as Job, (docs || []) as CandidateDocument[]);
  await supabase.from('match_scores').upsert({
    candidate_id: candidateId,
    job_id: jobId,
    score: match.score,
    reasons: match.reasons,
    blockers: match.blockers,
    calculated_at: new Date().toISOString(),
  });

  revalidatePath('/admin/postes');
  revalidatePath(`/admin/candidats/${candidateId}`);
  return NextResponse.json({ ok: true, ...match });
}
