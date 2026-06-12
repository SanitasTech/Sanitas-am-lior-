import PublicLayout from '@/components/PublicLayout';
import ContactInfo from '@/components/ContactInfo';
import Photo from '@/components/Photo';
import { DecorativeBlob } from '@/components/Icons';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'À propos | Placement santé Laval',
  description:
    "Découvrez Agence Sanitas, agence de placement en santé basée à Laval, au service des professionnels et des établissements du Québec.",
  path: '/a-propos',
  frPath: '/a-propos',
  enPath: '/en/about',
});

const HERO_PHOTO = '/images/sanitas-partenariat.jpg';
const MISSION_PHOTO = '/images/sanitas-mission.jpg';

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                À propos
              </p>
              <h1 className="mt-2 text-display-lg text-fg">À propos d'Agence Sanitas</h1>
              <p className="mt-5 text-[17px] leading-relaxed text-fg-muted">
                Agence Sanitas est une agence de placement en santé basée à Laval. Nous
                accompagnons les professionnels de la santé dans la recherche de mandats adaptés à
                leur réalité, tout en soutenant les établissements dans leurs besoins de personnel.
              </p>
            </div>
            <Photo
              src={HERO_PHOTO}
              alt="Rencontre professionnelle"
              aspect="landscape"
              rounded="3xl"
              className="shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Mission + photo */}
      <section className="section pt-8 bg-muted/40">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Photo
              src={MISSION_PHOTO}
              alt="Personne en environnement de soins"
              aspect="portrait"
              rounded="3xl"
              className="max-w-md"
            />
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                Notre mission
              </p>
              <h2 className="mt-2 text-display-md text-fg">
                Créer des liens durables entre les professionnels et les établissements.
              </h2>
              <p className="mt-4 max-w-prose text-[15.5px] leading-relaxed text-fg-muted">
                Créer des liens efficaces, humains et durables entre les professionnels de la santé
                et les établissements qui ont besoin d'eux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Approche : cartes */}
      <section className="section">
        <div className="container-page">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Notre approche
          </p>
          <h2 className="mt-2 text-display-md text-fg">Six principes qui guident notre travail.</h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Écoute du candidat',
                body: 'On prend le temps de comprendre votre parcours et vos préférences avant de proposer.',
              },
              {
                title: 'Compréhension des disponibilités',
                body: 'Vos contraintes horaires comptent autant que vos compétences.',
              },
              {
                title: 'Respect des préférences',
                body: 'Région, département, quart, type de mandat : ce que vous ne voulez pas, on ne le propose pas.',
              },
              {
                title: 'Suivi humain',
                body: 'Une équipe joignable, des nouvelles claires, pas de silence radio.',
              },
              {
                title: 'Rigueur dans la qualification',
                body: 'Vérification des documents et des exigences avant chaque présentation à un établissement.',
              },
              {
                title: 'Rapidité de traitement',
                body: 'Les besoins urgents sont traités en priorité, sans sacrifier la qualité.',
              },
            ].map((p) => (
              <div key={p.title} className="card p-6">
                <h3 className="text-[16px] font-semibold text-fg">{p.title}</h3>
                <p className="mt-2 text-[14.5px] text-fg-muted leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour les candidats + Pour les établissements */}
      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-display-md text-fg">Pour les candidats</h2>
              <p className="mt-4 max-w-prose text-[15.5px] leading-relaxed text-fg-muted">
                Nous aidons les professionnels de la santé à trouver des mandats compatibles avec
                leurs compétences, leurs régions, leurs disponibilités et leurs objectifs.
              </p>
            </div>
            <div>
              <h2 className="text-display-md text-fg">Pour les établissements</h2>
              <p className="mt-4 max-w-prose text-[15.5px] leading-relaxed text-fg-muted">
                Nous aidons les établissements à structurer leurs besoins et à accéder à des profils
                qualifiés, disponibles et mieux alignés avec les réalités du terrain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coordonnées */}
      <section className="section">
        <div className="container-page max-w-3xl">
          <div className="card p-6 bg-muted/40">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle mb-3">
              Coordonnées
            </p>
            <ContactInfo />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
