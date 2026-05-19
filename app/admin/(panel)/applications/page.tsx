import Link from 'next/link';
import type { Metadata } from 'next';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { SUBMISSION_STATUSES } from '@/lib/constants';
import { hydrateCandidate } from '@/lib/ats';
import {
  ATS_PIPELINE_LANES,
  applicationObjectLabel,
  candidateDisplayName,
  getApplicationNextAction,
  laneForStatus,
  priorityClass,
  priorityLabel,
} from '@/lib/ats-operating-model';
import { cn, formatDateTime } from '@/lib/utils';
import type { Application, Candidate, CandidateDocument, Job } from '@/types';

export const metadata: Metadata = { title: 'Pipeline ATS', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(sp: Props['searchParams'], key: string) {
  const value = sp[key];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

interface ApplicationRow extends Application {
  candidate: Candidate;
  job?: Job | null;
  candidate_documents?: CandidateDocument[];
}

async function fetchApplications(sp: Props['searchParams']) {
  const supabase = createSupabaseAdminClient();
  const status = param(sp, 'status');
  const type = param(sp, 'type');
  const search = param(sp, 'q').trim().toLowerCase();

  let query = supabase
    .from('applications')
    .select(
      '*, candidate:candidates(*, profile:candidate_profiles(*), availability:candidate_availability(*), documents:candidate_documents(*)), job:jobs(*)'
    )
    .order('created_at', { ascending: false })
    .limit(300);

  if (status) query = query.eq('status', status);
  if (type === 'posting' || type === 'spontaneous') query = query.eq('application_type', type);

  const { data } = await query;
  let rows = ((data || []) as Array<Record<string, unknown>>).map((row) => {
    const candidateRow = row.candidate as Record<string, unknown> | undefined;
    const candidate = hydrateCandidate(
      candidateRow,
      candidateRow?.profile as Record<string, unknown>,
      candidateRow?.availability as Record<string, unknown>
    ) || (candidateRow as unknown as Candidate);
    return {
      ...(row as unknown as Application),
      candidate,
      job: (row.job as Job | null) || null,
      candidate_documents: (candidateRow?.documents as CandidateDocument[] | undefined) || [],
    } as ApplicationRow;
  });

  if (search) {
    rows = rows.filter((row) =>
      [
        row.candidate?.first_name,
        row.candidate?.last_name,
        row.candidate?.email,
        row.candidate?.phone,
        applicationObjectLabel(row),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)
    );
  }

  return rows;
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const rows = await fetchApplications(searchParams);

  return (
    <div className="space-y-7">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Pipeline ATS</p>
        <h1 className="mt-1 text-display-md text-fg">File de décision</h1>
        <p className="mt-2 max-w-prose text-fg-muted">
          Une candidature doit toujours avoir une action suivante: qualifier, débloquer, présenter ou fermer.
        </p>
      </header>

      <form className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
          <div>
            <label className="label" htmlFor="q">Recherche</label>
            <input id="q" name="q" defaultValue={param(searchParams, 'q')} className="input" placeholder="Nom, mandat, contact" />
          </div>
          <div>
            <label className="label" htmlFor="type">Type</label>
            <select id="type" name="type" defaultValue={param(searchParams, 'type')} className="input">
              <option value="">Tous</option>
              <option value="posting">Mandat précis</option>
              <option value="spontaneous">Spontanée</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="status">Statut</label>
            <select id="status" name="status" defaultValue={param(searchParams, 'status')} className="input">
              <option value="">Tous</option>
              {SUBMISSION_STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary">Filtrer</button>
            <Link href="/admin/applications" className="btn-secondary">Reset</Link>
          </div>
        </div>
      </form>

      <section className="grid gap-4 xl:grid-cols-5">
        {ATS_PIPELINE_LANES.map((lane) => {
          const columnRows = rows.filter((row) => laneForStatus(row.status).id === lane.id);
          return (
            <div key={lane.id} className="rounded-lg border border-border bg-surface overflow-hidden">
              <div className="border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[14px] font-semibold text-fg">{lane.label}</h2>
                  <span className="tag">{columnRows.length}</span>
                </div>
                <p className="mt-1 text-[12.5px] leading-snug text-fg-subtle">{lane.intent}</p>
              </div>
              <div className="divide-y divide-border">
                {columnRows.length === 0 ? (
                  <p className="p-5 text-[13.5px] text-fg-muted">Aucun dossier.</p>
                ) : (
                  columnRows.slice(0, 8).map((application) => {
                    const action = getApplicationNextAction({
                      application,
                      candidate: application.candidate,
                      documents: application.candidate_documents || [],
                      job: application.job || null,
                    });
                    return (
                      <Link
                        key={application.id}
                        href={`/admin/candidats/${application.candidate_id}`}
                        className="block p-4 hover:bg-muted/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-fg truncate">
                              {candidateDisplayName(application.candidate)}
                            </p>
                            <p className="mt-1 text-[13px] text-fg-muted truncate">
                              {applicationObjectLabel(application)}
                            </p>
                          </div>
                          <TypeBadge type={application.application_type} />
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={cn('tag', priorityClass(action.priority))}>{priorityLabel(action.priority)}</span>
                          <span className={cn('text-[12px]', action.overdue ? 'text-danger' : 'text-fg-subtle')}>
                            {action.dueLabel}
                          </span>
                        </div>
                        <p className="mt-2 text-[12.5px] font-medium text-fg">{action.label}</p>
                        <p className="mt-1 text-[12px] text-fg-subtle">{formatDateTime(application.created_at)}</p>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[17px] font-semibold text-fg">Tous les dossiers actifs</h2>
            <p className="text-[13.5px] text-fg-muted">Vue dense pour recherche, triage et suivi.</p>
          </div>
          <span className="tag">{rows.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-muted text-fg-subtle">
              <tr>
                <Th>Candidat</Th>
                <Th>Lane ATS</Th>
                <Th>Objet</Th>
                <Th>Action suivante</Th>
                <Th>Statut</Th>
                <Th>Date</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-fg-muted">
                    Aucun dossier ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                rows.map((application) => (
                  <tr key={application.id} className="hover:bg-muted/50">
                    <Td>
                      <p className="font-medium text-fg">{candidateDisplayName(application.candidate)}</p>
                      <p className="text-fg-muted">{application.candidate?.phone || application.candidate?.email}</p>
                    </Td>
                    <Td><span className="tag">{laneForStatus(application.status).label}</span></Td>
                    <Td><div className="max-w-[320px] truncate">{applicationObjectLabel(application)}</div></Td>
                    <Td><ActionSummary application={application} /></Td>
                    <Td><StatusBadge status={application.status} /></Td>
                    <Td className="text-fg-muted whitespace-nowrap">{formatDateTime(application.created_at)}</Td>
                    <Td className="text-right">
                      <Link href={`/admin/candidats/${application.candidate_id}`} className="text-accent hover:underline">
                        Ouvrir
                      </Link>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="text-left font-medium uppercase tracking-wider text-[11.5px] px-4 py-3">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className || ''}`}>{children}</td>;
}

function ActionSummary({ application }: { application: ApplicationRow }) {
  const action = getApplicationNextAction({
    application,
    candidate: application.candidate,
    documents: application.candidate_documents || [],
    job: application.job || null,
  });
  return (
    <div className="min-w-[220px]">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('tag', priorityClass(action.priority))}>{priorityLabel(action.priority)}</span>
        <span className={cn('text-[12.5px]', action.overdue ? 'text-danger' : 'text-fg-subtle')}>
          {action.dueLabel}
        </span>
      </div>
      <p className="mt-1 font-medium text-fg">{action.label}</p>
      <p className="mt-0.5 text-[12.5px] text-fg-muted">{action.detail}</p>
    </div>
  );
}
