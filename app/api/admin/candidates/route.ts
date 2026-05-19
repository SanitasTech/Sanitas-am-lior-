import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('candidates')
    .select('*, profile:candidate_profiles(*), availability:candidate_availability(*), preference_sets:candidate_preference_sets(*), applications(*), documents:candidate_documents(*)')
    .order('last_active_at', { ascending: false, nullsFirst: false })
    .limit(300);
  if (error) {
    return NextResponse.json({ ok: false, error: 'Lecture impossible.' }, { status: 500 });
  }
  const candidates = q
    ? (data || []).filter((candidate) =>
        [
          candidate.first_name,
          candidate.last_name,
          candidate.email,
          candidate.phone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q)
      )
    : data || [];
  return NextResponse.json({ ok: true, candidates });
}

/**
 * Suppression définitive d'un candidat. Cascade :
 * - toutes ses applications (ON DELETE CASCADE)
 * - tous ses documents (cascade)
 * - toutes ses notes internes (cascade)
 * - tous les events de ses submissions (cascade)
 *
 * Action irréversible. À utiliser pour respecter une demande de suppression
 * RGPD/loi 25, ou pour effacer un test/spam.
 */
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
  const { error } = await supabase.from('candidates').delete().eq('id', id);
  if (error) {
    return NextResponse.json(
      { ok: false, error: 'Échec de la suppression.' },
      { status: 500 }
    );
  }
  revalidatePath('/admin/candidats');
  revalidatePath('/admin/applications');
  revalidatePath('/admin/taches');
  revalidatePath(`/admin/candidats/${id}`);
  return NextResponse.json({ ok: true });
}
