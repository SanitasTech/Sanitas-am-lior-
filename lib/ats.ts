import {
  DOCUMENT_TYPES,
  professionCovers,
  professionRequiresPDSB,
  professionRequiresPermit,
} from '@/lib/constants';
import { computeCandidateProfileCompletion } from '@/lib/utils';
import type {
  Candidate,
  CandidateAvailability,
  CandidateDocument,
  CandidatePreferenceSet,
  CandidateProfile,
  Job,
  MatchDecision,
  MatchFitLevel,
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
  availability?: Record<string, unknown> | null,
  preferenceSets?: Record<string, unknown>[] | Record<string, unknown> | null
): Candidate | null {
  if (!row) return null;
  const profileRow = Array.isArray(profile) ? profile[0] : profile;
  const availabilityRow = Array.isArray(availability) ? availability[0] : availability;
  const rawPreferenceSets =
    preferenceSets ??
    (row.preference_sets as Record<string, unknown>[] | undefined) ??
    (row.preferenceSets as Record<string, unknown>[] | undefined);
  const p = (profileRow || {}) as Partial<CandidateProfile>;
  const a = (availabilityRow || {}) as Partial<CandidateAvailability>;
  const candidate = {
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
    preferred_regions: normalizeRegionChoices(a.preferred_regions || []),
    preferred_departments: a.preferred_departments || [],
    housing_required: a.housing_required || null,
    transport_available: a.transport_available || null,
    constraints: a.constraints || null,
  } as Candidate;
  candidate.preference_sets = normalizeCandidatePreferenceSets(rawPreferenceSets, candidate);
  return candidate;
}

export function candidateFromApplicationAnswers(candidate: Candidate, answers: SubmissionAnswers): Candidate {
  const next = {
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
    preferred_regions: normalizeRegionChoices(answers.region_choices || candidate.preferred_regions || []),
    preferred_departments: answers.preferred_departments || candidate.preferred_departments || [],
    preferred_establishments: answers.preferred_establishments || candidate.preferred_establishments,
    avoided_establishments: answers.avoided_establishments || candidate.avoided_establishments,
    housing_required: answers.housing_required || candidate.housing_required,
    transport_available: answers.transport_available || candidate.transport_available,
    constraints: answers.constraints || candidate.constraints,
  } as Candidate;
  next.preference_sets = normalizeCandidatePreferenceSets(
    answers.preference_sets && answers.preference_sets.length > 0
      ? answers.preference_sets
      : candidate.preference_sets,
    next
  );
  return next;
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
  const now = Date.now();
  return documents.some(
    (doc) =>
      doc.document_type === type &&
      isReceivedDocumentStatus(doc.status) &&
      !!doc.file_path &&
      doc.is_current !== false &&
      (!doc.expires_at || new Date(doc.expires_at).getTime() >= now)
  );
}

function isReceivedDocumentStatus(status?: string | null): boolean {
  return ['Reçu', 'Recu', 'ReÃ§u', 'ReÃƒÂ§u'].includes(String(status || ''));
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
  const preferenceBonus = (candidate.preference_sets || []).length > 0 ? 5 : 0;
  return Math.min(100, base + (hasCurrentDocument(documents, 'CV') ? 10 : 0) + preferenceBonus);
}

function cleanStrings(values: Array<string | null | undefined> | undefined): string[] {
  return Array.from(
    new Set((values || []).map((value) => value?.trim()).filter((value): value is string => !!value))
  );
}

function normalizeRegionChoices(value: unknown): RegionChoice[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Partial<RegionChoice>;
      const region = typeof row.region === 'string' ? row.region : '';
      if (!region) return null;
      return {
        region,
        all_region: row.all_region !== false,
        cities: Array.isArray(row.cities) ? cleanStrings(row.cities) : [],
      };
    })
    .filter((item): item is RegionChoice => !!item);
}

export function makePreferenceSetFromFlat(
  candidate: Partial<Candidate>,
  overrides: Partial<CandidatePreferenceSet> = {}
): CandidatePreferenceSet {
  return {
    id: overrides.id,
    candidate_id: overrides.candidate_id || candidate.id,
    label: overrides.label || 'Choix principal',
    priority: overrides.priority || 1,
    professions: cleanStrings(
      overrides.professions && overrides.professions.length > 0
        ? overrides.professions
        : candidate.qualified_professions && candidate.qualified_professions.length > 0
          ? candidate.qualified_professions
          : candidate.profession
            ? [candidate.profession]
            : []
    ),
    regions: normalizeRegionChoices(
      overrides.regions && overrides.regions.length > 0
        ? overrides.regions
        : candidate.preferred_regions || []
    ),
    departments: cleanStrings(
      overrides.departments && overrides.departments.length > 0
        ? overrides.departments
        : candidate.preferred_departments || []
    ),
    shifts: cleanStrings(
      overrides.shifts && overrides.shifts.length > 0
        ? overrides.shifts
        : candidate.preferred_shifts || []
    ),
    mandate_types: cleanStrings(
      overrides.mandate_types && overrides.mandate_types.length > 0
        ? overrides.mandate_types
        : candidate.preferred_mandate_types || []
    ),
    start_date: overrides.start_date || candidate.start_availability || null,
    mobility: overrides.mobility || candidate.mobility || null,
    salary_floor: overrides.salary_floor || candidate.salary_expectations || null,
    constraints: overrides.constraints || candidate.constraints || null,
    active: overrides.active !== false,
  };
}

export function makePreferenceSetForJob(
  candidate: Partial<Candidate>,
  job: Job,
  label = 'Choix ajoute depuis un mandat'
): CandidatePreferenceSet {
  return makePreferenceSetFromFlat(candidate, {
    label,
    professions: cleanStrings([job.profession, ...(candidate.qualified_professions || [])]),
    regions: [emptyRegionChoice(job.region)],
    departments: job.department ? [job.department] : candidate.preferred_departments || [],
    shifts: job.shift ? [job.shift] : candidate.preferred_shifts || [],
    mandate_types: job.mandate_type ? [job.mandate_type] : candidate.preferred_mandate_types || [],
  });
}

export function normalizeCandidatePreferenceSets(
  input: unknown,
  fallback?: Partial<Candidate> | null
): CandidatePreferenceSet[] {
  const raw = Array.isArray(input) ? input : input ? [input] : [];
  const normalized = raw
    .map((item, index): CandidatePreferenceSet | null => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Partial<CandidatePreferenceSet> & {
        regions?: unknown;
        preferred_regions?: unknown;
      };
      const set: CandidatePreferenceSet = {
        label: typeof row.label === 'string' && row.label.trim() ? row.label.trim() : `Choix ${index + 1}`,
        priority: typeof row.priority === 'number' ? row.priority : index + 1,
        professions: cleanStrings(row.professions),
        regions: normalizeRegionChoices(row.regions || row.preferred_regions),
        departments: cleanStrings(row.departments),
        shifts: cleanStrings(row.shifts),
        mandate_types: cleanStrings(row.mandate_types),
        start_date: typeof row.start_date === 'string' ? row.start_date : null,
        mobility: typeof row.mobility === 'string' ? row.mobility : null,
        salary_floor: typeof row.salary_floor === 'string' ? row.salary_floor : null,
        constraints: typeof row.constraints === 'string' ? row.constraints : null,
        active: row.active !== false,
      };
      if (typeof row.id === 'string') set.id = row.id;
      const candidateId = typeof row.candidate_id === 'string' ? row.candidate_id : fallback?.id;
      if (candidateId) set.candidate_id = candidateId;
      return set;
    })
    .filter((item): item is CandidatePreferenceSet => !!item)
    .filter((item) => item.active !== false)
    .sort((a, b) => a.priority - b.priority);

  if (normalized.length > 0) return normalized;
  if (!fallback) return [];
  const fallbackSet = makePreferenceSetFromFlat(fallback);
  const hasSignal =
    fallbackSet.professions.length > 0 ||
    fallbackSet.regions.length > 0 ||
    fallbackSet.departments.length > 0 ||
    fallbackSet.shifts.length > 0 ||
    fallbackSet.mandate_types.length > 0;
  return hasSignal ? [fallbackSet] : [];
}

export function preferenceSetSummary(set?: CandidatePreferenceSet | null): string {
  if (!set) return 'Choix non precise';
  const parts = [
    set.label,
    set.professions.join(', '),
    set.regions.map((region) => region.region).join(', '),
    set.departments.join(', '),
    set.shifts.join(', '),
  ].filter(Boolean);
  return parts.join(' | ') || 'Choix non precise';
}

function acceptsRegionChoice(choices: RegionChoice[], job: Job) {
  if (!job.region) return true;
  if (choices.length === 0) return null;
  return choices.some((choice) => {
    if (choice.region !== job.region) return false;
    if (choice.all_region) return true;
    if (!job.city) return true;
    return (choice.cities || []).some((city) => city.toLowerCase() === job.city?.toLowerCase());
  });
}

function includesValue(values: string[], value?: string | null) {
  if (!value) return true;
  if (values.length === 0) return null;
  return values.includes(value);
}

function decideMatch(args: {
  score: number;
  reasons: MatchReason[];
  blockers: MatchReason[];
  fitLevel: MatchFitLevel;
}): MatchDecision {
  const { score, reasons, blockers, fitLevel } = args;
  const operationalBlock = blockers.some((reason) =>
    ['Profession', 'Region', 'Quart', 'Departement'].includes(reason.label)
  );
  if (operationalBlock || fitLevel === 'blocked' || score < 45) return 'do_not_propose';
  const documentWarn = reasons.some((reason) =>
    ['CV', 'Permis', 'Documents'].includes(reason.label) && reason.state !== 'ok'
  );
  if (documentWarn) return 'request_document';
  if (fitLevel === 'exact' && score >= 75) return 'present_now';
  return 'call_to_validate';
}

function computePreferenceSetMatch(
  candidate: Candidate,
  job: Job,
  documents: CandidateDocument[],
  preferenceSet: CandidatePreferenceSet
) {
  const reasons: MatchReason[] = [];
  const blockers: MatchReason[] = [];
  let score = 0;

  function add(reason: MatchReason) {
    reasons.push(reason);
    score += reason.points;
    if (reason.state === 'block') blockers.push(reason);
  }

  const professions = preferenceSet.professions.length > 0
    ? preferenceSet.professions
    : candidate.qualified_professions && candidate.qualified_professions.length > 0
      ? candidate.qualified_professions
      : candidate.profession
        ? [candidate.profession]
        : [];
  const coveringProfession = professions.find((profession) => professionCovers(profession, job.profession));
  const professionOk = !!coveringProfession;
  add({
    label: 'Profession',
    state: professionOk ? 'ok' : 'block',
    detail: professionOk
      ? `${coveringProfession} couvre le mandat ${job.profession}`
      : `Ce choix couvre ${professions.join(', ') || 'aucun titre'}; mandat: ${job.profession}`,
    points: professionOk ? 32 : 0,
  });

  const regionState = acceptsRegionChoice(preferenceSet.regions, job);
  add({
    label: 'Region',
    state: regionState === true ? 'ok' : regionState === null ? 'warn' : 'block',
    detail:
      regionState === true
        ? `${job.region} est dans ${preferenceSet.label}`
        : regionState === null
          ? 'Territoire a valider dans ce choix'
          : `${job.region} n'est pas dans ${preferenceSet.label}`,
    points: regionState === true ? 20 : regionState === null ? 6 : 0,
  });

  const shiftState = includesValue(preferenceSet.shifts, job.shift);
  add({
    label: 'Quart',
    state: shiftState === true ? 'ok' : shiftState === null ? 'warn' : 'block',
    detail:
      shiftState === true
        ? `${job.shift || 'Quart'} accepte dans ce choix`
        : shiftState === null
          ? 'Quart a valider dans ce choix'
          : `${job.shift} n'est pas dans ce choix`,
    points: shiftState === true ? 14 : shiftState === null ? 4 : 0,
  });

  const departmentState = includesValue(preferenceSet.departments, job.department);
  add({
    label: 'Departement',
    state: departmentState === true ? 'ok' : departmentState === null ? 'warn' : 'block',
    detail:
      departmentState === true
        ? `${job.department || 'Departement'} accepte dans ce choix`
        : departmentState === null
          ? 'Departement a valider dans ce choix'
          : `${job.department} n'est pas dans ce choix`,
    points: departmentState === true ? 10 : departmentState === null ? 3 : 0,
  });

  const mandateState = includesValue(preferenceSet.mandate_types, job.mandate_type);
  add({
    label: 'Type de mandat',
    state: mandateState === false ? 'warn' : 'ok',
    detail:
      mandateState === true
        ? `${job.mandate_type || 'Type'} accepte`
        : mandateState === null
          ? 'Type de mandat non limite'
          : `${job.mandate_type} a confirmer`,
    points: mandateState === false ? 1 : 5,
  });

  add({
    label: 'Disponibilite',
    state: preferenceSet.start_date || candidate.start_availability ? 'ok' : 'warn',
    detail: preferenceSet.start_date || candidate.start_availability || 'Date de depart a confirmer',
    points: preferenceSet.start_date || candidate.start_availability ? 10 : 0,
  });

  const cvOk = hasCurrentDocument(documents, 'CV');
  add({
    label: 'CV',
    state: cvOk ? 'ok' : 'warn',
    detail: cvOk ? 'CV recu' : 'CV a recevoir',
    points: cvOk ? 10 : 0,
  });

  const permitNeeded = professionRequiresPermit(job.profession);
  const permitOk = !permitNeeded || candidate.permit_status === 'Oui, valide';
  add({
    label: 'Permis',
    state: permitOk ? 'ok' : 'warn',
    detail: permitNeeded ? candidate.permit_status || 'Permis a confirmer' : 'Non requis',
    points: permitOk ? 7 : 0,
  });

  const requiredDocs = Array.from(new Set((job.required_documents || []).filter(Boolean)));
  if (requiredDocs.length > 0) {
    const missingDocs = requiredDocs.filter((type) => !hasCurrentDocument(documents, type));
    add({
      label: 'Documents',
      state: missingDocs.length === 0 ? 'ok' : 'warn',
      detail: missingDocs.length === 0
        ? 'Documents requis recus'
        : `A recevoir ou renouveler: ${missingDocs.join(', ')}`,
      points: missingDocs.length === 0 ? 8 : 0,
    });
  }

  add({
    label: 'Mobilite',
    state: preferenceSet.mobility || candidate.mobility ? 'ok' : 'warn',
    detail: preferenceSet.mobility || candidate.mobility || 'Mobilite a confirmer',
    points: preferenceSet.mobility || candidate.mobility ? 4 : 1,
  });

  if (preferenceSet.constraints) {
    add({
      label: 'Contraintes',
      state: 'warn',
      detail: preferenceSet.constraints,
      points: 0,
    });
  }

  const hasOperationalBlock = blockers.some((reason) =>
    ['Profession', 'Region', 'Quart', 'Departement'].includes(reason.label)
  );
  const hasOperationalWarn = reasons.some((reason) =>
    ['Region', 'Quart', 'Departement', 'Disponibilite', 'Type de mandat'].includes(reason.label) &&
    reason.state === 'warn'
  );
  const cappedScore = hasOperationalBlock ? Math.min(score, professionOk ? 49 : 39) : score;
  const finalScore = Math.max(0, Math.min(100, cappedScore));
  const fitLevel: MatchFitLevel = hasOperationalBlock
    ? 'blocked'
    : hasOperationalWarn
      ? 'partial'
      : 'exact';
  const validationQuestions = reasons
    .filter((reason) => reason.state === 'warn')
    .map((reason) => `${reason.label}: ${reason.detail}`);

  return {
    score: finalScore,
    reasons,
    blockers,
    preference_set_id: preferenceSet.id || null,
    preference_set_label: preferenceSet.label,
    preference_set: preferenceSet,
    fit_level: fitLevel,
    decision: decideMatch({ score: finalScore, reasons, blockers, fitLevel }),
    validation_questions: validationQuestions,
  };
}

export function computeMatchScore(
  candidate: Candidate,
  job: Job,
  documents: CandidateDocument[] = []
): {
  score: number;
  reasons: MatchReason[];
  blockers: MatchReason[];
  preference_set_id?: string | null;
  preference_set_label?: string | null;
  preference_set?: CandidatePreferenceSet | null;
  fit_level?: MatchFitLevel;
  decision?: MatchDecision;
  validation_questions?: string[];
} {
  const preferenceSets = normalizeCandidatePreferenceSets(candidate.preference_sets, candidate);
  const sets = preferenceSets.length > 0 ? preferenceSets : [makePreferenceSetFromFlat(candidate)];
  const levelWeight = (level: MatchFitLevel) => (level === 'exact' ? 3 : level === 'partial' ? 2 : 1);
  return sets
    .map((set) => computePreferenceSetMatch(candidate, job, documents, set))
    .sort((a, b) => b.score - a.score || levelWeight(b.fit_level) - levelWeight(a.fit_level))[0];
}
