import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isRecruitableApplication } from '@/lib/ats-operating-model';
import type { Application } from '@/types';

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
    .from('applications')
    .select('*, candidate:candidates(*), job:jobs(*)')
    .order('created_at', { ascending: false })
    .limit(300);
  if (status) query = query.eq('status', status);
  if (candidateId) query = query.eq('candidate_id', candidateId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: 'Lecture impossible.' }, { status: 500 });
  return NextResponse.json({ ok: true, applications: data || [] });
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'id requis.' }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { data: app } = await supabase
    .from('applications')
    .select('id, candidate_id, job_id, application_type, status')
    .eq('id', id)
    .maybeSingle();
  if (!app) return NextResponse.json({ ok: false, error: 'Candidature introuvable.' }, { status: 404 });

  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) return NextResponse.json({ ok: false, error: 'Suppression impossible.' }, { status: 500 });

  await supabase.from('activity_events').insert({
    candidate_id: app.candidate_id,
    application_id: null,
    job_id: app.job_id || null,
    actor_id: session.user.id,
    event_type: 'application_deleted',
    event_payload: {
      application_id: app.id,
      application_type: app.application_type,
      previous_status: app.status,
    },
  });

  if (app.job_id) {
    await supabase.from('match_scores').delete().eq('candidate_id', app.candidate_id).eq('job_id', app.job_id);
  }
  const { data: remaining } = await supabase
    .from('applications')
    .select('status')
    .eq('candidate_id', app.candidate_id);
  if (!((remaining || []) as Pick<Application, 'status'>[]).some(isRecruitableApplication)) {
    await supabase.from('candidates').update({ status: 'inactive' }).eq('id', app.candidate_id);
    await supabase.from('match_scores').delete().eq('candidate_id', app.candidate_id);
  }

  revalidatePath('/admin');
  revalidatePath('/admin/applications');
  revalidatePath('/admin/candidats');
  revalidatePath('/admin/postes');
  if (app.job_id) revalidatePath(`/admin/postes/${app.job_id}`);
  if (app?.candidate_id) revalidatePath(`/admin/candidats/${app.candidate_id}`);
  return NextResponse.json({ ok: true });
}
