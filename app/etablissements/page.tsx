import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import EstablishmentRequestForm from '@/components/EstablishmentRequestForm';
import ContactInfo from '@/components/ContactInfo';
import Photo from '@/components/Photo';
import { DecorativeBlob } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Demander du personnel en santé',
  description:
    'Établissements de santé : présentez votre besoin de personnel à Agence Sanitas. Réponse rapide et structurée.',
};

const NEEDS = [
  'Remplacement',
  'Besoin urgent',
  'Court terme',
  'Long terme',
  'Soutien temporaire',
  'Besoin par département',
  'Besoin par quart',
];

const PROFESSIONS = [
  'Infirmier(ère)',
  'Infirmier(ère) auxiliaire',
  'Préposé(e) aux bénéficiaires',
  'ASSS',
  'Inhalothérapeute',
  'Professionnels de réadaptation',
  'Personnel clinique et de soutien',
];

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80&auto=format&fit=crop';

export default function EtablissementsPage() {
  return (
    <PublicLayout>
      {/* Hero avec photo */}
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -left-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                Établissements
              </p>
              <h1 className="mt-2 text-display-lg text-fg">Demander du personnel en santé</h1>
              <p className="mt-5 text-[17px] leading-relaxed text-fg-muted max-w-prose">
                Présentez votre besoin à l'équipe Sanitas. Nous vous répondrons rapidement avec une
                approche claire et structurée.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-fg-muted max-w-prose">
                Agence Sanitas accompagne les établissements de santé dans leurs besoins de
                personnel, qu'il s'agisse de besoins ponctuels, urgents, récurrents ou planifiés.
              </p>
            </div>
            <Photo
              src={HERO_PHOTO}
              alt="Couloir d'hôpital lumineux"
              aspect="landscape"
              rounded="3xl"
              className="shadow-card"
            />
          </div>
        </div>
      </section>

      {/* Couvertures + professions en cartes */}
      <section className="pb-12">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card p-6">
              <h2 className="text-[18px] font-semibold text-fg">Besoins couverts</h2>
              <ul className="mt-4 space-y-2">
                {NEEDS.map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-[14.5px] text-fg">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h2 className="text-[18px] font-semibold text-fg">Professions possibles</h2>
              <ul className="mt-4 space-y-2">
                {PROFESSIONS.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[14.5px] text-fg">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section className="pb-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-display-md text-fg">Votre demande</h2>
          <p className="mt-2 text-fg-muted">
            Plus la demande est précise, plus notre réponse est rapide.
          </p>
          <div className="mt-8">
            <EstablishmentRequestForm />
          </div>
        </div>
      </section>

      {/* Contact direct */}
      <section className="pb-24">
        <div className="container-page max-w-3xl">
          <div className="card p-6 bg-muted/40">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle mb-3">
              Contact direct
            </p>
            <ContactInfo />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
