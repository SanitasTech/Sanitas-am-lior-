'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Action {
  label: string;
  confirmText: string;
  buttonLabel: string;
  endpoint: string;
  onAfter?: () => void;
  variant?: 'soft' | 'hard';
}

interface DangerZoneProps {
  title?: string;
  description?: string;
  actions: Action[];
  /** Route où rediriger après suppression complète (ex. /admin/candidats) */
  redirectAfterHardDelete?: string;
}

/**
 * Zone d'actions destructives clairement délimitée. Chaque bouton ouvre une
 * boîte de confirmation et fait un appel DELETE à l'endpoint correspondant.
 */
export default function DangerZone({
  title = 'Zone de danger',
  description = 'Actions irréversibles. Procédez avec attention.',
  actions,
  redirectAfterHardDelete,
}: DangerZoneProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: Action) {
    if (!window.confirm(action.confirmText)) return;
    setPending(action.endpoint);
    setError(null);
    try {
      const res = await fetch(action.endpoint, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Échec.');
      }
      if (action.onAfter) action.onAfter();
      if (action.variant === 'hard' && redirectAfterHardDelete) {
        router.push(redirectAfterHardDelete);
      } else {
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-5 sm:p-6">
      <h3 className="text-[15px] font-semibold text-danger">{title}</h3>
      {description && <p className="mt-1 text-[13.5px] text-fg-muted">{description}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((a) => (
          <button
            key={a.endpoint + a.buttonLabel}
            type="button"
            onClick={() => run(a)}
            disabled={pending === a.endpoint}
            className="inline-flex items-center gap-2 rounded-full border border-danger/40 bg-surface px-4 py-2 text-[13.5px] font-medium text-danger transition-colors hover:bg-danger hover:text-bg disabled:opacity-50"
          >
            {pending === a.endpoint ? '…' : a.buttonLabel}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 text-[13.5px] text-danger">
          <strong>Erreur :</strong> {error}
        </p>
      )}
    </section>
  );
}
