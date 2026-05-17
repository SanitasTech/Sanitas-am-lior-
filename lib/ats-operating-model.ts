import type { Application, Candidate, CandidateDocument, Job } from '@/types';
import { hasCurrentDocument, missingRequiredDocuments } from '@/lib/ats';

export type AtsLaneId = 'intake' | 'blocked' | 'ready' | 'client' | 'closed';

export interface AtsPipelineLane {
  id: AtsLaneId;
  label: string;
  intent: string;
  statuses: string[];
}

export const ATS_PIPELINE_LANES: AtsPipelineLane[] = [
  {
    id: 'intake',
    label: 'A qualifier',
    intent: 'Verifier contact, disponibilite et admissibilite.',
    statuses: ['Nouveau', 'A rappeler', 'Contacte'],
  },
  {
    id: 'blocked',
    label: 'Bloque',
    intent: 'Debloquer CV, permis, RCR ou information manquante.',
    statuses: ['Documents manquants'],
  },
  {
    id: 'ready',
    label: 'Pret client',
    intent: 'Dossier assez complet pour presentation.',
    statuses: ['Pret a presenter'],
  },
  {
    id: 'client',
    label: 'Presente',
    intent: 'Suivre la decision client et la disponibilite.',
    statuses: ['Presente'],
  },
  {
    id: 'closed',
    label: 'Ferme',
    intent: 'Historique conserve, pas d’action active.',
    statuses: ['Place', 'Non disponible', 'Refuse'],
  },
];

const NORMALIZED_STATUS: Record<string, string> = {
  'A rappeler': 'A rappeler',
  'À rappeler': 'A rappeler',
  Contacte: 'Contacte',
  'Contacté': 'Contacte',
  'Pret a presenter': 'Pret a presenter',
  'Prêt à présenter': 'Pret a presenter',
  Presente: 'Presente',
  'Présenté': 'Presente',
  Place: 'Place',
  'Placé': 'Place',
  Refuse: 'Refuse',
  'Refusé': 'Refuse',
};

export function normalizeApplicationStatus(status?: string | null): string {
  if (!status) return 'Nouveau';
  return NORMALIZED_STATUS[status] || status;
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
  const status = normalizeApplicationStatus(application.status);
  if (status === 'Nouveau') return 'Qualifier le dossier';
  if (status === 'A rappeler') return 'Appeler le candidat';
  if (status === 'Contacte') return 'Valider disponibilite';
  if (status === 'Documents manquants') return 'Relancer les documents';
  if (status === 'Pret a presenter') return 'Presenter au client';
  if (status === 'Presente') return 'Suivre la decision';
  if (status === 'Place') return 'Archiver le placement';
  if (status === 'Non disponible') return 'Garder en vivier';
  if (status === 'Refuse') return 'Fermer avec raison';
  return 'Traiter';
}

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
        qualifiedProfessions.length === 0 ? 'métier admissible' : null,
        !jobProfessionOk && job ? `admissibilité ${job.profession}` : null,
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
