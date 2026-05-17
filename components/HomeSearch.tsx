'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PROFESSIONS, QUEBEC_REGIONS, ALL_DEPARTMENTS } from '@/lib/constants';

export default function HomeSearch() {
  const router = useRouter();
  const [profession, setProfession] = useState('');
  const [region, setRegion] = useState('');
  const [department, setDepartment] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (profession) sp.set('profession', profession);
    if (region) sp.set('region', region);
    if (department) sp.set('department', department);
    router.push(`/postes${sp.toString() ? `?${sp.toString()}` : ''}`);
  }

  return (
    <form
      onSubmit={submit}
      className="card p-3 sm:p-4 shadow-card grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <select
        className="input border-0 bg-transparent sm:rounded-r-none"
        aria-label="Profession"
        value={profession}
        onChange={(e) => setProfession(e.target.value)}
      >
        <option value="">Toutes professions</option>
        {PROFESSIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select
        className="input border-0 bg-transparent sm:rounded-none"
        aria-label="Région"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      >
        <option value="">Toutes régions</option>
        {QUEBEC_REGIONS.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <select
        className="input border-0 bg-transparent sm:rounded-none"
        aria-label="Département"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">Tous départements</option>
        {ALL_DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <button type="submit" className="btn-primary">
        Rechercher
      </button>
    </form>
  );
}
