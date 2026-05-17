import Link from 'next/link';
import type { Metadata } from 'next';
import KpiCard from '@/components/KpiCard';
import StatusBadge from '@/components/StatusBadge';
import TaskStatusButton from '@/components/admin/TaskStatusButton';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  applicationObjectLabel,
  candidateDisplayName,
  laneForStatus,
  recruiterNextAction,
} from '@/lib/ats-operating-model';
import { formatDateTime } from '@/lib/utils';
import type { Application, Candidate, RecruiterTask } from '@/types';

export const metadata: Metadata = { title: 'ATS Sanitas', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

interface ApplicationRow extends Application {
  candidate: Candidate;
}

async function fetchDashboard() {
  const supabase = createSupabaseAdminClient();
  const [
    { count: candidates },
    { count: applications },
    { count: newApplications },
    { count: ready },
    { count: missingDocs },
    { count: urgentJobs },
    { data: recent },
    { data: tasks },
  ] = await Promise.all([
    supabase.from('candidates').select('*', { head: true, count: 'exact' }),
    supabase.from('applications').select('*', { head: true, count: 'exact' }),
    supabase.from('applications').select('*', { head: true, count: 'exact' }).eq('status', 'Nouveau'),
    supabase.from('applications').select('*', { head: true, count: 'exact' }).eq('status', 'Prêt à présenter'),
    supabase.from('applications').select('*', { head: true, count: 'exact' }).eq('status', 'Documents manquants'),
    supabase.from('jobs').select('*', { head: true, count: 'exact' }).eq('urgency', 'urgent').eq('status', 'active'),
    supabase
      .from('applications')
      .select('*, candidate:candidates(*)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('recruiter_tasks')
      .select('*, candidate:candidates(*), application:applications(*), job:jobs(*)')
      .eq('status', 'open')
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  return {
    kpi: {
      candidates: candidates ?? 0,
      applications: applications ?? 0,
      newApplications: newApplications ?? 0,
      ready: ready ?? 0,
      missingDocs: missingDocs ?? 0,
      urgentJobs: urgentJobs ?? 0,
    },
    recent: (recent || []) as unknown as ApplicationRow[],
    tasks: (tasks || []) as unknown as RecruiterTask[],
  };
}

export default async function AdminDashboardPage() {
  const { kpi, recent, tasks } = await fetchDashboard();
  const inbox = recent.filter((application) => laneForStatus(application.status).id === 'intake').length;
  const blocked = recent.filter((application) => laneForStatus(application.status).id === 'blocked').length;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">ATS Sanitas</p>
          <h1 className="mt-1 text-display-md text-fg">Centre de contrôle</h1>
          <p className="mt-2 max-w-prose text-fg-muted">
            Priorisez par action suivante. Les dossiers entrants, bloqués, prêts et à relancer restent dans la même file.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/applications" className="btn-primary">Ouvrir la file</Link>
          <Link href="/admin/postes/nouveau" className="btn-secondary">Créer un poste</Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Candidats" value={kpi.candidates} />
        <KpiCard label="Candidatures" value={kpi.applications} />
        <KpiCard label="Inbox" value={inbox || kpi.newApplications} />
        <KpiCard label="Bloqués" value={blocked || kpi.missingDocs} />
        <KpiCard label="Prêts client" value={kpi.ready} />
        <KpiCard label="Postes urgents" value={kpi.urgentJobs} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[17px] font-semibold text-fg">File opérationnelle</h2>
              <p className="text-[13.5px] text-fg-muted">Chaque dossier affiche son lane ATS et l’action suivante.</p>
            </div>
            <Link href="/admin/applications" className="text-[13.5px] text-accent hover:underline">
              Tout voir
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recent.length === 0 ? (
              <p className="p-8 text-center text-fg-muted">Aucune candidature pour le moment.</p>
            ) : (
              recent.map((application) => (
                <Link
                  key={application.id}
                  href={`/admin/candidats/${application.candidate_id}`}
                  className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-fg">{candidateDisplayName(application.candidate)}</p>
                    <p className="mt-1 truncate text-[13.5px] text-fg-muted">
                      {applicationObjectLabel(application)}
                    </p>
                    <p className="mt-1 text-[12.5px] font-medium text-fg">{recruiterNextAction(application)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="tag mb-1">{laneForStatus(application.status).label}</span>
                    <StatusBadge status={application.status} />
                    <p className="mt-1 text-[12px] text-fg-subtle">{formatDateTime(application.created_at)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[17px] font-semibold text-fg">Tâches ouvertes</h2>
              <p className="text-[13.5px] text-fg-muted">Relances et actions à faire.</p>
            </div>
            <Link href="/admin/taches" className="text-[13.5px] text-accent hover:underline">
              Gérer
            </Link>
          </div>
          <div className="divide-y divide-border">
            {tasks.length === 0 ? (
              <p className="p-8 text-center text-fg-muted">Aucune tâche ouverte.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-fg">{task.title}</p>
                      <p className="mt-1 text-[13px] text-fg-muted">
                        {task.candidate
                          ? `${task.candidate.first_name} ${task.candidate.last_name}`
                          : task.job?.title || 'Sans dossier lié'}
                      </p>
                      {task.due_at && (
                        <p className="mt-1 text-[12.5px] text-fg-subtle">Échéance {formatDateTime(task.due_at)}</p>
                      )}
                    </div>
                    <TaskStatusButton id={task.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
