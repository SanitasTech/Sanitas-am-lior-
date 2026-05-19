import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { mandateSearchSchema } from '@/lib/validation';
import { buildSearchJob, searchMandateCandidates, type CandidateSearchRecord } from '@/lib/mandate-search';
import type { Job, MandateSearchBucket, MandateSearchInput } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKETS: MandateSearchBucket[] = ['presentable', 'to_validate', 'document_blocked', 'incompatible'];

function valueOrSource<T>(value: T | undefined | null, source: T | undefined | null): T | undefined | null {
  return value === undefined || value === null || value === '' ? source : value;
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorise.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }

  const raw = body as Partial<MandateSearchInput>;
  const supabase = createSupabaseAdminClient();

  let sourceJob: Job | null = null;
  if (raw.job_id) {
    const { data } = await supabase.from('jobs').select('*').eq('id', raw.job_id).maybeSingle();
    sourceJob = (data as Job | null) || null;
    if (!sourceJob) {
      return NextResponse.json({ ok: false, error: 'Poste introuvable.' }, { status: 404 });
    }
    if (sourceJob.status !== 'active') {
      return NextResponse.json({ ok: false, error: 'Ce poste n est pas actif.' }, { status: 409 });
    }
  }

  const merged: Partial<MandateSearchInput> = {
    ...raw,
    title: valueOrSource(raw.title, sourceJob?.title),
    profession: valueOrSource(raw.profession, sourceJob?.profession) || '',
    job_title_id: valueOrSource(raw.job_title_id, sourceJob?.job_title_id),
    region: valueOrSource(raw.region, sourceJob?.region) || '',
    city: valueOrSource(raw.city, sourceJob?.city),
    establishment: valueOrSource(raw.establishment, sourceJob?.establishment),
    department: valueOrSource(raw.department, sourceJob?.department),
    shift: valueOrSource(raw.shift, sourceJob?.shift),
    schedule: valueOrSource(raw.schedule, sourceJob?.schedule),
    mandate_type: valueOrSource(raw.mandate_type, sourceJob?.mandate_type),
    start_date: valueOrSource(raw.start_date, sourceJob?.start_date),
    duration: valueOrSource(raw.duration, sourceJob?.duration),
    salary: valueOrSource(raw.salary, sourceJob?.salary),
    urgency: raw.urgency || sourceJob?.urgency || 'normal',
    required_documents: raw.required_documents || sourceJob?.required_documents || [],
  };

  const parsed = mandateSearchSchema.safeParse(merged);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: first?.message || 'Criteres invalides.' }, { status: 400 });
  }

  const input = parsed.data;
  const job = buildSearchJob(input, sourceJob);

  const [{ data: candidateRows }, { data: deletedEvents }] = await Promise.all([
    supabase
      .from('candidates')
      .select('*, profile:candidate_profiles(*), availability:candidate_availability(*), preference_sets:candidate_preference_sets(*), documents:candidate_documents(*), applications(*), tasks:recruiter_tasks(*)')
      .eq('status', 'active')
      .order('last_active_at', { ascending: false, nullsFirst: false })
      .limit(600),
    input.job_id
      ? supabase
          .from('activity_events')
          .select('candidate_id, job_id')
          .eq('event_type', 'application_deleted')
          .eq('job_id', input.job_id)
      : Promise.resolve({ data: [] }),
  ]);

  const deletedByCandidate = new Map<string, string[]>();
  for (const event of deletedEvents || []) {
    if (!event.candidate_id || !event.job_id) continue;
    const ids = deletedByCandidate.get(event.candidate_id) || [];
    ids.push(event.job_id);
    deletedByCandidate.set(event.candidate_id, ids);
  }

  const records: CandidateSearchRecord[] = ((candidateRows || []) as Array<Record<string, unknown>>).map((row) => ({
    row,
    deletedJobIds: typeof row.id === 'string' ? deletedByCandidate.get(row.id) || [] : [],
  }));

  const resultBuckets = searchMandateCandidates(input, job, records);
  const counts = BUCKETS.reduce(
    (acc, bucket) => ({ ...acc, [bucket]: resultBuckets[bucket].length }),
    {} as Record<MandateSearchBucket, number>
  );

  return NextResponse.json({
    ok: true,
    job,
    counts,
    presentable: resultBuckets.presentable.slice(0, 80),
    to_validate: resultBuckets.to_validate.slice(0, 120),
    document_blocked: resultBuckets.document_blocked.slice(0, 120),
    incompatible: resultBuckets.incompatible.slice(0, 80),
  });
}
