'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PROFESSIONS,
  QUEBEC_REGIONS,
  ALL_DEPARTMENTS,
  SHIFTS,
  MANDATE_TYPES,
  URGENCY_LEVELS,
  URGENCY_LABELS,
  DOCUMENT_TYPES,
  JOB_COUNTRIES,
  DEFAULT_JOB_COUNTRY,
  INTERNATIONAL_CANDIDATE_COUNTRIES,
  defaultEligibleCountriesForJobCountry,
  isInternationalCountry,
} from '@/lib/constants';
import type { Job, ExtraQuestion } from '@/types';

interface JobFormProps {
  initial?: Partial<Job> & { id?: string };
  mode: 'create' | 'edit';
}

interface State {
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  profession: string;
  country: string;
  eligible_countries: string[];
  region: string;
  city: string;
  establishment: string;
  establishment_en: string;
  department: string;
  shift: string;
  schedule: string;
  schedule_en: string;
  mandate_type: string;
  start_date: string;
  duration: string;
  duration_en: string;
  salary: string;
  salary_en: string;
  urgency: 'normal' | 'high' | 'urgent';
  requirements: string;
  requirements_en: string;
  benefits: string;
  benefits_en: string;
  particularities: string;
  particularities_en: string;
  required_documents: string[];
  extra_questions: ExtraQuestion[];
  status: 'active' | 'inactive' | 'draft';
}

function newQuestion(): ExtraQuestion {
  const id =
    typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return { id, label: '', type: 'yes_no', required: false };
}

export default function JobForm({ initial, mode }: JobFormProps) {
  const router = useRouter();
  const initialCountry = initial?.country || DEFAULT_JOB_COUNTRY;
  const [form, setForm] = useState<State>({
    title: initial?.title || '',
    title_en: initial?.title_en || '',
    description: initial?.description || '',
    description_en: initial?.description_en || '',
    profession: initial?.profession || '',
    country: initialCountry,
    eligible_countries:
      initial?.eligible_countries && initial.eligible_countries.length > 0
        ? initial.eligible_countries
        : defaultEligibleCountriesForJobCountry(initialCountry),
    region: initial?.region || '',
    city: initial?.city || '',
    establishment: initial?.establishment || '',
    establishment_en: initial?.establishment_en || '',
    department: initial?.department || '',
    shift: initial?.shift || '',
    schedule: initial?.schedule || '',
    schedule_en: initial?.schedule_en || '',
    mandate_type: initial?.mandate_type || '',
    start_date: initial?.start_date || '',
    duration: initial?.duration || '',
    duration_en: initial?.duration_en || '',
    salary: initial?.salary || '',
    salary_en: initial?.salary_en || '',
    urgency: (initial?.urgency as State['urgency']) ?? 'normal',
    requirements: initial?.requirements || '',
    requirements_en: initial?.requirements_en || '',
    benefits: initial?.benefits || '',
    benefits_en: initial?.benefits_en || '',
    particularities: initial?.particularities || '',
    particularities_en: initial?.particularities_en || '',
    required_documents: initial?.required_documents || [],
    extra_questions: initial?.extra_questions || [],
    // Nullish coalescing : ne tombe sur 'active' que si le statut est absent.
    // 'inactive' ou 'draft' sont conservés correctement.
    status: (initial?.status as State['status']) ?? 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof State>(k: K, v: State[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setCountry(country: string) {
    setForm((f) => ({
      ...f,
      country,
      eligible_countries:
        !isInternationalCountry(country)
          ? []
          : f.eligible_countries.length === 0
            ? defaultEligibleCountriesForJobCountry(country)
            : f.eligible_countries,
      region: country === DEFAULT_JOB_COUNTRY && !QUEBEC_REGIONS.includes(f.region) ? '' : f.region,
    }));
  }

  function toggleEligibleCountry(country: string) {
    set(
      'eligible_countries',
      form.eligible_countries.includes(country)
        ? form.eligible_countries.filter((value) => value !== country)
        : [...form.eligible_countries, country]
    );
  }

  function toggleDoc(doc: string) {
    set(
      'required_documents',
      form.required_documents.includes(doc)
        ? form.required_documents.filter((d) => d !== doc)
        : [...form.required_documents, doc]
    );
  }

  function updateQuestion(idx: number, patch: Partial<ExtraQuestion>) {
    set(
      'extra_questions',
      form.extra_questions.map((q, i) => (i === idx ? { ...q, ...patch } : q))
    );
  }

  function addQuestion() {
    set('extra_questions', [...form.extra_questions, newQuestion()]);
  }

  function removeQuestion(idx: number) {
    set('extra_questions', form.extra_questions.filter((_, i) => i !== idx));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.profession || !form.country || !form.region) {
      setError('Titre, profession, pays et région sont requis.');
      return;
    }
    if (isInternationalCountry(form.country) && form.eligible_countries.length === 0) {
      setError('Choisissez au moins un pays depuis lequel les candidats peuvent postuler.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(mode === 'edit' && initial?.id ? { id: initial.id } : {}),
        title: form.title.trim(),
        title_en: form.title_en || null,
        description: form.description || null,
        description_en: form.description_en || null,
        profession: form.profession,
        country: form.country,
        eligible_countries: isInternationalCountry(form.country) ? form.eligible_countries : [],
        region: form.region,
        city: form.city || null,
        establishment: form.establishment || null,
        establishment_en: form.establishment_en || null,
        department: form.department || null,
        shift: form.shift || null,
        schedule: form.schedule || null,
        schedule_en: form.schedule_en || null,
        mandate_type: form.mandate_type || null,
        start_date: form.start_date || null,
        duration: form.duration || null,
        duration_en: form.duration_en || null,
        salary: form.salary || null,
        salary_en: form.salary_en || null,
        urgency: form.urgency,
        requirements: form.requirements || null,
        requirements_en: form.requirements_en || null,
        benefits: form.benefits || null,
        benefits_en: form.benefits_en || null,
        particularities: form.particularities || null,
        particularities_en: form.particularities_en || null,
        required_documents: form.required_documents,
        extra_questions: form.extra_questions.filter((q) => q.label.trim()),
        status: form.status,
      };

      const res = await fetch('/api/admin/jobs', {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Échec.');
      router.push('/admin/postes');
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  }

  async function deactivate() {
    if (!initial?.id) return;
    if (!confirm('Désactiver ce poste ? Il ne sera plus visible publiquement mais restera consultable dans l\'admin.')) return;
    const res = await fetch(`/api/admin/jobs?id=${initial.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.ok) {
      router.push('/admin/postes');
      router.refresh();
    } else {
      setError(json.error || 'Échec de la désactivation.');
    }
  }

  async function hardDelete() {
    if (!initial?.id) return;
    if (
      !confirm(
        `Supprimer définitivement « ${initial.title || 'ce poste'} » ?\n\nCette action est irréversible. Les soumissions existantes seront conservées (job_id devient null, le posting_snapshot reste).`
      )
    )
      return;
    const res = await fetch(`/api/admin/jobs?id=${initial.id}&hard=true`, { method: 'DELETE' });
    const json = await res.json();
    if (json.ok) {
      router.push('/admin/postes');
      router.refresh();
    } else {
      setError(json.error || 'Échec de la suppression.');
    }
  }

  const isInternational = isInternationalCountry(form.country);

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="card p-6 space-y-5">
        <h2 className="text-[18px] font-semibold text-fg">Informations principales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titre" required>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </Field>
          <Field label="Titre anglais">
            <input className="input" value={form.title_en} onChange={(e) => set('title_en', e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description publique - français">
              <textarea
                className="textarea"
                rows={5}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Texte principal visible sur la fiche du poste en français."
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Public description - English">
              <textarea
                className="textarea"
                rows={5}
                value={form.description_en}
                onChange={(e) => set('description_en', e.target.value)}
                placeholder="Main public description shown on the English job page."
              />
            </Field>
          </div>
          <Field label="Profession" required>
            <select className="input" value={form.profession} onChange={(e) => set('profession', e.target.value)}>
              <option value="">Choisir</option>
              {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Pays du mandat" required>
            <select className="input" value={form.country} onChange={(e) => setCountry(e.target.value)}>
              {JOB_COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </Field>
          <Field label={isInternational ? 'Région / province / territoire' : 'Région'} required>
            {isInternational ? (
              <input
                className="input"
                value={form.region}
                onChange={(e) => set('region', e.target.value)}
                placeholder="Ex. Riyad, Djeddah, Arabie saoudite"
              />
            ) : (
              <select className="input" value={form.region} onChange={(e) => set('region', e.target.value)}>
                <option value="">Choisir</option>
                {QUEBEC_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </Field>
          <Field label="Ville">
            <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Établissement">
            <input className="input" value={form.establishment} onChange={(e) => set('establishment', e.target.value)} />
          </Field>
          <Field label="Établissement anglais">
            <input className="input" value={form.establishment_en} onChange={(e) => set('establishment_en', e.target.value)} />
          </Field>
          <Field label="Département">
            <select className="input" value={form.department} onChange={(e) => set('department', e.target.value)}>
              <option value="">Choisir</option>
              {ALL_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Quart">
            <select className="input" value={form.shift} onChange={(e) => set('shift', e.target.value)}>
              <option value="">Choisir</option>
              {SHIFTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Horaire détaillé">
            <input className="input" value={form.schedule} onChange={(e) => set('schedule', e.target.value)} placeholder="Ex. 7h à 15h30" />
          </Field>
          <Field label="Detailed schedule - English">
            <input className="input" value={form.schedule_en} onChange={(e) => set('schedule_en', e.target.value)} placeholder="Ex. 7 a.m. to 3:30 p.m." />
          </Field>
          <Field label="Type de mandat">
            <select className="input" value={form.mandate_type} onChange={(e) => set('mandate_type', e.target.value)}>
              <option value="">Choisir</option>
              {MANDATE_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Date de début">
            <input className="input" type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
          </Field>
          <Field label="Durée">
            <input className="input" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="Ex. 3 mois" />
          </Field>
          <Field label="Duration - English">
            <input className="input" value={form.duration_en} onChange={(e) => set('duration_en', e.target.value)} placeholder="Ex. 3 months" />
          </Field>
          <Field label="Rémunération">
            <input className="input" value={form.salary} onChange={(e) => set('salary', e.target.value)} placeholder="Ex. Selon convention + primes" />
          </Field>
          <Field label="Compensation - English">
            <input className="input" value={form.salary_en} onChange={(e) => set('salary_en', e.target.value)} placeholder="Ex. CAD $4,000-$7,500/month" />
          </Field>
          <Field label="Urgence">
            <select className="input" value={form.urgency} onChange={(e) => set('urgency', e.target.value as State['urgency'])}>
              {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{URGENCY_LABELS[u]}</option>)}
            </select>
          </Field>
          <Field label="Statut">
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as State['status'])}>
              <option value="active">Actif</option>
              <option value="draft">Brouillon</option>
              <option value="inactive">Inactif</option>
            </select>
          </Field>
        </div>

        {isInternational && (
          <Field
            label="Candidats admissibles depuis"
            helper="Pays de résidence depuis lesquels un candidat peut postuler à ce mandat international."
          >
            <div className="mt-2 flex flex-wrap gap-2">
              {INTERNATIONAL_CANDIDATE_COUNTRIES.map((country) => {
                const active = form.eligible_countries.includes(country);
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleEligibleCountry(country)}
                    className={active ? 'chip chip-active' : 'chip'}
                    aria-pressed={active}
                  >
                    {country}
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        <Field label="Exigences - français">
          <textarea className="textarea" rows={4} value={form.requirements} onChange={(e) => set('requirements', e.target.value)} />
        </Field>
        <Field label="Requirements - English">
          <textarea className="textarea" rows={4} value={form.requirements_en} onChange={(e) => set('requirements_en', e.target.value)} />
        </Field>
        <Field label="Avantages - français">
          <textarea className="textarea" rows={4} value={form.benefits} onChange={(e) => set('benefits', e.target.value)} />
        </Field>
        <Field label="Benefits - English">
          <textarea className="textarea" rows={4} value={form.benefits_en} onChange={(e) => set('benefits_en', e.target.value)} />
        </Field>
        <Field label="Particularités - français">
          <textarea className="textarea" rows={4} value={form.particularities} onChange={(e) => set('particularities', e.target.value)} />
        </Field>
        <Field label="Notes - English">
          <textarea className="textarea" rows={4} value={form.particularities_en} onChange={(e) => set('particularities_en', e.target.value)} />
        </Field>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="text-[18px] font-semibold text-fg">Documents demandés</h2>
        <p className="helper">Cochez les documents nécessaires pour ce mandat. Le CV est toujours demandé.</p>
        <div className="flex flex-wrap gap-2">
          {DOCUMENT_TYPES.map((d) => {
            const active = form.required_documents.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => toggleDoc(d)}
                className={active ? 'chip chip-active' : 'chip'}
                aria-pressed={active}
              >
                {d}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-fg">Questions supplémentaires</h2>
          <button type="button" onClick={addQuestion} className="btn-secondary btn-sm">
            Ajouter une question
          </button>
        </div>
        <p className="helper">Ces questions apparaîtront dans l'entrevue lorsqu'un candidat postule à ce mandat.</p>

        {form.extra_questions.length === 0 ? (
          <p className="text-fg-muted text-[14px]">Aucune question pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {form.extra_questions.map((q, idx) => (
              <div key={q.id} className="rounded-xl border border-border p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                  <Field label="Libellé">
                    <input className="input" value={q.label} onChange={(e) => updateQuestion(idx, { label: e.target.value })} />
                  </Field>
                  <Field label="Type">
                    <select
                      className="input"
                      value={q.type}
                      onChange={(e) => updateQuestion(idx, { type: e.target.value as ExtraQuestion['type'] })}
                    >
                      <option value="yes_no">Oui / Non</option>
                      <option value="text">Texte court</option>
                      <option value="textarea">Texte long</option>
                      <option value="select">Liste de choix</option>
                    </select>
                  </Field>
                  <div className="flex items-end">
                    <button type="button" onClick={() => removeQuestion(idx)} className="btn-danger btn-sm">
                      Retirer
                    </button>
                  </div>
                </div>
                {q.type === 'select' && (
                  <Field label="Options" helper="Séparez par des virgules.">
                    <input
                      className="input"
                      value={(q.options || []).join(', ')}
                      onChange={(e) =>
                        updateQuestion(idx, {
                          options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </Field>
                )}
                <label className="inline-flex items-center gap-2 text-[14px] cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-fg"
                    checked={q.required}
                    onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                  />
                  Réponse obligatoire
                </label>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Enregistrement…' : mode === 'edit' ? 'Mettre à jour' : 'Créer le poste'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Annuler
        </button>
      </div>

      {mode === 'edit' && initial?.id && (
        <section className="rounded-2xl border border-danger/30 bg-danger-soft/40 p-5 sm:p-6">
          <h3 className="text-[15px] font-semibold text-danger">Zone de danger</h3>
          <p className="mt-1 text-[13.5px] text-fg-muted">
            Actions irréversibles. Choisis la bonne selon le besoin.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {form.status !== 'inactive' && (
              <button
                type="button"
                onClick={deactivate}
                className="inline-flex items-center rounded-full border border-warning/40 bg-surface px-4 py-2 text-[13.5px] font-medium text-warning hover:bg-warning hover:text-bg transition-colors"
              >
                Désactiver (retirer du site public)
              </button>
            )}
            <button
              type="button"
              onClick={hardDelete}
              className="inline-flex items-center rounded-full border border-danger/40 bg-surface px-4 py-2 text-[13.5px] font-medium text-danger hover:bg-danger hover:text-bg transition-colors"
            >
              Supprimer définitivement
            </button>
          </div>
          <p className="mt-3 text-[12.5px] text-fg-muted leading-relaxed">
            <strong>Désactiver</strong> retire le poste des listes publiques mais le garde en
            base.&nbsp;
            <strong>Supprimer définitivement</strong> efface le poste. Les soumissions reçues
            avant la suppression sont conservées (avec le snapshot du poste capturé au moment de
            la candidature).
          </p>
        </section>
      )}
    </form>
  );
}

function Field({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {helper && <p className="helper mt-1.5">{helper}</p>}
    </div>
  );
}
