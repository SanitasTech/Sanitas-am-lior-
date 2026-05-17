import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import JobForm from '@/components/JobForm';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { computeMatchScore, hydrateCandidate } from '@/lib/ats';
import type { Candidate, CandidateDocument, Job, MatchReason } from '@/types';

export const metadata: Metadata = { title: 'Modifier le poste', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

async function fetchJob(id: string): Promise<Job | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
  return (data as Job) || null;
}

async function fetchTopMatches(job: Job) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('candidates')
    .select('*, profile:candidate_profiles(*), availability:candidate_availability(*), documents:candidate_documents(*)')
    .eq('status', 'active')
    .limit(100);

  return ((data || []) as Array<Record<string, unknown>>)
    .map((row) => {
      const candidate = hydrateCandidate(
        row,
        row.profile as Record<string, unknown>,
        row.availability as Record<string, unknown>
      ) as Candidate | null;
      if (!candidate) return null;
      const documents = (row.documents as CandidateDocument[] | undefined) || [];
      const match = computeMatchScore(candidate, job, documents);
      return { candidate, ...match };
    })
    .filter((row): row is { candidate: Candidate; score: number; reasons: MatchReason[]; blockers: MatchReason[] } => !!row)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

export default async function EditJobPage({ params }: { params: { id: string } }) {
  // Guard : "nouveau" est géré par sa propre route mais Next peut router ici si conflit.
  if (params.id === 'nouveau') notFound();
  const job = await fetchJob(params.id);
  if (!job) notFound();
  const matches = await fetchTopMatches(job);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-md text-fg">Modifier le poste</h1>
        <p className="mt-2 text-fg-muted">
          {job.title}
        </p>
      </header>
      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-fg">Candidats compatibles</h2>
            <p className="mt-1 text-[13.5px] text-fg-muted">
              Score déterministe calculé avec profession, région, quart, disponibilité et documents.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {matches.length === 0 ? (
            <p className="text-fg-muted">Aucun candidat actif à comparer.</p>
          ) : (
            matches.map(({ candidate, score, reasons }) => (
              <Link
                key={candidate.id}
                href={`/admin/candidats/${candidate.id}`}
                className="rounded-lg border border-border bg-surface p-4 hover:bg-muted/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-fg">{candidate.first_name} {candidate.last_name}</p>
                    <p className="mt-1 text-[13px] text-fg-muted">
                      {(candidate.qualified_professions || []).join(', ') || candidate.profession || 'Métier à compléter'}
                    </p>
                  </div>
                  <span className="tabular-nums text-[16px] font-semibold text-fg">{score}%</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {reasons.slice(0, 3).map((reason) => (
                    <li key={reason.label} className="text-[12.5px] text-fg-muted">
                      {reason.label}: {reason.detail}
                    </li>
                  ))}
                </ul>
              </Link>
            ))
          )}
        </div>
      </section>
      <JobForm mode="edit" initial={job} />
    </div>
  );
}
