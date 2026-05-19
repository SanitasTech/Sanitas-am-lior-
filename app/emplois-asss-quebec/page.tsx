import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

const asssJobsHref = `/postes?profession=${encodeURIComponent('Auxiliaire aux services de santé et sociaux (ASSS)')}`;

export const metadata = publicPageMetadata({
  title: 'Emplois ASSS au Québec | Agence Sanitas',
  description:
    'Trouvez des mandats ASSS au Québec avec Agence Sanitas. Indiquez vos régions, quarts, disponibilités, mobilité et documents.',
  path: '/emplois-asss-quebec',
  frPath: '/emplois-asss-quebec',
  enPath: '/en/asss-jobs-quebec',
});

export default function AsssJobsQuebecPage() {
  return (
    <PublicLayout>
      <SeoLandingPage
        eyebrow="ASSS"
        title="Emplois ASSS au Québec"
        intro="Agence Sanitas accompagne les auxiliaires aux services de santé et sociaux qui cherchent des mandats compatibles avec leurs disponibilités et leur mobilité."
        highlights={[
          'Mandats filtrables par région, ville, quart, type de mandat, date de départ et contraintes.',
          'Dossier candidat réutilisable pour éviter de répéter les mêmes informations à chaque candidature.',
          'Suivi des documents requis selon la profession et le mandat.',
        ]}
        sections={[
          {
            title: 'Vos contraintes sont importantes',
            body:
              'Le profil Sanitas permet d’indiquer les préférences, contraintes, mobilité, transport et disponibilité pour mieux cibler les mandats.',
          },
          {
            title: 'Recherche plus précise',
            body:
              'Les recruteurs peuvent croiser région, quart, département, documents et historique pour identifier les profils à appeler.',
          },
          {
            title: 'Postuler sans friction inutile',
            body:
              'Une fois le dossier prêt, les candidatures compatibles demandent moins de ressaisie et donnent plus rapidement une suite claire.',
          },
          {
            title: 'Accompagnement direct',
            body:
              'Vous pouvez postuler en ligne ou appeler Sanitas pour discuter des mandats disponibles et de vos préférences.',
          },
        ]}
        primaryCta={{ label: 'Voir les postes ASSS', href: asssJobsHref }}
        secondaryCta={{ label: 'Envoyer mon profil', href: '/postuler' }}
        relatedLinks={[
          { label: 'FAQ candidats', href: '/faq-candidats' },
          { label: 'Emplois PAB', href: '/emplois-pab-quebec' },
          { label: 'Tous les postes', href: '/postes' },
        ]}
      />
    </PublicLayout>
  );
}
