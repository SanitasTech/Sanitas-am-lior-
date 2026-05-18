'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DepartmentGroups from '@/components/DepartmentGroups';
import DocumentUploadChoice from '@/components/DocumentUploadChoice';
import SegmentedChoices from '@/components/SegmentedChoices';
import {
  COMPANY,
  CONTACT_PREFS,
  CONTACT_TIMES,
  HOUSING_CHOICES,
  LANGUAGES,
  MOBILITY,
  PERMIT_STATUSES,
  PROFESSIONS,
  QUEBEC_REGIONS,
  SHIFTS,
  START_AVAILABILITY,
  TRANSPORT_CHOICES,
  WORK_AUTH,
  YEARS_EXPERIENCE,
  YES_NO_DISCUSS,
  professionRequiresPermit,
  professionRequiresPDSB,
} from '@/lib/constants';
import { displayValue, jobTitle, localizedPath, type Locale } from '@/lib/i18n';
import { buildCandidateReadiness, readinessPercent } from '@/lib/ats-operating-model';
import { computeCompletionScore, mandateRequiresWeekendCheck } from '@/lib/utils';
import type { Candidate, CandidateDocument, DocumentRecord, ExtraQuestion, Job, RegionChoice } from '@/types';

type Mode = 'posting' | 'spontaneous';
type ModuleId = 'identity' | 'work' | 'availability' | 'documents';
type DocumentValue = {
  document_id?: string | null;
  status: string;
  file_name?: string | null;
  file_path?: string | null;
};

interface CandidateApplicationFlowProps {
  mode: Mode;
  job?: Job | null;
  initial: Candidate;
  initialDocuments?: Record<string, Pick<DocumentRecord, 'id' | 'status' | 'file_name' | 'file_path'>>;
  locale?: Locale;
}

interface FormState {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  preferred_contact: string;
  best_contact_time: string;
  city_residence: string;
  region_residence: string;
  postal_code: string;
  profession: string;
  qualified_professions: string[];
  years_experience: string;
  permit_status: string;
  permit_number: string;
  languages: string[];
  work_authorization: string;
  mobility: string;
  start_availability: string;
  preferred_hours: string;
  exact_start_date: string;
  shifts_accepted: string[];
  weekend_two_in_one: string;
  region_choices: RegionChoice[];
  preferred_departments: string[];
  preferred_establishments: string;
  avoided_establishments: string;
  housing_required: string;
  transport_available: string;
  salary_expectations: string;
  constraints: string;
  recruiter_comment: string;
  extra_answers: Record<string, string | boolean>;
  similar_mandates: string;
  documents: Record<string, DocumentValue>;
  consent_data: boolean;
  mailing_list_opt_in: boolean;
}

function emptyRegionChoice(region = ''): RegionChoice {
  return { region, all_region: true, cities: [] };
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v)));
}

function initialRegions(mode: Mode, job?: Job | null, candidate?: Candidate | null): RegionChoice[] {
  if (mode === 'posting' && job?.region) return [emptyRegionChoice(job.region)];
  if (candidate?.preferred_regions && candidate.preferred_regions.length > 0) return candidate.preferred_regions;
  if (candidate?.region_residence) return [emptyRegionChoice(candidate.region_residence)];
  return [emptyRegionChoice()];
}

function initialQualifiedProfessions(mode: Mode, job?: Job | null, candidate?: Candidate | null): string[] {
  const values = candidate?.qualified_professions && candidate.qualified_professions.length > 0
    ? candidate.qualified_professions
    : candidate?.profession
      ? [candidate.profession]
      : [];
  if (mode === 'posting' && job?.profession && values.length === 0) return [job.profession];
  return values;
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

function documentMapToRecords(
  candidateId: string,
  docs: Record<string, DocumentValue>
): CandidateDocument[] {
  return Object.entries(docs).map(([documentType, value]) => ({
    id: value.document_id || `${candidateId}-${documentType}`,
    candidate_id: candidateId,
    document_type: documentType,
    status: value.status as CandidateDocument['status'],
    file_path: value.file_path || null,
    file_name: value.file_name || null,
    uploaded_at: null,
    expires_at: null,
    is_current: true,
    archived_at: null,
    created_at: '',
  }));
}

function initialOpenModules(
  mode: Mode,
  job: Job | null | undefined,
  candidate: Candidate,
  docs?: Record<string, Pick<DocumentRecord, 'id' | 'status' | 'file_name' | 'file_path'>>
): ModuleId[] {
  const modules: ModuleId[] = [];
  const shifts = uniqueStrings([...(mode === 'posting' ? [job?.shift] : []), ...(candidate.preferred_shifts || [])]);
  const regions = initialRegions(mode, job, candidate);

  if (!(candidate.first_name && candidate.last_name && (candidate.phone || candidate.email) && candidate.city_residence && candidate.region_residence)) {
    modules.push('identity');
  }
  const qualified = initialQualifiedProfessions(mode, job, candidate);
  if (qualified.length === 0 || !candidate.years_experience || !candidate.work_authorization || (candidate.languages || []).length === 0) {
    modules.push('work');
  }
  if (!candidate.start_availability || shifts.length === 0 || (mode === 'spontaneous' && !regions.some((region) => region.region))) {
    modules.push('availability');
  }
  if (docs?.CV?.status !== 'Reçu' || !docs?.CV?.file_path || !candidate.consent_data || (job?.extra_questions || []).some((question) => question.required)) {
    modules.push('documents');
  }
  return modules.length > 0 ? modules : ['documents'];
}

function formToCandidate(initial: Candidate, form: FormState): Candidate {
  return {
    ...initial,
    first_name: form.first_name,
    last_name: form.last_name,
    phone: form.phone || null,
    email: form.email || null,
    preferred_contact: form.preferred_contact || null,
    best_contact_time: form.best_contact_time || null,
    city_residence: form.city_residence || null,
    region_residence: form.region_residence || null,
    postal_code: form.postal_code || null,
    profession: form.profession || null,
    qualified_professions: form.qualified_professions,
    years_experience: form.years_experience || null,
    permit_status: form.permit_status || null,
    permit_number: form.permit_number || null,
    languages: form.languages,
    work_authorization: form.work_authorization || null,
    mobility: form.mobility || null,
    start_availability: form.start_availability || null,
    exact_start_date: form.exact_start_date || null,
    preferred_hours: form.preferred_hours || null,
    preferred_shifts: form.shifts_accepted,
    preferred_regions: form.region_choices,
    preferred_departments: form.preferred_departments,
    preferred_establishments: form.preferred_establishments || null,
    avoided_establishments: form.avoided_establishments || null,
    housing_required: form.housing_required || null,
    transport_available: form.transport_available || null,
    salary_expectations: form.salary_expectations || null,
    constraints: form.constraints || null,
    consent_data: form.consent_data,
    mailing_list_opt_in: form.mailing_list_opt_in,
  };
}

export default function CandidateApplicationFlow({
  mode,
  job,
  initial,
  initialDocuments,
  locale = 'fr',
}: CandidateApplicationFlowProps) {
  const router = useRouter();
  const isPosting = mode === 'posting';
  const extraQuestions: ExtraQuestion[] = isPosting && job?.extra_questions ? job.extra_questions : [];
  const en = locale === 'en';
  const tr = (fr: string, enText: string) => (en ? enText : fr);

  const [form, setForm] = useState<FormState>({
    first_name: initial.first_name || '',
    last_name: initial.last_name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    preferred_contact: initial.preferred_contact || '',
    best_contact_time: initial.best_contact_time || '',
    city_residence: initial.city_residence || '',
    region_residence: initial.region_residence || '',
    postal_code: initial.postal_code || '',
    profession: isPosting ? job?.profession || initial.profession || '' : initial.profession || '',
    qualified_professions: initialQualifiedProfessions(mode, job, initial),
    years_experience: initial.years_experience || '',
    permit_status: initial.permit_status || '',
    permit_number: initial.permit_number || '',
    languages: initial.languages || [],
    work_authorization: initial.work_authorization || '',
    mobility: initial.mobility || '',
    start_availability: initial.start_availability || '',
    preferred_hours: initial.preferred_hours || '',
    exact_start_date: initial.exact_start_date || '',
    shifts_accepted: uniqueStrings([...(isPosting ? [job?.shift] : []), ...(initial.preferred_shifts || [])]),
    weekend_two_in_one: '',
    region_choices: initialRegions(mode, job, initial),
    preferred_departments: uniqueStrings([
      ...(isPosting ? [job?.department] : []),
      ...(initial.preferred_departments || []),
    ]),
    preferred_establishments: initial.preferred_establishments || '',
    avoided_establishments: initial.avoided_establishments || '',
    housing_required: initial.housing_required || '',
    transport_available: initial.transport_available || '',
    salary_expectations: initial.salary_expectations || '',
    constraints: initial.constraints || '',
    recruiter_comment: '',
    extra_answers: {},
    similar_mandates: initial.mailing_list_opt_in ? 'Oui' : '',
    documents: initialDocumentValues(initialDocuments),
    consent_data: initial.consent_data ?? false,
    mailing_list_opt_in: initial.mailing_list_opt_in ?? !isPosting,
  });
  const [openModules, setOpenModules] = useState<ModuleId[]>(() =>
    initialOpenModules(mode, job, initial, initialDocuments)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleModule(module: ModuleId) {
    setOpenModules((current) =>
      current.includes(module) ? current.filter((item) => item !== module) : [...current, module]
    );
  }

  function updateRegionChoice(idx: number, patch: Partial<RegionChoice>) {
    setForm((current) => ({
      ...current,
      region_choices: current.region_choices.map((region, index) =>
        index === idx ? { ...region, ...patch } : region
      ),
    }));
  }

  function addRegionChoice() {
    setForm((current) => ({
      ...current,
      region_choices: [...current.region_choices, emptyRegionChoice()],
    }));
  }

  function removeRegionChoice(idx: number) {
    setForm((current) => ({
      ...current,
      region_choices: current.region_choices.filter((_, index) => index !== idx),
    }));
  }

  const documentList = useMemo(() => {
    const requestedByPosting = new Set(job?.required_documents || []);
    const docs: Array<{ type: string; required: boolean; requestedByPosting: boolean }> = [
      { type: 'CV', required: true, requestedByPosting: requestedByPosting.has('CV') },
    ];
    if (form.qualified_professions.some((profession) => professionRequiresPermit(profession)) || professionRequiresPermit(form.profession)) {
      docs.push({
        type: "Permis d'exercice",
        required: false,
        requestedByPosting: requestedByPosting.has("Permis d'exercice"),
      });
    }
    docs.push({ type: 'RCR', required: false, requestedByPosting: requestedByPosting.has('RCR') });
    if (form.qualified_professions.some((profession) => professionRequiresPDSB(profession)) || professionRequiresPDSB(form.profession)) {
      docs.push({ type: 'PDSB', required: false, requestedByPosting: requestedByPosting.has('PDSB') });
    }
    docs.push({
      type: 'Carnet de vaccination',
      required: false,
      requestedByPosting: requestedByPosting.has('Carnet de vaccination'),
    });
    return docs;
  }, [form.profession, form.qualified_professions, job]);

  const mandateQuestionsAnswered =
    extraQuestions.length === 0 ||
    extraQuestions.every((question) => {
      const value = form.extra_answers[question.id];
      return !question.required || (value != null && value !== '');
    });

  const candidateForReadiness = formToCandidate(initial, form);
  const documentRecords = documentMapToRecords(initial.id, form.documents);
  const readiness = buildCandidateReadiness({
    candidate: candidateForReadiness,
    documents: documentRecords,
    job,
    mandateQuestionsAnswered,
  });
  const readinessScore = readinessPercent(readiness);
  const blockingMissing = readiness.filter((block) => block.blocking && !block.ready);

  const moduleStatus = {
    identity: readiness.find((block) => block.id === 'identity'),
    work: readiness.find((block) => block.id === 'work'),
    availability: readiness.find((block) => block.id === 'availability'),
    documents: readiness.find((block) => block.id === 'documents') || readiness.find((block) => block.id === 'mandate'),
  };

  const completion = useMemo(() => {
    return computeCompletionScore({
      hasContact: !!(form.first_name && form.last_name && (form.phone || form.email)),
      hasResidence: !!(form.city_residence && form.region_residence),
      hasProfession: form.qualified_professions.length > 0 || !!form.profession,
      hasAvailability: !!form.start_availability && form.shifts_accepted.length > 0,
      hasRegions: form.region_choices.some((region) => region.region) || isPosting,
      hasExperience: !!form.years_experience,
      cvProvided: form.documents.CV?.status === 'Reçu' && !!form.documents.CV?.file_path,
      consent: form.consent_data,
      postingQuestionsAnswered: !isPosting || mandateQuestionsAnswered,
    });
  }, [form, isPosting, mandateQuestionsAnswered]);

  const needsPermitField = form.qualified_professions.some((profession) => professionRequiresPermit(profession)) || professionRequiresPermit(form.profession);
  const needsWeekendCheck = isPosting && mandateRequiresWeekendCheck(job?.mandate_type);

  function openForError(key: string) {
    const map: Record<string, ModuleId> = {
      first_name: 'identity',
      last_name: 'identity',
      phone: 'identity',
      email: 'identity',
      city_residence: 'identity',
      region_residence: 'identity',
      profession: 'work',
      qualified_professions: 'work',
      years_experience: 'work',
      work_authorization: 'work',
      languages: 'work',
      start_availability: 'availability',
      shifts_accepted: 'availability',
      region_choices: 'availability',
      cv: 'documents',
      consent_data: 'documents',
    };
    const module = map[key] || (key.startsWith('q_') ? 'documents' : 'identity');
    setOpenModules((current) => (current.includes(module) ? current : [...current, module]));
  }

  function validateLocal() {
    const errors: Record<string, string> = {};
    if (!form.first_name.trim()) errors.first_name = tr('Prenom requis', 'First name is required');
    if (!form.last_name.trim()) errors.last_name = tr('Nom requis', 'Last name is required');
    if (!form.phone.trim() && !form.email.trim()) errors.phone = tr('Telephone ou courriel requis', 'Phone or email is required');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = tr('Courriel invalide', 'Invalid email');
    if (!form.city_residence.trim()) errors.city_residence = tr('Ville requise', 'City is required');
    if (!form.region_residence) errors.region_residence = tr('Region requise', 'Region is required');
    if (form.qualified_professions.length === 0) {
      errors.qualified_professions = tr('Choisissez au moins un metier admissible', 'Select at least one eligible profession');
    } else if (isPosting && job?.profession && !form.qualified_professions.includes(job.profession)) {
      errors.qualified_professions = tr(
        `Ajoutez ${job.profession} seulement si le candidat est admissible a ce mandat`,
        `Add ${displayValue(locale, job.profession)} only if you are eligible for this assignment`
      );
    }
    if (!form.years_experience) errors.years_experience = tr('Experience requise', 'Experience is required');
    if (!form.work_authorization) errors.work_authorization = tr('Autorisation requise', 'Work authorization is required');
    if (form.languages.length === 0) errors.languages = tr('Choisissez au moins une langue', 'Select at least one language');
    if (!form.start_availability) errors.start_availability = tr('Disponibilite requise', 'Availability is required');
    if (form.shifts_accepted.length === 0) errors.shifts_accepted = tr('Choisissez au moins un quart', 'Select at least one shift');
    if (!isPosting && !form.region_choices.some((region) => region.region)) {
      errors.region_choices = tr('Choisissez au moins une region', 'Select at least one region');
    }
    if (form.documents.CV?.status !== 'Reçu' || !form.documents.CV?.file_path) {
      errors.cv = tr('CV requis avant envoi', 'CV required before sending');
    }
    if (!form.consent_data) errors.consent_data = tr('Consentement obligatoire', 'Consent is required');
    for (const question of extraQuestions) {
      if (!question.required) continue;
      const value = form.extra_answers[question.id];
      if (value == null || value === '') errors[`q_${question.id}`] = tr('Reponse requise', 'Answer required');
    }
    setFieldErrors(errors);
    const firstKey = Object.keys(errors)[0];
    if (firstKey) openForError(firstKey);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validateLocal()) {
      setError(tr('Completez les elements bloquants, puis envoyez.', 'Complete the blocking items, then send.'));
      requestAnimationFrame(() => {
        document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          qualified_professions: form.qualified_professions,
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
          qualified_professions: form.qualified_professions,
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
        completion_score: Math.max(completion, readinessScore),
        source: 'web',
        documents: documentList.map((document) => ({
          document_id: form.documents[document.type]?.document_id || null,
          document_type: document.type,
          status: form.documents[document.type]?.status || 'À recevoir',
          file_path: form.documents[document.type]?.file_path || null,
          file_name: form.documents[document.type]?.file_name || null,
        })),
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || tr("Impossible d'enregistrer la candidature.", 'Unable to save the application.'));
      router.push(`${localizedPath(locale, 'thanks')}?type=${mode}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : tr('Erreur inconnue.', 'Unknown error.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4 min-w-0">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                {blockingMissing.length === 0 ? tr('Pret a envoyer', 'Ready to send') : tr('A completer', 'To complete')}
              </p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-fg">
                {blockingMissing.length === 0
                  ? tr('Tout est en place. Confirmez l’envoi.', 'Everything is ready. Confirm sending.')
                  : en
                    ? `${blockingMissing.length} block${blockingMissing.length > 1 ? 's' : ''} to complete`
                    : `${blockingMissing.length} bloc${blockingMissing.length > 1 ? 's' : ''} à traiter`}
              </h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">
                {tr('Les blocs deja complets restent fermes. Ouvrez seulement ce qui a change ou ce qui manque.', 'Completed sections stay closed. Open only what changed or what is missing.')}
              </p>
            </div>
            <div className="min-w-[160px] rounded-md border border-border bg-muted/40 px-4 py-3">
              <p className="text-[12px] uppercase tracking-wider text-fg-subtle">Readiness ATS</p>
              <p className="mt-1 text-[28px] font-semibold tabular-nums text-fg">{readinessScore}%</p>
            </div>
          </div>
        </div>

        <FlowModule
          id="identity"
          title={tr('Dossier', 'File')}
          ready={!!moduleStatus.identity?.ready}
          summary={moduleStatus.identity?.summary || ''}
          missing={moduleStatus.identity?.missing || []}
          open={openModules.includes('identity')}
          onToggle={() => toggleModule('identity')}
          locale={locale}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr('Prenom', 'First name')} required error={fieldErrors.first_name}>
              <input className="input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label={tr('Nom', 'Last name')} required error={fieldErrors.last_name}>
              <input className="input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} autoComplete="family-name" />
            </Field>
            <Field label={tr('Telephone', 'Phone')} required error={fieldErrors.phone} helper={tr('Telephone ou courriel requis.', 'Phone or email required.')}>
              <input className="input" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
            </Field>
            <Field label={tr('Courriel', 'Email')} error={fieldErrors.email}>
              <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" />
            </Field>
            <Field label={tr('Ville de residence', 'City of residence')} required error={fieldErrors.city_residence}>
              <input className="input" value={form.city_residence} onChange={(e) => set('city_residence', e.target.value)} />
            </Field>
            <Field label={tr('Region de residence', 'Region of residence')} required error={fieldErrors.region_residence}>
              <select className="input" value={form.region_residence} onChange={(e) => set('region_residence', e.target.value)}>
                <option value="">{tr('Choisir une region', 'Select a region')}</option>
                {QUEBEC_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr('Meilleur moyen de contact', 'Preferred contact method')}>
              <SegmentedChoices options={CONTACT_PREFS} value={form.preferred_contact} onChange={(value) => set('preferred_contact', value as string)} />
            </Field>
            <Field label={tr('Meilleur moment', 'Best time')}>
              <SegmentedChoices options={CONTACT_TIMES} value={form.best_contact_time} onChange={(value) => set('best_contact_time', value as string)} />
            </Field>
          </div>
        </FlowModule>

        <FlowModule
          id="work"
          title={tr('Metier', 'Work')}
          ready={!!moduleStatus.work?.ready}
          summary={moduleStatus.work?.summary || ''}
          missing={moduleStatus.work?.missing || []}
          open={openModules.includes('work')}
          onToggle={() => toggleModule('work')}
          locale={locale}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={isPosting ? tr('Metier du mandat', 'Assignment profession') : tr('Metier principal', 'Primary profession')}>
              {isPosting ? (
                <p className="rounded-md border border-border bg-muted px-3.5 py-2.5 text-[15px] text-fg">{displayValue(locale, job?.profession || form.profession)}</p>
              ) : (
                <select className="input" value={form.profession} onChange={(e) => {
                  const next = e.target.value;
                  setForm((current) => ({
                    ...current,
                    profession: next,
                    qualified_professions: next && !current.qualified_professions.includes(next)
                      ? [next, ...current.qualified_professions]
                      : current.qualified_professions,
                  }));
                }}>
                  <option value="">{tr('Choisir', 'Select')}</option>
                  {PROFESSIONS.map((profession) => <option key={profession} value={profession}>{displayValue(locale, profession)}</option>)}
                </select>
              )}
            </Field>
            <Field label={tr("Annees d'experience", 'Years of experience')} required error={fieldErrors.years_experience}>
              <SegmentedChoices options={YEARS_EXPERIENCE} value={form.years_experience} onChange={(value) => set('years_experience', value as string)} />
            </Field>
          </div>

          <Field
            label={tr('Metiers admissibles', 'Eligible professions')}
            required
            error={fieldErrors.qualified_professions}
            helper={tr('Selectionnez seulement les titres pour lesquels le candidat peut reellement etre presente.', 'Select only the titles for which you can truly be presented.')}
          >
            <SegmentedChoices
              options={PROFESSIONS}
              value={form.qualified_professions}
              multi
              onChange={(value) => {
                const next = value as string[];
                setForm((current) => ({
                  ...current,
                  qualified_professions: next,
                  profession: current.profession && next.includes(current.profession)
                    ? current.profession
                    : next[0] || current.profession,
                }));
              }}
            />
            {isPosting && job?.profession && !form.qualified_professions.includes(job.profession) && (
              <p className="mt-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-[13px] text-warning">
                {tr(
                  `Ce mandat demande ${job.profession}. Ajoutez ce metier seulement si le candidat est admissible a ce titre.`,
                  `This assignment requires ${displayValue(locale, job.profession)}. Add this profession only if you are eligible for this title.`
                )}
              </p>
            )}
          </Field>

          {needsPermitField && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-border bg-muted/30 p-4">
              <Field label={tr("Permis d'exercice", 'Professional permit')}>
                <SegmentedChoices options={PERMIT_STATUSES} value={form.permit_status} onChange={(value) => set('permit_status', value as string)} />
              </Field>
              <Field label={tr('Numero de permis', 'Permit number')}>
                <input className="input" value={form.permit_number} onChange={(e) => set('permit_number', e.target.value)} />
              </Field>
            </div>
          )}

          <Field label={tr('Langues de travail', 'Working languages')} required error={fieldErrors.languages}>
            <SegmentedChoices options={LANGUAGES} value={form.languages} onChange={(value) => set('languages', value as string[])} multi />
          </Field>
          <Field label={tr('Autorisation de travailler au Canada', 'Authorization to work in Canada')} required error={fieldErrors.work_authorization}>
            <SegmentedChoices options={WORK_AUTH} value={form.work_authorization} onChange={(value) => set('work_authorization', value as string)} />
          </Field>
        </FlowModule>

        <FlowModule
          id="availability"
          title={tr('Disponibilites', 'Availability')}
          ready={!!moduleStatus.availability?.ready}
          summary={moduleStatus.availability?.summary || ''}
          missing={moduleStatus.availability?.missing || []}
          open={openModules.includes('availability')}
          onToggle={() => toggleModule('availability')}
          locale={locale}
        >
          <Field label={tr('Depart possible', 'Possible start')} required error={fieldErrors.start_availability}>
            <SegmentedChoices options={START_AVAILABILITY} value={form.start_availability} onChange={(value) => set('start_availability', value as string)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr('Heures souhaitees', 'Preferred hours')}>
              <input className="input" value={form.preferred_hours} onChange={(e) => set('preferred_hours', e.target.value)} placeholder={tr('Ex. temps plein, 24 a 32 h', 'Ex. full time, 24 to 32 h')} />
            </Field>
            <Field label={tr('Date exacte si connue', 'Exact date if known')}>
              <input className="input" type="date" value={form.exact_start_date} onChange={(e) => set('exact_start_date', e.target.value)} />
            </Field>
          </div>
          <Field label={tr('Quarts acceptes', 'Accepted shifts')} required error={fieldErrors.shifts_accepted}>
            <SegmentedChoices options={SHIFTS} value={form.shifts_accepted} onChange={(value) => set('shifts_accepted', value as string[])} multi />
          </Field>
          {needsWeekendCheck && (
            <Field label={tr('Fin de semaine sur deux acceptable ?', 'Every second weekend acceptable?')}>
              <SegmentedChoices options={YES_NO_DISCUSS} value={form.weekend_two_in_one} onChange={(value) => set('weekend_two_in_one', value as string)} />
            </Field>
          )}

          <div data-error={!!fieldErrors.region_choices} className="space-y-3">
            {form.region_choices.map((regionChoice, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-surface p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Field label={isPosting ? tr('Region du mandat', 'Assignment region') : `${tr('Region', 'Region')} ${idx + 1}`}>
                    <select className="input" value={regionChoice.region} onChange={(e) => updateRegionChoice(idx, { region: e.target.value })}>
                      <option value="">{tr('Choisir une region', 'Select a region')}</option>
                      {QUEBEC_REGIONS.map((region) => <option key={region} value={region}>{region}</option>)}
                    </select>
                  </Field>
                  {form.region_choices.length > 1 && (
                    <button type="button" onClick={() => removeRegionChoice(idx)} className="btn-ghost btn-sm self-end">{tr('Retirer', 'Remove')}</button>
                  )}
                </div>
                <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-fg"
                    checked={regionChoice.all_region}
                    onChange={(e) => updateRegionChoice(idx, { all_region: e.target.checked, cities: e.target.checked ? [] : regionChoice.cities })}
                  />
                  <span className="text-[14px] text-fg">{tr('Toute la region', 'Entire region')}</span>
                </label>
                {!regionChoice.all_region && (
                  <div className="mt-3">
                    <Field label={tr('Villes acceptees', 'Accepted cities')} helper={tr('Separees par des virgules.', 'Separated by commas.')}>
                      <input
                        className="input"
                        value={regionChoice.cities.join(', ')}
                        onChange={(e) =>
                          updateRegionChoice(idx, {
                            cities: e.target.value.split(',').map((city) => city.trim()).filter(Boolean),
                          })
                        }
                      />
                    </Field>
                  </div>
                )}
              </div>
            ))}
            {fieldErrors.region_choices && <p className="error-text" data-error="true">{fieldErrors.region_choices}</p>}
            {!isPosting && (
              <button type="button" onClick={addRegionChoice} className="btn-secondary btn-sm">{tr('Ajouter une region', 'Add a region')}</button>
            )}
          </div>

          <DepartmentGroups
            value={form.preferred_departments}
            onChange={(value) => set('preferred_departments', value)}
            label={isPosting ? tr('Departements similaires acceptes', 'Similar departments accepted') : tr('Departements souhaites', 'Preferred departments')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={tr('Mobilite', 'Mobility')}>
              <SegmentedChoices options={MOBILITY} value={form.mobility} onChange={(value) => set('mobility', value as string)} />
            </Field>
            <Field label="Transport">
              <SegmentedChoices options={TRANSPORT_CHOICES} value={form.transport_available} onChange={(value) => set('transport_available', value as string)} />
            </Field>
            <Field label={tr('Hebergement', 'Housing')}>
              <SegmentedChoices options={HOUSING_CHOICES} value={form.housing_required} onChange={(value) => set('housing_required', value as string)} />
            </Field>
          </div>
        </FlowModule>

        <FlowModule
          id="documents"
          title={tr('CV et envoi', 'CV and submission')}
          ready={!!readiness.find((block) => block.id === 'documents')?.ready && mandateQuestionsAnswered && form.consent_data}
          summary={readiness.find((block) => block.id === 'documents')?.summary || ''}
          missing={[
            ...(readiness.find((block) => block.id === 'documents')?.missing || []),
            ...(!mandateQuestionsAnswered ? [tr('questions du mandat', 'assignment questions')] : []),
            ...(!form.consent_data ? [tr('consentement', 'consent')] : []),
          ]}
          open={openModules.includes('documents')}
          onToggle={() => toggleModule('documents')}
          locale={locale}
        >
          <div className="space-y-3" data-error={!!fieldErrors.cv}>
            {documentList.map((document) => (
              <DocumentUploadChoice
                key={document.type}
                documentType={document.type}
                required={document.required}
                requestedByPosting={document.requestedByPosting}
                value={form.documents[document.type]}
                locale={locale}
                onChange={(value) => set('documents', { ...form.documents, [document.type]: value })}
              />
            ))}
          </div>
          {fieldErrors.cv && <p className="error-text" data-error="true">{fieldErrors.cv}</p>}

          {isPosting && extraQuestions.length > 0 && (
            <div className="space-y-4 border-t border-border pt-5">
              <h3 className="text-[16px] font-semibold text-fg">{tr('Questions du mandat', 'Assignment questions')}</h3>
              {extraQuestions.map((question) => (
                <ExtraQuestionField
                  key={question.id}
                  question={question}
                  value={form.extra_answers[question.id]}
                  error={fieldErrors[`q_${question.id}`]}
                  onChange={(value) => set('extra_answers', { ...form.extra_answers, [question.id]: value })}
                  locale={locale}
                />
              ))}
            </div>
          )}

          {isPosting ? (
            <Field label={tr("Si ce mandat n'est plus disponible, voulez-vous recevoir des mandats similaires ?", 'If this assignment is no longer available, do you want to receive similar assignments?')}>
              <SegmentedChoices options={YES_NO_DISCUSS} value={form.similar_mandates} onChange={(value) => set('similar_mandates', value as string)} />
            </Field>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={tr('Attentes salariales', 'Salary expectations')}>
                <input className="input" value={form.salary_expectations} onChange={(e) => set('salary_expectations', e.target.value)} />
              </Field>
              <Field label={tr('Contraintes importantes', 'Important constraints')}>
                <textarea className="textarea" value={form.constraints} onChange={(e) => set('constraints', e.target.value)} />
              </Field>
              <Field label={tr('Note au recruteur', 'Note to recruiter')}>
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
              <span className="text-[14px] leading-relaxed text-fg">
                {tr("J'accepte que Sanitas utilise mes informations pour analyser ma candidature et me contacter.", 'I agree that Sanitas may use my information to review my application and contact me.')}
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
              <span className="text-[14px] leading-relaxed text-fg">
                {tr('Recevoir les nouveaux mandats compatibles avec mon profil.', 'Receive new assignments compatible with my profile.')}
              </span>
            </label>
          </div>
        </FlowModule>

        {error && (
          <div className="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                {tr('Finaliser', 'Finalize')}
              </p>
              <h3 className="mt-1 text-[18px] font-semibold text-fg">
                {blockingMissing.length === 0
                  ? tr('Votre dossier est pret.', 'Your file is ready.')
                  : tr('Completez les elements bloquants avant l’envoi.', 'Complete blocking items before sending.')}
              </h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">
                {tr('Vous pouvez revenir modifier votre dossier plus tard. L’envoi cree ou met a jour une seule candidature.', 'You can edit your file later. Sending creates or updates a single application.')}
              </p>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary shrink-0">
              {submitting ? tr('Envoi...', 'Sending...') : tr('Envoyer ma candidature', 'Send my application')}
            </button>
          </div>
        </div>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-fg-subtle">
            {tr("Decision d'envoi", 'Submission decision')}
          </p>
          <h3 className="mt-2 text-[18px] font-semibold text-fg">
            {isPosting ? tr('Mandat precis', 'Specific assignment') : tr('Candidature spontanee', 'Spontaneous application')}
          </h3>
          {job && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">
              {jobTitle(job, locale)}
              {job.establishment ? ` | ${job.establishment}` : ''}
            </p>
          )}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] text-fg-subtle">{tr('Blocages', 'Blockers')}</span>
              <span className="text-[13px] font-medium tabular-nums text-fg">{blockingMissing.length}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-accent" style={{ width: `${Math.max(completion, readinessScore)}%` }} />
            </div>
          </div>
          <ul className="mt-5 space-y-2.5">
            {readiness.map((block) => (
              <li key={block.id} className="flex items-start gap-2 text-[13.5px]">
                <span className={block.ready ? 'mt-0.5 text-success' : 'mt-0.5 text-warning'} aria-hidden>
                  {block.ready ? '✓' : '•'}
                </span>
                <span>
                  <span className={block.ready ? 'text-fg' : 'text-fg-muted'}>{displayValue(locale, block.label)}</span>
                  {!block.ready && block.missing.length > 0 && (
                    <span className="block text-[12px] text-fg-subtle">{block.missing.map((item) => displayValue(locale, item)).join(', ')}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12.5px] leading-relaxed text-fg-subtle">
            {tr('En ligne: Google obligatoire. Hors ligne:', 'Online: Google is required. Offline:')}{' '}
            <a href={COMPANY.phoneHref} className="underline hover:text-fg">
              {tr('appelez', 'call')} {COMPANY.phone}
            </a>
            .
          </p>
        </div>
      </aside>
    </form>
  );
}

function FlowModule({
  title,
  ready,
  summary,
  missing,
  open,
  onToggle,
  children,
  locale = 'fr',
}: {
  id: ModuleId;
  title: string;
  ready: boolean;
  summary: string;
  missing: string[];
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  locale?: Locale;
}) {
  const en = locale === 'en';
  return (
    <section className="rounded-lg border border-border bg-surface shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40"
      >
        <span>
          <span className="flex items-center gap-2">
            <span className={ready ? 'tag bg-success-soft text-success' : 'tag bg-warning-soft text-warning'}>
              {ready ? (en ? 'Complete' : 'Complet') : en ? 'To complete' : 'A completer'}
            </span>
            <span className="text-[17px] font-semibold text-fg">{title}</span>
          </span>
          <span className="mt-1 block text-[13.5px] text-fg-muted">
            {ready
              ? displayValue(locale, summary)
              : missing.length > 0
                ? `${en ? 'Missing' : 'Manquant'}: ${missing.map((item) => displayValue(locale, item)).join(', ')}`
                : displayValue(locale, summary)}
          </span>
        </span>
        <span className="text-[13px] font-medium text-accent">{open ? (en ? 'Close' : 'Fermer') : en ? 'Edit' : 'Modifier'}</span>
      </button>
      {open && <div className="space-y-5 border-t border-border px-5 py-5">{children}</div>}
    </section>
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
      {helper && !error && <p className="helper mt-1.5">{helper}</p>}
      {error && <p className="error-text" data-error="true">{error}</p>}
    </div>
  );
}

function ExtraQuestionField({
  question,
  value,
  error,
  onChange,
  locale = 'fr',
}: {
  question: ExtraQuestion;
  value: string | boolean | undefined;
  error?: string;
  onChange: (value: string | boolean) => void;
  locale?: Locale;
}) {
  if (question.type === 'textarea') {
    return (
      <Field label={question.label} required={question.required} error={error}>
        <textarea className="textarea" value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
      </Field>
    );
  }
  if (question.type === 'select') {
    return (
      <Field label={question.label} required={question.required} error={error}>
        <select className="input" value={(value as string) || ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">{locale === 'en' ? 'Select...' : 'Choisir...'}</option>
          {(question.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </Field>
    );
  }
  if (question.type === 'yes_no') {
    return (
      <Field label={question.label} required={question.required} error={error}>
        <SegmentedChoices options={YES_NO_DISCUSS} value={(value as string) || ''} onChange={(next) => onChange(next as string)} />
      </Field>
    );
  }
  return (
    <Field label={question.label} required={question.required} error={error}>
      <input className="input" value={(value as string) || ''} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}
