import Link from 'next/link';
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

const nurseJobsHref = `/postes?profession=${encodeURIComponent('Infirmier(ère)')}`;
const clinicianJobsHref = `/postes?profession=${encodeURIComponent('Infirmier(ère) clinicien(ne)')}`;

const REGIONS = [
  'Laval',
  'Montréal',
  'Montérégie',
  'Outaouais',
  'Gaspésie',
  'Îles-de-la-Madeleine',
  'Bas-Saint-Laurent',
  'Abitibi',
  'Côte-Nord',
  'Baie-James',
  'Grand Nord',
];

const DEPARTMENTS = [
  'Urgence',
  'Soins intensifs',
  'Bloc opératoire',
  'Obstétrique',
  'Chirurgie',
  'Médecine',
  'CHSLD',
  'Soins à domicile',
  'Santé mentale',
];

const FAQ = [
  {
    question: 'Qu’est-ce qu’une agence infirmière au Québec ?',
    answer:
      'Une agence infirmière au Québec accompagne des infirmières et infirmiers qualifiés dans la recherche de mandats, et aide les établissements à trouver du personnel infirmier selon la profession, la région, le département, le quart et les documents requis.',
  },
  {
    question: 'Agence Sanitas recrute-t-elle des infirmières au Québec ?',
    answer:
      'Oui. Agence Sanitas accompagne les infirmières autorisées, infirmiers autorisés, infirmières techniciennes et infirmières cliniciennes pour des mandats infirmiers au Québec.',
  },
  {
    question: 'Quels profils infirmiers sont recherchés ?',
    answer:
      'Les profils recherchés varient selon les mandats: infirmière autorisée, infirmier autorisé, infirmière technicienne, infirmier technicien, infirmière clinicienne et infirmier clinicien.',
  },
  {
    question: 'Quelles régions sont couvertes par Agence Sanitas ?',
    answer:
      'Agence Sanitas est basée à Laval et accompagne des mandats infirmiers dans plusieurs régions du Québec, notamment Montréal, Montérégie, Outaouais, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi, Côte-Nord, Baie-James et Grand Nord.',
  },
  {
    question: 'Les établissements peuvent-ils demander du personnel infirmier ?',
    answer:
      'Oui. Les établissements peuvent transmettre leurs besoins infirmiers à Agence Sanitas afin de préciser la profession, la région, le département, le quart, la date de début, la durée et les documents requis.',
  },
];

export const metadata = publicPageMetadata({
  title: 'Agence infirmière Québec | Placement infirmier Sanitas',
  description:
    'Agence Sanitas est une agence infirmière au Québec basée à Laval. Mandats pour infirmières autorisées, techniciennes et cliniciennes, avec recherche par région, département et quart.',
  path: '/agence-infirmiere-quebec',
  frPath: '/agence-infirmiere-quebec',
  enPath: '/en/nursing-agency-quebec',
});

export default function NursingAgencyQuebecPage() {
  return (
    <PublicLayout>
      <SeoJsonLd
        id="nursing-agency-quebec-jsonld"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'Agence infirmière Québec', url: '/agence-infirmiere-quebec' },
            ]),
            webPageJsonLd({
              name: 'Agence infirmière au Québec',
              description:
                'Page de référence Sanitas pour les infirmières, infirmiers et établissements qui cherchent une agence infirmière au Québec.',
              url: '/agence-infirmiere-quebec',
            }),
            serviceJsonLd({
              name: 'Agence infirmière Québec',
              description:
                'Placement infirmier et accompagnement de mandats pour infirmières autorisées, techniciennes et cliniciennes au Québec.',
              url: '/agence-infirmiere-quebec',
              serviceType: 'Agence de placement infirmier au Québec',
              audience: 'both',
              areaServed: ['Québec', 'Laval', 'Montréal', 'Montérégie', 'Outaouais', 'Gaspésie', 'Abitibi', 'Côte-Nord'],
            }),
            itemListJsonLd([
              {
                name: 'Emplois infirmières Québec',
                url: '/emplois-infirmieres-quebec',
                description:
                  'Mandats infirmiers pour infirmières autorisées, techniciennes et cliniciennes au Québec.',
              },
              {
                name: 'Mandats infirmiers en régions éloignées',
                url: '/mandats-infirmiers-region-eloignee',
                description:
                  'Mandats infirmiers en Baie-James, Grand Nord, Gaspésie, Îles-de-la-Madeleine, Bas-Saint-Laurent, Abitibi, Côte-Nord et Outaouais.',
              },
              {
                name: 'Agence placement santé Laval',
                url: '/agence-placement-sante-laval',
                description:
                  'Page locale Sanitas pour les besoins de placement santé et recrutement à Laval.',
              },
              {
                name: 'Recrutement personnel santé Québec',
                url: '/recrutement-personnel-sante-quebec',
                description:
                  'Page pour les établissements qui cherchent du personnel de santé au Québec.',
              },
            ]),
            faqPageJsonLd(FAQ),
          ],
        }}
      />

      <section className="section border-b border-border bg-muted/30 pt-16 pb-12">
        <div className="container-page max-w-5xl">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Agence de placement infirmier au Québec
          </p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-fg">Agence infirmière au Québec</h1>
          <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-fg-muted">
            Agence Sanitas est une agence infirmière basée à Laval qui accompagne les infirmières
            autorisées, infirmières techniciennes et infirmières cliniciennes dans la recherche de
            mandats au Québec.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={nurseJobsHref} className="btn-primary">
              Voir les mandats infirmiers
            </Link>
            <Link href="/postuler" className="btn-secondary">
              Postuler comme infirmier
            </Link>
            <a href="tel:+14509739696" className="btn-secondary">
              Appeler Sanitas
            </a>
          </div>
        </div>
      </section>

      <section className="section py-10">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Mandats infirmiers par région, département, quart et disponibilité.',
              'Profils infirmiers: autorisés, techniciens et cliniciens.',
              'Accompagnement pour candidats et établissements de santé au Québec.',
            ].map((item) => (
              <div key={item} className="card p-5">
                <p className="text-[15.5px] font-medium leading-relaxed text-fg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-10">
        <div className="container-page grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              Pour les infirmières et infirmiers
            </p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-fg">
              Trouver un mandat infirmier compatible
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">
              Sanitas structure le dossier candidat autour des critères qui comptent réellement:
              titre infirmier, régions souhaitées, départements, quarts, disponibilité, mobilité,
              expérience, CV et documents. L’objectif est d’éviter les propositions qui ne
              correspondent pas à vos choix.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Infirmière autorisée', 'Infirmier autorisé', 'Infirmière technicienne', 'Infirmière clinicienne', 'OIIQ'].map(
                (item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-[18px] font-semibold text-fg">Critères utilisés pour orienter les mandats</h3>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-fg-muted">
              <li>Profession et titre admissible pour le mandat.</li>
              <li>Région, ville ou territoire souhaité.</li>
              <li>Département: urgence, CHSLD, chirurgie, obstétrique et autres besoins.</li>
              <li>Quart, disponibilité, mobilité et contraintes importantes.</li>
              <li>Documents reçus ou à compléter avant présentation.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-muted/25 py-12">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              Pour les établissements
            </p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-fg">
              Recherche de personnel infirmier au Québec
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">
              Les établissements peuvent transmettre un besoin infirmier précis: profession,
              nombre de ressources, région, ville, département, quart, date de début, durée,
              documents requis et niveau d’urgence. L’équipe Sanitas peut ensuite orienter les
              profils compatibles.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Mandats urgents',
                body: 'Identifier rapidement les profils infirmiers actifs et disponibles.',
              },
              {
                title: 'Mandats planifiés',
                body: 'Préparer les disponibilités et documents avant la date de début.',
              },
              {
                title: 'Régions éloignées',
                body: 'Couvrir les besoins en Baie-James, Grand Nord, Gaspésie, Abitibi et Côte-Nord.',
              },
            ].map((item) => (
              <article key={item.title} className="card p-5">
                <h3 className="text-[18px] font-semibold text-fg">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-12">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[26px] font-semibold tracking-tight text-fg">Régions couvertes</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
              Les besoins varient selon les postes actifs et les mandats reçus. Sanitas met en
              avant les régions où les besoins infirmiers sont fréquents ou difficiles à combler.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <span key={region} className="chip">
                  {region}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[26px] font-semibold tracking-tight text-fg">Départements fréquents</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
              Le matching Sanitas tient compte du département du mandat pour éviter de présenter un
              candidat dont les choix ne couvrent pas le besoin demandé.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {DEPARTMENTS.map((department) => (
                <span key={department} className="chip">
                  {department}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-muted/25 py-12">
        <div className="container-page max-w-4xl">
          <h2 className="text-[26px] font-semibold tracking-tight text-fg">
            Comment choisir une agence infirmière au Québec ?
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">
            Une bonne agence infirmière doit clarifier les titres admissibles, les régions couvertes,
            les départements demandés, les quarts, les documents requis et la disponibilité réelle
            des candidats. Sanitas met ces critères au centre du parcours candidat et du suivi
            recruteur.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {[
              'Dossier candidat structuré pour éviter la ressaisie.',
              'Recherche par préférence groupée: région, département et quart ensemble.',
              'Suivi des CV, permis et documents utiles au mandat.',
              'Page postes pour consulter les mandats infirmiers actifs.',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-fg-muted">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-12">
        <div className="container-page max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-[24px] font-semibold tracking-tight text-fg">Questions fréquentes</h2>
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

      <section className="pb-20">
        <div className="container-page max-w-4xl">
          <div className="rounded-2xl border border-border bg-fg p-6 text-bg sm:p-8">
            <h2 className="text-[24px] font-semibold tracking-tight">Prêt à avancer ?</h2>
            <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-bg/75">
              Consultez les mandats infirmiers actifs ou créez votre dossier candidat pour être
              orienté vers les postes qui correspondent à vos choix.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={nurseJobsHref} className="btn-primary bg-bg text-fg hover:bg-bg/90">
                Voir les mandats infirmiers
              </Link>
              <Link href={clinicianJobsHref} className="btn-secondary border-bg/25 text-bg hover:bg-bg/10">
                Mandats infirmiers cliniciens
              </Link>
              <Link href="/etablissements" className="btn-secondary border-bg/25 text-bg hover:bg-bg/10">
                Demander du personnel
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
