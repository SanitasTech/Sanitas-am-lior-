import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import SeoLandingPage from '@/components/SeoLandingPage';
import { breadcrumbJsonLd, faqPageJsonLd, publicPageMetadata, serviceJsonLd } from '@/lib/seo';

const nurseJobsHref = `/postes?profession=${encodeURIComponent('Infirmier(ère)')}`;
const clinicianJobsHref = `/postes?profession=${encodeURIComponent('Infirmier(ère) clinicien(ne)')}`;

const FAQ = [
  {
    question: 'Quels profils infirmiers sont recherchés par Agence Sanitas ?',
    answer:
      'Agence Sanitas recherche des infirmières et infirmiers du Québec, notamment infirmiers autorisés, infirmières techniciennes et infirmières cliniciennes, selon les mandats disponibles.',
  },
  {
    question: 'Est-ce que le français est requis pour les mandats infirmiers au Québec ?',
    answer:
      'Oui. Les candidats doivent pouvoir communiquer en français dans un contexte professionnel de santé au Québec.',
  },
  {
    question: 'Puis-je choisir mes régions et mes départements ?',
    answer:
      'Oui. Le dossier candidat permet de préciser les régions, départements, quarts, disponibilités et contraintes pour éviter les propositions incompatibles.',
  },
  {
    question: 'Quels départements infirmiers sont souvent recherchés ?',
    answer:
      'Les besoins peuvent inclure urgence, soins intensifs, bloc opératoire, obstétrique, chirurgie, CHSLD, soins à domicile, médecine et santé mentale selon les postes actifs.',
  },
];

export const metadata = publicPageMetadata({
  title: 'Emploi infirmière Québec | Mandats infirmiers Sanitas',
  description:
    'Mandats infirmiers au Québec pour infirmières autorisées, techniciennes et cliniciennes. Régions éloignées, urgence, soins intensifs, bloc opératoire, obstétrique et CHSLD.',
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
            serviceJsonLd({
              name: 'Mandats infirmiers au Québec',
              description:
                'Recherche de mandats infirmiers au Québec pour infirmières autorisées, techniciennes et cliniciennes.',
              url: '/emplois-infirmieres-quebec',
              serviceType: 'Healthcare nursing job matching',
              audience: 'candidates',
              areaServed: ['Québec'],
            }),
            faqPageJsonLd(FAQ),
          ],
        }}
      />
      <SeoLandingPage
        eyebrow="Mandats infirmiers Québec"
        title="Emplois et mandats infirmiers au Québec"
        intro="Agence Sanitas aide les infirmières et infirmiers du Québec à trouver des mandats compatibles avec leur titre, leurs régions, leurs départements, leurs quarts et leurs disponibilités."
        highlights={[
          'Profils ciblés: infirmières techniciennes, infirmiers autorisés et infirmières cliniciennes.',
          'Régions éloignées prioritaires: Baie-James, Grand Nord, Outaouais, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi et Côte-Nord.',
          'Départements fréquents: urgence, soins intensifs, bloc opératoire, obstétrique, chirurgie, CHSLD, SAD et santé mentale.',
        ]}
        sections={[
          {
            title: 'Pour infirmiers autorisés, techniciens et cliniciens',
            body:
              'Cette page cible les mandats infirmiers au Québec. Sanitas tient compte du titre admissible, de l’expérience, des documents, de l’autorisation de travail et de la capacité à communiquer en français en contexte de santé.',
          },
          {
            title: 'Régions et départements sans faux match',
            body:
              'Votre dossier permet d’indiquer les combinaisons qui vont ensemble, par exemple Baie-James avec urgence, Gaspésie avec obstétrique, Abitibi avec CHSLD ou Côte-Nord avec soins intensifs.',
          },
          {
            title: 'Postuler sans répéter votre profil',
            body:
              'Une fois le dossier et le CV complétés, vous pouvez manifester votre intérêt pour un mandat sans ressaisir les mêmes informations à chaque fois.',
          },
          {
            title: 'Suivi rapide par l’équipe Sanitas',
            body:
              'Les recruteurs peuvent repérer les candidats compatibles par profession, région, département, quart, documents et disponibilité.',
          },
        ]}
        primaryCta={{ label: 'Voir les mandats infirmiers', href: nurseJobsHref }}
        secondaryCta={{ label: 'Postuler comme infirmier', href: '/postuler' }}
        relatedLinks={[
          { label: 'Agence infirmière Québec', href: '/agence-infirmiere-quebec' },
          { label: 'Infirmières cliniciennes', href: clinicianJobsHref },
          { label: 'Mandats en régions éloignées', href: '/mandats-infirmiers-region-eloignee' },
          { label: 'Mandats Baie-James', href: '/mandat-infirmiere-baie-james' },
          { label: 'Mandats Grand Nord', href: '/mandat-infirmiere-grand-nord' },
          { label: 'Mandats Gaspésie', href: '/mandat-infirmiere-gaspesie' },
          { label: 'Mandats Bas-Saint-Laurent', href: '/mandat-infirmiere-bas-saint-laurent' },
          { label: 'Mandats Côte-Nord', href: '/mandat-infirmiere-cote-nord' },
          { label: 'Mandats urgence', href: '/mandats-infirmiers-urgence-quebec' },
          { label: 'Mandats soins intensifs', href: '/mandats-infirmiers-soins-intensifs-quebec' },
          { label: 'Tous les postes', href: '/postes' },
        ]}
      />

      <section className="pb-20">
        <div className="container-page max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-[22px] font-semibold text-fg">Questions fréquentes</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {FAQ.map((item) => (
                <article key={item.question}>
                  <h3 className="text-[16px] font-semibold text-fg">{item.question}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{item.answer}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/postuler" className="btn-primary">
                Créer mon dossier infirmier
              </Link>
              <a href="tel:+14509739696" className="btn-secondary">
                Appeler Sanitas
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
