import { NextResponse } from 'next/server';
import { establishmentRequestSchema } from '@/lib/validation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendEmail, renderEmailHtml } from '@/lib/email';
import { COMPANY } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_NOTIF_EMAIL = process.env.RESEND_TO || COMPANY.email;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }

  const parsed = establishmentRequestSchema.safeParse(body);
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
    .from('establishment_requests')
    .insert({
      establishment: input.establishment,
      contact_name: input.contact_name,
      function_title: input.function_title || null,
      phone: input.phone || null,
      email: input.email ? input.email.toLowerCase() : null,
      region: input.region || null,
      city: input.city || null,
      department: input.department || null,
      profession_requested: input.profession_requested,
      number_of_resources: input.number_of_resources || null,
      shift: input.shift || null,
      start_date: input.start_date || null,
      duration: input.duration || null,
      urgency: input.urgency || 'normal',
      details: input.details || null,
      consent_contact: !!input.consent_contact,
      status: 'Nouvelle',
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: 'Impossible d\'enregistrer la demande.' },
      { status: 500 }
    );
  }

  // Notification courriel à l'équipe (non bloquante)
  sendEmail({
    to: ADMIN_NOTIF_EMAIL,
    replyTo: input.email || undefined,
    subject: `Nouvelle demande établissement : ${input.establishment}`,
    html: renderEmailHtml({
      title: 'Nouvelle demande d\'un établissement',
      intro: `${input.contact_name} (${input.establishment}) a soumis un besoin de personnel.`,
      rows: [
        { label: 'Établissement', value: input.establishment },
        { label: 'Contact', value: input.contact_name },
        { label: 'Fonction', value: input.function_title || null },
        { label: 'Téléphone', value: input.phone || null },
        { label: 'Courriel', value: input.email || null },
        { label: 'Région / Ville', value: [input.region, input.city].filter(Boolean).join(', ') || null },
        { label: 'Département', value: input.department || null },
        { label: 'Profession recherchée', value: input.profession_requested },
        { label: 'Nombre de ressources', value: input.number_of_resources ? String(input.number_of_resources) : null },
        { label: 'Quart', value: input.shift || null },
        { label: 'Date de début', value: input.start_date || null },
        { label: 'Durée', value: input.duration || null },
        { label: 'Urgence', value: input.urgency || null },
        { label: 'Détails', value: input.details || null },
      ],
      ctaLabel: 'Ouvrir dans l\'admin',
      ctaUrl: `${SITE_URL}/admin/demandes`,
    }),
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, id: data.id });
}
