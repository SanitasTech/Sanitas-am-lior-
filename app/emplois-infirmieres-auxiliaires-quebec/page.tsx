import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

const lpnJobsHref = `/postes?profession=${encodeURIComponent('Infirmier(ère) auxiliaire')}`;

export const metadata = publicPageMetadata({
  title: 'Emplois infirmières auxiliaires au Québec | Agence Sanitas',
  description:
    'Trouvez des mandats pour infirmières et infirmiers auxiliaires au Québec avec Agence Sanitas: régions, quarts, disponibilité et documents.',
  path: '/emplois-infirmieres-auxiliaires-quebec',
  frPath: '/emplois-infirmieres-auxiliaires-quebec',
  enPath: '/en/licensed-practical-nurse-jobs-quebec',
});

export default function LpnJobsQuebecPage() {
  return (
    <PublicLayout>
      <SeoLandingPage
        eyebrow="Infirmières auxiliaires"
        title="Emplois infirmières auxiliaires au Québec"
        intro="Agence Sanitas recrute des infirmières et infirmiers auxiliaires pour des mandats alignés avec les régions, quarts et milieux de soins recherchés."
        highlights={[
          'Recherche de mandats par région, ville, département, quart, type de mandat et date de départ.',
          'Dossier candidat unique avec CV, permis, disponibilités, préférences et documents requis.',
          'Possibilité de postuler en ligne ou d’appeler Sanitas au 450 973-9696.',
        ]}
        sections={[
          {
            title: 'Des mandats plus pertinents',
            body:
              'Vos préférences permettent de distinguer les régions, départements et quarts réellement acceptés pour éviter les propositions trop larges.',
          },
          {
            title: 'Documents au bon endroit',
            body:
              'Le portail candidat centralise le CV, le permis et les documents requis pour faciliter la qualification avant présentation.',
          },
          {
            title: 'Suivi humain',
            body:
              'Un recruteur peut valider les détails importants avant de présenter votre profil à un établissement.',
          },
          {
            title: 'Postuler plus rapidement',
            body:
              'Une fois votre dossier complet, vous pouvez envoyer une candidature compatible plus rapidement, sans ressaisie inutile.',
          },
        ]}
        primaryCta={{ label: 'Voir les postes infirmière auxiliaire', href: lpnJobsHref }}
        secondaryCta={{ label: 'Envoyer mon profil', href: '/postuler' }}
        relatedLinks={[
          { label: 'FAQ candidats', href: '/faq-candidats' },
          { label: 'Emplois infirmières', href: '/emplois-infirmieres-quebec' },
          { label: 'Tous les postes', href: '/postes' },
        ]}
      />
    </PublicLayout>
  );
}
