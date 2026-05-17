import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCurrentUser, getOrCreateCandidate } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUCKET = 'candidate-documents';
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo
const ALLOWED = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Connexion requise.' }, { status: 401 });
  }
  const candidate = await getOrCreateCandidate();
  if (!candidate) {
    return NextResponse.json({ ok: true, documents: [] });
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('candidate_documents')
    .select('*')
    .eq('candidate_id', candidate.id)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, error: 'Lecture impossible.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, documents: data || [] });
}

/**
 * Endpoint multipart : reçoit un fichier + document_type et stocke dans
 * le bucket privé. Retourne le file_path pour que le front l'attache à la
 * soumission (créée plus tard). L'utilisateur doit être connecté : le
 * file_path est stocké sous owner/{auth_user_id}/... et reste privé.
 *
 * Toute exception est capturée pour garantir une réponse JSON cohérente.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Connexion requise.' }, { status: 401 });
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json({ ok: false, error: 'Requête invalide.' }, { status: 400 });
    }

    const file = form.get('file');
    const documentType = (form.get('document_type') as string) || 'CV';

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: 'Fichier manquant.' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ ok: false, error: 'Fichier vide.' }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: 'Fichier trop volumineux (max 8 Mo).' }, { status: 413 });
    }
    if (file.type && !ALLOWED.includes(file.type)) {
      return NextResponse.json({ ok: false, error: 'Type de fichier non accepté.' }, { status: 415 });
    }

    // Sanitiser le nom de fichier et générer un chemin unique
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-100);
    const id =
      globalThis.crypto && 'randomUUID' in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const docTypeSlug =
      documentType
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'doc';
    const path = `owner/${user.id}/${docTypeSlug}/${id}-${safeName}`;

    // Vérifier les variables d'environnement avant d'aller plus loin
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Configuration serveur incomplète : variables Supabase manquantes. Vérifiez .env.local et redémarrez npm run dev.",
        },
        { status: 500 }
      );
    }

    const supabase = createSupabaseAdminClient();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

    if (uploadError) {
      // Loggable côté serveur pour diagnostic, message neutre côté client
      console.error('[api/documents] Storage upload error:', uploadError.message);
      return NextResponse.json(
        {
          ok: false,
          error: `Téléversement impossible : ${uploadError.message}. Vérifiez que le bucket "candidate-documents" existe.`,
        },
        { status: 500 }
      );
    }

    let documentId: string | null = null;
    const candidate = await getOrCreateCandidate();
    if (candidate) {
      const archivedAt = new Date().toISOString();
      await supabase
        .from('candidate_documents')
        .update({ is_current: false, archived_at: archivedAt })
        .eq('candidate_id', candidate.id)
        .eq('document_type', documentType)
        .eq('is_current', true);

      const { data: doc } = await supabase
        .from('candidate_documents')
        .insert({
          candidate_id: candidate.id,
          document_type: documentType,
          status: 'Reçu',
          file_path: path,
          file_name: file.name,
          uploaded_at: archivedAt,
          is_current: true,
        })
        .select('id')
        .maybeSingle();
      documentId = doc?.id || null;
    }

    return NextResponse.json({
      ok: true,
      document_id: documentId,
      file_path: path,
      file_name: file.name,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    console.error('[api/documents] Exception:', message);
    return NextResponse.json(
      { ok: false, error: `Erreur serveur lors du téléversement : ${message}` },
      { status: 500 }
    );
  }
}
