import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { statusUpdateSchema } from '@/lib/validation';
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

  revalidatePath('/admin');
  revalidatePath('/admin/candidats');
  revalidatePath('/admin/applications');
  revalidatePath(`/admin/candidats/${app.candidate_id}`);
  return NextResponse.json({ ok: true });
}
