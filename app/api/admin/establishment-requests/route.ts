import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['Nouvelle', 'À analyser', 'En traitement', 'Poste créé', 'Fermée']).optional(),
});

export async function PUT(req: Request) {
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

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Données invalides.' }, { status: 400 });
  }

  const { id, status } = parsed.data;
  const supabase = createSupabaseAdminClient();

  const patch: Record<string, unknown> = {};
  if (status) patch.status = status;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from('establishment_requests').update(patch).eq('id', id);
  if (error) {
    return NextResponse.json({ ok: false, error: 'Échec de la mise à jour.' }, { status: 500 });
  }
  revalidatePath('/admin/demandes');
  return NextResponse.json({ ok: true });
}

// Suppression d'une demande.
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
  const { error } = await supabase.from('establishment_requests').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ ok: false, error: 'Échec de la suppression.' }, { status: 500 });
  }
  revalidatePath('/admin/demandes');
  return NextResponse.json({ ok: true });
}

// Transformer en poste : crée un job actif minimal depuis la demande.
export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ ok: false, error: 'id requis.' }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: er, error: erErr } = await supabase
    .from('establishment_requests')
    .select('*')
    .eq('id', body.id)
    .maybeSingle();
  if (erErr || !er) {
    return NextResponse.json({ ok: false, error: 'Demande introuvable.' }, { status: 404 });
  }

  const title = `${er.profession_requested || 'Poste'}${er.department ? ' — ' + er.department : ''}`;
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .insert({
      title,
      profession: er.profession_requested || 'À préciser',
      region: er.region || 'À préciser',
      city: er.city || null,
      establishment: er.establishment || null,
      department: er.department || null,
      shift: er.shift || null,
      mandate_type: er.duration ? `Mandat (${er.duration})` : null,
      start_date: er.start_date || null,
      duration: er.duration || null,
      urgency: er.urgency === 'urgent' ? 'urgent' : er.urgency === 'high' ? 'high' : 'normal',
      particularities: er.details || null,
      status: 'draft',
      required_documents: ['CV'],
      extra_questions: [],
    })
    .select('id')
    .single();

  if (jobErr || !job) {
    return NextResponse.json({ ok: false, error: 'Échec de la création du poste.' }, { status: 500 });
  }

  await supabase
    .from('establishment_requests')
    .update({ status: 'Poste créé' })
    .eq('id', body.id);

  revalidatePath('/admin/demandes');
  revalidatePath('/admin/postes');
  return NextResponse.json({ ok: true, job_id: job.id });
}
