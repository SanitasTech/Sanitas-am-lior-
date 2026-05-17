'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  candidateId?: string | null;
  applicationId?: string | null;
  jobId?: string | null;
  compact?: boolean;
}

const QUICK_TASKS = [
  { type: 'call', title: 'Appeler le candidat' },
  { type: 'document', title: 'Relancer document manquant' },
  { type: 'availability', title: 'Valider la disponibilité' },
  { type: 'present', title: 'Préparer la présentation' },
];

export default function TaskQuickCreate({ candidateId, applicationId, jobId, compact }: Props) {
  const router = useRouter();
  const [customTitle, setCustomTitle] = useState('');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function createTask(title: string, type = 'follow_up') {
    if (!title.trim()) return;
    setMessage(null);
    const res = await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId || null,
        application_id: applicationId || null,
        job_id: jobId || null,
        task_type: type,
        title: title.trim(),
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setMessage(json.error || 'Impossible de créer la tâche.');
      return;
    }
    setCustomTitle('');
    setMessage('Tâche ajoutée.');
    startTransition(() => router.refresh());
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex flex-wrap gap-2">
        {QUICK_TASKS.map((task) => (
          <button
            key={task.type}
            type="button"
            disabled={pending}
            onClick={() => createTask(task.title, task.type)}
            className="btn-secondary btn-sm"
          >
            {task.title}
          </button>
        ))}
      </div>
      {!compact && (
        <div className="flex gap-2">
          <input
            className="input"
            value={customTitle}
            onChange={(event) => setCustomTitle(event.target.value)}
            placeholder="Autre tâche..."
          />
          <button
            type="button"
            disabled={pending || !customTitle.trim()}
            className="btn-primary"
            onClick={() => createTask(customTitle)}
          >
            Ajouter
          </button>
        </div>
      )}
      {message && <p className="text-[13px] text-fg-muted">{message}</p>}
    </div>
  );
}
