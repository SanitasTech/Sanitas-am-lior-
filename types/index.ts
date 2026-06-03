// =====================================================================
// Agence Sanitas - Types partages ATS V2
// =====================================================================

export type ApplicationType = 'posting' | 'spontaneous';
export type SubmissionType = ApplicationType;

export type ApplicationStatus =
  | 'Nouveau'
  | 'À appeler'
  | 'Qualifié'
  | 'Documents manquants'
  | 'Prêt à présenter'
  | 'Présenté'
  | 'Placé'
  | 'Refusé'
  | 'Inactif'
  // Legacy values kept readable while existing rows are migrated.
  | 'À rappeler'
  | 'Contacté'
  | 'Non disponible';
export type SubmissionStatus = ApplicationStatus;

export type EstablishmentRequestStatus =
  | 'Nouvelle'
  | 'À analyser'
  | 'En traitement'
  | 'Poste créé'
  | 'Fermée';

export type DocumentStatus = 'À recevoir' | 'Reçu' | 'À renouveler' | 'Non applicable';

export type DocumentType =
  | 'CV'
  | "Permis d'exercice"
  | 'RCR'
  | 'PDSB'
  | 'Carnet de vaccination';

export type Urgency = 'normal' | 'high' | 'urgent';
export type JobStatus = 'active' | 'inactive' | 'draft';
export type ExtraQuestionType = 'text' | 'textarea' | 'select' | 'yes_no';
export type RecruiterTaskStatus = 'open' | 'done' | 'cancelled';

export interface ExtraQuestion {
  id: string;
  label: string;
  type: ExtraQuestionType;
  options?: string[];
  required: boolean;
}

export interface RegionChoice {
  region: string;
  all_region: boolean;
  cities: string[];
}

export type MatchDecision =
  | 'present_now'
  | 'call_to_validate'
  | 'request_document'
  | 'do_not_propose';

export type MatchFitLevel = 'exact' | 'partial' | 'blocked';

export interface CandidatePreferenceSet {
  id?: string;
  candidate_id?: string;
  label: string;
  priority: number;
  professions: string[];
  regions: RegionChoice[];
  departments: string[];
  shifts: string[];
  mandate_types: string[];
  start_date?: string | null;
  mobility?: string | null;
  salary_floor?: string | null;
  constraints?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Job {
  id: string;
  title: string;
  title_en?: string | null;
  profession: string;
  job_title_id?: string | null;
  country?: string | null;
  eligible_countries?: string[];
  region: string;
  city: string | null;
  establishment: string | null;
  department: string | null;
  shift: string | null;
  schedule: string | null;
  mandate_type: string | null;
  start_date: string | null;
  duration: string | null;
  salary: string | null;
  urgency: Urgency;
  requirements: string | null;
  requirements_en?: string | null;
  particularities: string | null;
  particularities_en?: string | null;
  required_documents: string[];
  extra_questions: ExtraQuestion[];
  status: JobStatus;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobTitle {
  id: string;
  code: string | null;
  title: string;
  category: string | null;
  requires_permit: boolean;
  source_url: string | null;
  active: boolean;
}

export interface CandidateProfile {
  candidate_id: string;
  profession: string | null;
  qualified_professions: string[];
  years_experience: string | null;
  permit_status: string | null;
  permit_number: string | null;
  work_authorization: string | null;
  languages: string[];
  mobility: string | null;
  preferred_mandate_types: string[];
  preferred_establishments: string | null;
  avoided_establishments: string | null;
  salary_expectations: string | null;
  notes_for_recruiter: string | null;
  updated_at: string;
}

export interface CandidateAvailability {
  candidate_id: string;
  start_availability: string | null;
  exact_start_date: string | null;
  preferred_hours: string | null;
  preferred_shifts: string[];
  preferred_regions: RegionChoice[];
  preferred_departments: string[];
  housing_required: string | null;
  transport_available: string | null;
  constraints: string | null;
  updated_at: string;
}

export interface Candidate {
  id: string;
  auth_user_id?: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  preferred_contact: string | null;
  best_contact_time: string | null;
  city_residence: string | null;
  region_residence: string | null;
  postal_code: string | null;
  consent_data: boolean;
  consent_data_at: string | null;
  mailing_list_opt_in: boolean;
  mailing_list_opt_in_at: string | null;
  status: string;
  profile_completion_score?: number;
  last_active_at?: string | null;
  created_at: string;
  updated_at: string;

  profile?: CandidateProfile | null;
  availability?: CandidateAvailability | null;
  preference_sets?: CandidatePreferenceSet[];

  // Flat fields exposed to existing forms.
  profession?: string | null;
  qualified_professions?: string[];
  years_experience?: string | null;
  permit_status?: string | null;
  permit_number?: string | null;
  work_authorization?: string | null;
  languages: string[];
  mobility?: string | null;
  preferred_mandate_types?: string[];
  preferred_establishments?: string | null;
  avoided_establishments?: string | null;
  salary_expectations?: string | null;
  start_availability?: string | null;
  exact_start_date?: string | null;
  preferred_hours?: string | null;
  preferred_shifts?: string[];
  preferred_regions?: RegionChoice[];
  preferred_departments?: string[];
  housing_required?: string | null;
  transport_available?: string | null;
  constraints?: string | null;
}

export interface SubmissionAnswers {
  preferred_contact?: string;
  best_contact_time?: string;
  languages?: string[];
  work_authorization?: string;
  city_residence?: string;
  region_residence?: string;
  postal_code?: string;
  profession?: string;
  qualified_professions?: string[];
  years_experience?: string;
  permit_status?: string;
  permit_number?: string;
  mobility?: string;
  start_availability?: string;
  preferred_hours?: string;
  exact_start_date?: string;
  shifts_accepted?: string[];
  weekend_two_in_one?: string;
  region_choices?: RegionChoice[];
  preferred_establishments?: string;
  avoided_establishments?: string;
  preferred_departments?: string[];
  housing_required?: string;
  transport_available?: string;
  similar_mandates?: string;
  salary_expectations?: string;
  constraints?: string;
  recruiter_comment?: string;
  extra_answers?: Record<string, string | boolean>;
  preference_sets?: CandidatePreferenceSet[];
  preference_set_id?: string | null;
}

export interface CandidateDocument {
  id: string;
  candidate_id: string;
  document_type: string;
  status: DocumentStatus;
  file_path: string | null;
  file_name: string | null;
  uploaded_at: string | null;
  expires_at: string | null;
  is_current: boolean;
  archived_at: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}
export type DocumentRecord = CandidateDocument;

export interface Application {
  id: string;
  candidate_id: string;
  application_type: ApplicationType;
  submission_type?: ApplicationType;
  job_id: string | null;
  preference_set_id?: string | null;
  posting_snapshot: Partial<Job> | null;
  answers: SubmissionAnswers;
  completion_score: number;
  status: ApplicationStatus;
  status_reason: string | null;
  source: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  candidate?: Candidate;
  documents?: CandidateDocument[];
  application_documents?: ApplicationDocument[];
  job?: Job | null;
  match_score?: MatchScore | null;
}
export type Submission = Application;

export interface ApplicationDocument {
  id: string;
  application_id: string;
  candidate_document_id: string | null;
  document_type: string;
  status: DocumentStatus;
  file_path: string | null;
  file_name: string | null;
  created_at: string;
  document?: CandidateDocument | null;
}
export type SubmissionDocument = ApplicationDocument;

export interface MatchReason {
  label: string;
  state: 'ok' | 'warn' | 'block';
  detail: string;
  points: number;
}

export interface MatchScore {
  id: string;
  candidate_id: string;
  job_id: string;
  preference_set_id?: string | null;
  score: number;
  reasons: MatchReason[];
  blockers: MatchReason[];
  fit_level?: MatchFitLevel | null;
  decision?: MatchDecision | null;
  validation_questions?: string[];
  calculated_at: string;
}

export type MandateSearchBucket =
  | 'presentable'
  | 'to_validate'
  | 'document_blocked'
  | 'incompatible';

export interface MandateSearchInput {
  job_id?: string | null;
  title?: string | null;
  profession: string;
  job_title_id?: string | null;
  region: string;
  city?: string | null;
  establishment?: string | null;
  department?: string | null;
  shift?: string | null;
  schedule?: string | null;
  mandate_type?: string | null;
  start_date?: string | null;
  duration?: string | null;
  salary?: string | null;
  urgency?: Urgency;
  required_documents?: string[];
  min_experience?: string | null;
  languages?: string[];
  work_authorization?: string | null;
  mobility?: string | null;
  housing_required?: string | null;
  transport_available?: string | null;
  candidate_status?: string | null;
  last_active_days?: number | null;
  only_with_phone?: boolean;
  only_without_open_tasks?: boolean;
}

export interface MandateSearchResult {
  bucket: MandateSearchBucket;
  candidate: Candidate;
  score: number;
  priority_score: number;
  reasons: MatchReason[];
  blockers: MatchReason[];
  preference_set_id?: string | null;
  preference_set_label?: string | null;
  preference_set?: CandidatePreferenceSet | null;
  fit_level?: MatchFitLevel | null;
  decision?: MatchDecision | null;
  validation_questions: string[];
  missing_documents: string[];
  flags: {
    has_cv: boolean;
    has_required_documents: boolean;
    available_soon: boolean;
    already_applied: boolean;
    already_presented: boolean;
    previously_refused: boolean;
    never_contacted: boolean;
    has_open_tasks: boolean;
    has_overdue_tasks: boolean;
    has_phone: boolean;
  };
  applications: Application[];
  open_tasks: RecruiterTask[];
  documents: CandidateDocument[];
}

export interface MandateSearchResponse {
  ok: true;
  job: Job;
  counts: Record<MandateSearchBucket, number>;
  presentable: MandateSearchResult[];
  to_validate: MandateSearchResult[];
  document_blocked: MandateSearchResult[];
  incompatible: MandateSearchResult[];
}

export interface RecruiterTask {
  id: string;
  candidate_id: string | null;
  application_id: string | null;
  job_id: string | null;
  assigned_to: string | null;
  task_type: string;
  title: string;
  details: string | null;
  due_at: string | null;
  status: RecruiterTaskStatus;
  created_at: string;
  updated_at: string;
  candidate?: Candidate | null;
  application?: Application | null;
  job?: Job | null;
}

export interface InternalNote {
  id: string;
  candidate_id: string | null;
  application_id: string | null;
  job_id: string | null;
  recruiter_id: string | null;
  note: string;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  candidate_id: string | null;
  application_id: string | null;
  job_id: string | null;
  actor_id: string | null;
  event_type: string;
  event_payload: Record<string, unknown>;
  created_at: string;
}
export type SubmissionEvent = ActivityEvent;

export interface MessageTemplate {
  id: string;
  code: string;
  title: string;
  channel: string;
  subject: string | null;
  body: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EstablishmentRequest {
  id: string;
  establishment: string | null;
  contact_name: string | null;
  function_title: string | null;
  phone: string | null;
  email: string | null;
  region: string | null;
  city: string | null;
  department: string | null;
  profession_requested: string | null;
  number_of_resources: number | null;
  shift: string | null;
  start_date: string | null;
  duration: string | null;
  urgency: string | null;
  details: string | null;
  consent_contact: boolean;
  status: EstablishmentRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  request_type: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  consent_contact: boolean;
  status: string;
  created_at: string;
}
