// =====================================================================
// Agence Sanitas - Schémas Zod
// =====================================================================

import { z } from 'zod';

const nonEmpty = (label: string) => z.string().min(1, `${label} requis`).max(500);
const optionalString = z.string().max(2000).optional().nullable();

// ---------------------------------------------------------------------
// Candidate
// ---------------------------------------------------------------------
export const candidateSchema = z
  .object({
    first_name: nonEmpty('Prénom'),
    last_name: nonEmpty('Nom'),
    phone: z.string().max(40).optional().nullable(),
    email: z.string().email('Courriel invalide').max(200).optional().nullable().or(z.literal('')),
    preferred_contact: optionalString,
    best_contact_time: optionalString,
    city_residence: optionalString,
    region_residence: optionalString,
    postal_code: optionalString,
    profession: optionalString,
    qualified_professions: z.array(z.string()).default([]),
    work_authorization: optionalString,
    languages: z.array(z.string()).default([]),
    consent_data: z.boolean(),
    mailing_list_opt_in: z.boolean().default(false),
  })
  .refine(
    (v) => (v.phone && v.phone.trim().length > 0) || (v.email && v.email.trim().length > 0),
    { message: 'Téléphone ou courriel requis', path: ['phone'] }
  )
  .refine((v) => v.consent_data === true, {
    message: 'Le consentement est obligatoire',
    path: ['consent_data'],
  });

export type CandidateInput = z.infer<typeof candidateSchema>;

// ---------------------------------------------------------------------
// Extra questions (sur jobs)
// ---------------------------------------------------------------------
export const extraQuestionSchema = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(500),
  type: z.enum(['text', 'textarea', 'select', 'yes_no']),
  options: z.array(z.string().max(200)).optional(),
  required: z.boolean().default(false),
});

// ---------------------------------------------------------------------
// Job
// ---------------------------------------------------------------------
export const jobSchema = z.object({
  title: nonEmpty('Titre'),
  profession: nonEmpty('Profession'),
  job_title_id: z.string().uuid().optional().nullable(),
  region: nonEmpty('Région'),
  city: optionalString,
  establishment: optionalString,
  department: optionalString,
  shift: optionalString,
  schedule: optionalString,
  mandate_type: optionalString,
  start_date: optionalString,
  duration: optionalString,
  salary: optionalString,
  urgency: z.enum(['normal', 'high', 'urgent']).default('normal'),
  requirements: optionalString,
  particularities: optionalString,
  required_documents: z.array(z.string()).default([]),
  extra_questions: z.array(extraQuestionSchema).default([]),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
});

export type JobInput = z.infer<typeof jobSchema>;

// ---------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------
export const regionChoiceSchema = z.object({
  region: z.string().max(200).default(''),
  all_region: z.boolean().default(true),
  cities: z.array(z.string().max(200)).default([]),
});

export const submissionAnswersSchema = z.object({
  preferred_contact: optionalString,
  best_contact_time: optionalString,
  languages: z.array(z.string()).optional(),
  work_authorization: optionalString,
  city_residence: optionalString,
  region_residence: optionalString,
  postal_code: optionalString,
  profession: optionalString,
  qualified_professions: z.array(z.string()).optional(),
  years_experience: optionalString,
  permit_status: optionalString,
  permit_number: optionalString,
  mobility: optionalString,
  start_availability: optionalString,
  preferred_hours: optionalString,
  exact_start_date: optionalString,
  shifts_accepted: z.array(z.string()).optional(),
  weekend_two_in_one: optionalString,
  region_choices: z.array(regionChoiceSchema).optional(),
  preferred_establishments: optionalString,
  avoided_establishments: optionalString,
  preferred_departments: z.array(z.string()).optional(),
  housing_required: optionalString,
  transport_available: optionalString,
  similar_mandates: optionalString,
  salary_expectations: optionalString,
  constraints: optionalString,
  recruiter_comment: optionalString,
  extra_answers: z.record(z.union([z.string(), z.boolean()])).optional(),
});

export const submissionSchema = z
  .object({
    submission_type: z.enum(['posting', 'spontaneous']),
    job_id: z.string().uuid().optional().nullable(),
    candidate: candidateSchema,
    answers: submissionAnswersSchema,
    completion_score: z.number().int().min(0).max(100).default(0),
    source: optionalString,
    documents: z
      .array(
        z.object({
          document_id: z.string().uuid().optional().nullable(),
          document_type: z.string().min(1).max(100),
          status: z.enum(['À recevoir', 'Reçu', 'À renouveler', 'Non applicable']).default('À recevoir'),
          file_path: optionalString,
          file_name: optionalString,
        })
      )
      .default([]),
  })
  .refine(
    (v) => {
      if (v.submission_type === 'posting') return !!v.job_id;
      return true;
    },
    { message: 'job_id requis pour un mandat précis', path: ['job_id'] }
  )
  .refine(
    (v) => {
      if (v.submission_type === 'spontaneous') {
        return !!(
          v.candidate.profession ||
          v.answers.profession ||
          (v.candidate.qualified_professions || []).length > 0 ||
          (v.answers.qualified_professions || []).length > 0
        );
      }
      return true;
    },
    { message: 'Profession requise pour une candidature spontanée', path: ['answers', 'profession'] }
  )
  .refine(
    (v) => v.documents.some((d) => d.document_type === 'CV' && d.status === 'Reçu' && !!d.file_path),
    { message: 'CV requis pour envoyer une candidature', path: ['documents'] }
  );

export type SubmissionInput = z.infer<typeof submissionSchema>;
export const applicationSchema = submissionSchema;
export type ApplicationInput = z.infer<typeof applicationSchema>;

// ---------------------------------------------------------------------
// Note interne
// ---------------------------------------------------------------------
export const noteSchema = z
  .object({
    candidate_id: z.string().uuid().optional().nullable(),
    application_id: z.string().uuid().optional().nullable(),
    submission_id: z.string().uuid().optional().nullable(),
    job_id: z.string().uuid().optional().nullable(),
    note: z.string().min(1, 'Note requise').max(5000),
  })
  .refine((v) => !!(v.candidate_id || v.application_id || v.submission_id || v.job_id), {
    message: 'Un lien candidat, candidature ou poste est requis',
    path: ['candidate_id'],
  });

// ---------------------------------------------------------------------
// Status update
// ---------------------------------------------------------------------
export const statusUpdateSchema = z.object({
  application_id: z.string().uuid().optional(),
  submission_id: z.string().uuid().optional(),
  status: z.enum([
    'Nouveau',
    'À rappeler',
    'Contacté',
    'Documents manquants',
    'Prêt à présenter',
    'Présenté',
    'Placé',
    'Non disponible',
    'Refusé',
  ]),
  status_reason: z.string().max(1000).optional().nullable(),
}).refine((v) => !!(v.application_id || v.submission_id), {
  message: 'application_id requis',
  path: ['application_id'],
});

export const taskSchema = z.object({
  candidate_id: z.string().uuid().optional().nullable(),
  application_id: z.string().uuid().optional().nullable(),
  job_id: z.string().uuid().optional().nullable(),
  task_type: z.string().min(1).max(80).default('follow_up'),
  title: z.string().min(1, 'Titre requis').max(300),
  details: z.string().max(2000).optional().nullable(),
  due_at: z.string().optional().nullable(),
  status: z.enum(['open', 'done', 'cancelled']).default('open'),
});

// ---------------------------------------------------------------------
// Establishment request
// ---------------------------------------------------------------------
export const establishmentRequestSchema = z
  .object({
    establishment: nonEmpty('Nom de l\'établissement'),
    contact_name: nonEmpty('Personne contact'),
    function_title: optionalString,
    phone: z.string().max(40).optional().nullable(),
    email: z.string().email('Courriel invalide').max(200).optional().nullable().or(z.literal('')),
    region: optionalString,
    city: optionalString,
    department: optionalString,
    profession_requested: nonEmpty('Profession recherchée'),
    number_of_resources: z.number().int().positive().max(100).optional().nullable(),
    shift: optionalString,
    start_date: optionalString,
    duration: optionalString,
    urgency: optionalString,
    details: optionalString,
    consent_contact: z.boolean(),
  })
  .refine(
    (v) => (v.phone && v.phone.trim().length > 0) || (v.email && v.email.trim().length > 0),
    { message: 'Téléphone ou courriel requis', path: ['phone'] }
  )
  .refine((v) => v.consent_contact === true, {
    message: 'Le consentement est obligatoire',
    path: ['consent_contact'],
  });

export type EstablishmentRequestInput = z.infer<typeof establishmentRequestSchema>;

// ---------------------------------------------------------------------
// Contact message
// ---------------------------------------------------------------------
export const contactMessageSchema = z
  .object({
    request_type: optionalString,
    name: nonEmpty('Nom'),
    phone: z.string().max(40).optional().nullable(),
    email: z.string().email('Courriel invalide').max(200).optional().nullable().or(z.literal('')),
    message: z.string().min(1, 'Message requis').max(5000),
    consent_contact: z.boolean(),
  })
  .refine(
    (v) => (v.phone && v.phone.trim().length > 0) || (v.email && v.email.trim().length > 0),
    { message: 'Téléphone ou courriel requis', path: ['phone'] }
  )
  .refine((v) => v.consent_contact === true, {
    message: 'Le consentement est obligatoire',
    path: ['consent_contact'],
  });

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
