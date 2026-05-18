import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import { DecorativeBlob } from '@/components/Icons';
import { getCurrentUser, getCurrentCandidate } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requiredDocumentsForProfessions } from '@/lib/ats';
import { formatDateTime } from '@/lib/utils';
import { dateLocale, displayValue } from '@/lib/i18n';
import DocumentsManager from '@/app/mes-documents/DocumentsManager';
import type { CandidateDocument } from '@/types';

export const metadata: Metadata = {
  title: 'My documents',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EnglishDocumentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/en/login?redirect=/en/my-documents');
  const candidate = await getCurrentCandidate();

  let docs: CandidateDocument[] = [];
  if (candidate) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidate.id)
      .eq('is_current', true)
      .order('created_at', { ascending: false });
    docs = (data || []) as CandidateDocument[];
  }

  const requiredDocuments = requiredDocumentsForProfessions(
    candidate?.qualified_professions && candidate.qualified_professions.length > 0 ? candidate.qualified_professions : [candidate?.profession]
  );

  return (
    <PublicLayout locale="en">
      <section className="relative section pt-16 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-4xl relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Candidate portal</p>
          <h1 className="mt-2 text-display-md text-fg">My documents</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted max-w-prose">
            Add or replace your current documents. They will be reused automatically in future applications.
          </p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="card p-5 sm:p-6">
              <h2 className="text-[18px] font-semibold text-fg">Required documents</h2>
              <p className="mt-1 text-[14.5px] text-fg-muted">
                The CV is required. Other documents depend on your profession.
              </p>
              <div className="mt-5">
                <DocumentsManager requiredDocuments={requiredDocuments} initialDocuments={docs} locale="en" />
              </div>
            </div>

            <aside className="card p-5 self-start">
              <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">Current history</p>
              <div className="mt-4 space-y-3">
                {docs.length === 0 ? (
                  <p className="text-[14px] text-fg-muted">No document received yet.</p>
                ) : (
                  docs.map((doc) => (
                    <div key={doc.id} className="rounded-lg border border-border p-3">
                      <p className="font-medium text-fg text-[14px]">{displayValue('en', doc.document_type)}</p>
                      <p className="mt-1 text-[13px] text-fg-muted">{doc.file_name || displayValue('en', doc.status)}</p>
                      <p className="mt-1 text-[12px] text-fg-subtle">
                        {formatDateTime(doc.uploaded_at || doc.created_at, dateLocale('en'))}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
