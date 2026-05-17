import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { jobSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function revalidateJobs() {
  revalidatePath('/admin/postes');
  revalidatePath('/postes');
  revalidatePath('/');
}

function revalidateJobDetail(id: string) {
  revalidatePath(`/admin/postes/${id}`);
  revalidatePath(`/postes/${id}`);
}

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

  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: first?.message || 'Données invalides.' },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: input.title,
      profession: input.profession,
      job_title_id: input.job_title_id || null,
      region: input.region,
      city: input.city || null,
      establishment: input.establishment || null,
      department: input.department || null,
      shift: input.shift || null,
      schedule: input.schedule || null,
      mandate_type: input.mandate_type || null,
      start_date: input.start_date || null,
      duration: input.duration || null,
      salary: input.salary || null,
      urgency: input.urgency,
      requirements: input.requirements || null,
      particularities: input.particularities || null,
      required_documents: input.required_documents,
      extra_questions: input.extra_questions,
      status: input.status,
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: 'Échec de la création.' }, { status: 500 });
  }

  revalidateJobs();
  return NextResponse.json({ ok: true, id: data.id });
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }

  let body: { id?: string } & Record<string, unknown>;
  try {
    body = (await req.json()) as { id?: string } & Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }
  if (!body.id || typeof body.id !== 'string') {
    return NextResponse.json({ ok: false, error: 'id requis.' }, { status: 400 });
  }
  const { id, ...rest } = body;

  const parsed = jobSchema.safeParse(rest);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, error: first?.message || 'Données invalides.' },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from('jobs')
    .update({
      title: input.title,
      profession: input.profession,
      job_title_id: input.job_title_id || null,
      region: input.region,
      city: input.city || null,
      establishment: input.establishment || null,
      department: input.department || null,
      shift: input.shift || null,
      schedule: input.schedule || null,
      mandate_type: input.mandate_type || null,
      start_date: input.start_date || null,
      duration: input.duration || null,
      salary: input.salary || null,
      urgency: input.urgency,
      requirements: input.requirements || null,
      particularities: input.particularities || null,
      required_documents: input.required_documents,
      extra_questions: input.extra_questions,
      status: input.status,
    })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ ok: false, error: 'Échec de la mise à jour.' }, { status: 500 });
  }

  revalidateJobs();
  revalidateJobDetail(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const hard = url.searchParams.get('hard') === 'true';
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id requis.' }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();

  if (hard) {
    // Suppression définitive : le job_id devient null dans les soumissions
    // existantes (ON DELETE SET NULL) ; le posting_snapshot garde l'historique.
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ ok: false, error: 'Échec de la suppression.' }, { status: 500 });
    }
    revalidateJobs();
    revalidateJobDetail(id);
    return NextResponse.json({ ok: true, mode: 'hard' });
  }

  // Désactivation soft : bascule status à inactive (poste retiré des listes publiques)
  const { error } = await supabase.from('jobs').update({ status: 'inactive' }).eq('id', id);
  if (error) {
    return NextResponse.json({ ok: false, error: 'Échec.' }, { status: 500 });
  }
  revalidateJobs();
  revalidateJobDetail(id);
  return NextResponse.json({ ok: true, mode: 'soft' });
}
