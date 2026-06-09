import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  itemListJsonLd,
  publicPageMetadata,
  serviceJsonLd,
  webPageJsonLd,
} from '@/lib/seo';
import Link from 'next/link';

export const metadata = publicPageMetadata({
  title: 'Mandats infirmiers en régions éloignées au Québec',
  description:
    'Mandats infirmiers en régions éloignées avec Agence Sanitas: Baie-James, Grand Nord, Outaouais, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi et Côte-Nord.',
  path: '/mandats-infirmiers-region-eloignee',
  frPath: '/mandats-infirmiers-region-eloignee',
  enPath: '/en/remote-region-nursing-assignments-quebec',
});

const remoteRegions = [
  {
    name: 'Baie-James',
    href: '/mandat-infirmiere-baie-james',
    focus: 'Urgence, soins à domicile, soins intensifs et besoins ponctuels selon les mandats actifs.',
    fit: 'Pour les infirmières et infirmiers ouverts aux milieux régionaux avec mobilité et disponibilité à confirmer.',
  },
  {
    name: 'Grand Nord',
    href: '/mandat-infirmiere-grand-nord',
    focus: 'Mandats en territoires nordiques, avec conditions de déplacement, hébergement et durée à valider selon le besoin.',
    fit: 'Pour les profils capables de s’adapter à un contexte éloigné et à une organisation clinique plus autonome.',
  },
  {
    name: 'Outaouais',
    href: '/mandat-infirmiere-outaouais',
    focus: 'Bloc opératoire, soins à domicile, médecine/chirurgie et besoins régionaux selon les établissements.',
    fit: 'Pour les infirmières qui veulent préciser la combinaison région, département et quart avant d’être proposées.',
  },
  {
    name: 'Gaspésie',
    href: '/mandat-infirmiere-gaspesie',
    focus: 'Urgence, bloc opératoire, obstétrique, soins intensifs et autres besoins infirmiers en région.',
    fit: 'Pour les candidats qui acceptent la Gaspésie avec des départements précis, sans faux jumelage.',
  },
  {
    name: 'Îles-de-la-Madeleine',
    href: '/mandat-infirmiere-iles-de-la-madeleine',
    focus: 'Mandats insulaires et besoins spécialisés pouvant inclure soins intensifs ou médecine/chirurgie.',
    fit: 'Pour les profils qui souhaitent indiquer clairement leur ouverture aux Îles et les contraintes associées.',
  },
  {
    name: 'Bas-Saint-Laurent',
    href: '/mandat-infirmiere-bas-saint-laurent',
    focus: 'Soins à domicile, médecine/chirurgie, CHSLD et besoins infirmiers régionaux.',
    fit: 'Pour les candidats qui recherchent des mandats en région avec préférences de quart et mobilité documentées.',
  },
  {
    name: 'Abitibi',
    href: '/mandat-infirmiere-abitibi',
    focus: 'Urgence, CHSLD, médecine/chirurgie et besoins prioritaires selon les mandats ouverts.',
    fit: 'Pour les infirmières qui acceptent l’Abitibi seulement avec certains départements ou conditions de mandat.',
  },
  {
    name: 'Côte-Nord',
    href: '/mandat-infirmiere-cote-nord',
    focus: 'Médecine/chirurgie, soins intensifs, urgence et besoins en établissements régionaux.',
    fit: 'Pour les profils prêts à valider déplacement, hébergement, disponibilité et documents avant présentation.',
  },
];

const departmentLinks = [
  { label: 'Urgence', href: '/mandats-infirmiers-urgence-quebec' },
  { label: 'Soins intensifs', href: '/mandats-infirmiers-soins-intensifs-quebec' },
  { label: 'Bloc opératoire', href: '/mandats-infirmiers-bloc-operatoire-quebec' },
  { label: 'Obstétrique', href: '/mandats-infirmiers-obstetrique-quebec' },
  { label: 'Chirurgie', href: '/mandats-infirmiers-chirurgie-quebec' },
  { label: 'CHSLD', href: '/mandats-infirmiers-chsld-quebec' },
];

const FAQ = [
  {
    question: 'Quelles régions éloignées sont couvertes par Sanitas ?',
    answer:
      'Sanitas met en avant les mandats infirmiers en Baie-James, Grand Nord, Outaouais, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi et Côte-Nord selon les besoins actifs.',
  },
  {
    question: 'Puis-je choisir seulement certaines régions éloignées ?',
    answer:
      'Oui. Le dossier candidat permet de préciser les régions acceptées, les départements souhaités, les quarts, la mobilité et les contraintes importantes.',
  },
  {
    question: 'Sanitas évite-t-elle les propositions incompatibles ?',
    answer:
      'Oui. Les préférences croisées permettent d’éviter de mélanger une région acceptée avec un département, un quart ou une contrainte qui ne convient pas au candidat.',
  },
  {
    question: 'Quels départements sont fréquents en région éloignée ?',
    answer:
      'Les besoins peuvent inclure urgence, soins intensifs, bloc opératoire, obstétrique, chirurgie, CHSLD, soins à domicile, médecine/chirurgie et santé mentale selon les mandats actifs.',
  },
];

export default function RemoteNursingAssignmentsPage() {
  return (
    <PublicLayout>
      <SeoJsonLd
        id="remote-nursing-assignments-schema"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            webPageJsonLd({
              name: 'Mandats infirmiers en régions éloignées au Québec',
              description:
                'Page Sanitas pour les mandats infirmiers en Baie-James, Grand Nord, Outaouais, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi et Côte-Nord.',
              url: '/mandats-infirmiers-region-eloignee',
            }),
            serviceJsonLd({
              name: 'Mandats infirmiers en régions éloignées',
              description:
                'Recherche de mandats infirmiers régionaux au Québec pour infirmières autorisées, techniciennes et cliniciennes.',
              url: '/mandats-infirmiers-region-eloignee',
              serviceType: 'Healthcare nursing job matching',
              audience: 'candidates',
              areaServed: [
                'Québec',
                'Baie-James',
                'Nord-du-Québec',
                'Outaouais',
                'Gaspésie',
                'Îles-de-la-Madeleine',
                'Bas-Saint-Laurent',
                'Abitibi-Témiscamingue',
                'Côte-Nord',
              ],
            }),
            itemListJsonLd(
              remoteRegions.map((region) => ({
                name: `Mandats infirmiers ${region.name}`,
                url: region.href,
                description: region.focus,
              })),
            ),
            faqPageJsonLd(FAQ),
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'Mandats infirmiers en régions éloignées', url: '/mandats-infirmiers-region-eloignee' },
            ]),
          ],
        }}
      />
      <section className="section pt-16 pb-12 bg-muted/30 border-b border-border">
        <div className="container-page max-w-5xl">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Régions éloignées
          </p>
          <h1 className="mt-2 text-display-lg text-fg">
            Mandats infirmiers en régions éloignées au Québec
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-fg-muted">
            Agence Sanitas recrute des infirmières et infirmiers du Québec ouverts aux mandats en
            Baie-James, Grand Nord, Outaouais, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent,
            Abitibi et Côte-Nord. Votre dossier permet de préciser les régions, départements,
            quarts et contraintes qui vont réellement ensemble.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/postes?profession=Infirmier%28%C3%A8re%29" className="btn-primary">
              Voir les mandats infirmiers
            </Link>
            <Link href="/postuler" className="btn-secondary">
              Activer mon profil
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-10 pb-8">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Régions prioritaires: Baie-James, Grand Nord, Outaouais, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi et Côte-Nord.',
              'Départements possibles: urgence, bloc opératoire, soins intensifs, CHSLD, obstétrique, SAD, santé mentale et médecine/chirurgie.',
              'Matching par préférences croisées: Sanitas évite de mélanger une région acceptée avec un département ou un quart refusé.',
            ].map((item) => (
              <div key={item} className="card p-5">
                <p className="text-[15px] font-medium leading-relaxed text-fg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-6 pb-10">
        <div className="container-page">
          <div className="mb-6 max-w-3xl">
            <h2 className="text-[28px] font-semibold tracking-tight text-fg">
              Choisir la bonne région, pas seulement un poste
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
              Les besoins changent rapidement. Cette page regroupe les zones à surveiller et aide les
              candidats à créer un profil utile: région, département, quart, mobilité, date de départ
              et documents prêts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {remoteRegions.map((region) => (
              <article key={region.name} className="card flex flex-col p-5">
                <h3 className="text-[19px] font-semibold text-fg">{region.name}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">{region.focus}</p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">{region.fit}</p>
                <Link href={region.href} className="mt-5 text-[14px] font-medium text-accent hover:text-fg">
                  Voir la page {region.name}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-4 pb-20">
        <div className="container-page grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-[22px] font-semibold text-fg">Comment Sanitas évite les faux matchs</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Préférences liées',
                  body:
                    'Vous pouvez indiquer qu’une région est acceptable seulement avec certains départements, quarts ou types de mandat.',
                },
                {
                  title: 'Validation recruteur',
                  body:
                    'Lorsqu’un mandat urgent sort, le recruteur cherche par région, département, quart, mobilité, disponibilité et documents.',
                },
                {
                  title: 'Dossier candidat unique',
                  body:
                    'CV, documents, autorisation de travail, expérience et préférences restent dans le même dossier Sanitas.',
                },
                {
                  title: 'Action rapide',
                  body:
                    'Un profil complet permet de traiter plus vite les mandats compatibles et de vous contacter avec des détails précis.',
                },
              ].map((item) => (
                <section key={item.title} className="rounded-xl border border-border bg-bg p-4">
                  <h3 className="text-[17px] font-semibold text-fg">{item.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">{item.body}</p>
                </section>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-[18px] font-semibold text-fg">Explorer par département</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {departmentLinks.map((link) => (
                <Link key={link.href} href={link.href} className="chip-link">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <h2 className="text-[18px] font-semibold text-fg">Besoin d’en parler?</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">
                Si vous préférez valider les régions ou les conditions avant de postuler, appelez Sanitas.
              </p>
              <Link href="/contact" className="mt-4 inline-flex text-[14px] font-medium text-accent hover:text-fg">
                Contacter Sanitas
              </Link>
            </div>
          </aside>
        </div>
      </section>

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
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
