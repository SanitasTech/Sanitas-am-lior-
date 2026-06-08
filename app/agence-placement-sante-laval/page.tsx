import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Agence de placement santé à Laval | Agence Sanitas',
  description:
    'Agence Sanitas est une agence de placement en santé basée à Laval, au service des professionnels et établissements de santé du Québec.',
  path: '/agence-placement-sante-laval',
  frPath: '/agence-placement-sante-laval',
  enPath: '/en/healthcare-staffing-laval',
});

export default function LavalHealthcareStaffingPage() {
  return (
    <PublicLayout>
      <SeoLandingPage
        eyebrow="Laval et Québec"
        title="Agence de placement en santé à Laval"
        intro="Basée à Laval, Agence Sanitas accompagne les professionnels de la santé et les établissements qui cherchent une solution de placement claire, humaine et structurée."
        highlights={[
          'Adresse: 4 Place Laval, Suite 570, Laval, QC H7N 5Y3.',
          'Permis CNESST AP-2000952.',
          'Mandats et besoins couverts dans plusieurs régions du Québec.',
        ]}
        sections={[
          {
            title: 'Pour les candidats',
            body:
              'Sanitas aide les professionnels de la santé à trouver des mandats compatibles avec leur profession, leurs disponibilités, leurs régions et leurs documents.',
          },
          {
            title: 'Pour les établissements',
            body:
              'Les établissements peuvent soumettre un besoin ponctuel, urgent, récurrent ou planifié pour obtenir une réponse structurée de l’équipe.',
          },
          {
            title: 'Présence locale, couverture provinciale',
            body:
              'La base lavalloise de Sanitas facilite la proximité, mais le site est conçu pour gérer des mandats dans l’ensemble du Québec.',
          },
          {
            title: 'Un dossier candidat unique',
            body:
              'Le portail candidat centralise profil, préférences, CV et documents afin de réduire la friction et accélérer les mises en relation.',
          },
        ]}
        primaryCta={{ label: 'Voir les postes', href: '/postes' }}
        secondaryCta={{ label: 'Demander du personnel', href: '/etablissements' }}
        relatedLinks={[
          { label: 'Agence infirmière Québec', href: '/agence-infirmiere-quebec' },
          { label: 'Emplois infirmières', href: '/emplois-infirmieres-quebec' },
          { label: 'Recrutement personnel santé', href: '/recrutement-personnel-sante-quebec' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
    </PublicLayout>
  );
}
