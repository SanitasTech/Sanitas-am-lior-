import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Proxy admin pour télécharger un document privé.
 *
 * URL stable que l'admin peut bookmarquer ou partager en interne :
 *   /api/admin/documents/{document_id}?mode=view (par défaut)
 *   /api/admin/documents/{document_id}?mode=download (force le téléchargement)
 *
 * À chaque appel :
 * 1. vérifie que l'utilisateur est admin (requireAdmin)
 * 2. récupère le file_path en base
 * 3. génère une URL Supabase signée à courte durée
 * 4. redirige (302) vers cette URL signée
 *
 * Effet pour l'admin : URLs « permanentes » + sécurité serveur préservée.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: doc, error } = await supabase
    .from('candidate_documents')
    .select('id, file_path, file_name, document_type')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !doc) {
    return NextResponse.json({ ok: false, error: 'Document introuvable.' }, { status: 404 });
  }
  if (!doc.file_path) {
    return NextResponse.json(
      { ok: false, error: 'Aucun fichier rattaché à ce document.' },
      { status: 404 }
    );
  }

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode') === 'download' ? 'download' : 'view';

  // URL signée à très courte durée (60 secondes) : le navigateur a juste le
  // temps de suivre la redirection et de télécharger le fichier.
  const downloadName =
    mode === 'download' && doc.file_name ? doc.file_name : undefined;

  const { data: urlData, error: urlError } = await supabase.storage
    .from('candidate-documents')
    .createSignedUrl(doc.file_path, 60, downloadName ? { download: downloadName } : undefined);

  if (urlError || !urlData?.signedUrl) {
    return NextResponse.json(
      { ok: false, error: 'Impossible de générer le lien.' },
      { status: 500 }
    );
  }

  return NextResponse.redirect(urlData.signedUrl, { status: 302 });
}
