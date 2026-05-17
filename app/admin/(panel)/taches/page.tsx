import Link from 'next/link';
import type { Metadata } from 'next';
import TaskStatusButton from '@/components/admin/TaskStatusButton';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';
import type { RecruiterTask } from '@/types';

export const metadata: Metadata = { title: 'Tâches', robots: { index: false, follow: false } };
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
        <h1 className="mt-1 text-display-md text-fg">Tâches</h1>
        <p className="mt-2 text-fg-muted">Relances, validations et présentations à ne pas oublier.</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[17px] font-semibold text-fg">Ouvertes</h2>
          </div>
          <TaskList tasks={open} />
        </div>
        <div className="card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[17px] font-semibold text-fg">Terminées ou annulées</h2>
          </div>
          <TaskList tasks={done} />
        </div>
      </section>
    </div>
  );
}

function TaskList({ tasks }: { tasks: RecruiterTask[] }) {
  if (tasks.length === 0) {
    return <p className="p-8 text-center text-fg-muted">Aucune tâche.</p>;
  }
  return (
    <div className="divide-y divide-border">
      {tasks.map((task) => (
        <article key={task.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-fg">{task.title}</p>
              {task.details && <p className="mt-1 text-[13.5px] text-fg-muted">{task.details}</p>}
              <p className="mt-2 text-[13px] text-fg-subtle">
                {task.candidate ? (
                  <Link href={`/admin/candidats/${task.candidate.id}`} className="text-accent hover:underline">
                    {task.candidate.first_name} {task.candidate.last_name}
                  </Link>
                ) : task.job ? (
                  task.job.title
                ) : (
                  'Sans dossier lié'
                )}
                {task.due_at ? ` · ${formatDateTime(task.due_at)}` : ''}
              </p>
            </div>
            <TaskStatusButton id={task.id} done={task.status === 'done'} />
          </div>
        </article>
      ))}
    </div>
  );
}
