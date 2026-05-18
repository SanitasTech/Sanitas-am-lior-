'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { QUEBEC_REGIONS, PROFESSIONS, SHIFTS, MANDATE_TYPES, ALL_DEPARTMENTS } from '@/lib/constants';
import { PUBLIC_COPY, displayValue, localizedPath, optionLabel, type Locale } from '@/lib/i18n';
import { useLocale } from './I18nProvider';

const URGENCIES = [
  { value: '', label: { fr: 'Toutes', en: 'All' } },
  { value: 'urgent', label: { fr: 'Urgent', en: 'Urgent' } },
  { value: 'high', label: { fr: 'Prioritaire', en: 'Priority' } },
  { value: 'normal', label: { fr: 'Normal', en: 'Regular' } },
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

export default function JobFilters({ locale: localeProp }: { locale?: Locale }) {
  const contextLocale = useLocale();
  const locale = localeProp || contextLocale;
  const router = useRouter();
  const params = useSearchParams();
  const copy = PUBLIC_COPY[locale];

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
    router.push(`${localizedPath(locale, 'jobs')}${sp.toString() ? `?${sp.toString()}` : ''}`);
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
    router.push(localizedPath(locale, 'jobs'));
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
          <label className="label" htmlFor="f-profession">
            {locale === 'en' ? 'Profession' : 'Profession'}
          </label>
          <select
            id="f-profession"
            className="input"
            value={filters.profession}
            onChange={(e) => update('profession', e.target.value)}
          >
            <option value="">{copy.common.allFem}</option>
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {optionLabel(locale, p)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-region">
            {copy.jobs.region}
          </label>
          <select
            id="f-region"
            className="input"
            value={filters.region}
            onChange={(e) => update('region', e.target.value)}
          >
            <option value="">{copy.common.allFem}</option>
            {QUEBEC_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-city">
            {copy.jobs.city}
          </label>
          <input
            id="f-city"
            className="input"
            type="text"
            placeholder="Laval"
            value={filters.city}
            onChange={(e) => update('city', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-establishment">
            {copy.jobs.establishment}
          </label>
          <input
            id="f-establishment"
            className="input"
            type="text"
            placeholder={locale === 'en' ? 'Facility name' : "Nom de l'etablissement"}
            value={filters.establishment}
            onChange={(e) => update('establishment', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="f-department">
            {copy.jobs.department}
          </label>
          <select
            id="f-department"
            className="input"
            value={filters.department}
            onChange={(e) => update('department', e.target.value)}
          >
            <option value="">{copy.common.all}</option>
            {ALL_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {displayValue(locale, d)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-shift">
            {copy.jobs.shift}
          </label>
          <select
            id="f-shift"
            className="input"
            value={filters.shift}
            onChange={(e) => update('shift', e.target.value)}
          >
            <option value="">{copy.common.all}</option>
            {SHIFTS.map((s) => (
              <option key={s} value={s}>
                {displayValue(locale, s)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-mandate">
            {copy.jobs.mandateType}
          </label>
          <select
            id="f-mandate"
            className="input"
            value={filters.mandate_type}
            onChange={(e) => update('mandate_type', e.target.value)}
          >
            <option value="">{copy.common.all}</option>
            {MANDATE_TYPES.map((m) => (
              <option key={m} value={m}>
                {displayValue(locale, m)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="f-urgency">
            {locale === 'en' ? 'Urgency' : 'Urgence'}
          </label>
          <select
            id="f-urgency"
            className="input"
            value={filters.urgency}
            onChange={(e) => update('urgency', e.target.value)}
          >
            {URGENCIES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label[locale]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn-primary">
          {locale === 'en' ? 'Filter' : 'Filtrer'}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          {locale === 'en' ? 'Reset' : 'Reinitialiser'}
        </button>
      </div>
    </form>
  );
}
