import {
  DOCUMENT_TYPES,
  professionRequiresPDSB,
  professionRequiresPermit,
} from '@/lib/constants';
import { computeCandidateProfileCompletion } from '@/lib/utils';
import type {
  Candidate,
  CandidateAvailability,
  CandidateDocument,
  CandidateProfile,
  Job,
  MatchReason,
  RegionChoice,
  SubmissionAnswers,
} from '@/types';

export function emptyRegionChoice(region = ''): RegionChoice {
  return { region, all_region: true, cities: [] };
}

export function hydrateCandidate(
  row: Record<string, unknown> | null | undefined,
  profile?: Record<string, unknown> | null,
  availability?: Record<string, unknown> | null
): Candidate | null {
  if (!row) return null;
  const profileRow = Array.isArray(profile) ? profile[0] : profile;
  const availabilityRow = Array.isArray(availability) ? availability[0] : availability;
  const p = (profileRow || {}) as Partial<CandidateProfile>;
  const a = (availabilityRow || {}) as Partial<CandidateAvailability>;
  return {
    ...(row as unknown as Candidate),
    profile: profileRow ? (profileRow as CandidateProfile) : null,
    availability: availabilityRow ? (availabilityRow as CandidateAvailability) : null,
    profession: p.profession || null,
    qualified_professions: p.qualified_professions || (p.profession ? [p.profession] : []),
    years_experience: p.years_experience || null,
    permit_status: p.permit_status || null,
    permit_number: p.permit_number || null,
    work_authorization: p.work_authorization || null,
    languages: p.languages || ((row.languages as string[] | undefined) ?? []),
    mobility: p.mobility || null,
    preferred_mandate_types: p.preferred_mandate_types || [],
    preferred_establishments: p.preferred_establishments || null,
    avoided_establishments: p.avoided_establishments || null,
    salary_expectations: p.salary_expectations || null,
    start_availability: a.start_availability || null,
    exact_start_date: a.exact_start_date || null,
    preferred_hours: a.preferred_hours || null,
    preferred_shifts: a.preferred_shifts || [],
    preferred_regions: (a.preferred_regions as RegionChoice[] | undefined) || [],
    preferred_departments: a.preferred_departments || [],
    housing_required: a.housing_required || null,
    transport_available: a.transport_available || null,
    constraints: a.constraints || null,
  };
}

export function candidateFromApplicationAnswers(candidate: Candidate, answers: SubmissionAnswers): Candidate {
  return {
    ...candidate,
    preferred_contact: answers.preferred_contact || candidate.preferred_contact,
    best_contact_time: answers.best_contact_time || candidate.best_contact_time,
    city_residence: answers.city_residence || candidate.city_residence,
    region_residence: answers.region_residence || candidate.region_residence,
    postal_code: answers.postal_code || candidate.postal_code,
    profession: answers.profession || candidate.profession,
    qualified_professions:
      answers.qualified_professions ||
      candidate.qualified_professions ||
      (answers.profession ? [answers.profession] : candidate.profession ? [candidate.profession] : []),
    years_experience: answers.years_experience || candidate.years_experience,
    permit_status: answers.permit_status || candidate.permit_status,
    permit_number: answers.permit_number || candidate.permit_number,
    work_authorization: answers.work_authorization || candidate.work_authorization,
    languages: answers.languages || candidate.languages || [],
    mobility: answers.mobility || candidate.mobility,
    start_availability: answers.start_availability || candidate.start_availability,
    preferred_hours: answers.preferred_hours || candidate.preferred_hours,
    preferred_shifts: answers.shifts_accepted || candidate.preferred_shifts || [],
    preferred_regions: answers.region_choices || candidate.preferred_regions || [],
    preferred_departments: answers.preferred_departments || candidate.preferred_departments || [],
    preferred_establishments: answers.preferred_establishments || candidate.preferred_establishments,
    avoided_establishments: answers.avoided_establishments || candidate.avoided_establishments,
    housing_required: answers.housing_required || candidate.housing_required,
    transport_available: answers.transport_available || candidate.transport_available,
    constraints: answers.constraints || candidate.constraints,
  };
}

export function requiredDocumentsForProfession(profession?: string | null): string[] {
  const docs = new Set<string>(['CV', 'RCR', 'Carnet de vaccination']);
  if (professionRequiresPermit(profession)) docs.add("Permis d'exercice");
  if (professionRequiresPDSB(profession)) docs.add('PDSB');
  return DOCUMENT_TYPES.filter((doc) => docs.has(doc));
}

export function requiredDocumentsForProfessions(professions: Array<string | null | undefined>): string[] {
  const docs = new Set<string>(['CV', 'RCR', 'Carnet de vaccination']);
  for (const profession of professions) {
    if (professionRequiresPermit(profession)) docs.add("Permis d'exercice");
    if (professionRequiresPDSB(profession)) docs.add('PDSB');
  }
  return DOCUMENT_TYPES.filter((doc) => docs.has(doc));
}

export function hasCurrentDocument(documents: CandidateDocument[], type: string): boolean {
  return documents.some(
    (doc) =>
      doc.document_type === type &&
      doc.status === 'Reçu' &&
      !!doc.file_path &&
      doc.is_current !== false
  );
}

export function missingRequiredDocuments(
  candidate: Candidate,
  documents: CandidateDocument[]
): string[] {
  const professions =
    candidate.qualified_professions && candidate.qualified_professions.length > 0
      ? candidate.qualified_professions
      : [candidate.profession];
  return requiredDocumentsForProfessions(professions).filter(
    (type) => !hasCurrentDocument(documents, type)
  );
}

export function computeAtsProfileCompletion(
  candidate: Candidate,
  documents: CandidateDocument[] = []
): number {
  const base = computeCandidateProfileCompletion({
    first_name: candidate.first_name,
    last_name: candidate.last_name,
    phone: candidate.phone,
    email: candidate.email,
    city_residence: candidate.city_residence,
    region_residence: candidate.region_residence,
    profession: candidate.profession,
    qualified_professions: candidate.qualified_professions || [],
    years_experience: candidate.years_experience,
    start_availability: candidate.start_availability,
    preferred_shifts: candidate.preferred_shifts || [],
    preferred_regions: candidate.preferred_regions || [],
    work_authorization: candidate.work_authorization,
    languages: candidate.languages || [],
    mobility: candidate.mobility,
    preferred_departments: candidate.preferred_departments || [],
  });
  return Math.min(100, base + (hasCurrentDocument(documents, 'CV') ? 10 : 0));
}

function includesShift(candidate: Candidate, shift?: string | null) {
  if (!shift) return true;
  return (candidate.preferred_shifts || []).includes(shift);
}

function acceptsRegion(candidate: Candidate, job: Job) {
  const choices = candidate.preferred_regions || [];
  if (choices.length === 0) return false;
  return choices.some((choice) => {
    if (choice.region !== job.region) return false;
    if (choice.all_region) return true;
    if (!job.city) return true;
    return (choice.cities || []).some((city) => city.toLowerCase() === job.city?.toLowerCase());
  });
}

export function computeMatchScore(
  candidate: Candidate,
  job: Job,
  documents: CandidateDocument[] = []
): { score: number; reasons: MatchReason[]; blockers: MatchReason[] } {
  const reasons: MatchReason[] = [];
  const blockers: MatchReason[] = [];
  let score = 0;

  function add(reason: MatchReason) {
    reasons.push(reason);
    score += reason.points;
    if (reason.state === 'block') blockers.push(reason);
  }

  const qualifiedProfessions =
    candidate.qualified_professions && candidate.qualified_professions.length > 0
      ? candidate.qualified_professions
      : candidate.profession
        ? [candidate.profession]
        : [];
  const professionOk = qualifiedProfessions.includes(job.profession);

  add({
    label: 'Profession',
    state: professionOk ? 'ok' : 'block',
    detail: professionOk
      ? `Métier admissible: ${job.profession}`
      : `Admissible: ${qualifiedProfessions.join(', ') || 'non précisé'}; mandat: ${job.profession}`,
    points: professionOk ? 30 : 0,
  });

  const regionOk = acceptsRegion(candidate, job) || candidate.region_residence === job.region;
  add({
    label: 'Région',
    state: regionOk ? 'ok' : 'warn',
    detail: regionOk ? `${job.region} accepté` : `${job.region} non confirmé`,
    points: regionOk ? 18 : 4,
  });

  const shiftOk = includesShift(candidate, job.shift);
  add({
    label: 'Quart',
    state: shiftOk ? 'ok' : 'warn',
    detail: shiftOk ? `${job.shift || 'Quart'} accepté` : `${job.shift} non sélectionné`,
    points: shiftOk ? 14 : 3,
  });

  add({
    label: 'Disponibilité',
    state: candidate.start_availability ? 'ok' : 'warn',
    detail: candidate.start_availability || 'Date de départ à confirmer',
    points: candidate.start_availability ? 12 : 0,
  });

  const cvOk = hasCurrentDocument(documents, 'CV');
  add({
    label: 'CV',
    state: cvOk ? 'ok' : 'warn',
    detail: cvOk ? 'CV reçu' : 'CV à recevoir',
    points: cvOk ? 10 : 0,
  });

  const permitNeeded = professionRequiresPermit(job.profession);
  const permitOk = !permitNeeded || candidate.permit_status === 'Oui, valide';
  add({
    label: 'Permis',
    state: permitOk ? 'ok' : 'warn',
    detail: permitNeeded ? candidate.permit_status || 'Permis à confirmer' : 'Non requis',
    points: permitOk ? 8 : 0,
  });

  const deptOk = !job.department || (candidate.preferred_departments || []).includes(job.department);
  add({
    label: 'Département',
    state: deptOk ? 'ok' : 'warn',
    detail: deptOk ? job.department || 'Non précisé' : `${job.department} non confirmé`,
    points: deptOk ? 8 : 2,
  });

  const cappedScore = professionOk ? score : Math.min(score, 39);
  return {
    score: Math.max(0, Math.min(100, cappedScore)),
    reasons,
    blockers,
  };
}
