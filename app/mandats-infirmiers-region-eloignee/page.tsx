import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Mandats infirmiers en région éloignée au Québec',
  description:
    'Mandats infirmiers en région éloignée avec Agence Sanitas: Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi, Côte-Nord, Baie-James et autres régions.',
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
        intro="Pour les infirmières et infirmiers ouverts aux régions éloignées, Sanitas permet de préciser exactement les régions, départements, quarts et contraintes acceptés."
        highlights={[
          'Régions prioritaires: Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi, Côte-Nord, Baie-James et Nord-du-Québec.',
          'Départements recherchés: urgence, bloc opératoire, soins intensifs, CHSLD, obstétrique, SAD, santé mentale et médecine/chirurgie.',
          'Matching basé sur vos préférences croisées pour éviter de mélanger une région acceptée avec un département refusé.',
        ]}
        sections={[
          {
            title: 'Des préférences qui vont ensemble',
            body:
              'Vous pouvez indiquer qu’une région est acceptable seulement avec certains départements ou certains quarts. Cela aide Sanitas à éviter les faux matchs.',
          },
          {
            title: 'Recherche par région précise',
            body:
              'Les mandats peuvent être filtrés par Gaspésie, Abitibi, Côte-Nord, Bas-Saint-Laurent ou Îles-de-la-Madeleine selon les besoins actifs.',
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
        ]}
        primaryCta={{ label: 'Voir les mandats actifs', href: '/postes' }}
        secondaryCta={{ label: 'Activer mon profil', href: '/postuler' }}
        relatedLinks={[
          { label: 'Mandats Gaspésie', href: '/mandat-infirmiere-gaspesie' },
          { label: 'Mandats Îles-de-la-Madeleine', href: '/mandat-infirmiere-iles-de-la-madeleine' },
          { label: 'Mandats Bas-Saint-Laurent', href: '/mandat-infirmiere-bas-saint-laurent' },
          { label: 'Mandats Abitibi', href: '/mandat-infirmiere-abitibi' },
          { label: 'Mandats Côte-Nord', href: '/mandat-infirmiere-cote-nord' },
          { label: 'Emplois infirmières Québec', href: '/emplois-infirmieres-quebec' },
        ]}
      />
    </PublicLayout>
  );
}
