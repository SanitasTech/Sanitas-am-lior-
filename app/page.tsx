import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import HomeSearch from '@/components/HomeSearch';
import JobCard from '@/components/JobCard';
import Photo from '@/components/Photo';
import {
  TargetIcon,
  HandshakeIcon,
  BoltIcon,
  SearchIcon,
  SendIcon,
  ChecklistIcon,
  ChatIcon,
  ClipboardIcon,
  AnalyzeIcon,
  PeopleIcon,
  CheckCircleIcon,
  DecorativeBlob,
} from '@/components/Icons';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { publicPageMetadata, webPageJsonLd } from '@/lib/seo';
import type { Job } from '@/types';
import { urgencyOrder } from '@/lib/utils';

export const metadata = publicPageMetadata({
  title: 'Agence infirmière au Québec | Mandats infirmiers Sanitas',
  description:
    'Agence Sanitas aide les infirmières autorisées, infirmiers autorisés, techniciennes et cliniciennes à trouver des mandats infirmiers au Québec.',
  path: '/',
  frPath: '/',
  enPath: '/en',
});

export const revalidate = 60;

// Photos depuis Unsplash. Pour utiliser tes propres photos : place-les dans
// /public/images/ puis remplace par `/images/nom-de-fichier.jpg`.
// → HERO_BG : grande image atmosphérique en fond du hero, modifiable librement.
// Image locale : place le fichier dans /public/images/ et utilise un chemin
// commençant par "/" (servi automatiquement par Next.js).
const HERO_BG = '/images/sanitas-hero.png';
const PHOTOS = {
  candidates: '/images/sanitas-candidats.png',
  establishments: '/images/sanitas-equipe-soins.jpg',
} as const;

// Liens rapides vers /postes filtrés par profession (section candidat home).
// Le `filter` doit matcher exactement la valeur stockée dans jobs.profession.
type QuickProfession = { label: string; filter: string | null };
const QUICK_PROFESSIONS: QuickProfession[] = [
  { label: 'Infirmier(ère)', filter: 'Infirmier(ère)' },
  { label: 'Infirmier(ère) clinicien(ne)', filter: 'Infirmier(ère) clinicien(ne)' },
  { label: 'Infirmier(ère) auxiliaire', filter: 'Infirmier(ère) auxiliaire' },
  { label: 'Préposé(e) aux bénéficiaires', filter: 'Préposé(e) aux bénéficiaires' },
  { label: 'ASSS', filter: 'Auxiliaire aux services de santé et sociaux (ASSS)' },
  { label: 'Inhalothérapeute', filter: 'Inhalothérapeute' },
  { label: 'Tous les postes', filter: null },
];

// Partenaires affichés dans la section « Ils nous font confiance ».
// Quand tu obtiens les logos officiels (avec autorisation), place-les dans
// /public/logos/ et remplace `logo: null` par `logo: '/logos/mckesson.svg'`.
type Partner = { name: string; logo: string | null };
const PARTNERS: Partner[] = [
  { name: 'McKesson', logo: '/logos/mckesson.svg' },
  { name: 'LGI Healthcare Solutions', logo: '/logos/lgi.png' },
  { name: 'Santé Québec', logo: '/logos/sante-quebec.svg' },
  { name: 'AmerisourceBergen', logo: '/logos/amerisourcebergen.svg' },
  { name: 'Groupe Santé Arbec', logo: '/logos/arbec.png' },
  { name: 'Groupe Champlain', logo: '/logos/champlain.png' },
  { name: 'CHSLD Saint-Lambert sur le Golf', logo: '/logos/chsld-saint-lambert.svg' },
  { name: 'Résidence Soleil', logo: '/logos/residence-soleil.png' },
];

// Avis Google réels — source : fiche Google Business Agence Sanitas.
type Testimonial = {
  quote: string;
  author: string;
  role: string;
  rating?: number; // sur 5
};
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Je suis satisfaite des services de l'agence Sanitas. Les agents sont accueillants, serviables et professionnels. Ils répondent à mes besoins rapidement. Mon agent cherche toujours mon confort avant tout : il m'écoute, me respecte et me valorise. Le professionnalisme est une denrée rare — pour rien au monde je changerais mon agence !",
    author: 'Souad N.',
    role: 'Infirmière clinicienne',
    rating: 5,
  },
  {
    quote:
      "Professionnelle, flexible et humaine, avec d'excellentes valeurs éthiques. Très à l'écoute de ses employés et de leurs besoins. Un gros merci à M. Demba et Mme Alejandra, mes deux agents : grâce à eux j'ai toujours des quarts assignés dans le respect de mes disponibilités. On est vraiment considéré et respecté.",
    author: 'Sisi D.',
    role: 'Préposée aux bénéficiaires',
    rating: 5,
  },
  {
    quote:
      "Très bonne agence. Les superviseurs chargés des horaires sont polis, courtois et compréhensibles — surtout patients. Je recommande !",
    author: 'Charlotte M.',
    role: 'Infirmière technicienne',
    rating: 5,
  },
  {
    quote:
      "Première agence où je sens qu'on m'écoute vraiment avant de me proposer un mandat. Les options correspondent à mes disponibilités.",
    author: 'Tamara F.',
    role: 'Infirmière clinicienne',
    rating: 5,
  },
];

async function fetchUrgentJobs(): Promise<Job[]> {
  noStore();
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .in('urgency', ['urgent', 'high'])
      .order('created_at', { ascending: false })
      .limit(6);
    const jobs = (data || []) as Job[];
    return jobs.sort((a, b) => urgencyOrder(a.urgency) - urgencyOrder(b.urgency));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const urgentJobs = await fetchUrgentJobs();

  return (
    <PublicLayout>
      <SeoJsonLd
        id="home-page-schema"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            webPageJsonLd({
              name: 'Agence infirmière au Québec',
              description:
                'Agence Sanitas aide les infirmières autorisées, infirmiers autorisés, techniciennes et cliniciennes à trouver des mandats infirmiers au Québec.',
              url: '/',
            }),
          ],
        }}
      />
      {/* ============================================================
          Hero cinématographique : image de fond + overlay coloré
          (HERO_BG en haut du fichier : remplaçable par /images/xxx.jpg ou /images/xxx.png)
          Le bg-fg sur la section sert de secours sombre si l'image échoue.
          ============================================================ */}
      <section className="relative isolate overflow-hidden bg-fg">
        {/* Couche 1 : image de fond */}
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_BG}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
        </div>

        {/* Couche 2 : voile sombre teinté accent, dense à gauche pour la
            lisibilité du texte, dégagé à droite pour laisser vivre la photo */}
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-fg/80 via-fg/55 to-fg/15"
          aria-hidden
        />

        {/* Contenu */}
        <div className="container-page relative pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-bg/10 backdrop-blur px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-bg ring-1 ring-bg/25">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-bright" aria-hidden />
              Agence de placement infirmière · Laval, Québec
            </p>

            <h1 className="mt-6 text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.06] tracking-[-0.025em] font-semibold text-bg">
              Des mandats infirmiers et en santé{' '}
              <span className="font-serif italic font-medium tracking-[-0.01em] text-[oklch(0.85_0.09_220)]">
                adaptés à votre réalité.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[17.5px] sm:text-[19px] leading-relaxed text-bg/85">
              Infirmières autorisées, infirmiers autorisés, techniciennes et cliniciennes :
              choisissez vos régions, vos départements et vos horaires. Sanitas vous aide à
              trouver des mandats infirmiers compatibles au Québec.
            </p>

            {/* CTAs : audience-segmentés, candidats nettement dominants */}
            <div className="mt-10 grid gap-6 sm:gap-10 sm:grid-cols-[auto_1px_auto] sm:items-start">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-bg/70 mb-3">
                  Infirmiers et professionnels de la santé
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/emplois-infirmieres-quebec"
                    className="inline-flex items-center justify-center rounded-full bg-bg px-6 py-3 text-[15.5px] font-semibold text-fg shadow-soft transition-all hover:bg-bg/90"
                  >
                    Voir les mandats infirmiers
                  </Link>
                  <Link
                    href="/postuler"
                    className="inline-flex items-center justify-center rounded-full border border-bg/40 bg-bg/10 backdrop-blur px-6 py-3 text-[15.5px] font-medium text-bg transition-colors hover:bg-bg/20"
                  >
                    Envoyer mon profil
                  </Link>
                </div>
              </div>
              <div className="hidden sm:block w-px self-stretch bg-bg/25" aria-hidden />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-bg/70 mb-3">
                  Établissements de santé
                </p>
                <Link
                  href="/etablissements"
                  className="inline-flex items-center justify-center rounded-full border border-bg/40 bg-bg/10 backdrop-blur px-6 py-3 text-[15.5px] font-medium text-bg transition-colors hover:bg-bg/20"
                >
                  Demander du personnel
                </Link>
              </div>
            </div>
          </div>

          {/* Barre de recherche intégrée au hero, en bas */}
          <div className="mt-14">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-bg/65 mb-3">
              Recherche rapide
            </p>
            <HomeSearch />
          </div>
        </div>
      </section>

      {/* Bandeau de réassurance : stats structurées + permis CNESST */}
      <section className="border-b border-border bg-surface">
        <div className="container-page py-6">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
            <HeroStat value="17" label="régions couvertes au Québec" />
            <HeroStat value="14+" label="professions de la santé" />
            <HeroStat value="24 h" label="délai de réponse moyen" />
            <div className="flex flex-col justify-center">
              <dt className="text-[12.5px] text-fg-subtle">Permis CNESST</dt>
              <dd className="mt-0.5 text-[17px] font-semibold tracking-tight text-fg tabular-nums">
                AP-2000952
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-b border-border py-6">
        <div className="container-page">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Accès rapides</p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-fg">
                Recherches principales sur Agence Sanitas
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/agence-infirmiere-quebec" className="chip-link">
                Agence infirmière Québec
              </Link>
              <Link href="/emplois-infirmieres-quebec" className="chip-link">
                Emplois infirmières Québec
              </Link>
              <Link href="/mandats-infirmiers-region-eloignee" className="chip-link">
                Mandats en régions éloignées
              </Link>
              <Link href="/agence-placement-sante-laval" className="chip-link">
                Agence placement santé Laval
              </Link>
              <Link href="/recrutement-personnel-sante-quebec" className="chip-link">
                Recrutement personnel santé
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Mandats urgents
          ============================================================ */}
      <section className="section">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Mandats urgents</p>
              <h2 className="mt-2 text-display-lg text-fg">À combler rapidement</h2>
            </div>
            <Link href="/postes" className="btn-secondary btn-sm self-start">
              Tous les postes
            </Link>
          </div>

          {urgentJobs.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-fg-muted leading-relaxed max-w-prose mx-auto">
                Aucun mandat urgent pour le moment. Vous pouvez quand même envoyer votre profil.
              </p>
              <Link href="/postuler" className="btn-primary mt-5 inline-flex">
                Envoyer mon profil
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {urgentJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          Confiance : 3 piliers avec icônes SVG sur mesure
          ============================================================ */}
      <section className="section pt-6 sm:pt-8">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
            <div>
              <p className="eyebrow-subtle">Notre approche</p>
              <h2 className="mt-2 text-display-lg text-fg max-w-2xl">
                Une agence de placement en santé basée à Laval.
              </h2>
            </div>
            <p className="text-[17.5px] leading-relaxed text-fg-muted max-w-prose">
              Nous combinons proximité humaine, rigueur de qualification et rapidité de suivi pour
              mieux connecter les professionnels de la santé aux bons mandats.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <Pillar
              icon={<TargetIcon className="h-7 w-7" />}
              title="Mandats ciblés"
              body="Des opportunités précises, qui correspondent à votre profession, vos disponibilités et vos préférences."
            />
            <Pillar
              icon={<HandshakeIcon className="h-7 w-7" />}
              title="Suivi humain"
              body="Une équipe joignable, une communication claire, pas de robotisation du recrutement."
            />
            <Pillar
              icon={<BoltIcon className="h-7 w-7" />}
              title="Réponse rapide"
              body="Une analyse rapide des dossiers et une mise en relation efficace avec les établissements."
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          Candidats : grand visuel + chips professions
          ============================================================ */}
      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Photo
              src={PHOTOS.candidates}
              alt="Professionnels de la santé au travail"
              aspect="landscape"
              rounded="3xl"
              className="w-full"
            />
            <div>
              <p className="eyebrow">Pour les candidats</p>
              <h2 className="mt-2 text-display-lg text-fg">Infirmiers et professionnels de la santé</h2>
              <p className="mt-4 text-[17.5px] leading-relaxed text-fg-muted max-w-prose">
                Trouvez des mandats compatibles avec votre profession, vos disponibilités, vos
                régions et vos préférences. Les infirmiers autorisés, techniciens et cliniciens
                peuvent cibler leurs départements, quarts et régions du Québec.
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                {QUICK_PROFESSIONS.map((p) => (
                  <li key={p.label}>
                    <Link
                      href={
                        p.filter
                          ? `/postes?profession=${encodeURIComponent(p.filter)}`
                          : '/postes'
                      }
                      className="chip-link"
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/emplois-infirmieres-quebec" className="btn-primary">Mandats infirmiers</Link>
                <Link href="/postuler" className="btn-secondary">Créer mon profil</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Établissements
          ============================================================ */}
      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Pour les établissements</p>
              <h2 className="mt-2 text-display-lg text-fg">Vous représentez un établissement ?</h2>
              <p className="mt-4 text-[17.5px] leading-relaxed text-fg-muted max-w-prose">
                Soumettez votre besoin en personnel et l'équipe Sanitas vous répondra rapidement.
                Besoins ponctuels, urgents, récurrents ou planifiés.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/etablissements" className="btn-primary">Demander du personnel</Link>
                <Link href="/contact" className="btn-secondary">Nous contacter</Link>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                <Stat label="Régions couvertes" value="17" />
                <Stat label="Professions" value="14+" />
                <Stat label="Réponse moyenne" value="24h" />
              </dl>
            </div>
            <Photo
              src={PHOTOS.establishments}
              alt="Équipe médicale en environnement hospitalier"
              aspect="landscape"
              rounded="3xl"
              className="w-full lg:ml-auto"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          Processus : centré, 2 colonnes avec étapes verticales
          ============================================================ */}
      <section className="section">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">Fonctionnement</p>
            <h2 className="mt-2 text-display-lg text-fg">Un processus simple.</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-muted/60 p-6 sm:p-10">
              <ProcessColumn
                tone="neutral"
                title="Pour les candidats"
                steps={[
                  { icon: <SearchIcon className="h-5 w-5" />, label: 'Trouvez un mandat' },
                  { icon: <SendIcon className="h-5 w-5" />, label: 'Envoyez votre profil' },
                  { icon: <ChecklistIcon className="h-5 w-5" />, label: 'Quelques précisions (2 min)' },
                  { icon: <ChatIcon className="h-5 w-5" />, label: 'Notre équipe vous contacte' },
                ]}
              />
            </div>
            <div className="rounded-3xl bg-accent-soft p-6 sm:p-10">
              <ProcessColumn
                tone="accent"
                title="Pour les établissements"
                steps={[
                  { icon: <ClipboardIcon className="h-5 w-5" />, label: 'Soumettez votre besoin' },
                  { icon: <AnalyzeIcon className="h-5 w-5" />, label: 'Nous analysons la demande' },
                  { icon: <PeopleIcon className="h-5 w-5" />, label: 'Nous proposons des profils' },
                  { icon: <CheckCircleIcon className="h-5 w-5" />, label: 'Vous validez les candidats' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Avis : témoignages (placeholders en attendant les vrais avis Google)
          ============================================================ */}
      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Témoignages</p>
              <h2 className="mt-2 text-display-lg text-fg">Ce qu'on dit de nous.</h2>
            </div>
            <p className="text-[13.5px] text-fg-muted">
              Avis vérifiables sur notre fiche Google Business.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Ils nous font confiance : mur de logos partenaires
          ============================================================ */}
      <section className="py-14 sm:py-16 border-y border-border bg-surface">
        <div className="container-page">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.2em] text-fg-subtle text-center">
            Ils nous font confiance
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8 items-center justify-items-center max-w-5xl mx-auto">
            {PARTNERS.map((p) => (
              <PartnerLogo key={p.name} name={p.name} logo={p.logo} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          Bandeau contact final — épuré, CTA seul (les coordonnées
          détaillées sont dans le footer juste après)
          ============================================================ */}
      <section className="section bg-fg text-bg">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-display-lg">Une question ? On vous répond.</h2>
          <p className="mt-5 text-[18px] leading-relaxed text-bg/70 max-w-prose mx-auto">
            Notre équipe est joignable du lundi au vendredi pour discuter de votre profil ou
            de votre besoin en personnel.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-dark">
              Nous écrire
            </Link>
            <a
              href="tel:+14509739696"
              className="btn border border-bg/30 text-bg hover:bg-bg/10"
            >
              450 973-9696
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-card">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="mt-5 text-[19px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 text-[16px] text-fg-muted leading-relaxed">{body}</p>
    </div>
  );
}

function ProcessColumn({
  title,
  steps,
  tone = 'neutral',
}: {
  title: string;
  steps: Array<{ icon: React.ReactNode; label: string }>;
  tone?: 'neutral' | 'accent';
}) {
  const iconBg = tone === 'accent' ? 'bg-surface text-accent' : 'bg-surface text-fg';
  return (
    <div className="text-center">
      <h3 className="text-[19px] font-semibold text-fg">{title}</h3>
      <ol className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={i} className="flex flex-col items-center">
            <span
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full shadow-soft ${iconBg}`}
            >
              {s.icon}
            </span>
            <span className="mt-3 text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle tabular-nums">
              Étape {i + 1}
            </span>
            <p className="mt-1 text-[14.5px] text-fg leading-snug max-w-[14ch]">{s.label}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col justify-center">
      <dt className="order-2 mt-0.5 text-[13px] leading-snug text-fg-muted">{label}</dt>
      <dd className="order-1 text-[24px] font-semibold tracking-tight text-fg tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12.5px] text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-[24px] font-semibold text-fg tabular-nums">{value}</dd>
    </div>
  );
}

function PartnerLogo({ name, logo }: Partner) {
  return (
    <div className="flex h-14 w-full items-center justify-center px-3">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          loading="lazy"
          className="max-h-full max-w-full object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
        />
      ) : (
        <span className="text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-fg-subtle leading-tight">
          {name}
        </span>
      )}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const rating = testimonial.rating ?? 5;
  return (
    <figure className="card p-5 flex flex-col h-full">
      <div className="flex items-center gap-0.5 text-accent" aria-label={`${rating} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} filled={i < rating} />
        ))}
      </div>
      <blockquote className="mt-4 text-[14.5px] leading-relaxed text-fg flex-1">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-5 pt-4 border-t border-border">
        <p className="text-[14px] font-medium text-fg">{testimonial.author}</p>
        <p className="text-[12.5px] text-fg-muted">{testimonial.role}</p>
      </figcaption>
    </figure>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15l-5.3 2.8 1-5.9L1.5 7.7l5.9-.9z" />
    </svg>
  );
}
