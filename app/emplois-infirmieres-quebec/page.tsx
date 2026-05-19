import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import SeoLandingPage from '@/components/SeoLandingPage';
import { breadcrumbJsonLd, publicPageMetadata } from '@/lib/seo';

const nurseJobsHref = `/postes?profession=${encodeURIComponent('Infirmier(ère)')}`;

export const metadata = publicPageMetadata({
  title: 'Emplois et mandats infirmiers au Québec',
  description:
    'Trouvez des mandats infirmiers au Québec avec Agence Sanitas. Choisissez vos régions, départements, quarts et disponibilités.',
  path: '/emplois-infirmieres-quebec',
  frPath: '/emplois-infirmieres-quebec',
  enPath: '/en/nursing-agency-jobs-quebec',
});

export default function NurseJobsQuebecPage() {
  return (
    <PublicLayout>
      <SeoJsonLd
        id="nurse-jobs-breadcrumb"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'Emplois infirmières Québec', url: '/emplois-infirmieres-quebec' },
            ]),
          ],
        }}
      />
      <SeoLandingPage
        eyebrow="Emplois infirmières"
        title="Emplois et mandats infirmiers au Québec"
        intro="Agence Sanitas aide les infirmières et infirmiers à trouver des mandats compatibles avec leurs régions, leurs départements, leurs quarts et leur réalité professionnelle."
        highlights={[
          'Mandats par région: Montréal, Laval, Montérégie, Laurentides, Gaspésie, Abitibi, Côte-Nord et plus.',
          'Départements ciblés: urgence, chirurgie, médecine, obstétrique, soins intensifs, CHSLD, santé mentale et SAD.',
          'Profil candidat réutilisable: CV, disponibilités et préférences conservés pour éviter la ressaisie.',
        ]}
        sections={[
          {
            title: 'Choisir les mandats qui vous conviennent',
            body:
              'Votre dossier Sanitas permet de préciser vos régions, quarts, départements et contraintes. Le recruteur peut ainsi vous proposer les mandats qui correspondent vraiment à votre profil.',
          },
          {
            title: 'Postuler rapidement aux postes actifs',
            body:
              'Si votre profil et votre CV sont complets, vous pouvez manifester votre intérêt pour un mandat sans répéter les mêmes informations à chaque fois.',
          },
          {
            title: 'Un suivi humain',
            body:
              'Sanitas reste joignable par téléphone pour les candidats qui préfèrent parler directement à l’équipe avant de postuler ou de confirmer leurs disponibilités.',
          },
          {
            title: 'Mandats en région éloignée',
            body:
              'Pour les infirmières ouvertes aux régions éloignées, Sanitas peut filtrer les mandats selon la région, le département, le quart, la mobilité et les documents requis.',
          },
        ]}
        primaryCta={{ label: 'Voir les mandats infirmiers', href: nurseJobsHref }}
        secondaryCta={{ label: 'Créer mon profil', href: '/postuler' }}
        relatedLinks={[
          { label: 'Mandats en région éloignée', href: '/mandats-infirmiers-region-eloignee' },
          { label: 'Emplois PAB au Québec', href: '/emplois-pab-quebec' },
          { label: 'Tous les postes', href: '/postes' },
        ]}
      />
    </PublicLayout>
  );
}
