import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import CandidateApplicationFlow from '@/components/CandidateApplicationFlow';
import StatusBadge from '@/components/StatusBadge';
import { DecorativeBlob } from '@/components/Icons';
import { getCurrentUser, getOrCreateCandidate } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { COMPANY } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import type { Candidate, DocumentRecord, Job, Submission } from '@/types';

export const metadata: Metadata = {
  title: 'Postuler en ligne',
  description: 'Postulez à un mandat ou activez votre profil candidat Agence Sanitas.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { mandat_id?: string };
}

type ReusableDocument = Pick<
  DocumentRecord,
  'id' | 'document_type' | 'status' | 'file_path' | 'file_name'
>;

async function fetchJob(id?: string): Promise<Job | null> {
  if (!id) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
  return (data as Job) || null;
}

async function fetchExistingPosting(candidateId: string, jobId: string): Promise<Submission | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('candidate_id', candidateId)
    .eq('job_id', jobId)
    .maybeSingle();
  return (data as Submission) || null;
}

async function fetchReusableDocuments(candidateId: string): Promise<Record<string, ReusableDocument>> {
  const supabase = createSupabaseAdminClient();
  let { data, error } = await supabase
    .from('candidate_documents')
    .select('id, document_type, status, file_path, file_name, uploaded_at, created_at')
    .eq('candidate_id', candidateId)
    .eq('status', 'Reçu')
    .not('file_path', 'is', null)
    .eq('is_current', true)
    .order('uploaded_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    const fallback = await supabase
      .from('candidate_documents')
      .select('id, document_type, status, file_path, file_name, uploaded_at, created_at')
      .eq('candidate_id', candidateId)
      .eq('status', 'Reçu')
      .not('file_path', 'is', null)
      .order('uploaded_at', { ascending: false })
      .order('created_at', { ascending: false });
    data = fallback.data || [];
  }

  const byType: Record<string, ReusableDocument> = {};
  for (const doc of (data || []) as Array<ReusableDocument & { uploaded_at?: string; created_at?: string }>) {
    if (!byType[doc.document_type]) {
      byType[doc.document_type] = {
        id: doc.id,
        document_type: doc.document_type,
        status: doc.status,
        file_path: doc.file_path,
        file_name: doc.file_name,
      };
    }
  }
  return byType;
}

function buildRedirect(searchParams: Props['searchParams']) {
  const target = searchParams.mandat_id
    ? `/postuler?mandat_id=${encodeURIComponent(searchParams.mandat_id)}`
    : '/postuler';
  return `/connexion?redirect=${encodeURIComponent(target)}`;
}

export default async function PostulerPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(buildRedirect(searchParams));

  const candidate = await getOrCreateCandidate();
  if (!candidate) {
    return (
      <PublicLayout>
        <section className="section pt-16 pb-24">
          <div className="container-page max-w-2xl">
            <h1 className="text-display-md text-fg">Impossible de charger votre dossier.</h1>
            <p className="mt-3 text-fg-muted">
              Appelez-nous au <a className="underline" href={COMPANY.phoneHref}>{COMPANY.phone}</a>,
              et notre équipe vous aidera à compléter votre candidature.
            </p>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const selectedJob = await fetchJob(searchParams.mandat_id);
  if (searchParams.mandat_id && (!selectedJob || selectedJob.status !== 'active')) {
    return <InactiveMandate candidate={candidate} />;
  }

  const mode: 'posting' | 'spontaneous' = selectedJob ? 'posting' : 'spontaneous';
  const [documents, existingPosting] = await Promise.all([
    fetchReusableDocuments(candidate.id),
    selectedJob ? fetchExistingPosting(candidate.id, selectedJob.id) : Promise.resolve(null),
  ]);

  if (selectedJob && existingPosting) {
    return <AlreadyApplied job={selectedJob} submission={existingPosting} />;
  }

  return (
    <PublicLayout>
      <section className="relative section pt-12 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="mb-8 max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              Dossier candidat unique
            </p>
            <h1 className="mt-2 text-display-lg text-fg">
              {selectedJob ? 'Confirmer mon intérêt pour ce mandat' : 'Activer mon profil Sanitas'}
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-fg-muted max-w-prose">
              {selectedJob
                ? "Vos informations sont réutilisées depuis votre dossier. Confirmez seulement ce qui manque ou ce qui a changé pour ce mandat."
                : "Complétez votre dossier une fois. L'équipe Sanitas pourra ensuite vous proposer les mandats compatibles."}
            </p>
          </div>

          {selectedJob && (
            <div className="mb-6 rounded-xl border border-border bg-muted/40 p-5">
              <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
                Mandat sélectionné
              </p>
              <h2 className="mt-1 text-[18px] font-semibold text-fg">{selectedJob.title}</h2>
              <p className="mt-1 text-[14px] text-fg-muted">
                {[selectedJob.establishment, selectedJob.city, selectedJob.department, selectedJob.shift]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          )}

          <CandidateApplicationFlow
            mode={mode}
            job={selectedJob}
            initial={candidate}
            initialDocuments={documents}
          />
        </div>
      </section>
    </PublicLayout>
  );
}

function AlreadyApplied({ job, submission }: { job: Job; submission: Submission }) {
  return (
    <PublicLayout>
      <section className="section pt-16 pb-24">
        <div className="container-page max-w-2xl">
          <div className="card p-7 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                  Candidature déjà envoyée
                </p>
                <h1 className="mt-2 text-display-md text-fg">{job.title}</h1>
                <p className="mt-2 text-[15px] text-fg-muted">
                  Vous avez déjà manifesté votre intérêt pour ce mandat le{' '}
                  {formatDateTime(submission.created_at)}.
                </p>
              </div>
              <StatusBadge status={submission.status} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/mes-candidatures" className="btn-primary">
                Voir mes candidatures
              </Link>
              <a href={COMPANY.phoneHref} className="btn-secondary">
                Appeler {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function InactiveMandate({ candidate }: { candidate: Candidate }) {
  return (
    <PublicLayout>
      <section className="section pt-16 pb-24">
        <div className="container-page max-w-2xl">
          <div className="card p-7 sm:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              Mandat non disponible
            </p>
            <h1 className="mt-2 text-display-md text-fg">
              Ce poste n'est plus actif.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              {candidate.first_name ? `${candidate.first_name}, v` : 'V'}ous pouvez quand même
              activer votre profil Sanitas pour recevoir des mandats compatibles, ou nous appeler
              si vous préférez parler à quelqu'un.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/postuler" className="btn-primary">
                Activer mon profil
              </Link>
              <a href={COMPANY.phoneHref} className="btn-secondary">
                Appeler {COMPANY.phone}
              </a>
              <Link href="/postes" className="btn-ghost">
                Voir les postes ouverts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
