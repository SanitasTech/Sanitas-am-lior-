'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PROFESSIONS, QUEBEC_REGIONS, ALL_DEPARTMENTS } from '@/lib/constants';
import { displayValue, localizedPath, optionLabel, type Locale } from '@/lib/i18n';
import { useLocale } from './I18nProvider';

export default function HomeSearch({ locale: localeProp }: { locale?: Locale }) {
  const contextLocale = useLocale();
  const locale = localeProp || contextLocale;
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
    router.push(`${localizedPath(locale, 'jobs')}${sp.toString() ? `?${sp.toString()}` : ''}`);
  }

  return (
    <form
      onSubmit={submit}
      className="card grid min-w-0 max-w-full gap-2 overflow-hidden p-3 shadow-card sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:p-4"
    >
      <select
        className="input min-w-0 border-0 bg-transparent sm:rounded-r-none"
        aria-label={locale === 'en' ? 'Profession' : 'Profession'}
        value={profession}
        onChange={(e) => setProfession(e.target.value)}
      >
        <option value="">{locale === 'en' ? 'All professions' : 'Toutes professions'}</option>
        {PROFESSIONS.map((p) => (
          <option key={p} value={p}>
            {optionLabel(locale, p)}
          </option>
        ))}
      </select>
      <select
        className="input min-w-0 border-0 bg-transparent sm:rounded-none"
        aria-label={locale === 'en' ? 'Region' : 'Region'}
        value={region}
        onChange={(e) => setRegion(e.target.value)}
      >
        <option value="">{locale === 'en' ? 'All regions' : 'Toutes regions'}</option>
        {QUEBEC_REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        className="input min-w-0 border-0 bg-transparent sm:rounded-none"
        aria-label={locale === 'en' ? 'Department' : 'Departement'}
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">{locale === 'en' ? 'All departments' : 'Tous departements'}</option>
        {ALL_DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {displayValue(locale, d)}
          </option>
        ))}
      </select>
      <button type="submit" className="btn-primary">
        {locale === 'en' ? 'Search' : 'Rechercher'}
      </button>
    </form>
  );
}
