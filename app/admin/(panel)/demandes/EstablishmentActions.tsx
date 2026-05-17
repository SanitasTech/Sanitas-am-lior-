'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ESTABLISHMENT_REQUEST_STATUSES } from '@/lib/constants';
import type { EstablishmentRequest } from '@/types';

interface Props {
  request: EstablishmentRequest;
}

export default function EstablishmentActions({ request }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(request.status);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  async function saveStatus() {
    setMsg(null);
    try {
      const res = await fetch('/api/admin/establishment-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: request.id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erreur');
      setMsg('Statut mis à jour');
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Erreur');
    }
  }

  async function convert() {
    if (!confirm('Créer un poste prérempli depuis cette demande ?')) return;
    setMsg(null);
    try {
      const res = await fetch('/api/admin/establishment-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: request.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erreur');
      router.push(`/admin/postes/${json.job_id}`);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Erreur');
    }
  }

  async function remove() {
    if (
      !confirm(
        `Supprimer définitivement la demande de « ${request.establishment || 'cet établissement'} » ? Action irréversible.`
      )
    )
      return;
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/establishment-requests?id=${request.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erreur');
      startTransition(() => router.refresh());
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Erreur');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="label" htmlFor={`status-${request.id}`}>Statut</label>
          <select
            id={`status-${request.id}`}
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            {ESTABLISHMENT_REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button
          onClick={saveStatus}
          disabled={pending || status === request.status}
          className="btn-secondary btn-sm"
        >
          Enregistrer
        </button>
        <button onClick={convert} className="btn-primary btn-sm">
          Transformer en poste
        </button>
        <button
          onClick={remove}
          className="inline-flex items-center rounded-full border border-danger/40 bg-surface px-3.5 py-1.5 text-[13.5px] font-medium text-danger hover:bg-danger hover:text-bg transition-colors"
        >
          Supprimer
        </button>
      </div>
      {msg && <span className="text-[13px] text-fg-muted">{msg}</span>}
    </div>
  );
}
