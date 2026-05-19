import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import FaqLandingPage, { type FaqGroup } from '@/components/FaqLandingPage';
import { breadcrumbJsonLd, faqPageJsonLd, publicPageMetadata } from '@/lib/seo';

const groups: FaqGroup[] = [
  {
    title: 'Postuler avec Sanitas',
    items: [
      {
        question: 'Est-ce que je dois créer un compte pour postuler?',
        answer:
          'Oui. La connexion Google sécurise votre dossier candidat et permet de réutiliser votre profil, vos documents et vos préférences pour plusieurs mandats.',
      },
      {
        question: 'Puis-je postuler sans remplir plusieurs fois les mêmes informations?',
        answer:
          'Oui. Votre dossier Sanitas conserve vos coordonnées, votre profession, vos disponibilités, vos régions, vos quarts, vos documents et vos préférences de mandat.',
      },
      {
        question: 'Que faire si je ne veux pas postuler en ligne?',
        answer:
          'Vous pouvez appeler Sanitas au 450 973-9696. Un membre de l’équipe pourra vous orienter et confirmer les informations nécessaires par téléphone.',
      },
    ],
  },
  {
    title: 'Documents et suivi',
    items: [
      {
        question: 'Le CV est-il obligatoire?',
        answer:
          'Oui. Le CV est nécessaire pour envoyer une candidature. Les autres documents dépendent de votre profession et du mandat visé.',
      },
      {
        question: 'Quels documents peuvent être demandés?',
        answer:
          'Selon le poste, Sanitas peut demander le permis d’exercice, RCR, PDSB, carnet de vaccination ou d’autres documents requis par l’établissement.',
      },
      {
        question: 'Que se passe-t-il après ma candidature?',
        answer:
          'Votre dossier est analysé, puis un recruteur peut vous contacter pour valider vos disponibilités, documents, préférences et la compatibilité avec le mandat.',
      },
    ],
  },
];

const allQuestions = groups.flatMap((group) => group.items);

export const metadata = publicPageMetadata({
  title: 'FAQ candidats | Emplois et mandats en santé au Québec',
  description:
    'Réponses aux questions des candidats Sanitas: postuler, compte Google, CV, documents, suivi recruteur et mandats en santé au Québec.',
  path: '/faq-candidats',
  frPath: '/faq-candidats',
  enPath: '/en/candidate-faq',
});

export default function CandidateFaqPage() {
  return (
    <PublicLayout>
      <SeoJsonLd
        id="candidate-faq-schema"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            faqPageJsonLd(allQuestions),
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'FAQ candidats', url: '/faq-candidats' },
            ]),
          ],
        }}
      />
      <FaqLandingPage
        eyebrow="Questions candidates"
        title="FAQ candidats"
        intro="Les réponses essentielles pour postuler avec Agence Sanitas, préparer votre dossier et comprendre le suivi après candidature."
        groups={groups}
        primaryCta={{ label: 'Voir les postes', href: '/postes' }}
        secondaryCta={{ label: 'Envoyer mon profil', href: '/postuler' }}
      />
    </PublicLayout>
  );
}
