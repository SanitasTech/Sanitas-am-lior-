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
  title: 'Thank you',
  description: 'Your application has been received by Agence Sanitas.',
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: { type?: string; application_id?: string; app?: string };
}

export default function EnglishThankYouPage({ searchParams }: Props) {
  const isPosting = searchParams.type === 'posting';
  const shouldTrackCandidateLead =
    searchParams.type === 'posting' || searchParams.type === 'spontaneous';
  const transactionId = searchParams.application_id || searchParams.app || null;

  return (
    <PublicLayout locale="en">
      {shouldTrackCandidateLead ? <GoogleAdsConversionEvent transactionId={transactionId} /> : null}
      <section className="relative section pt-16 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] text-accent pointer-events-none" />
        <div className="container-page max-w-2xl relative">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success mb-6">
              <CheckCircleIcon className="h-8 w-8" />
            </div>
            <h1 className="text-display-lg text-fg">
              {isPosting ? 'Application sent with your resume!' : 'Profile activated!'}
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-fg-muted max-w-prose mx-auto">
              {isPosting
                ? 'Your application was sent with your resume. A Sanitas recruiter can now review your profile.'
                : 'Your profile is in our database. Here is what happens next:'}
            </p>
          </div>

          <ol className="mt-10 space-y-4">
            <NextStep
              number="1"
              icon={<CheckCircleIcon className="h-5 w-5" />}
              title="We review your file"
              body={
                isPosting
                  ? 'Your resume is in your file. A recruiter checks that your profile fits the assignment requirements.'
                  : 'A recruiter reviews your file and identifies assignments matching your preferences.'
              }
            />
            <NextStep
              number="2"
              icon={<ChatIcon className="h-5 w-5" />}
              title="We contact you within 24 to 48 business hours"
              body="By your preferred method (phone or email). Feel free to call us first if you want to speed things up."
            />
            <NextStep
              number="3"
              icon={<ChecklistIcon className="h-5 w-5" />}
              title={isPosting ? 'Follow your application live' : 'You receive matching assignments'}
              body={
                isPosting
                  ? 'In your candidate portal, you will see every update: received, contacted, presented, placed.'
                  : 'As soon as an assignment fits, we send it to you. You decide if you want to apply.'
              }
            />
          </ol>

          {isPosting && (
            <div className="mt-10 rounded-2xl border border-accent/30 bg-accent-soft/35 p-5 text-left">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">
                Receive more matching assignments
              </p>
              <h2 className="mt-2 text-[20px] font-semibold tracking-tight text-fg">
                Complete your preferences in 1 minute
              </h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">
                To receive other matching assignments, you can now add your regions, shifts,
                departments and important constraints. This step is optional.
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/en/my-applications" className="btn-primary">
              {isPosting ? 'View my application' : 'View my applications'}
            </Link>
            {isPosting && (
              <Link href="/en/my-profile" className="btn-secondary">
                Complete my preferences
              </Link>
            )}
            <Link href="/en/jobs" className="btn-secondary">
              Browse more assignments
            </Link>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-muted/30 px-5 py-4 text-center">
            <p className="text-[13.5px] text-fg-muted">
              Urgent question or want to speak with someone right away?
            </p>
            <a
              href="tel:+14509739696"
              className="mt-1 inline-block text-[15.5px] font-semibold text-fg hover:underline"
            >
              450 973-9696
            </a>
            <p className="mt-0.5 text-[12px] text-fg-subtle">Monday to Friday, 8 AM to 5 PM</p>
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
