'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import {
  ALL_DEPARTMENTS,
  DOCUMENT_TYPES,
  HOUSING_CHOICES,
  LANGUAGES,
  MANDATE_TYPES,
  MOBILITY,
  PROFESSIONS,
  QUEBEC_REGIONS,
  SHIFTS,
  TRANSPORT_CHOICES,
  URGENCY_LABELS,
  URGENCY_LEVELS,
  WORK_AUTH,
  YEARS_EXPERIENCE,
} from '@/lib/constants';
import { cn } from '@/lib/utils';
import type {
  Job,
  JobTitle,
  MandateSearchBucket,
  MandateSearchInput,
  MandateSearchResponse,
  MandateSearchResult,
} from '@/types';

interface Props {
  initial?: Partial<Job> | null;
  jobTitles: JobTitle[];
}

type View =
  | 'all'
  | MandateSearchBucket
  | 'already_applied'
  | 'never_contacted'
  | 'available_soon';

const VIEW_LABELS: Record<View, string> = {
  all: 'Tous',
  presentable: 'Presentables',
  to_validate: 'A valider',
  document_blocked: 'Docs manquants',
  incompatible: 'Non compatibles',
  already_applied: 'A deja postule',
  never_contacted: 'Jamais contacte',
  available_soon: 'Disponible bientot',
};

const BUCKET_LABELS: Record<MandateSearchBucket, string> = {
  presentable: 'Presentable',
  to_validate: 'A valider',
  document_blocked: 'Bloque document',
  incompatible: 'Non compatible',
};

const BUCKET_CLASS: Record<MandateSearchBucket, string> = {
  presentable: 'bg-success-soft text-success',
  to_validate: 'bg-accent-soft text-accent',
  document_blocked: 'bg-warning-soft text-warning',
  incompatible: 'bg-muted text-fg-muted',
};

function initialForm(initial?: Partial<Job> | null): MandateSearchInput {
  return {
    job_id: initial?.id || null,
    title: initial?.title || '',
    profession: initial?.profession || '',
    job_title_id: initial?.job_title_id || null,
    region: initial?.region || '',
    city: initial?.city || '',
    establishment: initial?.establishment || '',
    department: initial?.department || '',
    shift: initial?.shift || '',
    schedule: initial?.schedule || '',
    mandate_type: initial?.mandate_type || '',
    start_date: initial?.start_date || '',
    duration: initial?.duration || '',
    salary: initial?.salary || '',
    urgency: initial?.urgency || 'normal',
    required_documents: initial?.required_documents && initial.required_documents.length > 0
      ? initial.required_documents
      : ['CV'],
    min_experience: '',
    languages: [],
    work_authorization: '',
    mobility: '',
    housing_required: '',
    transport_available: '',
    candidate_status: 'active',
    last_active_days: null,
    only_with_phone: false,
    only_without_open_tasks: false,
  };
}

export default function MandateSearchConsole({ initial, jobTitles }: Props) {
  const [form, setForm] = useState<MandateSearchInput>(() => initialForm(initial));
  const [result, setResult] = useState<MandateSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('all');
  const [pending, startTransition] = useTransition();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  function set<K extends keyof MandateSearchInput>(key: K, value: MandateSearchInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key: 'required_documents' | 'languages', value: string) {
    setForm((current) => {
      const values = current[key] || [];
      return {
        ...current,
        [key]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  }

  async function search(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    setActionMessage(null);
    if (!form.profession || !form.region) {
      setError('Profession et region sont requises.');
      return;
    }
    const res = await fetch('/api/admin/mandate-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setResult(null);
      setError(json.error || 'Recherche impossible.');
      return;
    }
    setResult(json as MandateSearchResponse);
    setView('all');
  }

  async function runAction(action: 'create_task' | 'associate' | 'present', row: MandateSearchResult) {
    setActionMessage(null);
    const details = [
      result?.job.title,
      row.preference_set_label ? `Choix: ${row.preference_set_label}` : null,
      row.validation_questions[0] || null,
    ].filter(Boolean).join(' | ');
    const res = await fetch('/api/admin/mandate-search/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        candidate_id: row.candidate.id,
        job_id: form.job_id || null,
        preference_set_id: row.preference_set_id || null,
        title: action === 'create_task' ? 'Appeler le candidat pour ce mandat' : null,
        details,
      }),
    });
    const json = await res.json();
    setActionMessage(json.ok ? 'Action enregistree.' : json.error || 'Action impossible.');
  }

  const rows = useMemo(() => {
    if (!result) return [];
    const all = [
      ...result.presentable,
      ...result.to_validate,
      ...result.document_blocked,
      ...result.incompatible,
    ];
    if (view === 'all') return all;
    if (view === 'already_applied') return all.filter((row) => row.flags.already_applied);
    if (view === 'never_contacted') return all.filter((row) => row.flags.never_contacted);
    if (view === 'available_soon') return all.filter((row) => row.flags.available_soon);
    return all.filter((row) => row.bucket === view);
  }, [result, view]);

  const viewCounts = useMemo(() => {
    if (!result) return null;
    const all = [
      ...result.presentable,
      ...result.to_validate,
      ...result.document_blocked,
      ...result.incompatible,
    ];
    return {
      all: all.length,
      presentable: result.counts.presentable,
      to_validate: result.counts.to_validate,
      document_blocked: result.counts.document_blocked,
      incompatible: result.counts.incompatible,
      already_applied: all.filter((row) => row.flags.already_applied).length,
      never_contacted: all.filter((row) => row.flags.never_contacted).length,
      available_soon: all.filter((row) => row.flags.available_soon).length,
    } as Record<View, number>;
  }, [result]);

  const createJobHref = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of [
      'title',
      'profession',
      'job_title_id',
      'region',
      'city',
      'establishment',
      'department',
      'shift',
      'schedule',
      'mandate_type',
      'start_date',
      'duration',
      'salary',
      'urgency',
    ] as Array<keyof MandateSearchInput>) {
      const value = form[key];
      if (typeof value === 'string' && value) params.set(key, value);
    }
    for (const doc of form.required_documents || []) params.append('required_documents', doc);
    return `/admin/postes/nouveau?${params.toString()}`;
  }, [form]);

  const professionOptions = useMemo(
    () => Array.from(new Set([...PROFESSIONS, ...jobTitles.map((title) => title.title)])).sort(),
    [jobTitles]
  );

  return (
    <div className="space-y-6">
      <form onSubmit={(event) => startTransition(() => search(event))} className="space-y-5">
        <section className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold text-fg">Criteres du mandat</h2>
              <p className="mt-1 text-[13.5px] text-fg-muted">
                Les criteres metier doivent etre couverts par un meme choix candidat pour devenir presentables.
              </p>
            </div>
            {form.job_id ? (
              <Link href={`/admin/postes/${form.job_id}`} className="btn-secondary btn-sm">Voir le poste</Link>
            ) : (
              <Link href={createJobHref} className="btn-secondary btn-sm">Creer un poste avec ces criteres</Link>
            )}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Titre">
              <input className="input" value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <Field label="Titre d'emploi">
              <select className="input" value={form.job_title_id || ''} onChange={(e) => set('job_title_id', e.target.value || null)}>
                <option value="">Non precise</option>
                {jobTitles.map((title) => (
                  <option key={title.id} value={title.id}>{title.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Profession" required>
              <select className="input" value={form.profession} onChange={(e) => set('profession', e.target.value)}>
                <option value="">Choisir</option>
                {professionOptions.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </Field>
            <Field label="Region" required>
              <select className="input" value={form.region} onChange={(e) => set('region', e.target.value)}>
                <option value="">Choisir</option>
                {QUEBEC_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </Field>
            <Field label="Ville">
              <input className="input" value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="Etablissement">
              <input className="input" value={form.establishment || ''} onChange={(e) => set('establishment', e.target.value)} />
            </Field>
            <Field label="Departement">
              <select className="input" value={form.department || ''} onChange={(e) => set('department', e.target.value || null)}>
                <option value="">Non precise</option>
                {ALL_DEPARTMENTS.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </Field>
            <Field label="Quart">
              <select className="input" value={form.shift || ''} onChange={(e) => set('shift', e.target.value || null)}>
                <option value="">Non precise</option>
                {SHIFTS.map((shift) => <option key={shift} value={shift}>{shift}</option>)}
              </select>
            </Field>
            <Field label="Horaire">
              <input className="input" value={form.schedule || ''} onChange={(e) => set('schedule', e.target.value)} />
            </Field>
            <Field label="Type">
              <select className="input" value={form.mandate_type || ''} onChange={(e) => set('mandate_type', e.target.value || null)}>
                <option value="">Non precise</option>
                {MANDATE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="Date de debut">
              <input className="input" type="date" value={form.start_date || ''} onChange={(e) => set('start_date', e.target.value)} />
            </Field>
            <Field label="Duree">
              <input className="input" value={form.duration || ''} onChange={(e) => set('duration', e.target.value)} />
            </Field>
            <Field label="Salaire">
              <input className="input" value={form.salary || ''} onChange={(e) => set('salary', e.target.value)} />
            </Field>
            <Field label="Urgence">
              <select className="input" value={form.urgency || 'normal'} onChange={(e) => set('urgency', e.target.value as MandateSearchInput['urgency'])}>
                {URGENCY_LEVELS.map((urgency) => <option key={urgency} value={urgency}>{URGENCY_LABELS[urgency]}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="card p-5">
            <h2 className="text-[16px] font-semibold text-fg">Documents requis</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DOCUMENT_TYPES.map((doc) => (
                <label key={doc} className={cn('tag cursor-pointer', (form.required_documents || []).includes(doc) ? 'bg-fg text-bg' : 'bg-muted text-fg-muted')}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={(form.required_documents || []).includes(doc)}
                    onChange={() => toggleArray('required_documents', doc)}
                  />
                  {doc}
                </label>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-[16px] font-semibold text-fg">Priorisation candidat</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Experience minimale">
                <select className="input" value={form.min_experience || ''} onChange={(e) => set('min_experience', e.target.value || null)}>
                  <option value="">Non precise</option>
                  {YEARS_EXPERIENCE.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Autorisation">
                <select className="input" value={form.work_authorization || ''} onChange={(e) => set('work_authorization', e.target.value || null)}>
                  <option value="">Non precise</option>
                  {WORK_AUTH.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Mobilite">
                <select className="input" value={form.mobility || ''} onChange={(e) => set('mobility', e.target.value || null)}>
                  <option value="">Non precise</option>
                  {MOBILITY.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Hebergement">
                <select className="input" value={form.housing_required || ''} onChange={(e) => set('housing_required', e.target.value || null)}>
                  <option value="">Non precise</option>
                  {HOUSING_CHOICES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Transport">
                <select className="input" value={form.transport_available || ''} onChange={(e) => set('transport_available', e.target.value || null)}>
                  <option value="">Non precise</option>
                  {TRANSPORT_CHOICES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Activite recente">
                <select
                  className="input"
                  value={form.last_active_days ? String(form.last_active_days) : ''}
                  onChange={(e) => set('last_active_days', e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Non precise</option>
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">90 derniers jours</option>
                </select>
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <label key={language} className={cn('tag cursor-pointer', (form.languages || []).includes(language) ? 'bg-fg text-bg' : 'bg-muted text-fg-muted')}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={(form.languages || []).includes(language)}
                    onChange={() => toggleArray('languages', language)}
                  />
                  {language}
                </label>
              ))}
              <label className="tag cursor-pointer bg-muted text-fg-muted">
                <input
                  type="checkbox"
                  checked={!!form.only_with_phone}
                  onChange={(e) => set('only_with_phone', e.target.checked)}
                  className="mr-1"
                />
                Telephone requis
              </label>
              <label className="tag cursor-pointer bg-muted text-fg-muted">
                <input
                  type="checkbox"
                  checked={!!form.only_without_open_tasks}
                  onChange={(e) => set('only_without_open_tasks', e.target.checked)}
                  className="mr-1"
                />
                Sans tache ouverte
              </label>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? 'Recherche...' : 'Chercher les candidats'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setForm(initialForm(null))}>
            Reinitialiser
          </button>
          {error && <p className="text-[13.5px] text-danger">{error}</p>}
          {actionMessage && <p className="text-[13.5px] text-fg-muted">{actionMessage}</p>}
        </div>
      </form>

      {result && (
        <section className="card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold text-fg">Resultats</h2>
                <p className="mt-1 text-[13.5px] text-fg-muted">
                  {result.job.title} | {result.job.region} | {result.job.department || 'departement a valider'} | {result.job.shift || 'quart a valider'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(VIEW_LABELS) as View[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={cn('tag', view === item ? 'bg-fg text-bg' : 'bg-muted text-fg-muted')}
                    onClick={() => setView(item)}
                  >
                    {VIEW_LABELS[item]} {viewCounts ? viewCounts[item] : 0}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-muted text-fg-subtle">
                <tr>
                  <Th>Candidat</Th>
                  <Th>Decision</Th>
                  <Th>Choix utilise</Th>
                  <Th>Documents</Th>
                  <Th>Validation</Th>
                  <Th>Production</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-fg-muted">
                      Aucun resultat dans ce filtre.
                    </td>
                  </tr>
                ) : (
                  rows.slice(0, 160).map((row) => (
                    <ResultRow
                      key={`${row.bucket}-${row.candidate.id}-${row.preference_set_id || 'none'}`}
                      row={row}
                      hasJob={!!form.job_id}
                      onAction={(action) => runAction(action, row)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function ResultRow({
  row,
  hasJob,
  onAction,
}: {
  row: MandateSearchResult;
  hasJob: boolean;
  onAction: (action: 'create_task' | 'associate' | 'present') => void;
}) {
  const contact = row.candidate.phone || row.candidate.email || 'Contact a completer';
  const validation = row.validation_questions.slice(0, 2);
  const reasons = [...row.blockers, ...row.reasons.filter((reason) => reason.state !== 'ok')].slice(0, 2);

  return (
    <tr className="hover:bg-muted/40">
      <Td>
        <p className="font-medium text-fg">{row.candidate.first_name} {row.candidate.last_name}</p>
        <p className="text-fg-muted">{contact}</p>
        <p className="text-fg-subtle">{[row.candidate.city_residence, row.candidate.region_residence].filter(Boolean).join(', ') || 'Residence a completer'}</p>
      </Td>
      <Td>
        <span className={cn('tag', BUCKET_CLASS[row.bucket])}>{BUCKET_LABELS[row.bucket]}</span>
        <p className="mt-1 tabular-nums text-fg">{row.score}% | priorite {row.priority_score}</p>
        {row.fit_level && <p className="text-fg-subtle">{row.fit_level}</p>}
      </Td>
      <Td>
        <p className="font-medium text-fg">{row.preference_set_label || 'Choix a valider'}</p>
        <p className="text-fg-muted">{row.preference_set?.departments?.join(', ') || 'Departement a valider'}</p>
        <p className="text-fg-subtle">{row.preference_set?.regions?.map((region) => region.region).join(', ') || 'Region a valider'}</p>
      </Td>
      <Td>
        <span className={cn('tag', row.flags.has_required_documents ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning')}>
          {row.flags.has_required_documents ? 'Docs prets' : `${row.missing_documents.length} manquant(s)`}
        </span>
        {row.missing_documents.length > 0 && (
          <p className="mt-1 text-fg-subtle">{row.missing_documents.join(', ')}</p>
        )}
      </Td>
      <Td>
        {(validation.length > 0 ? validation : reasons.map((reason) => `${reason.label}: ${reason.detail}`)).map((item) => (
          <p key={item} className="text-fg-muted">{item}</p>
        ))}
        {validation.length === 0 && reasons.length === 0 && <p className="text-success">Aucun blocage visible</p>}
      </Td>
      <Td>
        <div className="flex flex-wrap gap-1">
          {row.flags.available_soon && <span className="tag bg-success-soft text-success">Dispo bientot</span>}
          {row.flags.already_applied && <span className="tag bg-accent-soft text-accent">Deja lie</span>}
          {row.flags.never_contacted && <span className="tag bg-muted text-fg-muted">Jamais contacte</span>}
          {row.flags.has_open_tasks && <span className="tag bg-warning-soft text-warning">Tache ouverte</span>}
          {row.flags.has_overdue_tasks && <span className="tag bg-danger-soft text-danger">En retard</span>}
        </div>
      </Td>
      <Td>
        <div className="flex min-w-[230px] flex-wrap gap-2">
          {row.candidate.phone && <a href={`tel:${row.candidate.phone}`} className="btn-primary btn-sm">Appeler</a>}
          {row.candidate.email && <a href={`mailto:${row.candidate.email}`} className="btn-secondary btn-sm">Courriel</a>}
          <Link href={`/admin/candidats/${row.candidate.id}`} className="btn-secondary btn-sm">Fiche</Link>
          <button type="button" className="btn-secondary btn-sm" onClick={() => onAction('create_task')}>Tache</button>
          {hasJob && (
            <>
              <button type="button" className="btn-secondary btn-sm" onClick={() => onAction('associate')}>Associer</button>
              {row.bucket === 'presentable' && (
                <button type="button" className="btn-primary btn-sm" onClick={() => onAction('present')}>Presenter</button>
              )}
            </>
          )}
        </div>
      </Td>
    </tr>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-[11.5px] font-medium uppercase tracking-wider">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
