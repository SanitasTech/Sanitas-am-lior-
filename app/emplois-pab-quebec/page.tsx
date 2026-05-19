import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

const pabJobsHref = `/postes?profession=${encodeURIComponent('Préposé(e) aux bénéficiaires')}`;

export const metadata = publicPageMetadata({
  title: 'Emplois PAB au Québec | Mandats avec Agence Sanitas',
  description:
    'Trouvez des emplois et mandats PAB au Québec. Agence Sanitas recrute des préposé(e)s aux bénéficiaires pour CHSLD, résidences et milieux de soins.',
  path: '/emplois-pab-quebec',
  frPath: '/emplois-pab-quebec',
  enPath: '/en/pab-jobs-quebec',
});

export default function PabJobsQuebecPage() {
  return (
    <PublicLayout>
      <SeoLandingPage
        eyebrow="Emplois PAB"
        title="Emplois PAB au Québec"
        intro="Agence Sanitas recrute des préposé(e)s aux bénéficiaires pour des mandats adaptés aux disponibilités, aux régions et aux milieux de soins recherchés."
        highlights={[
          'Mandats en CHSLD, résidences privées pour aînés, soins de longue durée et soutien clinique.',
          'Sélection par région, quart, disponibilité, mobilité et documents requis.',
          'Option de postuler en ligne ou d’appeler Sanitas au 450 973-9696.',
        ]}
        sections={[
          {
            title: 'Un profil unique pour vos mandats',
            body:
              'Le portail candidat conserve vos coordonnées, documents, disponibilités et préférences pour faciliter les prochaines candidatures.',
          },
          {
            title: 'Des mandats selon vos disponibilités',
            body:
              'Jour, soir, nuit, court terme ou remplacement: vos choix servent à proposer des opportunités pertinentes plutôt que des postes incompatibles.',
          },
          {
            title: 'Documents et suivi',
            body:
              'Le CV est obligatoire pour envoyer une candidature. Les autres documents sont indiqués selon votre profession et le mandat visé.',
          },
          {
            title: 'Accompagnement Sanitas',
            body:
              'L’équipe peut vous appeler pour valider vos disponibilités, vos préférences et les mandats qui correspondent le mieux à votre réalité.',
          },
        ]}
        primaryCta={{ label: 'Voir les postes PAB', href: pabJobsHref }}
        secondaryCta={{ label: 'Envoyer mon profil', href: '/postuler' }}
        relatedLinks={[
          { label: 'Emplois infirmières', href: '/emplois-infirmieres-quebec' },
          { label: 'Tous les postes', href: '/postes' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
    </PublicLayout>
  );
}
