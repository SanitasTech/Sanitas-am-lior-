import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Recrutement de personnel de santé au Québec | Agence Sanitas',
  description:
    'Agence Sanitas aide les établissements du Québec à structurer leurs besoins et à trouver du personnel de santé qualifié.',
  path: '/recrutement-personnel-sante-quebec',
  frPath: '/recrutement-personnel-sante-quebec',
  enPath: '/en/healthcare-recruitment-quebec',
});

export default function HealthcareRecruitmentQuebecPage() {
  return (
    <PublicLayout>
      <SeoLandingPage
        eyebrow="Établissements"
        title="Recrutement de personnel de santé au Québec"
        intro="Agence Sanitas accompagne les établissements de santé qui ont besoin de personnel qualifié pour des besoins urgents, ponctuels, récurrents ou planifiés."
        highlights={[
          'Professions possibles: infirmières, infirmières auxiliaires, PAB, ASSS et autres professionnels de la santé.',
          'Recherche par profession, région, département, quart, date de début, documents requis et urgence.',
          'Processus structuré pour qualifier les profils avant présentation.',
        ]}
        sections={[
          {
            title: 'Clarifier le besoin rapidement',
            body:
              'Le formulaire établissement collecte les informations utiles: profession, région, ville, département, nombre de ressources, quart, date de début et durée.',
          },
          {
            title: 'Présenter des profils alignés',
            body:
              'Le système ATS de Sanitas croise les préférences candidates avec les critères du mandat pour éviter les propositions incompatibles.',
          },
          {
            title: 'Suivi des documents',
            body:
              'CV, permis, RCR, PDSB et carnet de vaccination peuvent être suivis dans le dossier candidat selon la profession et le mandat.',
          },
          {
            title: 'Réponse structurée',
            body:
              'L’équipe Sanitas peut traiter les besoins urgents tout en conservant une logique de qualification, de suivi et de conformité.',
          },
        ]}
        primaryCta={{ label: 'Demander du personnel', href: '/etablissements' }}
        secondaryCta={{ label: 'Nous contacter', href: '/contact' }}
        relatedLinks={[
          { label: 'Agence placement santé Laval', href: '/agence-placement-sante-laval' },
          { label: 'À propos', href: '/a-propos' },
          { label: 'Postes candidats', href: '/postes' },
        ]}
      />
    </PublicLayout>
  );
}
