import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import JobForm from '@/components/JobForm';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { computeMatchScore, hydrateCandidate } from '@/lib/ats';
import { getMatchDecision, matchDecisionClass } from '@/lib/ats-operating-model';
import { cn } from '@/lib/utils';
import type { Candidate, CandidateDocument, Job, MatchReason } from '@/types';

export const metadata: Metadata = { title: 'Modifier le poste', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

interface MatchRow {
  candidate: Candidate;
  score: number;
  reasons: MatchReason[];
  blockers: MatchReason[];
  decision: ReturnType<typeof getMatchDecision>;
}

async function fetchJob(id: string): Promise<Job | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
  return (data as Job) || null;
}

async function fetchTopMatches(job: Job): Promise<MatchRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('candidates')
    .select('*, profile:candidate_profiles(*), availability:candidate_availability(*), documents:candidate_documents(*)')
    .eq('status', 'active')
    .limit(200);

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
      return { candidate, ...match, decision: getMatchDecision(match) };
    })
    .filter((row): row is MatchRow => !!row)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

export default async function EditJobPage({ params }: { params: { id: string } }) {
  if (params.id === 'nouveau') notFound();
  const job = await fetchJob(params.id);
  if (!job) notFound();
  const matches = await fetchTopMatches(job);
  const presentNow = matches.filter((match) => match.decision.decision === 'present_now');
  const toValidate = matches.filter((match) => match.decision.decision === 'call_to_validate');
  const blocked = matches.filter((match) => match.decision.decision === 'request_document');
  const incompatible = matches.filter((match) => match.decision.decision === 'do_not_propose');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-md text-fg">Modifier le poste</h1>
        <p className="mt-2 text-fg-muted">{job.title}</p>
      </header>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-fg">Couverture du mandat</h2>
            <p className="mt-1 text-[13.5px] text-fg-muted">
              Le score devient une decision: presenter, appeler, demander document ou ne pas proposer.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[12.5px]">
            <Metric label="Presentables" value={presentNow.length} tone={presentNow.length > 0 ? 'success' : 'warning'} />
            <Metric label="A valider" value={toValidate.length} tone="accent" />
            <Metric label="Bloques doc" value={blocked.length} tone="warning" />
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <MatchGroup title="Presenter maintenant" matches={presentNow} empty="Aucun dossier totalement presentable." />
          <MatchGroup title="Appeler pour valider" matches={toValidate} empty="Aucun candidat a valider." />
          <MatchGroup title="Demander document" matches={blocked} empty="Aucun dossier bloque par document." />

          <details className="rounded-lg border border-border bg-surface">
            <summary className="cursor-pointer px-4 py-3 text-[14px] font-medium text-fg">
              Non compatibles ({incompatible.length})
            </summary>
            <div className="border-t border-border p-4">
              <MatchGrid matches={incompatible.slice(0, 9)} empty="Aucun candidat incompatible dans l echantillon." muted />
            </div>
          </details>
        </div>
      </section>

      <JobForm mode="edit" initial={job} />
    </div>
  );
}

function MatchGroup({ title, matches, empty }: { title: string; matches: MatchRow[]; empty: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
        <span className="tag">{matches.length}</span>
      </div>
      <MatchGrid matches={matches.slice(0, 9)} empty={empty} />
    </div>
  );
}

function MatchGrid({ matches, empty, muted }: { matches: MatchRow[]; empty: string; muted?: boolean }) {
  if (matches.length === 0) {
    return <p className="rounded-lg bg-muted/40 p-4 text-[13.5px] text-fg-muted">{empty}</p>;
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {matches.map(({ candidate, score, reasons, blockers, decision }) => (
        <Link
          key={candidate.id}
          href={`/admin/candidats/${candidate.id}`}
          className={cn('rounded-lg border border-border bg-surface p-4 hover:bg-muted/60', muted && 'opacity-75')}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-fg">{candidate.first_name} {candidate.last_name}</p>
              <p className="mt-1 text-[13px] text-fg-muted">
                {(candidate.qualified_professions || []).join(', ') || candidate.profession || 'Metier a completer'}
              </p>
            </div>
            <span className="tabular-nums text-[16px] font-semibold text-fg">{score}%</span>
          </div>
          <span className={cn('tag mt-3', matchDecisionClass(decision.decision))}>{decision.label}</span>
          <ul className="mt-3 space-y-1">
            {[...blockers, ...reasons.filter((reason) => reason.state !== 'ok')].slice(0, 3).map((reason) => (
              <li key={`${reason.label}-${reason.detail}`} className="text-[12.5px] text-fg-muted">
                {reason.label}: {reason.detail}
              </li>
            ))}
          </ul>
        </Link>
      ))}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'success' | 'warning' | 'accent' }) {
  const cls =
    tone === 'success'
      ? 'bg-success-soft text-success'
      : tone === 'warning'
        ? 'bg-warning-soft text-warning'
        : 'bg-accent-soft text-accent';
  return (
    <div className={cn('rounded-lg px-3 py-2', cls)}>
      <p className="text-[18px] font-semibold tabular-nums">{value}</p>
      <p>{label}</p>
    </div>
  );
}
