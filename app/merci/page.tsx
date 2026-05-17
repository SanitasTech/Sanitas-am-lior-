import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import { DecorativeBlob, CheckCircleIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Merci',
  description: 'Votre candidature a bien été reçue par Agence Sanitas.',
};

interface Props {
  searchParams: { type?: string };
}

export default function MerciPage({ searchParams }: Props) {
  const isPosting = searchParams.type === 'posting';

  return (
    <PublicLayout>
      <section className="relative section pt-24 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] text-accent pointer-events-none" />
        <div className="container-page max-w-2xl text-center relative">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success mb-6">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <h1 className="text-display-lg text-fg">
            {isPosting
              ? 'Votre intérêt pour ce mandat a bien été reçu.'
              : 'Votre profil a bien été reçu.'}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-fg-muted max-w-prose mx-auto">
            {isPosting
              ? "Un membre de l'équipe Sanitas pourra vous contacter si votre profil correspond aux besoins du mandat."
              : 'Nous vous contacterons lorsqu\'un mandat compatible avec votre profil sera disponible.'}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/postes" className="btn-primary">
              Voir les postes ouverts
            </Link>
            <Link href="/" className="btn-secondary">
              Retour à l'accueil
            </Link>
          </div>

          <p className="mt-12 text-[13.5px] text-fg-muted">
            Une question urgente ? Appelez-nous au{' '}
            <a href="tel:+14509739696" className="text-fg hover:underline">
              450 973-9696
            </a>
            .
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
