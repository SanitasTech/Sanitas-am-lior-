import type { Locale } from '@/lib/i18n';

type SeoSection = { title: string; body: string };
type SeoLink = { label: string; href: string };

export interface LocalSeoContent {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  highlights: string[];
  sections: SeoSection[];
  primaryCta: SeoLink;
  secondaryCta?: SeoLink;
  relatedLinks: SeoLink[];
}

export interface LocalSeoPagePair {
  fr: LocalSeoContent;
  en: LocalSeoContent;
  priority: number;
}

function jobsHref(locale: Locale, filters: Record<string, string>) {
  const params = new URLSearchParams(filters);
  return `${locale === 'en' ? '/en/jobs' : '/postes'}?${params.toString()}`;
}

const nurse = 'Infirmier(ère)';
const pab = 'Préposé(e) aux bénéficiaires';

export const LOCAL_SEO_PAGES: LocalSeoPagePair[] = [
  {
    priority: 0.82,
    fr: {
      slug: 'emplois-infirmieres-montreal',
      metaTitle: 'Emplois infirmières à Montréal | Agence Sanitas',
      metaDescription:
        'Trouvez des mandats infirmiers à Montréal avec Agence Sanitas. Filtrez les postes par quart, département, disponibilité et type de mandat.',
      eyebrow: 'Montréal',
      title: 'Emplois infirmières à Montréal',
      intro:
        'Agence Sanitas aide les infirmières et infirmiers qui cherchent des mandats à Montréal à préciser leurs disponibilités, départements, quarts et préférences.',
      highlights: [
        'Recherche par profession, région de Montréal, département, quart et type de mandat.',
        'Profil candidat réutilisable pour conserver CV, documents, disponibilités et préférences.',
        'Possibilité de postuler en ligne ou d’appeler Sanitas au 450 973-9696.',
      ],
      sections: [
        {
          title: 'Mandats infirmiers ciblés',
          body:
            'La recherche Sanitas permet d’éviter les propositions trop générales en tenant compte des départements, quarts et contraintes du candidat.',
        },
        {
          title: 'Un dossier prêt pour les recruteurs',
          body:
            'Un profil complet avec CV et documents facilite la qualification avant une présentation à un établissement.',
        },
        {
          title: 'Montréal et environs',
          body:
            'Les candidats peuvent indiquer Montréal comme région recherchée et préciser leurs villes, établissements ou contraintes de déplacement.',
        },
        {
          title: 'Suivi humain',
          body:
            'Un recruteur peut valider les disponibilités et préférences avant de proposer ou présenter un mandat.',
        },
      ],
      primaryCta: { label: 'Voir les postes infirmiers à Montréal', href: jobsHref('fr', { profession: nurse, region: 'Montréal' }) },
      secondaryCta: { label: 'Envoyer mon profil', href: '/postuler' },
      relatedLinks: [
        { label: 'Emplois infirmières Québec', href: '/emplois-infirmieres-quebec' },
        { label: 'FAQ candidats', href: '/faq-candidats' },
        { label: 'Emplois infirmières Montérégie', href: '/emplois-infirmieres-monteregie' },
      ],
    },
    en: {
      slug: 'nursing-jobs-montreal-agency',
      metaTitle: 'Nursing jobs in Montreal | Agence Sanitas',
      metaDescription:
        'Find nursing assignments in Montreal with Agence Sanitas. Filter by shift, department, availability and assignment type.',
      eyebrow: 'Montreal',
      title: 'Nursing jobs in Montreal',
      intro:
        'Agence Sanitas helps nurses looking for assignments in Montreal specify their availability, departments, shifts and preferences.',
      highlights: [
        'Search by profession, Montreal region, department, shift and assignment type.',
        'Reusable candidate profile for CV, documents, availability and preferences.',
        'Apply online or call Sanitas at 450 973-9696.',
      ],
      sections: [
        {
          title: 'Targeted nursing assignments',
          body:
            'Sanitas matching avoids overly broad suggestions by considering departments, shifts and candidate constraints.',
        },
        {
          title: 'A recruiter-ready file',
          body:
            'A complete profile with CV and documents supports qualification before presentation to a facility.',
        },
        {
          title: 'Montreal and nearby areas',
          body:
            'Candidates can select Montreal as a preferred region and specify cities, facilities or travel constraints.',
        },
        {
          title: 'Human follow-up',
          body:
            'A recruiter can validate availability and preferences before proposing or presenting an assignment.',
        },
      ],
      primaryCta: { label: 'View nursing jobs in Montreal', href: jobsHref('en', { profession: nurse, region: 'Montréal' }) },
      secondaryCta: { label: 'Submit my profile', href: '/en/apply' },
      relatedLinks: [
        { label: 'Nursing jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
        { label: 'Candidate FAQ', href: '/en/candidate-faq' },
        { label: 'Nursing jobs Monteregie', href: '/en/nursing-jobs-monteregie-agency' },
      ],
    },
  },
  {
    priority: 0.8,
    fr: {
      slug: 'emplois-infirmieres-monteregie',
      metaTitle: 'Emplois infirmières en Montérégie | Agence Sanitas',
      metaDescription:
        'Trouvez des mandats infirmiers en Montérégie avec Agence Sanitas. Postes par région, quart, département et disponibilité.',
      eyebrow: 'Montérégie',
      title: 'Emplois infirmières en Montérégie',
      intro:
        'Pour les infirmières et infirmiers qui cherchent des mandats en Montérégie, Sanitas centralise les préférences, disponibilités et documents dans un dossier unique.',
      highlights: [
        'Mandats filtrables par région Montérégie, département, quart et type de mandat.',
        'Préférences croisées pour éviter de mélanger région, département et quart incompatibles.',
        'CV et documents suivis dans le dossier candidat.',
      ],
      sections: [
        {
          title: 'Une recherche plus précise',
          body:
            'Le candidat peut préciser les combinaisons acceptées: région, département, quart, mobilité et contraintes.',
        },
        {
          title: 'Postuler aux mandats actifs',
          body:
            'Les postes actifs peuvent être filtrés directement pour repérer les besoins infirmiers en Montérégie.',
        },
        {
          title: 'Réduire les faux matchs',
          body:
            'Le recruteur peut valider les choix de mandat avant d’appeler ou de présenter un profil.',
        },
        {
          title: 'Accompagnement Sanitas',
          body:
            'L’équipe demeure joignable pour discuter des disponibilités, documents et préférences.',
        },
      ],
      primaryCta: { label: 'Voir les postes en Montérégie', href: jobsHref('fr', { profession: nurse, region: 'Montérégie' }) },
      secondaryCta: { label: 'Créer mon profil', href: '/postuler' },
      relatedLinks: [
        { label: 'Emplois infirmières Montréal', href: '/emplois-infirmieres-montreal' },
        { label: 'Mandats en région éloignée', href: '/mandats-infirmiers-region-eloignee' },
        { label: 'FAQ candidats', href: '/faq-candidats' },
      ],
    },
    en: {
      slug: 'nursing-jobs-monteregie-agency',
      metaTitle: 'Nursing jobs in Monteregie | Agence Sanitas',
      metaDescription:
        'Find nursing assignments in Monteregie with Agence Sanitas. Search by region, shift, department and availability.',
      eyebrow: 'Monteregie',
      title: 'Nursing jobs in Monteregie',
      intro:
        'For nurses looking for assignments in Monteregie, Sanitas keeps preferences, availability and documents in one candidate file.',
      highlights: [
        'Assignments can be filtered by Monteregie region, department, shift and assignment type.',
        'Preference groups help avoid combining incompatible regions, departments and shifts.',
        'CV and documents are tracked in the candidate profile.',
      ],
      sections: [
        {
          title: 'More precise search',
          body:
            'Candidates can clarify acceptable combinations: region, department, shift, mobility and constraints.',
        },
        {
          title: 'Apply to active assignments',
          body:
            'Active jobs can be filtered directly to identify nursing needs in Monteregie.',
        },
        {
          title: 'Reduce false matches',
          body:
            'Recruiters can validate mandate choices before calling or presenting a profile.',
        },
        {
          title: 'Sanitas follow-up',
          body:
            'The team remains available to discuss availability, documents and preferences.',
        },
      ],
      primaryCta: { label: 'View Monteregie nursing jobs', href: jobsHref('en', { profession: nurse, region: 'Montérégie' }) },
      secondaryCta: { label: 'Create my profile', href: '/en/apply' },
      relatedLinks: [
        { label: 'Nursing jobs Montreal', href: '/en/nursing-jobs-montreal-agency' },
        { label: 'Remote nursing assignments', href: '/en/remote-region-nursing-assignments-quebec' },
        { label: 'Candidate FAQ', href: '/en/candidate-faq' },
      ],
    },
  },
  {
    priority: 0.78,
    fr: {
      slug: 'emplois-pab-laval',
      metaTitle: 'Emplois PAB à Laval | Agence Sanitas',
      metaDescription:
        'Trouvez des mandats PAB à Laval avec Agence Sanitas. Indiquez vos disponibilités, quarts, mobilité et documents requis.',
      eyebrow: 'Laval',
      title: 'Emplois PAB à Laval',
      intro:
        'Agence Sanitas accompagne les PAB qui cherchent des mandats à Laval ou dans les environs, avec un dossier candidat simple à réutiliser.',
      highlights: [
        'Filtre par profession PAB, région de Laval, quart, disponibilité et type de mandat.',
        'Dossier candidat avec CV, documents, préférences et contraintes.',
        'Option de postuler en ligne ou d’appeler Sanitas.',
      ],
      sections: [
        {
          title: 'Mandats PAB plus pertinents',
          body:
            'Vos disponibilités, quarts et préférences permettent de mieux cibler les mandats compatibles.',
        },
        {
          title: 'Profil réutilisable',
          body:
            'Le dossier Sanitas évite de répéter les mêmes informations pour chaque candidature.',
        },
        {
          title: 'Documents à jour',
          body:
            'Le CV et les documents requis peuvent être suivis dans votre espace candidat.',
        },
        {
          title: 'Suivi local',
          body:
            'Sanitas est basée à Laval et peut accompagner les candidats qui souhaitent parler à l’équipe avant de postuler.',
        },
      ],
      primaryCta: { label: 'Voir les postes PAB à Laval', href: jobsHref('fr', { profession: pab, region: 'Laval' }) },
      secondaryCta: { label: 'Envoyer mon profil', href: '/postuler' },
      relatedLinks: [
        { label: 'Emplois PAB Québec', href: '/emplois-pab-quebec' },
        { label: 'Agence placement santé Laval', href: '/agence-placement-sante-laval' },
        { label: 'FAQ candidats', href: '/faq-candidats' },
      ],
    },
    en: {
      slug: 'pab-jobs-laval',
      metaTitle: 'PAB jobs in Laval | Agence Sanitas',
      metaDescription:
        'Find PAB assignments in Laval with Agence Sanitas. Share your availability, shifts, mobility and required documents.',
      eyebrow: 'Laval',
      title: 'PAB jobs in Laval',
      intro:
        'Agence Sanitas supports PAB candidates looking for assignments in Laval or nearby areas with a reusable candidate profile.',
      highlights: [
        'Filter by PAB role, Laval region, shift, availability and assignment type.',
        'Candidate file with CV, documents, preferences and constraints.',
        'Apply online or call Sanitas.',
      ],
      sections: [
        {
          title: 'More relevant PAB assignments',
          body:
            'Your availability, shifts and preferences help target compatible assignments.',
        },
        {
          title: 'Reusable profile',
          body:
            'The Sanitas file avoids repeating the same information for every application.',
        },
        {
          title: 'Current documents',
          body:
            'Your CV and required documents can be tracked in your candidate portal.',
        },
        {
          title: 'Local follow-up',
          body:
            'Sanitas is based in Laval and can support candidates who prefer to speak with the team before applying.',
        },
      ],
      primaryCta: { label: 'View PAB jobs in Laval', href: jobsHref('en', { profession: pab, region: 'Laval' }) },
      secondaryCta: { label: 'Submit my profile', href: '/en/apply' },
      relatedLinks: [
        { label: 'PAB jobs Quebec', href: '/en/pab-jobs-quebec' },
        { label: 'Healthcare staffing Laval', href: '/en/healthcare-staffing-laval' },
        { label: 'Candidate FAQ', href: '/en/candidate-faq' },
      ],
    },
  },
  {
    priority: 0.76,
    fr: {
      slug: 'agence-placement-infirmiere-montreal',
      metaTitle: 'Agence de placement infirmière Montréal | Agence Sanitas',
      metaDescription:
        'Agence Sanitas aide les établissements à Montréal à structurer leurs besoins en personnel infirmier: région, département, quart et urgence.',
      eyebrow: 'Établissements Montréal',
      title: 'Agence de placement infirmière à Montréal',
      intro:
        'Pour un besoin infirmier à Montréal, Sanitas aide à clarifier le mandat et à identifier les profils compatibles selon les critères opérationnels.',
      highlights: [
        'Besoin structuré par profession, région, ville, département, quart, date de début et urgence.',
        'Recherche de candidats selon préférences, disponibilité, documents et historique ATS.',
        'Suivi humain pour qualifier les profils avant présentation.',
      ],
      sections: [
        {
          title: 'Clarifier le mandat',
          body:
            'Le formulaire établissement permet de transmettre les informations nécessaires pour une recherche plus précise.',
        },
        {
          title: 'Chercher les bons profils',
          body:
            'Le recruteur peut filtrer par profession, région, département, quart, documents et disponibilité.',
        },
        {
          title: 'Limiter les incompatibilités',
          body:
            'Les préférences croisées évitent de présenter un candidat qui accepte une région mais pas le département demandé.',
        },
        {
          title: 'Réponse structurée',
          body:
            'Sanitas peut traiter un besoin ponctuel, urgent, récurrent ou planifié avec une logique de qualification claire.',
        },
      ],
      primaryCta: { label: 'Demander du personnel', href: '/etablissements' },
      secondaryCta: { label: 'Nous contacter', href: '/contact' },
      relatedLinks: [
        { label: 'FAQ établissements', href: '/faq-etablissements' },
        { label: 'Recrutement personnel santé', href: '/recrutement-personnel-sante-quebec' },
        { label: 'Emplois infirmières Montréal', href: '/emplois-infirmieres-montreal' },
      ],
    },
    en: {
      slug: 'nursing-staffing-agency-montreal',
      metaTitle: 'Nursing staffing agency in Montreal | Agence Sanitas',
      metaDescription:
        'Agence Sanitas helps Montreal facilities structure nursing staffing needs by region, department, shift and urgency.',
      eyebrow: 'Montreal facilities',
      title: 'Nursing staffing agency in Montreal',
      intro:
        'For a nursing staffing need in Montreal, Sanitas helps clarify the mandate and identify compatible profiles based on operational criteria.',
      highlights: [
        'Needs structured by profession, region, city, department, shift, start date and urgency.',
        'Candidate search based on preferences, availability, documents and ATS history.',
        'Human follow-up to qualify profiles before presentation.',
      ],
      sections: [
        {
          title: 'Clarify the mandate',
          body:
            'The facility form captures the information needed for a more precise search.',
        },
        {
          title: 'Find the right profiles',
          body:
            'Recruiters can filter by profession, region, department, shift, documents and availability.',
        },
        {
          title: 'Reduce incompatibilities',
          body:
            'Preference groups help avoid presenting a candidate who accepts a region but not the required department.',
        },
        {
          title: 'Structured response',
          body:
            'Sanitas can handle occasional, urgent, recurring or planned needs with a clear qualification process.',
        },
      ],
      primaryCta: { label: 'Request staff', href: '/en/facilities' },
      secondaryCta: { label: 'Contact us', href: '/en/contact' },
      relatedLinks: [
        { label: 'Facility FAQ', href: '/en/facility-faq' },
        { label: 'Healthcare recruitment Quebec', href: '/en/healthcare-recruitment-quebec' },
        { label: 'Nursing jobs Montreal', href: '/en/nursing-jobs-montreal-agency' },
      ],
    },
  },
  {
    priority: 0.74,
    fr: {
      slug: 'agence-placement-sante-monteregie',
      metaTitle: 'Agence de placement santé Montérégie | Agence Sanitas',
      metaDescription:
        'Agence Sanitas accompagne les besoins en personnel de santé en Montérégie: infirmières, PAB, ASSS et autres professionnels.',
      eyebrow: 'Établissements Montérégie',
      title: 'Agence de placement santé en Montérégie',
      intro:
        'Sanitas aide les établissements en Montérégie à structurer leurs besoins de personnel de santé et à rechercher des profils compatibles.',
      highlights: [
        'Besoins par profession, région, ville, département, quart et documents requis.',
        'Candidats évalués selon préférences, disponibilité, documents et contraintes.',
        'Suivi recruteur pour prioriser les profils à appeler ou à présenter.',
      ],
      sections: [
        {
          title: 'Un besoin mieux qualifié',
          body:
            'Plus les critères du mandat sont précis, plus la recherche de candidats peut devenir actionnable.',
        },
        {
          title: 'Professions couvertes',
          body:
            'Infirmières, infirmières auxiliaires, PAB, ASSS et autres professionnels de la santé peuvent être considérés selon les besoins.',
        },
        {
          title: 'Prioriser les bons candidats',
          body:
            'La console recruteur peut distinguer les profils présentables, à valider ou bloqués par document.',
        },
        {
          title: 'Contact direct',
          body:
            'Les établissements peuvent transmettre un besoin en ligne ou contacter Sanitas par téléphone.',
        },
      ],
      primaryCta: { label: 'Demander du personnel', href: '/etablissements' },
      secondaryCta: { label: 'FAQ établissements', href: '/faq-etablissements' },
      relatedLinks: [
        { label: 'Emplois infirmières Montérégie', href: '/emplois-infirmieres-monteregie' },
        { label: 'Agence placement infirmière Montréal', href: '/agence-placement-infirmiere-montreal' },
        { label: 'Recrutement personnel santé', href: '/recrutement-personnel-sante-quebec' },
      ],
    },
    en: {
      slug: 'healthcare-staffing-monteregie',
      metaTitle: 'Healthcare staffing in Monteregie | Agence Sanitas',
      metaDescription:
        'Agence Sanitas supports healthcare staffing needs in Monteregie for nurses, PABs, ASSS and other healthcare professionals.',
      eyebrow: 'Monteregie facilities',
      title: 'Healthcare staffing in Monteregie',
      intro:
        'Sanitas helps Monteregie facilities structure healthcare staffing needs and search for compatible candidate profiles.',
      highlights: [
        'Needs organized by profession, region, city, department, shift and required documents.',
        'Candidates reviewed through preferences, availability, documents and constraints.',
        'Recruiter follow-up to prioritize profiles to call or present.',
      ],
      sections: [
        {
          title: 'A better-qualified need',
          body:
            'The more precise the mandate criteria, the more actionable the candidate search becomes.',
        },
        {
          title: 'Roles covered',
          body:
            'Nurses, licensed practical nurses, PABs, ASSS and other healthcare professionals can be considered depending on the need.',
        },
        {
          title: 'Prioritize the right candidates',
          body:
            'The recruiter console can distinguish profiles that are presentable, to validate or blocked by documents.',
        },
        {
          title: 'Direct contact',
          body:
            'Facilities can submit a need online or contact Sanitas by phone.',
        },
      ],
      primaryCta: { label: 'Request staff', href: '/en/facilities' },
      secondaryCta: { label: 'Facility FAQ', href: '/en/facility-faq' },
      relatedLinks: [
        { label: 'Nursing jobs Monteregie', href: '/en/nursing-jobs-monteregie-agency' },
        { label: 'Nursing staffing Montreal', href: '/en/nursing-staffing-agency-montreal' },
        { label: 'Healthcare recruitment Quebec', href: '/en/healthcare-recruitment-quebec' },
      ],
    },
  },
  {
    priority: 0.72,
    fr: {
      slug: 'agence-placement-sante-quebec',
      metaTitle: 'Agence de placement santé à Québec | Agence Sanitas',
      metaDescription:
        'Agence Sanitas accompagne les établissements de la ville de Québec et de la Capitale-Nationale pour leurs besoins en personnel de santé.',
      eyebrow: 'Québec et Capitale-Nationale',
      title: 'Agence de placement santé à Québec',
      intro:
        'Pour les besoins en personnel de santé dans la ville de Québec et la Capitale-Nationale, Sanitas aide à structurer les critères du mandat.',
      highlights: [
        'Recherche par profession, région, ville, département, quart, date de début et urgence.',
        'Candidats évalués selon disponibilité, documents, mobilité et préférences.',
        'Processus conçu pour rendre la recherche recruteur plus rapide et plus claire.',
      ],
      sections: [
        {
          title: 'Structurer le besoin',
          body:
            'Un mandat bien défini permet de savoir rapidement quels candidats appeler, valider ou écarter.',
        },
        {
          title: 'Couvrir plusieurs professions',
          body:
            'Sanitas peut traiter des besoins pour infirmières, infirmières auxiliaires, PAB, ASSS et autres profils de santé.',
        },
        {
          title: 'Documents et disponibilité',
          body:
            'Le suivi du CV, des documents et des dates de disponibilité aide à accélérer la qualification.',
        },
        {
          title: 'Équipe joignable',
          body:
            'Les établissements peuvent soumettre une demande en ligne ou appeler Sanitas pour clarifier le besoin.',
        },
      ],
      primaryCta: { label: 'Demander du personnel', href: '/etablissements' },
      secondaryCta: { label: 'Nous contacter', href: '/contact' },
      relatedLinks: [
        { label: 'FAQ établissements', href: '/faq-etablissements' },
        { label: 'Recrutement personnel santé', href: '/recrutement-personnel-sante-quebec' },
        { label: 'Tous les postes', href: '/postes' },
      ],
    },
    en: {
      slug: 'healthcare-staffing-quebec-city',
      metaTitle: 'Healthcare staffing in Quebec City | Agence Sanitas',
      metaDescription:
        'Agence Sanitas supports healthcare facilities in Quebec City and Capitale-Nationale with structured healthcare staffing needs.',
      eyebrow: 'Quebec City',
      title: 'Healthcare staffing in Quebec City',
      intro:
        'For healthcare staffing needs in Quebec City and Capitale-Nationale, Sanitas helps structure mandate criteria clearly.',
      highlights: [
        'Search by profession, region, city, department, shift, start date and urgency.',
        'Candidates reviewed through availability, documents, mobility and preferences.',
        'Process designed to make recruiter search faster and clearer.',
      ],
      sections: [
        {
          title: 'Structure the need',
          body:
            'A well-defined mandate helps recruiters quickly know which candidates to call, validate or exclude.',
        },
        {
          title: 'Cover multiple roles',
          body:
            'Sanitas can process needs for nurses, licensed practical nurses, PABs, ASSS and other healthcare profiles.',
        },
        {
          title: 'Documents and availability',
          body:
            'Tracking CVs, documents and availability dates helps accelerate qualification.',
        },
        {
          title: 'Reachable team',
          body:
            'Facilities can submit a request online or call Sanitas to clarify the need.',
        },
      ],
      primaryCta: { label: 'Request staff', href: '/en/facilities' },
      secondaryCta: { label: 'Contact us', href: '/en/contact' },
      relatedLinks: [
        { label: 'Facility FAQ', href: '/en/facility-faq' },
        { label: 'Healthcare recruitment Quebec', href: '/en/healthcare-recruitment-quebec' },
        { label: 'All jobs', href: '/en/jobs' },
      ],
    },
  },
];

export const LOCAL_SEO_FOOTER_LINKS: Record<Locale, SeoLink[]> = {
  fr: [
    { label: 'Emplois infirmières Montréal', href: '/emplois-infirmieres-montreal' },
    { label: 'Emplois infirmières Montérégie', href: '/emplois-infirmieres-monteregie' },
    { label: 'Emplois PAB Laval', href: '/emplois-pab-laval' },
    { label: 'Placement infirmière Montréal', href: '/agence-placement-infirmiere-montreal' },
    { label: 'Placement santé Montérégie', href: '/agence-placement-sante-monteregie' },
    { label: 'Placement santé Québec', href: '/agence-placement-sante-quebec' },
  ],
  en: [
    { label: 'Nursing jobs Montreal', href: '/en/nursing-jobs-montreal-agency' },
    { label: 'Nursing jobs Monteregie', href: '/en/nursing-jobs-monteregie-agency' },
    { label: 'PAB jobs Laval', href: '/en/pab-jobs-laval' },
    { label: 'Nursing staffing Montreal', href: '/en/nursing-staffing-agency-montreal' },
    { label: 'Healthcare staffing Monteregie', href: '/en/healthcare-staffing-monteregie' },
    { label: 'Healthcare staffing Quebec City', href: '/en/healthcare-staffing-quebec-city' },
  ],
};

export function getLocalSeoPage(locale: Locale, slug: string): LocalSeoContent | null {
  const pair = LOCAL_SEO_PAGES.find((page) => page[locale].slug === slug);
  return pair ? pair[locale] : null;
}

export function getLocalSeoSlugs(locale: Locale): string[] {
  return LOCAL_SEO_PAGES.map((page) => page[locale].slug);
}

export function getLocalSeoRoutes() {
  return LOCAL_SEO_PAGES.map((page) => ({
    fr: `/${page.fr.slug}`,
    en: `/en/${page.en.slug}`,
    priority: page.priority,
    changeFrequency: 'monthly' as const,
  }));
}
