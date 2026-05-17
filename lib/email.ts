// =====================================================================
// Envoi de courriels transactionnels via Resend
// =====================================================================
// Resend : https://resend.com — plan gratuit 3000 courriels/mois.
//
// Configuration :
//   1. Crée un compte Resend
//   2. Récupère ta clé API (commence par re_)
//   3. Ajoute à .env.local :
//        RESEND_API_KEY=re_xxx
//   4. (Optionnel) Vérifie ton domaine agencesanitas.com pour utiliser
//      noreply@agencesanitas.com comme expéditeur. Sans vérification,
//      Resend force l'envoi depuis onboarding@resend.dev.
//   5. Ajoute la destination admin :
//        RESEND_TO=rh@agencesanitas.com
//        RESEND_FROM=Agence Sanitas <noreply@agencesanitas.com>
//
// Si RESEND_API_KEY n'est pas défini, sendEmail() ne fait rien sans erreur :
// l'appli continue de fonctionner même sans configuration courriel.

import 'server-only';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  /** En-tête Reply-To (utile pour répondre directement au candidat) */
  replyTo?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Configuration absente : on ignore silencieusement plutôt que de casser
    // le flux de soumission. On log côté serveur pour la visibilité.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[email] RESEND_API_KEY non défini, courriel ignoré :', payload.subject);
    }
    return { ok: false, error: 'RESEND_API_KEY non configuré' };
  }

  const from = process.env.RESEND_FROM || 'Agence Sanitas <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[email] Resend error:', res.status, text);
      return { ok: false, error: `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (e) {
    console.error('[email] Exception:', e);
    return { ok: false, error: 'Exception réseau' };
  }
}

/**
 * Construit un courriel HTML simple, sobre, lisible dans tous les clients.
 */
export function renderEmailHtml(args: {
  title: string;
  intro?: string;
  rows?: Array<{ label: string; value: string | null | undefined }>;
  ctaLabel?: string;
  ctaUrl?: string;
  footer?: string;
}): string {
  const rows = (args.rows || [])
    .filter((r) => r.value)
    .map(
      (r) => `<tr>
  <td style="padding:6px 12px 6px 0;color:#666;font-size:13px;vertical-align:top;width:160px;">${escapeHtml(r.label)}</td>
  <td style="padding:6px 0;color:#111;font-size:14px;">${escapeHtml(String(r.value))}</td>
</tr>`
    )
    .join('');

  const cta =
    args.ctaLabel && args.ctaUrl
      ? `<p style="margin:24px 0 0;"><a href="${escapeAttr(args.ctaUrl)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;font-weight:500;">${escapeHtml(args.ctaLabel)}</a></p>`
      : '';

  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e5e7eb;">
    <p style="margin:0 0 6px;color:#0a84ff;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Agence Sanitas</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#111;">${escapeHtml(args.title)}</h1>
    ${args.intro ? `<p style="margin:0 0 16px;color:#444;font-size:14px;line-height:1.55;">${escapeHtml(args.intro)}</p>` : ''}
    ${rows ? `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-top:8px;">${rows}</table>` : ''}
    ${cta}
    ${args.footer ? `<p style="margin:24px 0 0;color:#888;font-size:12px;border-top:1px solid #eee;padding-top:16px;">${escapeHtml(args.footer)}</p>` : ''}
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;');
}
