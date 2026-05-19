import Link from 'next/link';
import type { Metadata } from 'next';
import KpiCard from '@/components/KpiCard';
import StatusBadge from '@/components/StatusBadge';
import TaskStatusButton from '@/components/admin/TaskStatusButton';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { computeMatchScore, hydrateCandidate } from '@/lib/ats';
import {
  applicationObjectLabel,
  candidateDisplayName,
  getApplicationNextAction,
  getMatchDecision,
  laneForStatus,
  priorityClass,
  priorityLabel,
  type AtsActionPriority,
} from '@/lib/ats-operating-model';
import { cn, formatDateTime } from '@/lib/utils';
import type { Application, Candidate, CandidateDocument, Job, RecruiterTask } from '@/types';

export const metadata: Metadata = { title: 'ATS Sanitas', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

interface ApplicationRow extends Application {
  candidate: Candidate;
  job?: Job | null;
  candidate_documents?: CandidateDocument[];
}

interface ActionItem {
  application: ApplicationRow;
  action: ReturnType<typeof getApplicationNextAction>;
  candidate: Candidate;
  lane: ReturnType<typeof laneForStatus>;
}

interface JobCoverage {
  job: Job;
  readyCount: number;
  validateCount: number;
  bestScore: number;
}

async function fetchDashboard() {
  const supabase = createSupabaseAdminClient();
  const [
    { count: candidates },
    { count: applications },
    { count: placed },
    { data: appRows },
    { data: taskRows },
    { data: jobRows },
    { data: candidateRows },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { head: true, count: 'exact' }),
    supabase.from('applications').select('*', { head: true, count: 'exact' }),
    supabase.from('applications').select('*', { head: true, count: 'exact' }).eq('status', 'Placé'),
    supabase
      .from('applications')
      .select(
        '*, candidate:candidates(*, profile:candidate_profiles(*), availability:candidate_availability(*), documents:candidate_documents(*)), job:jobs(*)'
      )
      .order('updated_at', { ascending: false })
      .limit(120),
    supabase
      .from('recruiter_tasks')
      .select('*, candidate:candidates(*), application:applications(*), job:jobs(*)')
      .eq('status', 'open')
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(80),
    supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .in('urgency', ['urgent', 'high'])
      .order('urgency', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('candidates')
      .select('*, profile:candidate_profiles(*), availability:candidate_availability(*), documents:candidate_documents(*)')
      .eq('status', 'active')
      .limit(200),
  ]);

  const rows = ((appRows || []) as Array<Record<string, unknown>>).map((row) => {
    const candidateRow = row.candidate as Record<string, unknown> | undefined;
    const candidate = hydrateCandidate(
      candidateRow,
      candidateRow?.profile as Record<string, unknown>,
      candidateRow?.availability as Record<string, unknown>
    ) || (candidateRow as unknown as Candidate);
    const documents = (candidateRow?.documents as CandidateDocument[] | undefined) || [];
    return {
      ...(row as unknown as Application),
      candidate,
      job: (row.job as Job | null) || null,
      candidate_documents: documents,
    } as ApplicationRow;
  });

  const actionItems: ActionItem[] = rows
    .filter((application) => laneForStatus(application.status).id !== 'closed')
    .map((application) => {
      const candidate = application.candidate;
      const action = getApplicationNextAction({
        application,
        candidate,
        documents: application.candidate_documents || [],
        job: application.job || null,
      });
      return { application, action, candidate, lane: laneForStatus(application.status) };
    })
    .sort((a, b) => priorityWeight(b.action.priority) - priorityWeight(a.action.priority));

  const activeCandidates = ((candidateRows || []) as Array<Record<string, unknown>>)
    .map((row) => {
      const candidate = hydrateCandidate(
        row,
        row.profile as Record<string, unknown>,
        row.availability as Record<string, unknown>
      );
      if (!candidate) return null;
      return {
        candidate,
        documents: (row.documents as CandidateDocument[] | undefined) || [],
      };
    })
    .filter((row): row is { candidate: Candidate; documents: CandidateDocument[] } => !!row);

  const urgentCoverage: JobCoverage[] = ((jobRows || []) as Job[]).map((job) => {
    const scores = activeCandidates.map(({ candidate, documents }) => {
      const match = computeMatchScore(candidate, job, documents);
      const decision = getMatchDecision(match);
      return { score: match.score, decision: decision.decision };
    });
    return {
      job,
      readyCount: scores.filter((score) => score.decision === 'present_now').length,
      validateCount: scores.filter((score) => score.decision === 'call_to_validate').length,
      bestScore: scores.reduce((max, item) => Math.max(max, item.score), 0),
    };
  });

  return {
    kpi: {
      candidates: candidates ?? 0,
      applications: applications ?? 0,
      placed: placed ?? 0,
      overdue: actionItems.filter((item) => item.action.overdue).length,
      ready: actionItems.filter((item) => item.action.code === 'present_candidate').length,
      uncoveredUrgent: urgentCoverage.filter((item) => item.readyCount === 0).length,
    },
    actions: actionItems,
    tasks: (taskRows || []) as unknown as RecruiterTask[],
    urgentCoverage,
  };
}

export default async function AdminDashboardPage() {
  const { kpi, actions, tasks, urgentCoverage } = await fetchDashboard();
  const calls = actions.filter((item) => item.action.code === 'call_candidate' || item.action.code === 'qualify_candidate');
  const documents = actions.filter((item) => item.action.code === 'request_documents');
  const ready = actions.filter((item) => item.action.code === 'present_candidate');
  const followUps = actions.filter((item) => item.action.code === 'follow_client');

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">ATS Sanitas</p>
          <h1 className="mt-1 text-display-md text-fg">Aujourd'hui</h1>
          <p className="mt-2 max-w-prose text-fg-muted">
            Le cockpit est organise par action suivante: appeler, debloquer, presenter, suivre. Un dossier actif sans action est un mandat qui ralentit.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/applications" className="btn-primary">Ouvrir la file</Link>
          <Link href="/admin/postes" className="btn-secondary">Voir les mandats</Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Dossiers" value={kpi.candidates} hint="Candidats uniques" />
        <KpiCard label="Candidatures" value={kpi.applications} hint="Postes + spontanees" />
        <KpiCard label="A presenter" value={kpi.ready} hint="Action client immediate" />
        <KpiCard label="En retard" value={kpi.overdue} hint="SLA depasse" />
        <KpiCard label="Urgents sans pret" value={kpi.uncoveredUrgent} hint="A sourcer aujourd'hui" />
        <KpiCard label="Places" value={kpi.placed} hint="Candidatures placees" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.85fr]">
        <div className="space-y-5">
          <TodayPanel
            title="Appels et qualification"
            description="Nouveaux dossiers et validations qui doivent avancer sous 24 h."
            href="/admin/applications?status=Nouveau"
            items={calls.slice(0, 6)}
            empty="Aucun appel prioritaire."
          />
          <TodayPanel
            title="Documents a debloquer"
            description="CV, permis ou pieces qui empechent une presentation client."
            href="/admin/applications?status=Documents%20manquants"
            items={documents.slice(0, 6)}
            empty="Aucune relance document immediate."
          />
          <TodayPanel
            title="Prets a presenter"
            description="Dossiers suffisamment complets pour etre proposes a un client."
            href="/admin/applications?status=Pr%C3%AAt%20%C3%A0%20pr%C3%A9senter"
            items={ready.slice(0, 6)}
            empty="Aucun dossier pret pour presentation."
          />
        </div>

        <div className="space-y-5">
          <section className="card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[17px] font-semibold text-fg">Mandats urgents</h2>
              <p className="text-[13.5px] text-fg-muted">La question: peut-on combler ce mandat aujourd'hui ?</p>
            </div>
            <div className="divide-y divide-border">
              {urgentCoverage.length === 0 ? (
                <p className="p-7 text-[14px] text-fg-muted">Aucun mandat urgent ou prioritaire actif.</p>
              ) : (
                urgentCoverage.slice(0, 8).map((item) => (
                  <Link
                    key={item.job.id}
                    href={`/admin/postes/${item.job.id}`}
                    className="block px-5 py-4 hover:bg-muted/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-fg">{item.job.title}</p>
                        <p className="mt-1 text-[13px] text-fg-muted">
                          {[item.job.region, item.job.department, item.job.shift].filter(Boolean).join(' | ')}
                        </p>
                      </div>
                      <span className={cn('tag', item.readyCount > 0 ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning')}>
                        {item.readyCount > 0 ? `${item.readyCount} pret(s)` : 'Aucun pret'}
                      </span>
                    </div>
                    <p className="mt-2 text-[12.5px] text-fg-subtle">
                      {item.validateCount} a valider | meilleur score {item.bestScore}%
                    </p>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-[17px] font-semibold text-fg">Taches ouvertes</h2>
                <p className="text-[13.5px] text-fg-muted">Production recruteur deja planifiee.</p>
              </div>
              <Link href="/admin/taches" className="text-[13.5px] text-accent hover:underline">
                Gerer
              </Link>
            </div>
            <div className="divide-y divide-border">
              {tasks.length === 0 ? (
                <p className="p-7 text-center text-fg-muted">Aucune tache ouverte.</p>
              ) : (
                tasks.slice(0, 8).map((task) => (
                  <div key={task.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-fg">{task.title}</p>
                        <p className="mt-1 text-[13px] text-fg-muted">
                          {task.candidate
                            ? candidateDisplayName(task.candidate)
                            : task.job?.title || 'Sans dossier lie'}
                        </p>
                        {task.due_at && (
                          <p className="mt-1 text-[12.5px] text-fg-subtle">Echeance {formatDateTime(task.due_at)}</p>
                        )}
                      </div>
                      <TaskStatusButton id={task.id} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <TodayPanel
            title="Suivis client"
            description="Candidats deja presentes, a garder chauds."
            href="/admin/applications?status=Pr%C3%A9sent%C3%A9"
            items={followUps.slice(0, 4)}
            empty="Aucun suivi client prioritaire."
            compact
          />
        </div>
      </section>
    </div>
  );
}

function TodayPanel({
  title,
  description,
  href,
  items,
  empty,
  compact,
}: {
  title: string;
  description: string;
  href: string;
  items: ActionItem[];
  empty: string;
  compact?: boolean;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-[17px] font-semibold text-fg">{title}</h2>
          <p className="text-[13.5px] text-fg-muted">{description}</p>
        </div>
        <Link href={href} className="shrink-0 text-[13.5px] text-accent hover:underline">
          Tout voir
        </Link>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <p className="p-7 text-[14px] text-fg-muted">{empty}</p>
        ) : (
          items.map((item) => <ActionRow key={item.application.id} item={item} compact={compact} />)
        )}
      </div>
    </section>
  );
}

function ActionRow({ item, compact }: { item: ActionItem; compact?: boolean }) {
  return (
    <Link
      href={`/admin/candidats/${item.application.candidate_id}`}
      className="block px-5 py-4 hover:bg-muted/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-fg">{candidateDisplayName(item.candidate)}</p>
          <p className="mt-1 truncate text-[13.5px] text-fg-muted">
            {applicationObjectLabel(item.application)}
          </p>
          {!compact && <p className="mt-2 text-[13px] text-fg">{item.action.detail}</p>}
        </div>
        <div className="shrink-0 text-right">
          <span className={cn('tag mb-2', priorityClass(item.action.priority))}>
            {priorityLabel(item.action.priority)}
          </span>
          <p className={cn('text-[12.5px]', item.action.overdue ? 'text-danger' : 'text-fg-subtle')}>
            {item.action.dueLabel}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="tag">{item.lane.label}</span>
        <StatusBadge status={item.application.status} />
        <span className="text-[12.5px] font-medium text-fg">{item.action.label}</span>
      </div>
    </Link>
  );
}

function priorityWeight(priority: AtsActionPriority) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'normal') return 2;
  return 1;
}
