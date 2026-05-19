import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import FaqLandingPage, { type FaqGroup } from '@/components/FaqLandingPage';
import { breadcrumbJsonLd, faqPageJsonLd, publicPageMetadata } from '@/lib/seo';

const groups: FaqGroup[] = [
  {
    title: 'Demander du personnel',
    items: [
      {
        question: 'Quels types de besoins Sanitas peut-elle recevoir?',
        answer:
          'Sanitas peut recevoir des besoins urgents, ponctuels, récurrents ou planifiés pour des professionnels de la santé au Québec.',
      },
      {
        question: 'Quelles informations faut-il fournir pour un mandat?',
        answer:
          'Les informations les plus utiles sont la profession, la région, la ville, l’établissement, le département, le quart, la date de début, la durée, les documents requis et le niveau d’urgence.',
      },
      {
        question: 'Est-ce que Sanitas couvre plusieurs régions du Québec?',
        answer:
          'Oui. Sanitas est basée à Laval et peut traiter des besoins dans plusieurs régions du Québec selon les mandats actifs et les profils disponibles.',
      },
    ],
  },
  {
    title: 'Qualification et présentation',
    items: [
      {
        question: 'Comment les profils sont-ils priorisés?',
        answer:
          'Le recruteur vérifie la profession, la région, le département, le quart, la disponibilité, les documents et les contraintes du candidat avant de présenter un profil.',
      },
      {
        question: 'Les documents sont-ils suivis?',
        answer:
          'Oui. Le dossier candidat peut suivre le CV, permis, RCR, PDSB, carnet de vaccination et autres documents requis selon le mandat.',
      },
      {
        question: 'Comment communiquer un besoin urgent?',
        answer:
          'Le formulaire établissement permet de soumettre le besoin en ligne. Vous pouvez aussi appeler Sanitas au 450 973-9696 pour un besoin pressant.',
      },
    ],
  },
];

const allQuestions = groups.flatMap((group) => group.items);

export const metadata = publicPageMetadata({
  title: 'FAQ établissements | Placement personnel de santé Québec',
  description:
    'Questions fréquentes pour les établissements: demander du personnel de santé, critères de mandat, documents, qualification et suivi Sanitas.',
  path: '/faq-etablissements',
  frPath: '/faq-etablissements',
  enPath: '/en/facility-faq',
});

export default function FacilityFaqPage() {
  return (
    <PublicLayout>
      <SeoJsonLd
        id="facility-faq-schema"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            faqPageJsonLd(allQuestions),
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'FAQ établissements', url: '/faq-etablissements' },
            ]),
          ],
        }}
      />
      <FaqLandingPage
        eyebrow="Questions établissements"
        title="FAQ établissements"
        intro="Les réponses utiles pour soumettre un besoin en personnel de santé et comprendre comment Sanitas qualifie les profils."
        groups={groups}
        primaryCta={{ label: 'Demander du personnel', href: '/etablissements' }}
        secondaryCta={{ label: 'Nous contacter', href: '/contact' }}
      />
    </PublicLayout>
  );
}
