import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id requis.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: app } = await supabase
    .from('applications')
    .select('candidate_id')
    .eq('id', id)
    .maybeSingle();
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ ok: false, error: 'Échec de la suppression.' }, { status: 500 });
  }
  revalidatePath('/admin');
  revalidatePath('/admin/candidats');
  revalidatePath('/admin/applications');
  if (app?.candidate_id) revalidatePath(`/admin/candidats/${app.candidate_id}`);
  return NextResponse.json({ ok: true });
}
