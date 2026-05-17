import { NextResponse } from 'next/server';
import { contactMessageSchema } from '@/lib/validation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendEmail, renderEmailHtml } from '@/lib/email';
import { COMPANY } from '@/lib/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_NOTIF_EMAIL = process.env.RESEND_TO || COMPANY.email;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON invalide.' }, { status: 400 });
  }

  const parsed = contactMessageSchema.safeParse(body);
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
    .from('contact_messages')
    .insert({
      request_type: input.request_type || null,
      name: input.name,
      phone: input.phone || null,
      email: input.email ? input.email.toLowerCase() : null,
      message: input.message,
      consent_contact: !!input.consent_contact,
      status: 'Nouveau',
    })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: 'Impossible d\'envoyer le message.' },
      { status: 500 }
    );
  }

  // Notification courriel à l'équipe (non bloquante)
  sendEmail({
    to: ADMIN_NOTIF_EMAIL,
    replyTo: input.email || undefined,
    subject: `Nouveau message contact : ${input.name}`,
    html: renderEmailHtml({
      title: 'Nouveau message via le formulaire de contact',
      intro: `${input.name} vous a écrit.`,
      rows: [
        { label: 'Type de demande', value: input.request_type || null },
        { label: 'Nom', value: input.name },
        { label: 'Téléphone', value: input.phone || null },
        { label: 'Courriel', value: input.email || null },
        { label: 'Message', value: input.message },
      ],
    }),
  }).catch(() => undefined);

  return NextResponse.json({ ok: true, id: data.id });
}
