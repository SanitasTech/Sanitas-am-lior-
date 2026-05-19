import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const actionSchema = z.object({
  action: z.enum(['create_task', 'associate', 'present']),
  candidate_id: z.string().uuid(),
  job_id: z.string().uuid().optional().nullable(),
  application_id: z.string().uuid().optional().nullable(),
  preference_set_id: z.string().uuid().optional().nullable(),
  title: z.string().max(300).optional().nullable(),
  details: z.string().max(2000).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorise.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Action invalide.' }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  if (input.action === 'create_task') {
    const { error } = await supabase.from('recruiter_tasks').insert({
      candidate_id: input.candidate_id,
      application_id: input.application_id || null,
      job_id: input.job_id || null,
      assigned_to: session.user.id,
      task_type: 'mandate_search',
      title: input.title || 'Appeler le candidat pour mandat compatible',
      details: input.details || null,
      status: 'open',
    });
    if (error) {
      return NextResponse.json({ ok: false, error: 'Impossible de creer la tache.' }, { status: 500 });
    }
  } else {
    if (!input.job_id) {
      return NextResponse.json({ ok: false, error: 'job_id requis.' }, { status: 400 });
    }
    const { data: job } = await supabase.from('jobs').select('*').eq('id', input.job_id).maybeSingle();
    if (!job) {
      return NextResponse.json({ ok: false, error: 'Poste introuvable.' }, { status: 404 });
    }
    const status = input.action === 'present' ? 'Présenté' : 'À appeler';
    const { data: application, error } = await supabase
      .from('applications')
      .upsert(
        {
          candidate_id: input.candidate_id,
          application_type: 'posting',
          job_id: input.job_id,
          preference_set_id: input.preference_set_id || null,
          posting_snapshot: job,
          answers: {},
          completion_score: 0,
          status,
          status_reason: input.action === 'present'
            ? 'Marque presente depuis la recherche mandat.'
            : 'Associe depuis la recherche mandat.',
          source: 'admin_mandate_search',
        },
        { onConflict: 'candidate_id,job_id' }
      )
      .select('id')
      .maybeSingle();

    if (error || !application) {
      return NextResponse.json({ ok: false, error: 'Impossible de mettre a jour la candidature.' }, { status: 500 });
    }

    await supabase.from('activity_events').insert({
      candidate_id: input.candidate_id,
      application_id: application.id,
      job_id: input.job_id,
      actor_id: session.user.id,
      event_type: input.action === 'present' ? 'candidate_presented_from_search' : 'candidate_associated_from_search',
      event_payload: { status, preference_set_id: input.preference_set_id || null },
    });
  }

  revalidatePath('/admin');
  revalidatePath('/admin/recherche-mandat');
  revalidatePath('/admin/candidats');
  revalidatePath('/admin/applications');
  revalidatePath('/admin/postes');
  revalidatePath(`/admin/candidats/${input.candidate_id}`);
  if (input.job_id) revalidatePath(`/admin/postes/${input.job_id}`);

  return NextResponse.json({ ok: true });
}
