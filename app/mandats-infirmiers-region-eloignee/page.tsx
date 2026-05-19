import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Mandats infirmiers en région éloignée au Québec',
  description:
    'Découvrez les mandats infirmiers en région éloignée avec Agence Sanitas: Gaspésie, Abitibi, Côte-Nord, Baie-James et autres régions du Québec.',
  path: '/mandats-infirmiers-region-eloignee',
  frPath: '/mandats-infirmiers-region-eloignee',
  enPath: '/en/remote-region-nursing-assignments-quebec',
});

export default function RemoteNursingAssignmentsPage() {
  return (
    <PublicLayout>
      <SeoLandingPage
        eyebrow="Régions éloignées"
        title="Mandats infirmiers en région éloignée"
        intro="Pour les infirmières et infirmiers ouverts aux régions éloignées, Sanitas permet de préciser exactement les régions, départements et quarts acceptés."
        highlights={[
          'Régions ciblées selon les besoins actifs: Gaspésie, Abitibi, Côte-Nord, Baie-James, Outaouais et autres régions.',
          'Recherche par département: urgence, bloc opératoire, soins intensifs, CHSLD, santé mentale, SAD et médecine/chirurgie.',
          'Matching basé sur vos préférences croisées pour éviter les propositions incompatibles.',
        ]}
        sections={[
          {
            title: 'Des préférences qui vont ensemble',
            body:
              'Vous pouvez indiquer qu’une région est acceptable seulement avec certains départements ou certains quarts. Cela aide Sanitas à éviter les faux matchs.',
          },
          {
            title: 'Validation rapide avec un recruteur',
            body:
              'Lorsqu’un mandat urgent sort, le recruteur peut chercher rapidement les candidats compatibles par région, département, quart, mobilité et documents.',
          },
          {
            title: 'Documents prêts avant présentation',
            body:
              'Les documents requis sont suivis dans votre dossier candidat pour accélérer la présentation aux établissements lorsque le mandat convient.',
          },
          {
            title: 'Postuler ou appeler',
            body:
              'Vous pouvez postuler en ligne avec Google ou appeler Sanitas si vous préférez parler à quelqu’un avant de confirmer votre intérêt.',
          },
        ]}
        primaryCta={{ label: 'Voir les mandats actifs', href: '/postes' }}
        secondaryCta={{ label: 'Activer mon profil', href: '/postuler' }}
        relatedLinks={[
          { label: 'Emplois infirmières Québec', href: '/emplois-infirmieres-quebec' },
          { label: 'Agence placement santé Laval', href: '/agence-placement-sante-laval' },
        ]}
      />
    </PublicLayout>
  );
}
