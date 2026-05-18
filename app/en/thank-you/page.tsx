import Link from 'next/link';
import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import { DecorativeBlob, CheckCircleIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Thank you',
  description: 'Your application has been received by Agence Sanitas.',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: { type?: string };
}

export default function EnglishThankYouPage({ searchParams }: Props) {
  const isPosting = searchParams.type === 'posting';

  return (
    <PublicLayout locale="en">
      <section className="relative section pt-24 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] text-accent pointer-events-none" />
        <div className="container-page max-w-2xl text-center relative">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success mb-6">
            <CheckCircleIcon className="h-8 w-8" />
          </div>
          <h1 className="text-display-lg text-fg">
            {isPosting ? 'Your interest in this assignment has been received.' : 'Your profile has been received.'}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-fg-muted max-w-prose mx-auto">
            {isPosting
              ? 'A member of the Sanitas team may contact you if your profile matches the assignment needs.'
              : 'We will contact you when an assignment compatible with your profile becomes available.'}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/en/jobs" className="btn-primary">View open jobs</Link>
            <Link href="/en" className="btn-secondary">Back to home</Link>
          </div>

          <p className="mt-12 text-[13.5px] text-fg-muted">
            Urgent question? Call us at{' '}
            <a href="tel:+14509739696" className="text-fg hover:underline">450 973-9696</a>.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
