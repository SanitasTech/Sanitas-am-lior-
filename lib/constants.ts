// =====================================================================
// Agence Sanitas - Constantes partagées
// =====================================================================

export const COMPANY = {
  name: 'Agence Sanitas',
  tagline: 'Agence de placement en santé',
  phone: '450 973-9696',
  phoneHref: 'tel:+14509739696',
  email: 'rh@agencesanitas.com',
  emailHref: 'mailto:rh@agencesanitas.com',
  address: {
    line1: 'Suite 570',
    line2: '4 Place Laval',
    city: 'Laval',
    province: 'QC',
    postal: 'H7N 5Y3',
  },
  // Permis d'agence de placement de personnel (LNT) émis par la CNESST.
  // Obligation d'affichage pour les agences de placement au Québec.
  cnesstPermit: 'AP-2000952',
} as const;

export const QUEBEC_REGIONS: string[] = [
  'Abitibi-Témiscamingue',
  'Bas-Saint-Laurent',
  'Capitale-Nationale',
  'Centre-du-Québec',
  'Chaudière-Appalaches',
  'Côte-Nord',
  'Estrie',
  'Gaspésie–Îles-de-la-Madeleine',
  'Lanaudière',
  'Laurentides',
  'Laval',
  'Mauricie',
  'Montérégie',
  'Montréal',
  'Nord-du-Québec',
  'Outaouais',
  'Saguenay–Lac-Saint-Jean',
];

export const DEFAULT_JOB_COUNTRY = 'Canada';

export const JOB_COUNTRIES: string[] = [
  DEFAULT_JOB_COUNTRY,
  'Arabie saoudite',
];

export const INTERNATIONAL_CANDIDATE_COUNTRIES: string[] = [
  'Canada',
  'États-Unis',
  'Royaume-Uni',
  'France',
];

export function isInternationalCountry(country?: string | null): boolean {
  return !!country && country !== DEFAULT_JOB_COUNTRY;
}

export function defaultEligibleCountriesForJobCountry(country?: string | null): string[] {
  return isInternationalCountry(country) ? [...INTERNATIONAL_CANDIDATE_COUNTRIES] : [];
}

export const PROFESSIONS: string[] = [
  'Infirmier(ère)',
  'Infirmier(ère) clinicien(ne)',
  'Infirmier(ère) auxiliaire',
  'Préposé(e) aux bénéficiaires',
  'Auxiliaire aux services de santé et sociaux (ASSS)',
  'Inhalothérapeute',
  'Physiothérapeute',
  'Ergothérapeute',
  'Travailleur(se) social(e)',
  'Psychologue',
  'Technologue en radiologie',
  'Pharmacien(ne)',
  'Nutritionniste',
  'Médecin',
  'Agent(e) administratif(ve)',
];

export const PROFESSIONS_REQUIRING_PERMIT = new Set<string>([
  'Infirmier(ère)',
  'Infirmier(ère) clinicien(ne)',
  'Infirmier(ère) auxiliaire',
  'Inhalothérapeute',
  'Physiothérapeute',
  'Ergothérapeute',
  'Travailleur(se) social(e)',
  'Psychologue',
  'Technologue en radiologie',
  'Pharmacien(ne)',
  'Nutritionniste',
  'Médecin',
]);

export const PROFESSIONS_REQUIRING_PDSB = new Set<string>([
  'Préposé(e) aux bénéficiaires',
  'Auxiliaire aux services de santé et sociaux (ASSS)',
]);

export function professionRequiresPermit(profession?: string | null): boolean {
  if (!profession) return false;
  return PROFESSIONS_REQUIRING_PERMIT.has(profession);
}

export function professionRequiresPDSB(profession?: string | null): boolean {
  if (!profession) return false;
  return PROFESSIONS_REQUIRING_PDSB.has(profession);
}

export function professionKey(profession?: string | null): string {
  const value = (profession || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (!value) return '';
  if (
    value.includes('inf cli') ||
    value.includes('clinical nurse') ||
    value.includes('nurse clinician') ||
    (value.includes('infirm') && value.includes('clinicien'))
  ) {
    return 'nurse_clinician';
  }
  if (
    value.includes('infirmiere auxiliaire') ||
    value.includes('infirmier auxiliaire') ||
    value.includes('licensed practical nurse') ||
    value === 'lpn'
  ) {
    return 'licensed_practical_nurse';
  }
  if (
    value === 'inf' ||
    value === 'rn' ||
    value === 'nurse' ||
    value.includes('infirmier') ||
    value.includes('infirmiere') ||
    value.includes('registered nurse')
  ) {
    return 'nurse';
  }
  if (value.includes('prepose') || value.includes('beneficiaire')) return 'pab';
  if (value.includes('asss') || value.includes('auxiliaire aux services')) return 'asss';
  return value;
}

const PROFESSION_COVERAGE: Record<string, string[]> = {
  // Une infirmiere clinicienne peut couvrir un mandat infirmier general.
  // L'inverse n'est pas vrai: infirmiere generale ne couvre pas clinicienne.
  nurse_clinician: ['nurse'],
};

export function professionCovers(candidateProfession?: string | null, mandateProfession?: string | null): boolean {
  const source = professionKey(candidateProfession);
  const target = professionKey(mandateProfession);
  if (!target) return true;
  if (!source) return false;
  return source === target || (PROFESSION_COVERAGE[source] || []).includes(target);
}

export function professionListCovers(
  candidateProfessions: Array<string | null | undefined> | undefined,
  mandateProfession?: string | null
): boolean {
  if (!mandateProfession) return true;
  return (candidateProfessions || []).some((profession) => professionCovers(profession, mandateProfession));
}

export const SHIFTS = ['Jour', 'Soir', 'Nuit'] as const;

export const MANDATE_TYPES = [
  'Remplacement',
  'Remplacement long terme',
  'Temporaire',
  'Court terme',
  'Long terme',
  'Permanent',
  'Sur appel',
] as const;

export const URGENCY_LEVELS = ['normal', 'high', 'urgent'] as const;
export const URGENCY_LABELS: Record<string, string> = {
  normal: 'Normal',
  high: 'Prioritaire',
  urgent: 'Urgent',
};

export const SUBMISSION_STATUSES = [
  'Nouveau',
  'À appeler',
  'Qualifié',
  'Documents manquants',
  'Prêt à présenter',
  'Présenté',
  'Placé',
  'Refusé',
  'Inactif',
] as const;

export const ESTABLISHMENT_REQUEST_STATUSES = [
  'Nouvelle',
  'À analyser',
  'En traitement',
  'Poste créé',
  'Fermée',
] as const;

export const DOCUMENT_TYPES = [
  'CV',
  "Permis d'exercice",
  'RCR',
  'PDSB',
  'Carnet de vaccination',
] as const;

export const CONTACT_PREFS = ['Téléphone', 'SMS', 'Courriel', 'WhatsApp'] as const;
export const CONTACT_TIMES = ['Matin', 'Après-midi', 'Soir', 'Peu importe'] as const;
export const LANGUAGES = ['Français', 'Anglais', 'Autre'] as const;
export const WORK_AUTH = ['Oui', 'Non', 'Permis de travail', 'À discuter'] as const;
export const PERMIT_STATUSES = ['Oui, valide', 'En renouvellement', 'Non'] as const;
export const YEARS_EXPERIENCE = [
  'Moins de 1 an',
  '1 à 2 ans',
  '3 à 5 ans',
  '6 à 10 ans',
  '10 ans et plus',
] as const;
export const MOBILITY = [
  'Locale seulement',
  'Régionale',
  'Partout au Québec',
  'Canada',
  'International',
] as const;
export const START_AVAILABILITY = [
  'Dès que possible',
  'Cette semaine',
  'Dans 2 semaines',
  'Dans 1 mois',
  'À discuter',
] as const;
export const HOUSING_CHOICES = ['Oui', 'Non', 'Selon la distance', 'À discuter'] as const;
export const TRANSPORT_CHOICES = [
  'Oui, véhicule personnel',
  'Oui, transport en commun',
  'Non',
  'À discuter',
] as const;
export const YES_NO_DISCUSS = ['Oui', 'Non', 'À discuter'] as const;

// Départements groupés
export interface DepartmentGroup {
  label: string;
  items: string[];
}

export const DEPARTMENT_GROUPS: DepartmentGroup[] = [
  {
    label: 'Soins aigus et hospitaliers',
    items: [
      'Urgence',
      'Médecine',
      'Chirurgie',
      'Médecine et chirurgie',
      'Hospitalisation',
      'Courte durée',
      'Unité de soins de courte durée',
      'Débordement',
      'Transition',
      'Observation',
      'Soins intermédiaires',
    ],
  },
  {
    label: 'Soins spécialisés',
    items: [
      'Cardiologie',
      'Hémato-oncologie',
      'Hémodialyse',
      'Bloc opératoire',
      'Soins intensifs',
      'Unité de soins intensifs',
      'Endoscopie',
      'Oncologie',
      'Pneumologie',
      'Neurologie',
      'Néphrologie',
      'Orthopédie',
      'Urologie',
      'Gastro-entérologie',
    ],
  },
  {
    label: 'Mère-enfant',
    items: [
      'Obstétrique',
      'Pédiatrie',
      'Obstétrique et pédiatrie',
      'Périnatalité',
      'Pouponnière',
      'Néonatalogie',
      "Salle d'accouchement",
    ],
  },
  {
    label: 'Santé mentale',
    items: ['Psychiatrie', 'Pédopsychiatrie'],
  },
  {
    label: 'Gériatrie et longue durée',
    items: [
      'Gériatrie',
      "Centre d'hébergement et de soins de longue durée",
      'Unité de soins de longue durée',
      'Unité de courte durée gériatrique',
      'Résidence privée pour aînés',
    ],
  },
  {
    label: 'Réadaptation',
    items: [
      'Réadaptation',
      'Unité de réadaptation fonctionnelle intensive',
      'Unité de courte durée gériatrique et unité de réadaptation fonctionnelle intensive',
      'Physiothérapie',
      'Ergothérapie',
      'Orthophonie',
      'Réadaptation physique',
      'Réadaptation neurologique',
      'Réadaptation respiratoire',
    ],
  },
  {
    label: 'Soins à domicile et communautaires',
    items: [
      'Soutien à domicile',
      'Dispensaire',
      'Centre local de services communautaires',
      'Vaccination',
      'Prélèvements',
      'Dépistage',
      'Info-Santé',
    ],
  },
  {
    label: 'Milieu carcéral',
    items: ['Milieu carcéral'],
  },
  {
    label: 'Soins palliatifs',
    items: ['Soins palliatifs'],
  },
];

export const ALL_DEPARTMENTS: string[] = DEPARTMENT_GROUPS.flatMap((g) => g.items);

export const CONTACT_TYPES = [
  'Je suis candidat',
  'Je représente un établissement',
  'Autre demande',
] as const;
