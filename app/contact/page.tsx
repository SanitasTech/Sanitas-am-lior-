import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';
import { DecorativeBlob, PeopleIcon, ClipboardIcon, ChatIcon } from '@/components/Icons';
import { breadcrumbJsonLd, publicPageMetadata, webPageJsonLd } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Contact Agence Sanitas | Candidats et établissements',
  description:
    "Contactez Agence Sanitas à Laval pour postuler, poser une question ou demander du personnel de santé au Québec.",
  path: '/contact',
  frPath: '/contact',
  enPath: '/en/contact',
});

export default function ContactPage() {
  return (
    <PublicLayout>
      <SeoJsonLd
        id="contact-schema"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            webPageJsonLd({
              name: 'Contact Agence Sanitas',
              description:
                'Coordonnées et formulaire de contact pour candidats, professionnels de la santé et établissements au Québec.',
              url: '/contact',
            }),
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'Contact', url: '/contact' },
            ]),
          ],
        }}
      />
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-4xl relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Contact</p>
          <h1 className="mt-2 text-display-lg text-fg">Contactez Agence Sanitas</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-fg-muted max-w-prose">
            Que vous soyez candidat, professionnel de la santé ou représentant d'un établissement,
            notre équipe peut vous orienter vers la bonne démarche.
          </p>
        </div>
      </section>

      <section className="pb-8">
        <div className="container-page max-w-4xl">
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              icon={<PeopleIcon className="h-6 w-6" />}
              title="Je suis candidat"
              body="Envoyez votre profil et complétez quelques précisions."
              cta="Envoyer mon profil"
              href="/postuler"
            />
            <Card
              icon={<ClipboardIcon className="h-6 w-6" />}
              title="Je représente un établissement"
              body="Présentez votre besoin de personnel à l'équipe Sanitas."
              cta="Demander du personnel"
              href="/etablissements"
            />
            <Card
              icon={<ChatIcon className="h-6 w-6" />}
              title="Autre demande"
              body="Une question qui ne correspond pas aux deux cas ci-dessus."
              cta="Envoyer un message"
              href="#form"
            />
          </div>
        </div>
      </section>

      <section id="form" className="section pt-8 pb-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-display-md text-fg">Nous écrire</h2>
          <p className="mt-2 text-fg-muted">Réponse rapide pendant les heures de bureau.</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="pb-24">
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

function Card({
  icon,
  title,
  body,
  cta,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 text-[14px] text-fg-muted leading-relaxed flex-1">{body}</p>
      <Link href={href} className="btn-secondary btn-sm mt-4 self-start">
        {cta}
      </Link>
    </div>
  );
}
