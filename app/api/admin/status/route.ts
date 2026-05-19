import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { statusUpdateSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hydrateCandidate } from '@/lib/ats';
import { buildAutoTaskRecommendations } from '@/lib/ats-operating-model';
import type { Application, Candidate, CandidateDocument, Job, RecruiterTask } from '@/types';

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

  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Données invalides.' }, { status: 400 });
  }

  const applicationId = parsed.data.application_id || parsed.data.submission_id;
  const { status, status_reason } = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data: app, error } = await supabase
    .from('applications')
    .update({ status, status_reason: status_reason || null })
    .eq('id', applicationId)
    .select('id, candidate_id, job_id')
    .maybeSingle();
  if (error || !app) {
    return NextResponse.json({ ok: false, error: 'Échec de la mise à jour.' }, { status: 500 });
  }

  await supabase.from('activity_events').insert({
    candidate_id: app.candidate_id,
    application_id: applicationId,
    job_id: app.job_id,
    actor_id: session.user.id,
    event_type: 'status_changed',
    event_payload: { status, status_reason: status_reason || null },
  });

  const { data: contextualApp } = await supabase
    .from('applications')
    .select(
      '*, candidate:candidates(*, profile:candidate_profiles(*), availability:candidate_availability(*), documents:candidate_documents(*)), job:jobs(*)'
    )
    .eq('id', applicationId)
    .maybeSingle();

  if (contextualApp) {
    const row = contextualApp as Record<string, unknown>;
    const candidateRow = row.candidate as Record<string, unknown> | undefined;
    const candidate = hydrateCandidate(
      candidateRow,
      candidateRow?.profile as Record<string, unknown>,
      candidateRow?.availability as Record<string, unknown>
    ) as Candidate | null;
    const documents = (candidateRow?.documents as CandidateDocument[] | undefined) || [];
    const job = (row.job as Job | null) || null;
    const { data: existingTaskRows } = await supabase
      .from('recruiter_tasks')
      .select('*')
      .eq('application_id', applicationId)
      .eq('status', 'open');
    const taskRecommendations = buildAutoTaskRecommendations({
      application: row as unknown as Application,
      candidate,
      documents,
      job,
      existingTasks: (existingTaskRows || []) as RecruiterTask[],
    });
    if (taskRecommendations.length > 0) {
      const { data: createdTasks } = await supabase
        .from('recruiter_tasks')
        .insert(taskRecommendations.map((action) => ({
          candidate_id: app.candidate_id,
          application_id: applicationId,
          job_id: app.job_id,
          assigned_to: session.user.id,
          task_type: action.taskType,
          title: action.taskTitle,
          details: action.detail,
          due_at: action.dueAt,
          status: 'open',
        })))
        .select('id, task_type, title');

      if (createdTasks && createdTasks.length > 0) {
        await supabase.from('activity_events').insert(createdTasks.map((task) => ({
          candidate_id: app.candidate_id,
          application_id: applicationId,
          job_id: app.job_id,
          actor_id: session.user.id,
          event_type: 'task_auto_created',
          event_payload: { task_id: task.id, task_type: task.task_type, title: task.title },
        })));
      }
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/candidats');
  revalidatePath('/admin/applications');
  revalidatePath(`/admin/candidats/${app.candidate_id}`);
  return NextResponse.json({ ok: true });
}
