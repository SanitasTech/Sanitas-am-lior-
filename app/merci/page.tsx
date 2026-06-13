import Link from 'next/link';
import type { Metadata } from 'next';
import GoogleAdsConversionEvent from '@/components/GoogleAdsConversionEvent';
import PublicLayout from '@/components/PublicLayout';
import {
  CheckCircleIcon,
  ChatIcon,
  ChecklistIcon,
  DecorativeBlob,
} from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Merci',
  description: 'Votre candidature a bien été reçue par Agence Sanitas.',
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: { type?: string; application_id?: string; app?: string };
}

export default function MerciPage({ searchParams }: Props) {
  const isPosting = searchParams.type === 'posting';
  const shouldTrackCandidateLead =
    searchParams.type === 'posting' || searchParams.type === 'spontaneous';
  const transactionId = searchParams.application_id || searchParams.app || null;

  return (
    <PublicLayout>
      {shouldTrackCandidateLead ? <GoogleAdsConversionEvent transactionId={transactionId} /> : null}
      <section className="relative section pt-16 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] text-accent pointer-events-none" />
        <div className="container-page max-w-2xl relative">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success mb-6">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <h1 className="text-display-lg text-fg">
              {isPosting ? 'Candidature envoyée avec CV !' : 'Profil activé !'}
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-fg-muted max-w-prose mx-auto">
              {isPosting
                ? 'Votre candidature est envoyée avec votre CV. Un recruteur Sanitas pourra maintenant analyser votre profil.'
                : 'Ton profil est dans notre base. Voici ce qui va se passer :'}
            </p>
          </div>

          <ol className="mt-10 space-y-4">
            <NextStep
              number="1"
              icon={<CheckCircleIcon className="h-5 w-5" />}
              title="Nous analysons ton dossier"
              body={
                isPosting
                  ? "Votre CV est au dossier. Une recruteuse vérifie que votre profil correspond aux exigences du mandat."
                  : 'Une recruteuse vérifie ton dossier et identifie les mandats compatibles avec tes préférences.'
              }
            />
            <NextStep
              number="2"
              icon={<ChatIcon className="h-5 w-5" />}
              title="On te contacte dans 24 à 48 h ouvrables"
              body="Par le moyen que tu as choisi (téléphone ou courriel). Tu peux nous appeler avant si tu veux accélérer."
            />
            <NextStep
              number="3"
              icon={<ChecklistIcon className="h-5 w-5" />}
              title={isPosting ? 'Suis l’état de ta candidature' : 'Tu reçois les mandats compatibles'}
              body={
                isPosting
                  ? 'Dans ton espace candidat, tu verras chaque mise à jour : reçu, contacté, présenté, placé.'
                  : 'Dès qu’un mandat colle à ton profil, on te l’envoie. Tu décides si tu veux postuler.'
              }
            />
          </ol>

          {isPosting && (
            <div className="mt-10 rounded-2xl border border-accent/30 bg-accent-soft/35 p-5 text-left">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                Recevoir d'autres mandats
              </p>
              <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-fg">
                Complétez vos préférences en 1 minute
              </h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">
                Pour recevoir d’autres mandats compatibles, vous pouvez maintenant ajouter vos régions,
                quarts, départements et contraintes importantes. Cette étape est optionnelle.
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/mes-candidatures"
              className="btn-primary"
              data-analytics-event="thank_you_cta_click"
              data-analytics-label={isPosting ? 'view_application' : 'view_applications'}
            >
              {isPosting ? 'Voir ma candidature' : 'Voir mes candidatures'}
            </Link>
            {isPosting && (
              <Link
                href="/mon-profil"
                className="btn-secondary"
                data-analytics-event="thank_you_cta_click"
                data-analytics-label="complete_preferences"
              >
                Compléter mes préférences
              </Link>
            )}
            <Link
              href="/postes"
              className="btn-secondary"
              data-analytics-event="thank_you_cta_click"
              data-analytics-label="browse_more_jobs"
            >
              Voir d’autres mandats
            </Link>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-center">
            <p className="text-[13.5px] text-fg-muted">
              Une question urgente ou tu veux parler à quelqu’un tout de suite ?
            </p>
            <a
              href="tel:+14509739696"
              className="mt-1 inline-block text-[15.5px] font-semibold text-fg hover:underline"
              data-analytics-event="thank_you_cta_click"
              data-analytics-label="phone"
            >
              450 973-9696
            </a>
            <p className="mt-0.5 text-[12px] text-fg-subtle">
              Lundi au vendredi, 8 h à 17 h
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function NextStep({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        {icon}
        <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-fg">
          {number}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[15.5px] font-semibold text-fg">{title}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-fg-muted">{body}</p>
      </div>
    </li>
  );
}
