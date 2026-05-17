'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  candidateId?: string;
  applicationId?: string;
  submissionId?: string;
}

export default function NoteForm({ candidateId, applicationId, submissionId }: Props) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!note.trim()) {
      setError('La note ne peut pas être vide.');
      return;
    }
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId || null,
          application_id: applicationId || submissionId || null,
          note: note.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Échec.');
      setNote('');
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        className="textarea"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ajouter une note interne…"
      />
      {error && <p className="error-text">{error}</p>}
      <button type="submit" disabled={pending} className="btn-secondary btn-sm">
        {pending ? 'Ajout…' : 'Ajouter la note'}
      </button>
    </form>
  );
}
