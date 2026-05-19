import type { Application, Job } from '@/types';

export type Locale = 'fr' | 'en';

export const DEFAULT_LOCALE: Locale = 'fr';
export const LOCALES: Locale[] = ['fr', 'en'];

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'fr' || value === 'en';
}

export function dateLocale(locale: Locale): string {
  return locale === 'en' ? 'en-CA' : 'fr-CA';
}

export const ROUTES = {
  home: { fr: '/', en: '/en' },
  jobs: { fr: '/postes', en: '/en/jobs' },
  apply: { fr: '/postuler', en: '/en/apply' },
  interview: { fr: '/entrevue', en: '/en/interview' },
  thanks: { fr: '/merci', en: '/en/thank-you' },
  facilities: { fr: '/etablissements', en: '/en/facilities' },
  about: { fr: '/a-propos', en: '/en/about' },
  contact: { fr: '/contact', en: '/en/contact' },
  privacy: { fr: '/politique-confidentialite', en: '/en/privacy-policy' },
  login: { fr: '/connexion', en: '/en/login' },
  profile: { fr: '/mon-profil', en: '/en/my-profile' },
  documents: { fr: '/mes-documents', en: '/en/my-documents' },
  applications: { fr: '/mes-candidatures', en: '/en/my-applications' },
} as const;

type RouteKey = keyof typeof ROUTES;

const ROUTE_KEYS = Object.keys(ROUTES) as RouteKey[];

function splitHref(href: string) {
  const hashIndex = href.indexOf('#');
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const queryIndex = withoutHash.indexOf('?');
  return {
    path: queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash,
    suffix: (queryIndex >= 0 ? withoutHash.slice(queryIndex) : '') + hash,
  };
}

function isExternalHref(href: string) {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#')
  );
}

function mapStaticPath(path: string, targetLocale: Locale): string | null {
  for (const key of ROUTE_KEYS) {
    if (ROUTES[key].fr === path || ROUTES[key].en === path) {
      return ROUTES[key][targetLocale];
    }
  }
  return null;
}

function mapDynamicPath(path: string, targetLocale: Locale): string | null {
  if (path.startsWith('/postes/')) {
    return `${ROUTES.jobs[targetLocale]}/${path.slice('/postes/'.length)}`;
  }
  if (path.startsWith('/en/jobs/')) {
    return `${ROUTES.jobs[targetLocale]}/${path.slice('/en/jobs/'.length)}`;
  }
  return null;
}

export function localizedPath(locale: Locale, key: RouteKey, suffix = ''): string {
  return `${ROUTES[key][locale]}${suffix}`;
}

export function localizedJobPath(locale: Locale, jobId: string): string {
  return `${ROUTES.jobs[locale]}/${jobId}`;
}

export function localizeHref(locale: Locale, href: string): string {
  if (!href || isExternalHref(href) || href.startsWith('/api') || href.startsWith('/admin')) {
    return href;
  }
  if (href.startsWith('/auth')) return href;

  const { path, suffix } = splitHref(href);
  const mapped = mapStaticPath(path, locale) || mapDynamicPath(path, locale);
  return mapped ? `${mapped}${suffix}` : href;
}

export function alternateLocaleHref(href: string, targetLocale: Locale): string {
  if (!href || isExternalHref(href) || href.startsWith('/admin')) return href;
  const { path, suffix } = splitHref(href);
  const mapped = mapStaticPath(path, targetLocale) || mapDynamicPath(path, targetLocale);
  return mapped ? `${mapped}${suffix}` : ROUTES.home[targetLocale];
}

export const PUBLIC_COPY = {
  fr: {
    localeName: 'Français',
    nav: {
      jobs: 'Postes',
      facilities: 'Établissements',
      about: 'À propos',
      contact: 'Contact',
      login: 'Se connecter',
      staffing: 'Demander du personnel',
      profile: 'Mon profil',
      applications: 'Mes candidatures',
      documents: 'Mes documents',
      signOut: 'Se déconnecter',
      candidateSpace: 'Mon espace',
      primary: 'Navigation principale',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      homeAria: 'Accueil Agence Sanitas',
    },
    footer: {
      site: 'Site',
      information: 'Information',
      home: 'Accueil',
      sendProfile: 'Envoyer mon profil',
      candidateSpace: 'Espace candidat',
      privacy: 'Politique de confidentialité',
      rights: 'Tous droits réservés.',
      recruiterSpace: 'Espace recruteur',
      cnesst: 'Permis CNESST',
    },
    common: {
      choose: 'Choisir',
      all: 'Tous',
      allFem: 'Toutes',
      required: 'requis',
      save: 'Enregistrer',
      cancel: 'Annuler',
      edit: 'Modifier',
      close: 'Fermer',
      complete: 'Complet',
      incomplete: 'À compléter',
      missing: 'Manquant',
      received: 'Reçu',
      toReceive: 'À recevoir',
      replace: 'Remplacer',
      later: "Je l'enverrai plus tard",
      uploading: 'Téléversement...',
      upload: 'Glisser-déposer ou cliquer',
      fileTooLarge: 'Fichier trop volumineux (max 8 Mo).',
      uploadFailed: 'Échec du téléversement.',
      error: 'Erreur.',
      unknownError: 'Erreur inconnue.',
      phoneOrEmailRequired: 'Téléphone ou courriel requis.',
      consentRequired: 'Le consentement est obligatoire.',
      responseFast: 'Réponse rapide pendant les heures de bureau.',
      call: 'Appeler',
      writeUs: 'Nous écrire',
      openJobs: 'Voir les postes ouverts',
      backHome: "Retour à l'accueil",
    },
    jobs: {
      pageTitle: 'Mandats en santé',
      eyebrow: 'Postes',
      intro:
        "Filtrez les postes par profession, région, ville, établissement, département, quart ou type de mandat. Les postes affichés sont actifs et provenant d'Agence Sanitas.",
      emptyTitle: 'Aucun poste ne correspond.',
      emptyBody:
        "Essayez d'élargir vos critères, ou envoyez-nous votre profil. Nous vous contacterons lorsqu'un mandat compatible sera disponible.",
      count: 'poste disponible',
      countPlural: 'postes disponibles',
      allJobs: 'Tous les postes',
      viewJob: 'Voir le poste',
      interested: 'Je suis intéressé',
      wantMandate: 'Je veux ce mandat',
      askQuestion: 'Poser une question',
      summary: 'Résumé',
      backToJobs: 'Tous les postes',
      requirements: 'Exigences',
      particularities: 'Particularités',
      requiredDocuments: 'Documents requis',
      department: 'Département',
      shift: 'Quart',
      schedule: 'Horaire',
      mandateType: 'Type de mandat',
      startDate: 'Date de début',
      duration: 'Durée',
      salary: 'Rémunération',
      region: 'Région',
      city: 'Ville',
      establishment: 'Etablissement',
      type: 'Type',
      start: 'Debut',
      fallbackRequirements:
        "L'équipe Sanitas confirmera les exigences détaillées avec vous avant toute présentation.",
      fallbackParticularities:
        "Les particularités du mandat seront validées avec le recruteur Sanitas.",
    },
  },
  en: {
    localeName: 'English',
    nav: {
      jobs: 'Jobs',
      facilities: 'Facilities',
      about: 'About',
      contact: 'Contact',
      login: 'Sign in',
      staffing: 'Request staff',
      profile: 'My profile',
      applications: 'My applications',
      documents: 'My documents',
      signOut: 'Sign out',
      candidateSpace: 'My space',
      primary: 'Primary navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      homeAria: 'Agence Sanitas home',
    },
    footer: {
      site: 'Site',
      information: 'Information',
      home: 'Home',
      sendProfile: 'Submit my profile',
      candidateSpace: 'Candidate portal',
      privacy: 'Privacy policy',
      rights: 'All rights reserved.',
      recruiterSpace: 'Recruiter area',
      cnesst: 'CNESST permit',
    },
    common: {
      choose: 'Select',
      all: 'All',
      allFem: 'All',
      required: 'required',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      close: 'Close',
      complete: 'Complete',
      incomplete: 'To complete',
      missing: 'Missing',
      received: 'Received',
      toReceive: 'To send',
      replace: 'Replace',
      later: 'I will send it later',
      uploading: 'Uploading...',
      upload: 'Upload or click',
      fileTooLarge: 'File is too large (max 8 MB).',
      uploadFailed: 'Upload failed.',
      error: 'Error.',
      unknownError: 'Unknown error.',
      phoneOrEmailRequired: 'Phone or email is required.',
      consentRequired: 'Consent is required.',
      responseFast: 'We respond quickly during business hours.',
      call: 'Call',
      writeUs: 'Write to us',
      openJobs: 'View open jobs',
      backHome: 'Back to home',
    },
    jobs: {
      pageTitle: 'Healthcare assignments',
      eyebrow: 'Jobs',
      intro:
        'Filter open roles by profession, region, city, facility, department, shift or assignment type. These active openings come from Agence Sanitas.',
      emptyTitle: 'No jobs match your search.',
      emptyBody:
        'Try broadening your filters, or send us your profile. We will contact you when a compatible assignment is available.',
      count: 'job available',
      countPlural: 'jobs available',
      allJobs: 'All jobs',
      viewJob: 'View job',
      interested: 'I am interested',
      wantMandate: 'I want this assignment',
      askQuestion: 'Ask a question',
      summary: 'Summary',
      backToJobs: 'All jobs',
      requirements: 'Requirements',
      particularities: 'Notes',
      requiredDocuments: 'Required documents',
      department: 'Department',
      shift: 'Shift',
      schedule: 'Schedule',
      mandateType: 'Assignment type',
      startDate: 'Start date',
      duration: 'Duration',
      salary: 'Compensation',
      region: 'Region',
      city: 'City',
      establishment: 'Facility',
      type: 'Type',
      start: 'Start',
      fallbackRequirements:
        'The Sanitas team will confirm detailed requirements with you before presenting your profile.',
      fallbackParticularities:
        'Assignment details will be confirmed with a Sanitas recruiter.',
    },
  },
} as const;

export const OPTION_LABELS: Record<string, Partial<Record<Locale, string>>> = {
  // Professions
  'Infirmier(ere)': { en: 'Registered nurse' },
  'Infirmier(ère)': { en: 'Registered nurse' },
  'Infirmier(ere) clinicien(ne)': { en: 'Clinical nurse' },
  'Infirmier(ère) clinicien(ne)': { en: 'Clinical nurse' },
  'Infirmier(ere) auxiliaire': { en: 'Licensed practical nurse' },
  'Infirmier(ère) auxiliaire': { en: 'Licensed practical nurse' },
  'Prepose(e) aux beneficiaires': { en: 'Beneficiary attendant' },
  'Préposé(e) aux bénéficiaires': { en: 'Beneficiary attendant' },
  'Auxiliaire aux services de sante et sociaux (ASSS)': {
    en: 'Health and social services assistant (ASSS)',
  },
  'Auxiliaire aux services de santé et sociaux (ASSS)': {
    en: 'Health and social services assistant (ASSS)',
  },
  Inhalotherapeute: { en: 'Respiratory therapist' },
  'Inhalothérapeute': { en: 'Respiratory therapist' },
  Physiotherapeute: { en: 'Physiotherapist' },
  'Physiothérapeute': { en: 'Physiotherapist' },
  Ergotherapeute: { en: 'Occupational therapist' },
  'Ergothérapeute': { en: 'Occupational therapist' },
  'Travailleur(se) social(e)': { en: 'Social worker' },
  Psychologue: { en: 'Psychologist' },
  'Technologue en radiologie': { en: 'Medical radiation technologist' },
  'Pharmacien(ne)': { en: 'Pharmacist' },
  Nutritionniste: { en: 'Nutritionist' },
  Medecin: { en: 'Physician' },
  'Médecin': { en: 'Physician' },
  'Agent(e) administratif(ve)': { en: 'Administrative agent' },

  // Common options
  Jour: { en: 'Day' },
  Soir: { en: 'Evening' },
  Nuit: { en: 'Night' },
  Remplacement: { en: 'Replacement' },
  'Remplacement long terme': { en: 'Long-term replacement' },
  Temporaire: { en: 'Temporary' },
  'Court terme': { en: 'Short term' },
  'Long terme': { en: 'Long term' },
  Permanent: { en: 'Permanent' },
  'Sur appel': { en: 'On call' },
  Telephone: { en: 'Phone' },
  'Téléphone': { en: 'Phone' },
  Courriel: { en: 'Email' },
  Matin: { en: 'Morning' },
  'Apres-midi': { en: 'Afternoon' },
  'Après-midi': { en: 'Afternoon' },
  'Peu importe': { en: 'Any time' },
  Francais: { en: 'French' },
  'Français': { en: 'French' },
  Anglais: { en: 'English' },
  Autre: { en: 'Other' },
  Oui: { en: 'Yes' },
  Non: { en: 'No' },
  'Permis de travail': { en: 'Work permit' },
  'A discuter': { en: 'To discuss' },
  'À discuter': { en: 'To discuss' },
  'Oui, valide': { en: 'Yes, valid' },
  'En renouvellement': { en: 'Renewal in progress' },
  'Moins de 1 an': { en: 'Less than 1 year' },
  '1 a 2 ans': { en: '1 to 2 years' },
  '1 à 2 ans': { en: '1 to 2 years' },
  '3 a 5 ans': { en: '3 to 5 years' },
  '3 à 5 ans': { en: '3 to 5 years' },
  '6 a 10 ans': { en: '6 to 10 years' },
  '6 à 10 ans': { en: '6 to 10 years' },
  '10 ans et plus': { en: '10 years or more' },
  'Locale seulement': { en: 'Local only' },
  Regionale: { en: 'Regional' },
  'Régionale': { en: 'Regional' },
  'Partout au Quebec': { en: 'Anywhere in Quebec' },
  'Partout au Québec': { en: 'Anywhere in Quebec' },
  Canada: { en: 'Canada' },
  International: { en: 'International' },
  'Des que possible': { en: 'As soon as possible' },
  'Dès que possible': { en: 'As soon as possible' },
  'Cette semaine': { en: 'This week' },
  'Dans 2 semaines': { en: 'In 2 weeks' },
  'Dans 1 mois': { en: 'In 1 month' },
  'Selon la distance': { en: 'Depending on distance' },
  'Oui, vehicule personnel': { en: 'Yes, personal vehicle' },
  'Oui, véhicule personnel': { en: 'Yes, personal vehicle' },
  'Oui, transport en commun': { en: 'Yes, public transit' },

  // Documents and statuses
  "Permis d'exercice": { en: 'Professional permit' },
  'Carnet de vaccination': { en: 'Vaccination record' },
  'A recevoir': { en: 'To send' },
  'À recevoir': { en: 'To send' },
  Recu: { en: 'Received' },
  Reçu: { en: 'Received' },
  'A renouveler': { en: 'To renew' },
  'À renouveler': { en: 'To renew' },
  'Non applicable': { en: 'Not applicable' },

  // Application statuses
  Nouveau: { en: 'New' },
  Nouvelle: { en: 'New' },
  'A appeler': { en: 'To call' },
  'À appeler': { en: 'To call' },
  'A rappeler': { en: 'Call back' },
  'À rappeler': { en: 'Call back' },
  Qualifie: { en: 'Qualified' },
  'Qualifié': { en: 'Qualified' },
  Contacte: { en: 'Contacted' },
  'Contacté': { en: 'Contacted' },
  'Documents manquants': { en: 'Missing documents' },
  'Pret a presenter': { en: 'Ready to present' },
  'Prêt à présenter': { en: 'Ready to present' },
  Presente: { en: 'Presented' },
  'Présenté': { en: 'Presented' },
  Place: { en: 'Placed' },
  'Placé': { en: 'Placed' },
  'Non disponible': { en: 'Unavailable' },
  Inactif: { en: 'Inactive' },
  Refuse: { en: 'Declined' },
  'Refusé': { en: 'Declined' },
  Spontanee: { en: 'Spontaneous' },
  'Spontanée': { en: 'Spontaneous' },
  'Mandat precis': { en: 'Specific assignment' },
  'Mandat précis': { en: 'Specific assignment' },

  // Contact request types
  'Je suis candidat': { en: 'I am a candidate' },
  'Je représente un établissement': { en: 'I represent a facility' },
  'Je represente un etablissement': { en: 'I represent a facility' },
  'Autre demande': { en: 'Other request' },

  // Department groups
  'Soins aigus et hospitaliers': { en: 'Acute and hospital care' },
  'Soins spécialisés': { en: 'Specialized care' },
  'Soins specialises': { en: 'Specialized care' },
  'Mère-enfant': { en: 'Mother-child' },
  'Mere-enfant': { en: 'Mother-child' },
  'Santé mentale': { en: 'Mental health' },
  'Sante mentale': { en: 'Mental health' },
  'Gériatrie et longue durée': { en: 'Geriatrics and long-term care' },
  'Geriatrie et longue duree': { en: 'Geriatrics and long-term care' },
  Réadaptation: { en: 'Rehabilitation' },
  Readaptation: { en: 'Rehabilitation' },
  'Soins à domicile et communautaires': { en: 'Home and community care' },
  'Soins a domicile et communautaires': { en: 'Home and community care' },
  'Milieu carcéral': { en: 'Correctional setting' },
  'Milieu carceral': { en: 'Correctional setting' },
  'Soins palliatifs': { en: 'Palliative care' },

  // Departments
  Urgence: { en: 'Emergency' },
  Médecine: { en: 'Medicine' },
  Medecine: { en: 'Medicine' },
  Chirurgie: { en: 'Surgery' },
  'Médecine et chirurgie': { en: 'Medicine and surgery' },
  'Medecine et chirurgie': { en: 'Medicine and surgery' },
  Hospitalisation: { en: 'Hospitalization' },
  'Courte durée': { en: 'Short-stay care' },
  'Courte duree': { en: 'Short-stay care' },
  'Unité de soins de courte durée': { en: 'Short-stay care unit' },
  'Unite de soins de courte duree': { en: 'Short-stay care unit' },
  Débordement: { en: 'Overflow' },
  Debordement: { en: 'Overflow' },
  Transition: { en: 'Transition' },
  Observation: { en: 'Observation' },
  'Soins intermédiaires': { en: 'Intermediate care' },
  'Soins intermediaires': { en: 'Intermediate care' },
  Cardiologie: { en: 'Cardiology' },
  'Hémato-oncologie': { en: 'Hemato-oncology' },
  'Hemato-oncologie': { en: 'Hemato-oncology' },
  Hémodialyse: { en: 'Hemodialysis' },
  Hemodialyse: { en: 'Hemodialysis' },
  'Bloc opératoire': { en: 'Operating room' },
  'Bloc operatoire': { en: 'Operating room' },
  'Soins intensifs': { en: 'Intensive care' },
  'Unité de soins intensifs': { en: 'Intensive care unit' },
  'Unite de soins intensifs': { en: 'Intensive care unit' },
  Endoscopie: { en: 'Endoscopy' },
  Oncologie: { en: 'Oncology' },
  Pneumologie: { en: 'Pulmonology' },
  Neurologie: { en: 'Neurology' },
  Néphrologie: { en: 'Nephrology' },
  Nephrologie: { en: 'Nephrology' },
  Orthopédie: { en: 'Orthopedics' },
  Orthopedie: { en: 'Orthopedics' },
  Urologie: { en: 'Urology' },
  'Gastro-entérologie': { en: 'Gastroenterology' },
  'Gastro-enterologie': { en: 'Gastroenterology' },
  Obstétrique: { en: 'Obstetrics' },
  Obstetrique: { en: 'Obstetrics' },
  Pédiatrie: { en: 'Pediatrics' },
  Pediatrie: { en: 'Pediatrics' },
  'Obstétrique et pédiatrie': { en: 'Obstetrics and pediatrics' },
  'Obstetrique et pediatrie': { en: 'Obstetrics and pediatrics' },
  Périnatalité: { en: 'Perinatal care' },
  Perinatalite: { en: 'Perinatal care' },
  Pouponnière: { en: 'Nursery' },
  Pouponniere: { en: 'Nursery' },
  Néonatalogie: { en: 'Neonatology' },
  Neonatalogie: { en: 'Neonatology' },
  "Salle d'accouchement": { en: 'Delivery room' },
  Psychiatrie: { en: 'Psychiatry' },
  Pédopsychiatrie: { en: 'Child psychiatry' },
  Pedopsychiatrie: { en: 'Child psychiatry' },
  Gériatrie: { en: 'Geriatrics' },
  Geriatrie: { en: 'Geriatrics' },
  "Centre d'hébergement et de soins de longue durée": { en: 'Long-term care centre' },
  "Centre d'hebergement et de soins de longue duree": { en: 'Long-term care centre' },
  'Unité de soins de longue durée': { en: 'Long-term care unit' },
  'Unite de soins de longue duree': { en: 'Long-term care unit' },
  'Résidence privée pour aînés': { en: 'Private seniors residence' },
  'Residence privee pour aines': { en: 'Private seniors residence' },
  Physiothérapie: { en: 'Physiotherapy' },
  Physiotherapie: { en: 'Physiotherapy' },
  Ergothérapie: { en: 'Occupational therapy' },
  Ergotherapie: { en: 'Occupational therapy' },
  Orthophonie: { en: 'Speech therapy' },
  'Soutien à domicile': { en: 'Home support' },
  'Soutien a domicile': { en: 'Home support' },
  Dispensaire: { en: 'Dispensary' },
  'Centre local de services communautaires': { en: 'Local community service centre' },
  Vaccination: { en: 'Vaccination' },
  Prélèvements: { en: 'Specimen collection' },
  Prelevements: { en: 'Specimen collection' },
  Dépistage: { en: 'Screening' },
  Depistage: { en: 'Screening' },
  'Info-Santé': { en: 'Info-Sante' },
  'Info-Sante': { en: 'Info-Sante' },
};

export const URGENCY_DISPLAY: Record<string, Record<Locale, string>> = {
  normal: { fr: 'Normal', en: 'Regular' },
  high: { fr: 'Prioritaire', en: 'Priority' },
  urgent: { fr: 'Urgent', en: 'Urgent' },
};

export function displayValue(locale: Locale, value?: string | null): string {
  if (!value) return '';
  if (locale === 'fr') return value;
  return OPTION_LABELS[value]?.en || value;
}

export function displayList(locale: Locale, values?: Array<string | null | undefined> | null): string {
  return (values || []).map((value) => displayValue(locale, value)).filter(Boolean).join(', ');
}

export function optionLabel(locale: Locale, value: string): string {
  return displayValue(locale, value);
}

export function jobTitle(job: Job, locale: Locale): string {
  if (locale === 'en') {
    if (job.title_en) return job.title_en;
    const profession = displayValue(locale, job.profession);
    const city = job.city ? ` in ${job.city}` : '';
    const shift = job.shift ? `, ${displayValue(locale, job.shift).toLowerCase()} shift` : '';
    return `${profession} assignment${city}${shift}`;
  }
  return job.title;
}

export function jobRequirements(job: Job, locale: Locale): string | null {
  if (locale === 'en') return job.requirements_en || (job.requirements ? PUBLIC_COPY.en.jobs.fallbackRequirements : null);
  return job.requirements;
}

export function jobParticularities(job: Job, locale: Locale): string | null {
  if (locale === 'en') {
    return job.particularities_en || (job.particularities ? PUBLIC_COPY.en.jobs.fallbackParticularities : null);
  }
  return job.particularities;
}

export function applicationTitle(application: Application, locale: Locale): string {
  const snapshot = application.posting_snapshot || {};
  const type = application.application_type || application.submission_type || 'spontaneous';
  if (type !== 'posting') return locale === 'en' ? 'Spontaneous application' : 'Candidature spontanee';
  if (locale === 'en') {
    const titleEn = typeof snapshot.title_en === 'string' ? snapshot.title_en : '';
    if (titleEn) return titleEn;
    const profession = typeof snapshot.profession === 'string' ? displayValue(locale, snapshot.profession) : 'Healthcare';
    const city = typeof snapshot.city === 'string' && snapshot.city ? ` in ${snapshot.city}` : '';
    return `${profession} assignment${city}`;
  }
  return (typeof snapshot.title === 'string' && snapshot.title) || 'Mandat';
}

export function routeKeyForPath(pathname: string): RouteKey | null {
  const { path } = splitHref(pathname);
  for (const key of ROUTE_KEYS) {
    if (ROUTES[key].fr === path || ROUTES[key].en === path) return key;
  }
  if (path.startsWith('/postes/') || path.startsWith('/en/jobs/')) return 'jobs';
  return null;
}
