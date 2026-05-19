import Link from 'next/link';
import type { Metadata } from 'next';
import TaskStatusButton from '@/components/admin/TaskStatusButton';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  priorityClass,
  priorityLabel,
  RECRUITER_MESSAGE_TEMPLATES,
  type AtsActionPriority,
} from '@/lib/ats-operating-model';
import { cn, formatDateTime } from '@/lib/utils';
import type { RecruiterTask } from '@/types';

export const metadata: Metadata = { title: 'Taches', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

async function fetchTasks() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('recruiter_tasks')
    .select('*, candidate:candidates(*), application:applications(*), job:jobs(*)')
    .order('status', { ascending: true })
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(300);
  return (data || []) as unknown as RecruiterTask[];
}

export default async function TasksPage() {
  const tasks = await fetchTasks();
  const open = tasks.filter((task) => task.status === 'open');
  const done = tasks.filter((task) => task.status !== 'open');

  return (
    <div className="space-y-7">
      <header>
        <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Suivi recruteur</p>
        <h1 className="mt-1 text-display-md text-fg">Taches</h1>
        <p className="mt-2 text-fg-muted">
          Les taches sont le moteur de production: appel, document, validation, presentation, suivi client.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[17px] font-semibold text-fg">Ouvertes</h2>
            <p className="mt-1 text-[13.5px] text-fg-muted">A traiter par echeance et impact sur les mandats.</p>
          </div>
          <TaskList tasks={open} />
        </div>

        <div className="space-y-5">
          <section className="card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[17px] font-semibold text-fg">Modeles de relance</h2>
              <p className="mt-1 text-[13.5px] text-fg-muted">Textes copiables, sans envoi automatique obligatoire.</p>
            </div>
            <div className="divide-y divide-border">
              {RECRUITER_MESSAGE_TEMPLATES.map((template) => (
                <details key={template.code}>
                  <summary className="cursor-pointer px-5 py-3 text-[14px] font-medium text-fg hover:bg-muted/50">
                    {template.title}
                  </summary>
                  <div className="px-5 pb-4">
                    {template.subject && <p className="mb-2 text-[12.5px] font-medium text-fg">{template.subject}</p>}
                    <textarea
                      readOnly
                      value={template.body}
                      className="min-h-[110px] w-full resize-none rounded-md border border-border bg-muted/30 p-2 text-[12.5px] text-fg"
                    />
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[17px] font-semibold text-fg">Terminees ou annulees</h2>
            </div>
            <TaskList tasks={done} />
          </section>
        </div>
      </section>
    </div>
  );
}

function TaskList({ tasks }: { tasks: RecruiterTask[] }) {
  if (tasks.length === 0) {
    return <p className="p-8 text-center text-fg-muted">Aucune tache.</p>;
  }
  return (
    <div className="divide-y divide-border">
      {tasks.map((task) => (
        <article key={task.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-fg">{task.title}</p>
              {task.details && <p className="mt-1 text-[13.5px] text-fg-muted">{task.details}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="tag">{task.task_type}</span>
                <span className={cn('tag', priorityClass(taskPriority(task)))}>
                  {priorityLabel(taskPriority(task))}
                </span>
                {task.due_at && (
                  <span className={cn('text-[12.5px]', isOverdue(task.due_at) && task.status === 'open' ? 'text-danger' : 'text-fg-subtle')}>
                    {isOverdue(task.due_at) && task.status === 'open' ? 'En retard' : 'Planifie'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[13px] text-fg-subtle">
                {task.candidate ? (
                  <Link href={`/admin/candidats/${task.candidate.id}`} className="text-accent hover:underline">
                    {task.candidate.first_name} {task.candidate.last_name}
                  </Link>
                ) : task.job ? (
                  task.job.title
                ) : (
                  'Sans dossier lie'
                )}
                {task.due_at ? ` | ${formatDateTime(task.due_at)}` : ''}
              </p>
            </div>
            <TaskStatusButton id={task.id} done={task.status === 'done'} />
          </div>
        </article>
      ))}
    </div>
  );
}

function isOverdue(dueAt: string) {
  return new Date(dueAt).getTime() < Date.now();
}

function taskPriority(task: RecruiterTask): AtsActionPriority {
  if (task.status !== 'open') return 'low';
  if (task.due_at && isOverdue(task.due_at)) return 'urgent';
  if (['call', 'missing_cv', 'present', 'client_follow_up'].includes(task.task_type)) return 'high';
  return 'normal';
}
