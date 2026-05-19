'use client';

import SegmentedChoices from '@/components/SegmentedChoices';
import DepartmentGroups from '@/components/DepartmentGroups';
import {
  MANDATE_TYPES,
  MOBILITY,
  PROFESSIONS,
  QUEBEC_REGIONS,
  SHIFTS,
  START_AVAILABILITY,
} from '@/lib/constants';
import { displayValue, type Locale } from '@/lib/i18n';
import type { CandidatePreferenceSet, RegionChoice } from '@/types';

interface PreferenceSetEditorProps {
  value: CandidatePreferenceSet[];
  onChange: (value: CandidatePreferenceSet[]) => void;
  locale?: Locale;
  compact?: boolean;
}

function tr(locale: Locale, fr: string, en: string) {
  return locale === 'en' ? en : fr;
}

function emptyRegionChoice(region = ''): RegionChoice {
  return { region, all_region: true, cities: [] };
}

function emptySet(index: number): CandidatePreferenceSet {
  return {
    label: index === 0 ? 'Choix principal' : `Choix ${index + 1}`,
    priority: index + 1,
    professions: [],
    regions: [emptyRegionChoice()],
    departments: [],
    shifts: [],
    mandate_types: [],
    start_date: null,
    mobility: null,
    salary_floor: null,
    constraints: null,
    active: true,
  };
}

export function ensurePreferenceSets(value: CandidatePreferenceSet[]): CandidatePreferenceSet[] {
  return value.length > 0 ? value : [emptySet(0)];
}

export default function PreferenceSetEditor({
  value,
  onChange,
  locale = 'fr',
  compact,
}: PreferenceSetEditorProps) {
  const sets = ensurePreferenceSets(value);

  function patchSet(index: number, patch: Partial<CandidatePreferenceSet>) {
    onChange(
      sets.map((set, i) =>
        i === index
          ? {
              ...set,
              ...patch,
              priority: index + 1,
            }
          : set
      )
    );
  }

  function addSet() {
    onChange([...sets, emptySet(sets.length)]);
  }

  function removeSet(index: number) {
    const next = sets
      .filter((_, i) => i !== index)
      .map((set, i) => ({ ...set, priority: i + 1, label: set.label || `Choix ${i + 1}` }));
    onChange(ensurePreferenceSets(next));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-accent/30 bg-accent-soft/30 p-4">
        <p className="text-[15px] font-semibold text-fg">
          {tr(locale, 'Mes choix de mandats', 'My assignment preferences')}
        </p>
        <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">
          {tr(
            locale,
            'Chaque groupe est evalue separement. Si une region va seulement avec certains departements ou quarts, ajoute un autre groupe.',
            'Each group is evaluated separately. If a region only works with certain departments or shifts, add another group.'
          )}
        </p>
      </div>

      {sets.map((set, index) => (
        <div key={set.id || index} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <label className="label">
                {tr(locale, 'Nom du groupe', 'Group name')}
              </label>
              <input
                className="input mt-1 max-w-sm"
                value={set.label}
                onChange={(event) => patchSet(index, { label: event.target.value })}
                placeholder={tr(locale, 'Ex. Nord, urgence, soir', 'Ex. North, emergency, evening')}
              />
            </div>
            {sets.length > 1 && (
              <button type="button" className="btn-ghost btn-sm" onClick={() => removeSet(index)}>
                {tr(locale, 'Retirer', 'Remove')}
              </button>
            )}
          </div>

          <div className={compact ? 'mt-4 space-y-4' : 'mt-4 grid gap-4 lg:grid-cols-2'}>
            <Field label={tr(locale, 'Titres admissibles dans ce groupe', 'Eligible titles in this group')}>
              <SegmentedChoices
                options={PROFESSIONS}
                value={set.professions}
                onChange={(next) => patchSet(index, { professions: next as string[] })}
                multi
              />
            </Field>

            <Field label={tr(locale, 'Quarts acceptes dans ce groupe', 'Accepted shifts in this group')}>
              <SegmentedChoices
                options={SHIFTS}
                value={set.shifts}
                onChange={(next) => patchSet(index, { shifts: next as string[] })}
                multi
              />
            </Field>

            <RegionSetField
              value={set.regions}
              onChange={(regions) => patchSet(index, { regions })}
              locale={locale}
            />

            <DepartmentGroups
              value={set.departments}
              onChange={(departments) => patchSet(index, { departments })}
              label={tr(locale, 'Departements pour ce groupe', 'Departments for this group')}
              locale={locale}
            />

            <Field label={tr(locale, 'Types de mandat', 'Assignment types')}>
              <SegmentedChoices
                options={MANDATE_TYPES}
                value={set.mandate_types}
                onChange={(next) => patchSet(index, { mandate_types: next as string[] })}
                multi
              />
            </Field>

            <Field label={tr(locale, 'Debut pour ce groupe', 'Start for this group')}>
              <SegmentedChoices
                options={START_AVAILABILITY}
                value={set.start_date || ''}
                onChange={(next) => patchSet(index, { start_date: next as string })}
              />
            </Field>

            <Field label={tr(locale, 'Mobilite', 'Mobility')}>
              <SegmentedChoices
                options={MOBILITY}
                value={set.mobility || ''}
                onChange={(next) => patchSet(index, { mobility: next as string })}
              />
            </Field>

            <Field label={tr(locale, 'Contraintes propres a ce groupe', 'Constraints for this group')}>
              <textarea
                className="textarea"
                value={set.constraints || ''}
                onChange={(event) => patchSet(index, { constraints: event.target.value })}
                placeholder={tr(
                  locale,
                  'Ex. pas de nuit en region eloignee, hebergement requis',
                  'Ex. no night shifts in remote regions, housing required'
                )}
              />
            </Field>
          </div>

          <p className="mt-3 text-[12.5px] text-fg-subtle">
            {set.professions.length > 0 || set.regions.some((region) => region.region)
              ? [
                  set.professions.map((p) => displayValue(locale, p)).join(', '),
                  set.regions.map((r) => r.region).filter(Boolean).join(', '),
                  set.departments.join(', '),
                  set.shifts.map((s) => displayValue(locale, s)).join(', '),
                ]
                  .filter(Boolean)
                  .join(' | ')
              : tr(locale, 'Complete ce groupe pour le rendre utilisable.', 'Complete this group to make it usable.')}
          </p>
        </div>
      ))}

      <button type="button" className="btn-secondary btn-sm" onClick={addSet}>
        {tr(locale, 'Ajouter une preference differente', 'Add another preference')}
      </button>
    </div>
  );
}

function RegionSetField({
  value,
  onChange,
  locale,
}: {
  value: RegionChoice[];
  onChange: (value: RegionChoice[]) => void;
  locale: Locale;
}) {
  const regions = value.length > 0 ? value : [emptyRegionChoice()];

  function patchRegion(index: number, patch: Partial<RegionChoice>) {
    onChange(regions.map((region, i) => (i === index ? { ...region, ...patch } : region)));
  }

  function addRegion() {
    onChange([...regions, emptyRegionChoice()]);
  }

  function removeRegion(index: number) {
    const next = regions.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [emptyRegionChoice()]);
  }

  return (
    <div>
      <p className="label">{tr(locale, 'Regions pour ce groupe', 'Regions for this group')}</p>
      <div className="mt-2 space-y-3">
        {regions.map((region, index) => (
          <div key={index} className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <select
                className="input"
                value={region.region}
                onChange={(event) => patchRegion(index, { region: event.target.value })}
              >
                <option value="">{tr(locale, 'Choisir', 'Select')}</option>
                {QUEBEC_REGIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {regions.length > 1 && (
                <button type="button" className="btn-ghost btn-sm" onClick={() => removeRegion(index)}>
                  {tr(locale, 'Retirer', 'Remove')}
                </button>
              )}
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-fg"
                checked={region.all_region}
                onChange={(event) =>
                  patchRegion(index, {
                    all_region: event.target.checked,
                    cities: event.target.checked ? [] : region.cities,
                  })
                }
              />
              <span className="text-[13.5px] text-fg">
                {tr(locale, 'Toute la region', 'Entire region')}
              </span>
            </label>
            {!region.all_region && (
              <input
                className="input mt-3"
                value={region.cities.join(', ')}
                onChange={(event) =>
                  patchRegion(index, {
                    cities: event.target.value.split(',').map((city) => city.trim()).filter(Boolean),
                  })
                }
                placeholder={tr(locale, 'Villes separees par virgules', 'Cities separated by commas')}
              />
            )}
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost btn-sm mt-2" onClick={addRegion}>
        {tr(locale, '+ Ajouter une region a ce groupe', '+ Add a region to this group')}
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
