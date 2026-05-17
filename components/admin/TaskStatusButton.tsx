'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function TaskStatusButton({ id, done }: { id: string; done?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function toggle() {
    await fetch('/api/admin/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: done ? 'open' : 'done' }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <button type="button" disabled={pending} onClick={toggle} className="btn-secondary btn-sm">
      {done ? 'Rouvrir' : 'Terminer'}
    </button>
  );
}
