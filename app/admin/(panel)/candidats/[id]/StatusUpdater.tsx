'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SUBMISSION_STATUSES } from '@/lib/constants';

interface Props {
  applicationId?: string;
  submissionId?: string;
  currentStatus: string;
}

export default function StatusUpdater({ applicationId, submissionId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  // Auto-dismiss du message après 3 secondes
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(t);
  }, [feedback]);

  async function save() {
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId || submissionId, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Échec de la mise à jour.');
      setFeedback({ kind: 'success', text: 'Statut mis à jour' });
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setFeedback({ kind: 'error', text: e instanceof Error ? e.message : 'Erreur inconnue' });
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[180px]">
        <label className="label" htmlFor="status-select">Changer le statut</label>
        <select
          id="status-select"
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {SUBMISSION_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <button onClick={save} disabled={pending || status === currentStatus} className="btn-primary">
        Enregistrer
      </button>
      {feedback && (
        <span
          className={
            feedback.kind === 'success'
              ? 'inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-[13px] font-medium text-success'
              : 'inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-[13px] font-medium text-danger'
          }
          role="status"
        >
          {feedback.kind === 'success' ? '✓' : '⚠'} {feedback.text}
        </span>
      )}
    </div>
  );
}
