'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { QUEBEC_REGIONS, PROFESSIONS, SHIFTS, MANDATE_TYPES, ALL_DEPARTMENTS } from '@/lib/constants';

const URGENCIES = [
  { value: '', label: 'Toutes' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'Prioritaire' },
  { value: 'normal', label: 'Normal' },
];

interface FilterState {
  profession: string;
  region: string;
  city: string;
  establishment: string;
  department: string;
  shift: string;
  mandate_type: string;
  urgency: string;
}

export default function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    profession: params.get('profession') || '',
    region: params.get('region') || '',
    city: params.get('city') || '',
    establishment: params.get('establishment') || '',
    department: params.get('department') || '',
    shift: params.get('shift') || '',
    mandate_type: params.get('mandate_type') || '',
    urgency: params.get('urgency') || '',
  });

  useEffect(() => {
    setFilters({
      profession: params.get('profession') || '',
      region: params.get('region') || '',
      city: params.get('city') || '',
      establishment: params.get('establishment') || '',
      department: params.get('department') || '',
      shift: params.get('shift') || '',
      mandate_type: params.get('mandate_type') || '',
      urgency: params.get('urgency') || '',
    });
  }, [params]);

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function apply() {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v) sp.set(k, v);
    }
    router.push(`/postes${sp.toString() ? `?${sp.toString()}` : ''}`);
  }

  function reset() {
    setFilters({
      profession: '',
      region: '',
      city: '',
      establishment: '',
      department: '',
      shift: '',
      mandate_type: '',
      urgency: '',
    });
    router.push('/postes');
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="card p-5 sm:p-6 space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label" htmlFor="f-profession">Profession</label>
          <select
            id="f-profession"
            className="input"
            value={filters.profession}
            onChange={(e) => update('profession', e.target.value)}
          >
            <option value="">Toutes</option>
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-region">Région</label>
          <select
            id="f-region"
            className="input"
            value={filters.region}
            onChange={(e) => update('region', e.target.value)}
          >
            <option value="">Toutes</option>
            {QUEBEC_REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-city">Ville</label>
          <input
            id="f-city"
            className="input"
            type="text"
            placeholder="Ex. Laval"
            value={filters.city}
            onChange={(e) => update('city', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-establishment">Établissement</label>
          <input
            id="f-establishment"
            className="input"
            type="text"
            placeholder="Nom de l'établissement"
            value={filters.establishment}
            onChange={(e) => update('establishment', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-department">Département</label>
          <select
            id="f-department"
            className="input"
            value={filters.department}
            onChange={(e) => update('department', e.target.value)}
          >
            <option value="">Tous</option>
            {ALL_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-shift">Quart</label>
          <select
            id="f-shift"
            className="input"
            value={filters.shift}
            onChange={(e) => update('shift', e.target.value)}
          >
            <option value="">Tous</option>
            {SHIFTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-mandate">Type de mandat</label>
          <select
            id="f-mandate"
            className="input"
            value={filters.mandate_type}
            onChange={(e) => update('mandate_type', e.target.value)}
          >
            <option value="">Tous</option>
            {MANDATE_TYPES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-urgency">Urgence</label>
          <select
            id="f-urgency"
            className="input"
            value={filters.urgency}
            onChange={(e) => update('urgency', e.target.value)}
          >
            {URGENCIES.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn-primary">Filtrer</button>
        <button type="button" onClick={reset} className="btn-secondary">Réinitialiser</button>
      </div>
    </form>
  );
}
