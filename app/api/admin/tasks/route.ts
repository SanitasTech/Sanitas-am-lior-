import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { taskSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }
  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const candidateId = url.searchParams.get('candidate_id');
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from('recruiter_tasks')
    .select('*, candidate:candidates(*), application:applications(*), job:jobs(*)')
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(300);
  if (status) query = query.eq('status', status);
  if (candidateId) query = query.eq('candidate_id', candidateId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: 'Lecture impossible.' }, { status: 500 });
  return NextResponse.json({ ok: true, tasks: data || [] });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Données invalides.' }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('recruiter_tasks')
    .insert({
      ...input,
      assigned_to: session.user.id,
      due_at: input.due_at || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Impossible de créer la tâche.' }, { status: 500 });
  }

  await supabase.from('activity_events').insert({
    candidate_id: input.candidate_id || null,
    application_id: input.application_id || null,
    job_id: input.job_id || null,
    actor_id: session.user.id,
    event_type: 'task_created',
    event_payload: { title: input.title, task_type: input.task_type },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/taches');
  revalidatePath('/admin/candidats');
  if (input.candidate_id) revalidatePath(`/admin/candidats/${input.candidate_id}`);
  return NextResponse.json({ ok: true, task_id: data.id });
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const id = typeof body?.id === 'string' ? body.id : null;
  const status = body?.status === 'done' || body?.status === 'cancelled' || body?.status === 'open'
    ? body.status
    : null;
  if (!id || !status) {
    return NextResponse.json({ ok: false, error: 'id et statut requis.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('recruiter_tasks')
    .update({ status })
    .eq('id', id)
    .select('candidate_id, application_id, job_id')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Tâche introuvable.' }, { status: 404 });
  }

  await supabase.from('activity_events').insert({
    candidate_id: data.candidate_id,
    application_id: data.application_id,
    job_id: data.job_id,
    actor_id: session.user.id,
    event_type: 'task_status_changed',
    event_payload: { status },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/taches');
  if (data.candidate_id) revalidatePath(`/admin/candidats/${data.candidate_id}`);
  return NextResponse.json({ ok: true });
}
