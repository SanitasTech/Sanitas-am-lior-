import {
  computeMatchScore,
  hasCurrentDocument,
  hydrateCandidate,
} from '@/lib/ats';
import {
  isCandidateEligibleForMatching,
  normalizeApplicationStatus,
} from '@/lib/ats-operating-model';
import type {
  Application,
  Candidate,
  CandidateDocument,
  Job,
  MandateSearchBucket,
  MandateSearchInput,
  MandateSearchResult,
  MatchReason,
  RecruiterTask,
} from '@/types';

export interface CandidateSearchRecord {
  row: Record<string, unknown>;
  deletedJobIds?: string[];
}

const EXPERIENCE_RANK: Record<string, number> = {
  'Moins de 1 an': 0,
  '1 a 2 ans': 1,
  '1 Ã  2 ans': 1,
  '3 a 5 ans': 2,
  '3 Ã  5 ans': 2,
  '6 a 10 ans': 3,
  '6 Ã  10 ans': 3,
  '10 ans et plus': 4,
};

function normalizeText(value?: string | null) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function cleanArray(values?: string[] | null) {
  return Array.from(new Set((values || []).map((value) => value.trim()).filter(Boolean)));
}

function requiredDocumentsForSearch(input: MandateSearchInput, job: Job) {
  return Array.from(new Set(['CV', ...(job.required_documents || []), ...(input.required_documents || [])].filter(Boolean)));
}

function isSoon(candidate: Candidate) {
  const text = normalizeText(candidate.start_availability);
  if (text.includes('des que possible') || text.includes('cette semaine')) return true;
  if (candidate.exact_start_date) {
    const time = new Date(candidate.exact_start_date).getTime();
    if (Number.isFinite(time)) {
      const days = (time - Date.now()) / 86_400_000;
      return days <= 14;
    }
  }
  return false;
}

function isOverdue(task: RecruiterTask) {
  if (!task.due_at || task.status !== 'open') return false;
  return new Date(task.due_at).getTime() < Date.now();
}

function applicationForJob(applications: Application[], jobId?: string | null) {
  if (!jobId) return null;
  return applications.find((application) => application.job_id === jobId) || null;
}

function hasStatus(applications: Application[], statuses: string[], jobId?: string | null) {
  const normalized = new Set(statuses.map(normalizeApplicationStatus));
  return applications.some((application) => {
    if (jobId && application.job_id !== jobId) return false;
    return normalized.has(normalizeApplicationStatus(application.status));
  });
}

function candidateMatchesTextCriterion(current: string | null | undefined, expected: string | null | undefined) {
  if (!expected) return true;
  if (!current) return null;
  return normalizeText(current) === normalizeText(expected);
}

function addValidation(
  questions: string[],
  reasons: MatchReason[],
  label: string,
  detail: string,
  points = 0
) {
  questions.push(`${label}: ${detail}`);
  reasons.push({ label, detail, state: 'warn', points });
}

function additionalValidationQuestions(
  input: MandateSearchInput,
  candidate: Candidate,
  tasks: RecruiterTask[],
  reasons: MatchReason[]
) {
  const questions: string[] = [];

  const minRank = input.min_experience ? EXPERIENCE_RANK[input.min_experience] : undefined;
  const candidateRank = candidate.years_experience ? EXPERIENCE_RANK[candidate.years_experience] : undefined;
  if (typeof minRank === 'number' && (candidateRank === undefined || candidateRank < minRank)) {
    addValidation(
      questions,
      reasons,
      'Experience',
      candidate.years_experience
        ? `Experience indiquee: ${candidate.years_experience}; minimum souhaite: ${input.min_experience}`
        : `Experience a confirmer; minimum souhaite: ${input.min_experience}`
    );
  }

  for (const language of cleanArray(input.languages)) {
    if (!(candidate.languages || []).includes(language)) {
      addValidation(questions, reasons, 'Langues', `${language} a confirmer`);
    }
  }

  const authState = candidateMatchesTextCriterion(candidate.work_authorization, input.work_authorization);
  if (authState !== true) {
    addValidation(
      questions,
      reasons,
      'Autorisation',
      authState === null ? 'Autorisation de travail a confirmer' : `Autorisation indiquee: ${candidate.work_authorization}`
    );
  }

  const mobilityState = candidateMatchesTextCriterion(candidate.mobility, input.mobility);
  if (mobilityState !== true) {
    addValidation(
      questions,
      reasons,
      'Mobilite',
      mobilityState === null ? 'Mobilite a confirmer' : `Mobilite indiquee: ${candidate.mobility}`
    );
  }

  const housingState = candidateMatchesTextCriterion(candidate.housing_required, input.housing_required);
  if (housingState !== true) {
    addValidation(
      questions,
      reasons,
      'Hebergement',
      housingState === null ? 'Hebergement a confirmer' : `Hebergement indique: ${candidate.housing_required}`
    );
  }

  const transportState = candidateMatchesTextCriterion(candidate.transport_available, input.transport_available);
  if (transportState !== true) {
    addValidation(
      questions,
      reasons,
      'Transport',
      transportState === null ? 'Transport a confirmer' : `Transport indique: ${candidate.transport_available}`
    );
  }

  if (input.only_with_phone && !candidate.phone) {
    addValidation(questions, reasons, 'Telephone', 'Aucun telephone au dossier');
  }

  if (input.only_without_open_tasks && tasks.some((task) => task.status === 'open')) {
    addValidation(questions, reasons, 'Taches', 'Tache ouverte au dossier');
  }

  if (input.last_active_days && candidate.last_active_at) {
    const ageDays = (Date.now() - new Date(candidate.last_active_at).getTime()) / 86_400_000;
    if (ageDays > input.last_active_days) {
      addValidation(questions, reasons, 'Activite', `Derniere activite il y a ${Math.round(ageDays)} jour(s)`);
    }
  } else if (input.last_active_days && !candidate.last_active_at) {
    addValidation(questions, reasons, 'Activite', 'Aucune activite recente connue');
  }

  return questions;
}

function bucketFor(args: {
  matchDecision?: string | null;
  fitLevel?: string | null;
  missingDocuments: string[];
  additionalQuestions: string[];
  explicitPreferenceSet: boolean;
}): MandateSearchBucket {
  const { matchDecision, fitLevel, missingDocuments, additionalQuestions, explicitPreferenceSet } = args;
  if (matchDecision === 'do_not_propose' || fitLevel === 'blocked') return 'incompatible';
  if (missingDocuments.length > 0 || matchDecision === 'request_document') return 'document_blocked';
  if (
    explicitPreferenceSet &&
    matchDecision === 'present_now' &&
    fitLevel === 'exact' &&
    additionalQuestions.length === 0
  ) {
    return 'presentable';
  }
  return 'to_validate';
}

function priorityScore(result: {
  score: number;
  candidate: Candidate;
  flags: MandateSearchResult['flags'];
  missingDocuments: string[];
  validationQuestions: string[];
}) {
  let score = result.score;
  if (result.flags.available_soon) score += 8;
  if (result.flags.has_phone) score += 4;
  if (result.flags.never_contacted) score += 3;
  if (result.flags.already_applied) score += 2;
  if (result.flags.has_open_tasks) score -= 4;
  if (result.flags.has_overdue_tasks) score -= 8;
  if (result.flags.previously_refused) score -= 12;
  if (result.flags.already_presented) score -= 6;
  score += Math.min(8, Math.round((result.candidate.profile_completion_score || 0) / 12));
  score -= result.missingDocuments.length * 5;
  score -= result.validationQuestions.length * 2;
  return Math.max(0, Math.min(120, score));
}

export function buildSearchJob(input: MandateSearchInput, sourceJob?: Job | null): Job {
  const now = new Date().toISOString();
  const required_documents = requiredDocumentsForSearch(input, {
    ...(sourceJob || {}),
    required_documents: input.required_documents || sourceJob?.required_documents || [],
  } as Job);

  return {
    id: input.job_id || sourceJob?.id || 'temporary-mandate-search',
    title: input.title || sourceJob?.title || [
      input.profession || sourceJob?.profession,
      input.department || sourceJob?.department,
      input.region || sourceJob?.region,
    ].filter(Boolean).join(' - ') || 'Recherche mandat',
    title_en: sourceJob?.title_en || null,
    profession: input.profession || sourceJob?.profession || '',
    job_title_id: input.job_title_id || sourceJob?.job_title_id || null,
    region: input.region || sourceJob?.region || '',
    city: input.city || sourceJob?.city || null,
    establishment: input.establishment || sourceJob?.establishment || null,
    department: input.department || sourceJob?.department || null,
    shift: input.shift || sourceJob?.shift || null,
    schedule: input.schedule || sourceJob?.schedule || null,
    mandate_type: input.mandate_type || sourceJob?.mandate_type || null,
    start_date: input.start_date || sourceJob?.start_date || null,
    duration: input.duration || sourceJob?.duration || null,
    salary: input.salary || sourceJob?.salary || null,
    urgency: input.urgency || sourceJob?.urgency || 'normal',
    requirements: sourceJob?.requirements || null,
    requirements_en: sourceJob?.requirements_en || null,
    particularities: sourceJob?.particularities || null,
    particularities_en: sourceJob?.particularities_en || null,
    required_documents,
    extra_questions: sourceJob?.extra_questions || [],
    status: sourceJob?.status || 'active',
    is_demo: false,
    created_at: sourceJob?.created_at || now,
    updated_at: sourceJob?.updated_at || now,
  };
}

export function searchMandateCandidates(
  input: MandateSearchInput,
  job: Job,
  records: CandidateSearchRecord[]
) {
  const buckets: Record<MandateSearchBucket, MandateSearchResult[]> = {
    presentable: [],
    to_validate: [],
    document_blocked: [],
    incompatible: [],
  };

  for (const record of records) {
    const row = record.row;
    const candidate = hydrateCandidate(
      row,
      row.profile as Record<string, unknown>,
      row.availability as Record<string, unknown>,
      row.preference_sets as Record<string, unknown>[]
    );
    if (!candidate) continue;

    const applications = ((row.applications as Application[] | undefined) || []);
    const documents = ((row.documents as CandidateDocument[] | undefined) || []).filter((doc) => doc.is_current !== false);
    const tasks = ((row.tasks as RecruiterTask[] | undefined) || []);

    if (!isCandidateEligibleForMatching({
      candidate,
      applications,
      jobId: input.job_id || null,
      deletedJobIds: record.deletedJobIds || [],
    })) {
      continue;
    }

    const sameJobApplication = applicationForJob(applications, input.job_id || null);
    const match = computeMatchScore(candidate, job, documents);
    const requiredDocs = requiredDocumentsForSearch(input, job);
    const missingDocuments = requiredDocs.filter((type) => !hasCurrentDocument(documents, type));
    const reasons = [...match.reasons];
    const additionalQuestions = additionalValidationQuestions(input, candidate, tasks, reasons);
    const explicitPreferenceSet = (candidate.preference_sets || []).some((set) => set.active !== false);
    const validationQuestions = Array.from(new Set([
      ...(match.validation_questions || []),
      ...additionalQuestions,
      ...missingDocuments.map((doc) => `Document: ${doc} a recevoir ou renouveler`),
    ]));

    const flags = {
      has_cv: hasCurrentDocument(documents, 'CV'),
      has_required_documents: missingDocuments.length === 0,
      available_soon: isSoon(candidate),
      already_applied: !!sameJobApplication,
      already_presented: hasStatus(applications, ['Presente', 'PrÃ©sentÃ©', 'Place', 'PlacÃ©'], input.job_id || null),
      previously_refused: hasStatus(applications, ['Refuse', 'RefusÃ©'], input.job_id || null),
      never_contacted: !candidate.last_active_at,
      has_open_tasks: tasks.some((task) => task.status === 'open'),
      has_overdue_tasks: tasks.some(isOverdue),
      has_phone: !!candidate.phone,
    };

    const bucket = bucketFor({
      matchDecision: match.decision,
      fitLevel: match.fit_level,
      missingDocuments,
      additionalQuestions,
      explicitPreferenceSet,
    });

    const result: MandateSearchResult = {
      bucket,
      candidate,
      score: match.score,
      priority_score: 0,
      reasons,
      blockers: match.blockers,
      preference_set_id: match.preference_set_id || null,
      preference_set_label: match.preference_set_label || null,
      preference_set: match.preference_set || null,
      fit_level: match.fit_level || null,
      decision: match.decision || null,
      validation_questions: validationQuestions,
      missing_documents: missingDocuments,
      flags,
      applications,
      open_tasks: tasks.filter((task) => task.status === 'open'),
      documents,
    };
    result.priority_score = priorityScore({
      score: result.score,
      candidate,
      flags,
      missingDocuments,
      validationQuestions,
    });
    buckets[bucket].push(result);
  }

  for (const key of Object.keys(buckets) as MandateSearchBucket[]) {
    buckets[key].sort((a, b) => b.priority_score - a.priority_score || b.score - a.score);
  }

  return buckets;
}
