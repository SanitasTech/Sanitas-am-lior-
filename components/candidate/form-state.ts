// =====================================================================
// Agence Sanitas - État du formulaire candidat (wizard)
// =====================================================================
//
// Types et helpers partagés par CandidateWizard et ses étapes.
// Conserve la forme de l'ancien FormState pour ne pas casser l'API
// `/api/applications` côté serveur.

import { professionRequiresPDSB, professionRequiresPermit } from '@/lib/constants';
import type { Candidate, CandidateDocument, DocumentRecord, Job, RegionChoice } from '@/types';

export type Mode = 'posting' | 'spontaneous';

export type StepId = 'identity' | 'work' | 'availability' | 'documents' | 'review';

export interface DocumentValue {
  document_id?: string | null;
  status: string;
  file_name?: string | null;
  file_path?: string | null;
}

export interface FormState {
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
  /** Créneaux date+heure proposés par le candidat pour être rappelé / rencontré. */
  interview_slots: string[];
}

// ---------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------

export function emptyRegionChoice(region = ''): RegionChoice {
  return { region, all_region: true, cities: [] };
}

export function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v)));
}

export function initialRegions(
  mode: Mode,
  job?: Job | null,
  candidate?: Candidate | null
): RegionChoice[] {
  if (mode === 'posting' && job?.region) return [emptyRegionChoice(job.region)];
  if (candidate?.preferred_regions && candidate.preferred_regions.length > 0) {
    return candidate.preferred_regions;
  }
  if (candidate?.region_residence) return [emptyRegionChoice(candidate.region_residence)];
  return [emptyRegionChoice()];
}

export function initialQualifiedProfessions(
  mode: Mode,
  job?: Job | null,
  candidate?: Candidate | null
): string[] {
  const values =
    candidate?.qualified_professions && candidate.qualified_professions.length > 0
      ? candidate.qualified_professions
      : candidate?.profession
        ? [candidate.profession]
        : [];
  if (mode === 'posting' && job?.profession && values.length === 0) return [job.profession];
  return values;
}

export function initialDocumentValues(
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

export function makeInitialFormState(
  mode: Mode,
  initial: Candidate,
  job?: Job | null,
  initialDocuments?: Record<string, Pick<DocumentRecord, 'id' | 'status' | 'file_name' | 'file_path'>>
): FormState {
  const isPosting = mode === 'posting';
  return {
    first_name: initial.first_name || '',
    last_name: initial.last_name || '',
    phone: initial.phone || '',
    email: initial.email || '',
    preferred_contact: initial.preferred_contact || '',
    best_contact_time: initial.best_contact_time || '',
    city_residence: initial.city_residence || '',
    region_residence: initial.region_residence || '',
    postal_code: initial.postal_code || '',
    profession: isPosting
      ? job?.profession || initial.profession || ''
      : initial.profession || '',
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
    shifts_accepted: uniqueStrings([
      ...(isPosting ? [job?.shift] : []),
      ...(initial.preferred_shifts || []),
    ]),
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
    interview_slots: [''],
  };
}

// ---------------------------------------------------------------------
// Conversion FormState -> Candidate (pour readiness ATS et payload)
// ---------------------------------------------------------------------

export function formToCandidate(initial: Candidate, form: FormState): Candidate {
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

export function documentMapToRecords(
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

/**
 * Liste des documents à présenter au candidat, dynamique selon profession.
 * Pour les inf./inf. aux. : Permis d'exercice ajouté. Pour les PAB : PDSB.
 */
export function buildDocumentList(form: FormState, job?: Job | null): Array<{
  type: string;
  required: boolean;
  requestedByPosting: boolean;
}> {
  const requestedByPosting = new Set(job?.required_documents || []);
  const list: Array<{ type: string; required: boolean; requestedByPosting: boolean }> = [
    { type: 'CV', required: true, requestedByPosting: requestedByPosting.has('CV') },
  ];
  const needsPermit =
    form.qualified_professions.some((p) => professionRequiresPermit(p)) ||
    professionRequiresPermit(form.profession);
  if (needsPermit) {
    list.push({
      type: "Permis d'exercice",
      required: false,
      requestedByPosting: requestedByPosting.has("Permis d'exercice"),
    });
  }
  list.push({ type: 'RCR', required: false, requestedByPosting: requestedByPosting.has('RCR') });
  const needsPDSB =
    form.qualified_professions.some((p) => professionRequiresPDSB(p)) ||
    professionRequiresPDSB(form.profession);
  if (needsPDSB) {
    list.push({
      type: 'PDSB',
      required: false,
      requestedByPosting: requestedByPosting.has('PDSB'),
    });
  }
  list.push({
    type: 'Carnet de vaccination',
    required: false,
    requestedByPosting: requestedByPosting.has('Carnet de vaccination'),
  });
  return list;
}

export const STEP_ORDER: StepId[] = ['identity', 'work', 'availability', 'documents', 'review'];

export function stepIndex(step: StepId): number {
  return STEP_ORDER.indexOf(step);
}
