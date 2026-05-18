import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';
import { DecorativeBlob } from '@/components/Icons';
import { getCurrentCandidate, getCurrentUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';
import { applicationTitle, dateLocale } from '@/lib/i18n';
import type { Submission } from '@/types';

export const metadata: Metadata = {
  title: 'My applications',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EnglishApplicationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/en/login?redirect=/en/my-applications');
  const candidate = await getCurrentCandidate();

  let submissions: Submission[] = [];
  if (candidate) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('candidate_id', candidate.id)
      .order('created_at', { ascending: false });
    submissions = (data || []) as Submission[];
  }

  return (
    <PublicLayout locale="en">
      <section className="relative section pt-16 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-4xl relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Candidate portal</p>
          <h1 className="mt-2 text-display-md text-fg">My applications</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted max-w-prose">
            History of all your applications with their current Sanitas follow-up status.
          </p>

          <div className="mt-10 space-y-4">
            {submissions.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-fg-muted">You do not have an application yet.</p>
                <Link href="/en/jobs" className="btn-primary mt-5 inline-flex">View open jobs</Link>
              </div>
            ) : (
              submissions.map((s) => {
                const type = s.application_type || s.submission_type || 'spontaneous';
                const isPosting = type === 'posting';
                const meta = isPosting
                  ? [s.posting_snapshot?.establishment, s.posting_snapshot?.city, s.posting_snapshot?.department].filter(Boolean).join(' · ')
                  : 'Profile sent for compatible assignments';
                return (
                  <article key={s.id} className="card p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeBadge type={type} locale="en" />
                        </div>
                        <h2 className="text-[18px] font-semibold text-fg">{applicationTitle(s, 'en')}</h2>
                        <p className="mt-1 text-[14.5px] text-fg-muted">{meta}</p>
                        <p className="mt-2 text-[13px] text-fg-subtle">
                          Submitted on {formatDateTime(s.created_at, dateLocale('en'))}
                        </p>
                      </div>
                      <StatusBadge status={s.status} locale="en" />
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <p className="mt-10 text-[13.5px] text-fg-muted">
            Question about an application?{' '}
            <a href="mailto:rh@agencesanitas.com" className="underline">Write to us</a> or call 450 973-9696.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
