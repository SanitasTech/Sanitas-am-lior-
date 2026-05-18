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
import { applicationTitle, dateLocale, jobTitle, localizedPath } from '@/lib/i18n';
import type { Candidate, DocumentRecord, Job, Submission } from '@/types';

export const metadata: Metadata = {
  title: 'Apply online',
  description: 'Apply to an assignment or activate your Agence Sanitas candidate profile.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { mandat_id?: string };
}

type ReusableDocument = Pick<DocumentRecord, 'id' | 'document_type' | 'status' | 'file_path' | 'file_name'>;

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
    ? `/en/apply?mandat_id=${encodeURIComponent(searchParams.mandat_id)}`
    : '/en/apply';
  return `/en/login?redirect=${encodeURIComponent(target)}`;
}

export default async function EnglishApplyPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(buildRedirect(searchParams));

  const candidate = await getOrCreateCandidate();
  if (!candidate) {
    return (
      <PublicLayout locale="en">
        <section className="section pt-16 pb-24">
          <div className="container-page max-w-2xl">
            <h1 className="text-display-md text-fg">We could not load your file.</h1>
            <p className="mt-3 text-fg-muted">
              Call us at <a className="underline" href={COMPANY.phoneHref}>{COMPANY.phone}</a>, and our team will help you complete your application.
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
    <PublicLayout locale="en">
      <section className="relative section pt-12 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="mb-8 max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Single candidate file</p>
            <h1 className="mt-2 text-display-lg text-fg">
              {selectedJob ? 'Confirm my interest in this assignment' : 'Activate my Sanitas profile'}
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-fg-muted max-w-prose">
              {selectedJob
                ? 'Your information is reused from your file. Confirm only what is missing or what changed for this assignment.'
                : 'Complete your file once. The Sanitas team can then match you with compatible assignments.'}
            </p>
          </div>

          {selectedJob && (
            <div className="mb-6 rounded-xl border border-border bg-muted/40 p-5">
              <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">Selected assignment</p>
              <h2 className="mt-1 text-[18px] font-semibold text-fg">{jobTitle(selectedJob, 'en')}</h2>
              <p className="mt-1 text-[14px] text-fg-muted">
                {[selectedJob.establishment, selectedJob.city, selectedJob.department, selectedJob.shift].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}

          <CandidateApplicationFlow mode={mode} job={selectedJob} initial={candidate} initialDocuments={documents} locale="en" />
        </div>
      </section>
    </PublicLayout>
  );
}

function AlreadyApplied({ job, submission }: { job: Job; submission: Submission }) {
  return (
    <PublicLayout locale="en">
      <section className="section pt-16 pb-24">
        <div className="container-page max-w-2xl">
          <div className="card p-7 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Application already sent</p>
                <h1 className="mt-2 text-display-md text-fg">{jobTitle(job, 'en')}</h1>
                <p className="mt-2 text-[15px] text-fg-muted">
                  You already expressed interest in this assignment on {formatDateTime(submission.created_at, dateLocale('en'))}.
                </p>
              </div>
              <StatusBadge status={submission.status} locale="en" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/en/my-applications" className="btn-primary">View my applications</Link>
              <a href={COMPANY.phoneHref} className="btn-secondary">Call {COMPANY.phone}</a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function InactiveMandate({ candidate }: { candidate: Candidate }) {
  return (
    <PublicLayout locale="en">
      <section className="section pt-16 pb-24">
        <div className="container-page max-w-2xl">
          <div className="card p-7 sm:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Assignment unavailable</p>
            <h1 className="mt-2 text-display-md text-fg">This job is no longer active.</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
              {candidate.first_name ? `${candidate.first_name}, y` : 'Y'}ou can still activate your Sanitas profile to receive compatible assignments, or call us if you prefer to speak with someone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={localizedPath('en', 'apply')} className="btn-primary">Activate my profile</Link>
              <a href={COMPANY.phoneHref} className="btn-secondary">Call {COMPANY.phone}</a>
              <Link href={localizedPath('en', 'jobs')} className="btn-ghost">View open jobs</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
