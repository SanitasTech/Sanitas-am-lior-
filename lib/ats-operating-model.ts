import { hasCurrentDocument, missingRequiredDocuments } from '@/lib/ats';
import type { Application, Candidate, CandidateDocument, Job, MatchReason, RecruiterTask } from '@/types';

export type AtsLaneId = 'intake' | 'qualified' | 'blocked' | 'ready' | 'client' | 'closed';
export type AtsActionPriority = 'urgent' | 'high' | 'normal' | 'low';
export type MatchDecision =
  | 'present_now'
  | 'call_to_validate'
  | 'request_document'
  | 'do_not_propose';

export const CLOSED_APPLICATION_STATUSES = ['Place', 'Refuse', 'Inactif'] as const;
export type ApplicationEligibilityInput = {
  status?: string | null;
  job_id?: string | null;
  application_type?: string | null;
};

export interface AtsPipelineLane {
  id: AtsLaneId;
  label: string;
  intent: string;
  statuses: string[];
}

export interface AtsNextAction {
  code:
    | 'call_candidate'
    | 'qualify_candidate'
    | 'request_documents'
    | 'validate_availability'
    | 'present_candidate'
    | 'follow_client'
    | 'close_file'
    | 'reactivate_candidate'
    | 'monitor';
  label: string;
  detail: string;
  priority: AtsActionPriority;
  dueAt: string | null;
  dueLabel: string;
  overdue: boolean;
  taskType: string;
  taskTitle: string;
}

export const ATS_PIPELINE_LANES: AtsPipelineLane[] = [
  {
    id: 'intake',
    label: 'A appeler',
    intent: 'Joindre sous 24 h et confirmer l interet.',
    statuses: ['Nouveau', 'A appeler'],
  },
  {
    id: 'qualified',
    label: 'Qualifie',
    intent: 'Dossier humainement valide, reste a produire une action.',
    statuses: ['Qualifie'],
  },
  {
    id: 'blocked',
    label: 'Documents',
    intent: 'Debloquer CV, permis, RCR ou information manquante.',
    statuses: ['Documents manquants'],
  },
  {
    id: 'ready',
    label: 'Pret a presenter',
    intent: 'Dossier presentable au client maintenant.',
    statuses: ['Pret a presenter'],
  },
  {
    id: 'client',
    label: 'Presente client',
    intent: 'Suivre la decision client dans les 24 a 48 h.',
    statuses: ['Presente'],
  },
  {
    id: 'closed',
    label: 'Ferme',
    intent: 'Historique conserve, pas d action active.',
    statuses: ['Place', 'Refuse', 'Inactif'],
  },
];

const NORMALIZED_STATUS: Record<string, string> = {
  'A rappeler': 'A appeler',
  'À rappeler': 'A appeler',
  'A appeler': 'A appeler',
  'À appeler': 'A appeler',
  Contacte: 'Qualifie',
  'Contacté': 'Qualifie',
  Qualifie: 'Qualifie',
  'Qualifié': 'Qualifie',
  'Pret a presenter': 'Pret a presenter',
  'Prêt à présenter': 'Pret a presenter',
  Presente: 'Presente',
  'Présenté': 'Presente',
  Place: 'Place',
  'Placé': 'Place',
  Refuse: 'Refuse',
  'Refusé': 'Refuse',
  'Non disponible': 'Inactif',
  Inactif: 'Inactif',
};

export function normalizeApplicationStatus(status?: string | null): string {
  if (!status) return 'Nouveau';
  return NORMALIZED_STATUS[status] || status;
}

export function isClosedApplicationStatus(status?: string | null): boolean {
  return CLOSED_APPLICATION_STATUSES.includes(
    normalizeApplicationStatus(status) as (typeof CLOSED_APPLICATION_STATUSES)[number]
  );
}

export function isRecruitableApplication(application?: ApplicationEligibilityInput | null): boolean {
  return !!application && !isClosedApplicationStatus(application.status);
}

export function candidateHasRecruitableApplication(applications: ApplicationEligibilityInput[] = []): boolean {
  return applications.some(isRecruitableApplication);
}

export function candidateExcludedForJob(args: {
  applications?: ApplicationEligibilityInput[];
  jobId?: string | null;
  deletedJobIds?: string[];
}): boolean {
  const { applications = [], jobId, deletedJobIds = [] } = args;
  if (!jobId) return false;
  if (deletedJobIds.includes(jobId)) return true;
  return applications.some((application) =>
    application.job_id === jobId && isClosedApplicationStatus(application.status)
  );
}

export function isCandidateEligibleForMatching(args: {
  candidate: Pick<Candidate, 'status'>;
  applications?: ApplicationEligibilityInput[];
  jobId?: string | null;
  deletedJobIds?: string[];
}): boolean {
  const { candidate, applications = [], jobId, deletedJobIds = [] } = args;
  if (candidate.status !== 'active') return false;
  if (!candidateHasRecruitableApplication(applications)) return false;
  return !candidateExcludedForJob({ applications, jobId, deletedJobIds });
}

export function laneForStatus(status?: string | null): AtsPipelineLane {
  const normalized = normalizeApplicationStatus(status);
  return (
    ATS_PIPELINE_LANES.find((lane) => lane.statuses.includes(normalized)) ||
    ATS_PIPELINE_LANES[0]
  );
}

export function applicationObjectLabel(application: Application): string {
  if (application.application_type === 'posting') {
    const snapshot = application.posting_snapshot || {};
    return (snapshot.title as string | undefined) || 'Mandat precis';
  }
  return 'Profil actif pour mandats compatibles';
}

export function candidateDisplayName(candidate?: Candidate | null): string {
  const name = [candidate?.first_name, candidate?.last_name].filter(Boolean).join(' ').trim();
  return name || 'Candidat sans nom';
}

export function recruiterNextAction(application: Application): string {
  return getApplicationNextAction({ application }).label;
}

function addHours(input: string | null | undefined, hours: number): string | null {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function formatDueLabel(dueAt: string | null, now = new Date()): string {
  if (!dueAt) return 'Pas d echeance';
  const due = new Date(dueAt);
  if (Number.isNaN(due.getTime())) return 'Echeance a verifier';
  const diffHours = Math.round((due.getTime() - now.getTime()) / 36e5);
  if (diffHours < -48) return `En retard de ${Math.abs(Math.round(diffHours / 24))} j`;
  if (diffHours < 0) return `En retard de ${Math.abs(diffHours)} h`;
  if (diffHours === 0) return 'A faire maintenant';
  if (diffHours < 24) return `Dans ${diffHours} h`;
  return `Dans ${Math.round(diffHours / 24)} j`;
}

function isOverdue(dueAt: string | null, now = new Date()): boolean {
  if (!dueAt) return false;
  const due = new Date(dueAt);
  return !Number.isNaN(due.getTime()) && due.getTime() < now.getTime();
}

function priorityFromDue(base: AtsActionPriority, dueAt: string | null, now = new Date()): AtsActionPriority {
  if (isOverdue(dueAt, now)) return base === 'low' ? 'high' : 'urgent';
  return base;
}

function buildAction(input: Omit<AtsNextAction, 'dueLabel' | 'overdue'>, now = new Date()): AtsNextAction {
  return {
    ...input,
    priority: priorityFromDue(input.priority, input.dueAt, now),
    dueLabel: formatDueLabel(input.dueAt, now),
    overdue: isOverdue(input.dueAt, now),
  };
}

export function getApplicationNextAction(args: {
  application: Application;
  candidate?: Candidate | null;
  documents?: CandidateDocument[];
  job?: Job | null;
  now?: Date;
}): AtsNextAction {
  const { application, candidate, documents = [], job = application.job || null, now = new Date() } = args;
  const status = normalizeApplicationStatus(application.status);
  const createdAt = application.submitted_at || application.created_at;
  const updatedAt = application.updated_at || application.created_at;
  const missingDocs = candidate ? missingRequiredDocuments(candidate, documents) : [];
  const missingCv = candidate ? missingDocs.includes('CV') || !hasCurrentDocument(documents, 'CV') : false;
  const missingAvailability = !!candidate && (
    !candidate.start_availability ||
    (candidate.preferred_shifts || []).length === 0
  );

  if (status === 'Place') {
    return buildAction({
      code: 'close_file',
      label: 'Placement confirme',
      detail: 'Conserver l historique et verifier les prochaines disponibilites plus tard.',
      priority: 'low',
      dueAt: null,
      taskType: 'placement_archive',
      taskTitle: 'Archiver le placement',
    }, now);
  }

  if (status === 'Refuse') {
    return buildAction({
      code: 'close_file',
      label: 'Fermer avec raison',
      detail: application.status_reason || 'Noter la raison pour eviter une relance incoherente.',
      priority: 'low',
      dueAt: null,
      taskType: 'close_reason',
      taskTitle: 'Fermer le dossier avec raison',
    }, now);
  }

  if (status === 'Inactif') {
    return buildAction({
      code: 'reactivate_candidate',
      label: 'Garder en vivier',
      detail: 'Aucune action immediate. Reactiver si un mandat compatible arrive.',
      priority: 'low',
      dueAt: null,
      taskType: 'reactivation',
      taskTitle: 'Revoir le candidat plus tard',
    }, now);
  }

  if (status === 'Presente') {
    return buildAction({
      code: 'follow_client',
      label: 'Suivre la decision client',
      detail: 'Relancer le client et confirmer que le candidat reste disponible.',
      priority: job?.urgency === 'urgent' ? 'high' : 'normal',
      dueAt: addHours(updatedAt, job?.urgency === 'urgent' ? 24 : 48),
      taskType: 'client_follow_up',
      taskTitle: 'Suivre la decision client',
    }, now);
  }

  if (status === 'Pret a presenter') {
    return buildAction({
      code: 'present_candidate',
      label: 'Presenter maintenant',
      detail: job
        ? `Dossier assez complet pour ${job.title}.`
        : 'Dossier complet: choisir un mandat compatible ou envoyer au client.',
      priority: job?.urgency === 'urgent' ? 'urgent' : 'high',
      dueAt: addHours(updatedAt, job?.urgency === 'urgent' ? 8 : 24),
      taskType: 'present',
      taskTitle: 'Presenter le candidat au client',
    }, now);
  }

  if (status === 'Documents manquants' || missingCv || missingDocs.length > 0) {
    const docs = missingDocs.length > 0 ? missingDocs.join(', ') : 'documents obligatoires';
    return buildAction({
      code: 'request_documents',
      label: missingCv ? 'Relancer le CV' : 'Relancer les documents',
      detail: `Manquant: ${docs}. Relance recommandee apres 48 h sans reception.`,
      priority: missingCv ? 'high' : 'normal',
      dueAt: addHours(updatedAt, 48),
      taskType: missingCv ? 'missing_cv' : 'missing_documents',
      taskTitle: missingCv ? 'Relancer le CV' : `Relancer documents: ${docs}`,
    }, now);
  }

  if (status === 'Qualifie' || missingAvailability) {
    return buildAction({
      code: 'validate_availability',
      label: 'Valider disponibilite et mandat cible',
      detail: 'Confirmer date de depart, quarts, regions et contraintes avant presentation.',
      priority: 'normal',
      dueAt: addHours(updatedAt, 24),
      taskType: 'availability',
      taskTitle: 'Valider disponibilite et mandat cible',
    }, now);
  }

  return buildAction({
    code: 'call_candidate',
    label: 'Appeler sous 24 h',
    detail: 'Nouveau dossier actif. Premier contact requis pour transformer en candidature qualifiee.',
    priority: 'high',
    dueAt: addHours(createdAt, 24),
    taskType: 'call',
    taskTitle: 'Appeler le candidat',
  }, now);
}

export function priorityLabel(priority: AtsActionPriority): string {
  if (priority === 'urgent') return 'Urgent';
  if (priority === 'high') return 'Prioritaire';
  if (priority === 'normal') return 'Normal';
  return 'Faible';
}

export function priorityClass(priority: AtsActionPriority): string {
  if (priority === 'urgent') return 'bg-danger-soft text-danger';
  if (priority === 'high') return 'bg-warning-soft text-warning';
  if (priority === 'normal') return 'bg-accent-soft text-accent';
  return 'bg-muted text-fg-muted';
}

export function matchDecisionLabel(decision: MatchDecision): string {
  if (decision === 'present_now') return 'Presenter maintenant';
  if (decision === 'call_to_validate') return 'Appeler pour valider';
  if (decision === 'request_document') return 'Demander document';
  return 'Ne pas proposer';
}

export function matchDecisionClass(decision: MatchDecision): string {
  if (decision === 'present_now') return 'bg-success-soft text-success';
  if (decision === 'call_to_validate') return 'bg-accent-soft text-accent';
  if (decision === 'request_document') return 'bg-warning-soft text-warning';
  return 'bg-muted text-fg-muted';
}

export function getMatchDecision(args: {
  score: number;
  reasons?: MatchReason[];
  blockers?: MatchReason[];
}): { decision: MatchDecision; label: string; detail: string } {
  const { score, reasons = [], blockers = [] } = args;
  const hasProfessionBlock = blockers.some((reason) => reason.label.toLowerCase().includes('profession'));
  const documentWarn = reasons.some((reason) =>
    ['CV', 'Permis', 'Documents'].includes(reason.label) && reason.state !== 'ok'
  );
  const hasHardBlock = blockers.length > 0;
  const hasAvailabilityWarn = reasons.some((reason) =>
    ['Region', 'Région', 'Quart', 'Disponibilite', 'Disponibilité'].includes(reason.label) &&
    reason.state !== 'ok'
  );

  if (hasProfessionBlock || score < 45) {
    return {
      decision: 'do_not_propose',
      label: matchDecisionLabel('do_not_propose'),
      detail: hasProfessionBlock ? 'Titre non admissible pour ce mandat.' : 'Compatibilite trop faible pour presentation.',
    };
  }
  if (documentWarn) {
    return {
      decision: 'request_document',
      label: matchDecisionLabel('request_document'),
      detail: 'Le candidat peut etre interessant, mais un document bloque la presentation.',
    };
  }
  if (score >= 75 && !hasHardBlock && !hasAvailabilityWarn) {
    return {
      decision: 'present_now',
      label: matchDecisionLabel('present_now'),
      detail: 'Score fort et aucun blocage operationnel majeur.',
    };
  }
  return {
    decision: 'call_to_validate',
    label: matchDecisionLabel('call_to_validate'),
    detail: 'Bon potentiel, mais disponibilite, territoire ou details du mandat doivent etre confirmes.',
  };
}

export function buildAutoTaskRecommendations(args: {
  application: Application;
  candidate?: Candidate | null;
  documents?: CandidateDocument[];
  job?: Job | null;
  existingTasks?: RecruiterTask[];
  now?: Date;
}): AtsNextAction[] {
  const action = getApplicationNextAction(args);
  const existingOpen = (args.existingTasks || []).some(
    (task) => task.status === 'open' && task.task_type === action.taskType
  );
  if (existingOpen || action.priority === 'low') return [];
  return [action];
}

export const RECRUITER_MESSAGE_TEMPLATES = [
  {
    code: 'call_candidate',
    title: 'Appel candidat',
    channel: 'telephone',
    body:
      'Bonjour {{first_name}}, ici Sanitas. Je vous appelle pour confirmer vos disponibilites, vos regions et les mandats qui pourraient vous convenir cette semaine.',
  },
  {
    code: 'missing_cv',
    title: 'Relance CV',
    channel: 'email',
    subject: 'Votre CV est requis pour completer votre dossier Sanitas',
    body:
      'Bonjour {{first_name}}, il nous manque votre CV pour finaliser votre dossier et vous proposer aux bons mandats. Vous pouvez l ajouter dans votre espace candidat ou nous appeler au 450 973-9696.',
  },
  {
    code: 'availability_check',
    title: 'Validation disponibilite',
    channel: 'telephone',
    body:
      'Valider: date de depart, quarts acceptes, regions, departements, contraintes, hebergement, transport et meilleur moment pour etre joint.',
  },
  {
    code: 'client_presentation',
    title: 'Presentation client',
    channel: 'email',
    subject: 'Candidat a presenter: {{first_name}} {{last_name}}',
    body:
      'Profil a presenter: titre admissible, experience, disponibilite, regions acceptees, documents recus et points a valider. Ajouter les forces pertinentes pour ce mandat.',
  },
  {
    code: 'clean_refusal',
    title: 'Refus propre',
    channel: 'email',
    subject: 'Suivi de votre dossier Sanitas',
    body:
      'Bonjour {{first_name}}, merci pour votre interet. Pour ce mandat precis, nous ne pouvons pas avancer votre dossier. Nous conservons votre profil pour les opportunites compatibles.',
  },
];

export interface CandidateReadinessBlock {
  id: 'identity' | 'work' | 'availability' | 'documents' | 'mandate' | 'consent';
  label: string;
  ready: boolean;
  blocking: boolean;
  missing: string[];
  summary: string;
}

export function buildCandidateReadiness(args: {
  candidate: Candidate;
  documents?: CandidateDocument[];
  job?: Job | null;
  mandateQuestionsAnswered?: boolean;
}): CandidateReadinessBlock[] {
  const { candidate, documents = [], job, mandateQuestionsAnswered = true } = args;
  const requiredDocs = missingRequiredDocuments(candidate, documents);
  const cvReady = hasCurrentDocument(documents, 'CV');
  const shifts = candidate.preferred_shifts || [];
  const regions = candidate.preferred_regions || [];
  const qualifiedProfessions =
    candidate.qualified_professions && candidate.qualified_professions.length > 0
      ? candidate.qualified_professions
      : candidate.profession
        ? [candidate.profession]
        : [];
  const jobProfessionOk = !job || qualifiedProfessions.includes(job.profession);

  return [
    {
      id: 'identity',
      label: 'Identite et contact',
      ready: !!(candidate.first_name && candidate.last_name && (candidate.phone || candidate.email)),
      blocking: true,
      missing: [
        !candidate.first_name ? 'prenom' : null,
        !candidate.last_name ? 'nom' : null,
        !(candidate.phone || candidate.email) ? 'telephone ou courriel' : null,
      ].filter(Boolean) as string[],
      summary: [candidate.phone, candidate.email].filter(Boolean).join(' | ') || 'Contact a completer',
    },
    {
      id: 'work',
      label: 'Metier et admissibilite',
      ready: !!(
        qualifiedProfessions.length > 0 &&
        jobProfessionOk &&
        candidate.years_experience &&
        candidate.work_authorization &&
        (candidate.languages || []).length > 0
      ),
      blocking: true,
      missing: [
        qualifiedProfessions.length === 0 ? 'metier admissible' : null,
        !jobProfessionOk && job ? `admissibilite ${job.profession}` : null,
        !candidate.years_experience ? 'experience' : null,
        !candidate.work_authorization ? 'autorisation de travail' : null,
        (candidate.languages || []).length === 0 ? 'langues' : null,
      ].filter(Boolean) as string[],
      summary:
        [
          qualifiedProfessions.length > 0
            ? qualifiedProfessions.join(', ')
            : candidate.profession,
          candidate.years_experience,
        ].filter(Boolean).join(' | ') || 'Metier a completer',
    },
    {
      id: 'availability',
      label: 'Disponibilite et territoire',
      ready: !!(
        candidate.start_availability &&
        shifts.length > 0 &&
        (job || regions.some((region) => region.region))
      ),
      blocking: true,
      missing: [
        !candidate.start_availability ? 'date de depart' : null,
        shifts.length === 0 ? 'quarts acceptes' : null,
        !job && !regions.some((region) => region.region) ? 'region souhaitee' : null,
      ].filter(Boolean) as string[],
      summary: [candidate.start_availability, shifts.join(', ')].filter(Boolean).join(' | ') || 'Disponibilite a confirmer',
    },
    {
      id: 'documents',
      label: 'Documents',
      ready: cvReady,
      blocking: true,
      missing: cvReady ? requiredDocs.filter((doc) => doc !== 'CV') : ['CV'],
      summary: cvReady ? 'CV recu' : 'CV requis avant envoi',
    },
    {
      id: 'mandate',
      label: 'Questions du mandat',
      ready: !job || mandateQuestionsAnswered,
      blocking: !!job,
      missing: job && !mandateQuestionsAnswered ? ['questions obligatoires'] : [],
      summary: job ? 'Questions specifiques au mandat' : 'Sans question de mandat',
    },
    {
      id: 'consent',
      label: 'Consentement',
      ready: !!candidate.consent_data,
      blocking: true,
      missing: candidate.consent_data ? [] : ['consentement'],
      summary: candidate.consent_data ? 'Consentement au dossier' : 'Consentement requis',
    },
  ];
}

export function readinessPercent(blocks: CandidateReadinessBlock[]): number {
  if (blocks.length === 0) return 0;
  const ready = blocks.filter((block) => block.ready).length;
  return Math.round((ready / blocks.length) * 100);
}
