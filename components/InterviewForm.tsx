'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionCard from './SectionCard';
import SegmentedChoices from './SegmentedChoices';
import DepartmentGroups from './DepartmentGroups';
import DocumentUploadChoice from './DocumentUploadChoice';
import {
  CONTACT_PREFS,
  CONTACT_TIMES,
  LANGUAGES,
  WORK_AUTH,
  PERMIT_STATUSES,
  YEARS_EXPERIENCE,
  MOBILITY,
  SHIFTS,
  START_AVAILABILITY,
  HOUSING_CHOICES,
  TRANSPORT_CHOICES,
  YES_NO_DISCUSS,
  PROFESSIONS,
  QUEBEC_REGIONS,
  professionRequiresPermit,
  professionRequiresPDSB,
} from '@/lib/constants';
import { mandateRequiresWeekendCheck, computeCompletionScore } from '@/lib/utils';
import type { Candidate, DocumentRecord, ExtraQuestion, Job, RegionChoice } from '@/types';

type Mode = 'posting' | 'spontaneous';
type DocumentValue = {
  document_id?: string | null;
  status: string;
  file_name?: string | null;
  file_path?: string | null;
};

interface InterviewFormProps {
  mode: Mode;
  job?: Job | null;
  initial?: Candidate | null;
  initialDocuments?: Record<string, Pick<DocumentRecord, 'id' | 'status' | 'file_name' | 'file_path'>>;
}

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  preferred_contact: string;
  best_contact_time: string;
  languages: string[];
  work_authorization: string;
  consent_data: boolean;
  mailing_list_opt_in: boolean;
  city_residence: string;
  region_residence: string;
  postal_code: string;
  profession: string;
  years_experience: string;
  permit_status: string;
  permit_number: string;
  mobility: string;
  start_availability: string;
  preferred_hours: string;
  exact_start_date: string;
  shifts_accepted: string[];
  weekend_two_in_one: string;
  region_choices: RegionChoice[];
  preferred_establishments: string;
  avoided_establishments: string;
  preferred_departments: string[];
  housing_required: string;
  transport_available: string;
  documents: Record<string, DocumentValue>;
  extra_answers: Record<string, string | boolean>;
  similar_mandates: string;
  salary_expectations: string;
  constraints: string;
  recruiter_comment: string;
}

function emptyRegionChoice(region = ''): RegionChoice {
  return { region, all_region: true, cities: [] };
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v)));
}

function initialRegions(mode: Mode, job?: Job | null, candidate?: Candidate | null): RegionChoice[] {
  if (mode === 'posting' && job?.region) return [emptyRegionChoice(job.region)];
  if (candidate?.preferred_regions && candidate.preferred_regions.length > 0) {
    return candidate.preferred_regions;
  }
  if (candidate?.region_residence) return [emptyRegionChoice(candidate.region_residence)];
  return [emptyRegionChoice()];
}

function initialDocumentValues(
  docs?: Record<string, Pick<DocumentRecord, 'id' | 'status' | 'file_name' | 'file_path'>>
): Record<string, DocumentValue> {
  const values: Record<string, DocumentValue> = {};
  for (const [type, doc] of Object.entries(docs || {})) {
    values[type] = {
      document_id: doc.id,
      status: doc.status,
      file_name: doc.file_name,
      file_path: doc.file_path,
    };
  }
  return values;
}

export default function InterviewForm({ mode, job, initial, initialDocuments }: InterviewFormProps) {
  const router = useRouter();
  const isPosting = mode === 'posting';

  const [form, setForm] = useState<FormState>({
    first_name: initial?.first_name || '',
    last_name: initial?.last_name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    preferred_contact: initial?.preferred_contact || '',
    best_contact_time: initial?.best_contact_time || '',
    languages: initial?.languages || [],
    work_authorization: initial?.work_authorization || '',
    consent_data: initial?.consent_data ?? false,
    mailing_list_opt_in: initial?.mailing_list_opt_in ?? !isPosting,
    city_residence: initial?.city_residence || '',
    region_residence: initial?.region_residence || '',
    postal_code: initial?.postal_code || '',
    profession: isPosting ? job?.profession || initial?.profession || '' : initial?.profession || '',
    years_experience: initial?.years_experience || '',
    permit_status: initial?.permit_status || '',
    permit_number: initial?.permit_number || '',
    mobility: initial?.mobility || '',
    start_availability: initial?.start_availability || '',
    preferred_hours: initial?.preferred_hours || '',
    exact_start_date: '',
    shifts_accepted: uniqueStrings([
      ...(isPosting ? [job?.shift] : []),
      ...(initial?.preferred_shifts || []),
    ]),
    weekend_two_in_one: '',
    region_choices: initialRegions(mode, job, initial),
    preferred_establishments: initial?.preferred_establishments || '',
    avoided_establishments: initial?.avoided_establishments || '',
    preferred_departments: uniqueStrings([
      ...(isPosting ? [job?.department] : []),
      ...(initial?.preferred_departments || []),
    ]),
    housing_required: initial?.housing_required || '',
    transport_available: initial?.transport_available || '',
    documents: initialDocumentValues(initialDocuments),
    extra_answers: {},
    similar_mandates: initial?.mailing_list_opt_in ? 'Oui' : '',
    salary_expectations: '',
    constraints: '',
    recruiter_comment: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const needsWeekendCheck = isPosting && mandateRequiresWeekendCheck(job?.mandate_type);
  const needsPermitField = professionRequiresPermit(form.profession);
  const extraQuestions: ExtraQuestion[] = isPosting && job?.extra_questions ? job.extra_questions : [];

  const documentList = useMemo(() => {
    const needsPermit = professionRequiresPermit(form.profession);
    const needsPDSB = professionRequiresPDSB(form.profession);
    const requestedByPosting = new Set(job?.required_documents || []);

    const docs: Array<{ type: string; required: boolean; requestedByPosting: boolean }> = [
      { type: 'CV', required: true, requestedByPosting: requestedByPosting.has('CV') },
    ];
    if (needsPermit) {
      docs.push({
        type: "Permis d'exercice",
        required: false,
        requestedByPosting: requestedByPosting.has("Permis d'exercice"),
      });
    }
    docs.push({
      type: 'RCR',
      required: false,
      requestedByPosting: requestedByPosting.has('RCR'),
    });
    if (needsPDSB) {
      docs.push({
        type: 'PDSB',
        required: false,
        requestedByPosting: requestedByPosting.has('PDSB'),
      });
    }
    docs.push({
      type: 'Carnet de vaccination',
      required: false,
      requestedByPosting: requestedByPosting.has('Carnet de vaccination'),
    });
    return docs;
  }, [form.profession, job]);

  const completion = useMemo(() => {
    return computeCompletionScore({
      hasContact: !!(form.first_name && form.last_name && (form.phone || form.email)),
      hasResidence: !!(form.city_residence && form.region_residence),
      hasProfession: !!form.profession,
      hasAvailability: !!form.start_availability && form.shifts_accepted.length > 0,
      hasRegions: form.region_choices.some((r) => r.region) || isPosting,
      hasExperience: !!form.years_experience,
      cvProvided: form.documents.CV?.status === 'Reçu' && !!form.documents.CV?.file_path,
      consent: form.consent_data,
      postingQuestionsAnswered:
        !isPosting ||
        extraQuestions.length === 0 ||
        extraQuestions.every(
          (q) => !q.required || (form.extra_answers[q.id] != null && form.extra_answers[q.id] !== '')
        ),
    });
  }, [form, isPosting, extraQuestions]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateRegionChoice(idx: number, patch: Partial<RegionChoice>) {
    setForm((f) => ({
      ...f,
      region_choices: f.region_choices.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  }

  function addRegionChoice() {
    setForm((f) => ({ ...f, region_choices: [...f.region_choices, emptyRegionChoice()] }));
  }

  function removeRegionChoice(idx: number) {
    setForm((f) => ({
      ...f,
      region_choices: f.region_choices.filter((_, i) => i !== idx),
    }));
  }

  function validateLocal(): boolean {
    const errs: Record<string, string> = {};
    if (!form.first_name.trim()) errs.first_name = 'Prénom requis';
    if (!form.last_name.trim()) errs.last_name = 'Nom requis';
    if (!form.phone.trim() && !form.email.trim()) errs.phone = 'Téléphone ou courriel requis';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Courriel invalide';
    }
    if (!form.city_residence.trim()) errs.city_residence = 'Ville requise';
    if (!form.region_residence) errs.region_residence = 'Région requise';
    if (!form.profession) errs.profession = 'Profession requise';
    if (!form.years_experience) errs.years_experience = 'Expérience requise';
    if (!form.work_authorization) errs.work_authorization = 'Veuillez préciser';
    if (form.languages.length === 0) errs.languages = 'Choisissez au moins une langue';
    if (!form.start_availability) errs.start_availability = 'Disponibilité requise';
    if (form.shifts_accepted.length === 0) errs.shifts_accepted = 'Choisissez au moins un quart';
    if (!isPosting && !form.region_choices.some((r) => r.region)) {
      errs.region_choices = 'Choisissez au moins une région';
    }
    if (form.documents.CV?.status !== 'Reçu' || !form.documents.CV?.file_path) {
      errs.cv = 'CV requis';
    }
    if (!form.consent_data) errs.consent_data = 'Consentement obligatoire';
    for (const q of extraQuestions) {
      if (q.required) {
        const v = form.extra_answers[q.id];
        if (v == null || v === '') errs[`q_${q.id}`] = 'Réponse requise';
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateLocal()) {
      setError('Veuillez compléter les champs requis.');
      requestAnimationFrame(() => {
        const first = document.querySelector('[data-error="true"]');
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        submission_type: mode,
        job_id: isPosting ? job?.id : null,
        candidate: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          preferred_contact: form.preferred_contact || null,
          best_contact_time: form.best_contact_time || null,
          city_residence: form.city_residence.trim() || null,
          region_residence: form.region_residence || null,
          postal_code: form.postal_code.trim() || null,
          profession: form.profession || null,
          work_authorization: form.work_authorization || null,
          languages: form.languages,
          consent_data: form.consent_data,
          mailing_list_opt_in: form.mailing_list_opt_in,
        },
        answers: {
          preferred_contact: form.preferred_contact,
          best_contact_time: form.best_contact_time,
          languages: form.languages,
          work_authorization: form.work_authorization,
          city_residence: form.city_residence,
          region_residence: form.region_residence,
          postal_code: form.postal_code,
          profession: form.profession,
          years_experience: form.years_experience,
          permit_status: form.permit_status,
          permit_number: form.permit_number,
          mobility: form.mobility,
          start_availability: form.start_availability,
          preferred_hours: form.preferred_hours,
          exact_start_date: form.exact_start_date,
          shifts_accepted: form.shifts_accepted,
          weekend_two_in_one: form.weekend_two_in_one,
          region_choices: form.region_choices,
          preferred_establishments: form.preferred_establishments,
          avoided_establishments: form.avoided_establishments,
          preferred_departments: form.preferred_departments,
          housing_required: form.housing_required,
          transport_available: form.transport_available,
          similar_mandates: form.similar_mandates,
          salary_expectations: form.salary_expectations,
          constraints: form.constraints,
          recruiter_comment: form.recruiter_comment,
          extra_answers: form.extra_answers,
        },
        completion_score: completion,
        source: 'web',
        documents: documentList.map((d) => ({
          document_id: form.documents[d.type]?.document_id || null,
          document_type: d.type,
          status: form.documents[d.type]?.status || 'À recevoir',
          file_path: form.documents[d.type]?.file_path || null,
          file_name: form.documents[d.type]?.file_name || null,
        })),
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Impossible d'enregistrer la candidature.");
      }
      const thanksParams = new URLSearchParams({ type: mode });
      if (json.application_id) thanksParams.set('application_id', String(json.application_id));
      router.push(`/merci?${thanksParams.toString()}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      setSubmitting(false);
    }
  }

  const checklist = [
    { label: 'Dossier', ok: !!(form.first_name && form.last_name && (form.phone || form.email) && form.city_residence && form.region_residence) },
    { label: 'Profession', ok: !!(form.profession && form.years_experience && form.work_authorization) },
    { label: 'Disponibilités', ok: !!form.start_availability && form.shifts_accepted.length > 0 },
    { label: 'Territoire', ok: isPosting || form.region_choices.some((r) => r.region) },
    { label: 'CV', ok: form.documents.CV?.status === 'Reçu' && !!form.documents.CV?.file_path },
    { label: 'Consentement', ok: form.consent_data },
  ];
  if (extraQuestions.length > 0) {
    checklist.push({
      label: 'Questions du mandat',
      ok: extraQuestions.every(
        (q) => !q.required || (form.extra_answers[q.id] != null && form.extra_answers[q.id] !== '')
      ),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6 min-w-0">
        <SectionCard
          step="1 sur 3"
          title="Dossier candidat"
          helper="Vos coordonnées, votre résidence et votre admissibilité. Ces informations seront réutilisées pour les prochaines candidatures."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prénom" required error={fieldErrors.first_name}>
              <input className="input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label="Nom" required error={fieldErrors.last_name}>
              <input className="input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} autoComplete="family-name" />
            </Field>
            <Field label="Téléphone" helper="Téléphone ou courriel requis." error={fieldErrors.phone}>
              <input className="input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
            </Field>
            <Field label="Courriel" error={fieldErrors.email}>
              <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ville de résidence" required error={fieldErrors.city_residence}>
              <input className="input" value={form.city_residence} onChange={(e) => set('city_residence', e.target.value)} />
            </Field>
            <Field label="Région de résidence" required error={fieldErrors.region_residence}>
              <select className="input" value={form.region_residence} onChange={(e) => set('region_residence', e.target.value)}>
                <option value="">Choisir une région</option>
                {QUEBEC_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Code postal" helper="Optionnel">
              <input className="input" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Profession" required error={fieldErrors.profession}>
              {isPosting ? (
                <p className="rounded-lg border border-border bg-muted px-3.5 py-2.5 text-[15px] text-fg">
                  {form.profession}
                </p>
              ) : (
                <select className="input" value={form.profession} onChange={(e) => set('profession', e.target.value)}>
                  <option value="">Choisir une profession</option>
                  {PROFESSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              )}
            </Field>
            <Field label="Années d'expérience" required error={fieldErrors.years_experience}>
              <SegmentedChoices options={YEARS_EXPERIENCE} value={form.years_experience} onChange={(v) => set('years_experience', v as string)} />
            </Field>
          </div>

          {needsPermitField && (
            <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <Field label="Permis d'exercice">
                <SegmentedChoices options={PERMIT_STATUSES} value={form.permit_status} onChange={(v) => set('permit_status', v as string)} />
              </Field>
              <Field label="Numéro de permis" helper="Optionnel">
                <input className="input" value={form.permit_number} onChange={(e) => set('permit_number', e.target.value)} />
              </Field>
            </div>
          )}

          <Field label="Langues de travail" required error={fieldErrors.languages}>
            <SegmentedChoices options={LANGUAGES} value={form.languages} onChange={(v) => set('languages', v as string[])} multi />
          </Field>

          <Field label="Autorisation de travailler au Canada" required error={fieldErrors.work_authorization}>
            <SegmentedChoices options={WORK_AUTH} value={form.work_authorization} onChange={(v) => set('work_authorization', v as string)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meilleur moyen de contact">
              <SegmentedChoices options={CONTACT_PREFS} value={form.preferred_contact} onChange={(v) => set('preferred_contact', v as string)} />
            </Field>
            <Field label="Meilleur moment pour joindre">
              <SegmentedChoices options={CONTACT_TIMES} value={form.best_contact_time} onChange={(v) => set('best_contact_time', v as string)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          step="2 sur 3"
          title="Disponibilités et territoire"
          helper={isPosting ? 'Confirmez que le mandat convient à votre horaire et à vos déplacements.' : 'Ces préférences servent à proposer les bons mandats, sans vous reposer les mêmes questions.'}
        >
          <Field label="Quand pouvez-vous commencer ?" required error={fieldErrors.start_availability}>
            <SegmentedChoices options={START_AVAILABILITY} value={form.start_availability} onChange={(v) => set('start_availability', v as string)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Heures souhaitées" helper="Ex. temps plein, 24 à 32 h">
              <input className="input" value={form.preferred_hours} onChange={(e) => set('preferred_hours', e.target.value)} />
            </Field>
            <Field label="Date exacte si connue">
              <input className="input" type="date" value={form.exact_start_date} onChange={(e) => set('exact_start_date', e.target.value)} />
            </Field>
          </div>

          <Field label="Quarts acceptés" required error={fieldErrors.shifts_accepted}>
            <SegmentedChoices options={SHIFTS} value={form.shifts_accepted} onChange={(v) => set('shifts_accepted', v as string[])} multi />
          </Field>

          {needsWeekendCheck && (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-[14px] text-fg-muted leading-relaxed">
                Pour ce type de mandat, une fin de semaine sur deux peut être demandée.
              </p>
              <div className="mt-3">
                <Field label="Est-ce acceptable pour vous ?">
                  <SegmentedChoices options={YES_NO_DISCUSS} value={form.weekend_two_in_one} onChange={(v) => set('weekend_two_in_one', v as string)} />
                </Field>
              </div>
            </div>
          )}

          <div className="space-y-3" data-error={!!fieldErrors.region_choices}>
            {form.region_choices.map((rc, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-surface p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Field label={isPosting ? 'Région du mandat' : `Région ${idx + 1}`}>
                    <select className="input" value={rc.region} onChange={(e) => updateRegionChoice(idx, { region: e.target.value })}>
                      <option value="">Choisir une région</option>
                      {QUEBEC_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Field>
                  {form.region_choices.length > 1 && (
                    <button type="button" onClick={() => removeRegionChoice(idx)} className="btn-ghost btn-sm self-end">
                      Retirer
                    </button>
                  )}
                </div>

                <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-fg"
                    checked={rc.all_region}
                    onChange={(e) => updateRegionChoice(idx, { all_region: e.target.checked, cities: e.target.checked ? [] : rc.cities })}
                  />
                  <span className="text-[14px] text-fg">Toute la région</span>
                </label>

                {!rc.all_region && (
                  <div className="mt-3">
                    <Field label="Ville(s) acceptée(s)" helper="Séparez par des virgules.">
                      <input
                        className="input"
                        value={rc.cities.join(', ')}
                        onChange={(e) =>
                          updateRegionChoice(idx, {
                            cities: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                          })
                        }
                      />
                    </Field>
                  </div>
                )}
              </div>
            ))}
            {fieldErrors.region_choices && <p className="error-text" data-error="true">{fieldErrors.region_choices}</p>}
            <button type="button" onClick={addRegionChoice} className="btn-secondary btn-sm">
              Ajouter une autre région
            </button>
          </div>

          <DepartmentGroups
            value={form.preferred_departments}
            onChange={(v) => set('preferred_departments', v)}
            label={isPosting ? 'Départements similaires acceptés' : 'Départements souhaités'}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mobilité">
              <SegmentedChoices options={MOBILITY} value={form.mobility} onChange={(v) => set('mobility', v as string)} />
            </Field>
            <Field label="Transport disponible">
              <SegmentedChoices options={TRANSPORT_CHOICES} value={form.transport_available} onChange={(v) => set('transport_available', v as string)} />
            </Field>
            <Field label="Hébergement requis">
              <SegmentedChoices options={HOUSING_CHOICES} value={form.housing_required} onChange={(v) => set('housing_required', v as string)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Établissements souhaités" helper="Optionnel">
              <textarea className="textarea" value={form.preferred_establishments} onChange={(e) => set('preferred_establishments', e.target.value)} />
            </Field>
            <Field label="Établissements à éviter" helper="Optionnel">
              <textarea className="textarea" value={form.avoided_establishments} onChange={(e) => set('avoided_establishments', e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          step="3 sur 3"
          title="CV et envoi"
          helper="Le CV est obligatoire. Les autres documents peuvent suivre plus tard si le recruteur en a besoin."
        >
          <div className="space-y-3" data-error={!!fieldErrors.cv}>
            {documentList.map((d) => (
              <DocumentUploadChoice
                key={d.type}
                documentType={d.type}
                required={d.type === 'CV'}
                requestedByPosting={d.requestedByPosting}
                value={form.documents[d.type]}
                onChange={(v) => set('documents', { ...form.documents, [d.type]: v })}
              />
            ))}
          </div>
          {fieldErrors.cv && <p className="error-text" data-error="true">{fieldErrors.cv}</p>}

          {isPosting && extraQuestions.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-[17px] font-semibold text-fg">Questions du mandat</h3>
              {extraQuestions.map((q) => (
                <ExtraQuestionField
                  key={q.id}
                  question={q}
                  value={form.extra_answers[q.id]}
                  error={fieldErrors[`q_${q.id}`]}
                  onChange={(v) => set('extra_answers', { ...form.extra_answers, [q.id]: v })}
                />
              ))}
            </div>
          )}

          {isPosting ? (
            <Field label="Si ce mandat n'est plus disponible, souhaitez-vous recevoir des mandats similaires ?">
              <SegmentedChoices options={YES_NO_DISCUSS} value={form.similar_mandates} onChange={(v) => set('similar_mandates', v as string)} />
            </Field>
          ) : (
            <div className="space-y-4">
              <Field label="Attentes salariales" helper="Optionnel">
                <input className="input" value={form.salary_expectations} onChange={(e) => set('salary_expectations', e.target.value)} />
              </Field>
              <Field label="Contraintes importantes" helper="Optionnel">
                <textarea className="textarea" value={form.constraints} onChange={(e) => set('constraints', e.target.value)} />
              </Field>
              <Field label="Commentaire au recruteur" helper="Optionnel">
                <textarea className="textarea" value={form.recruiter_comment} onChange={(e) => set('recruiter_comment', e.target.value)} />
              </Field>
            </div>
          )}

          <div className="space-y-3 border-t border-border pt-4">
            <label className="flex items-start gap-3 cursor-pointer" data-error={!!fieldErrors.consent_data}>
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border accent-fg"
                checked={form.consent_data}
                onChange={(e) => set('consent_data', e.target.checked)}
              />
              <span className="text-[14px] text-fg leading-relaxed">
                J'accepte que Sanitas utilise mes informations pour analyser ma candidature, me contacter et me proposer des mandats pertinents.
                <span className="text-danger"> *</span>
              </span>
            </label>
            {fieldErrors.consent_data && <p className="error-text" data-error="true">{fieldErrors.consent_data}</p>}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border accent-fg"
                checked={form.mailing_list_opt_in}
                onChange={(e) => set('mailing_list_opt_in', e.target.checked)}
              />
              <span className="text-[14px] text-fg leading-relaxed">
                Je souhaite recevoir les nouveaux besoins et mandats compatibles avec mon profil.
              </span>
            </label>
          </div>
        </SectionCard>

        {error && (
          <div className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-fg-muted">
            Vos informations sont conservées de façon sécurisée. Voir la{' '}
            <a href="/politique-confidentialite" className="underline">politique de confidentialité</a>.
          </p>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting
              ? 'Envoi...'
              : isPosting
              ? 'Envoyer mon intérêt pour ce mandat'
              : 'Activer mon profil Sanitas'}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className="card p-5">
          <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
            Dossier avant envoi
          </p>
          <p className="mt-1.5 text-[15px] font-medium text-fg">
            {isPosting ? 'Mandat précis' : 'Candidature spontanée'}
          </p>
          {isPosting && job && (
            <p className="mt-2 text-[13.5px] text-fg-muted leading-relaxed">
              {job.title}
              {job.establishment ? ` · ${job.establishment}` : ''}
            </p>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] text-fg-subtle">Profil complété</p>
              <p className="text-[13px] font-medium text-fg tabular-nums">{completion}%</p>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500 ease-out-quart"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <ul className="mt-5 space-y-2">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-[13.5px]">
                <span
                  className={
                    c.ok
                      ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-soft text-success'
                      : 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-fg-subtle'
                  }
                  aria-hidden
                >
                  {c.ok ? '✓' : '·'}
                </span>
                <span className={c.ok ? 'text-fg' : 'text-fg-muted'}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  required,
  helper,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {helper && !error && <p className="mt-1.5 helper">{helper}</p>}
      {error && <p className="error-text" data-error="true">{error}</p>}
    </div>
  );
}

function ExtraQuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: ExtraQuestion;
  value: string | boolean | undefined;
  error?: string;
  onChange: (v: string | boolean) => void;
}) {
  switch (question.type) {
    case 'text':
      return (
        <Field label={question.label} required={question.required} error={error}>
          <input className="input" value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case 'textarea':
      return (
        <Field label={question.label} required={question.required} error={error}>
          <textarea className="textarea" value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case 'select':
      return (
        <Field label={question.label} required={question.required} error={error}>
          <select className="input" value={(value as string) || ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">Choisir...</option>
            {(question.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      );
    case 'yes_no':
      return (
        <Field label={question.label} required={question.required} error={error}>
          <SegmentedChoices
            options={['Oui', 'Non', 'À discuter']}
            value={(value as string) || ''}
            onChange={(v) => onChange(v as string)}
          />
        </Field>
      );
  }
}
