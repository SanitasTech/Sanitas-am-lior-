import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import UrgencyBadge from '@/components/UrgencyBadge';
import { DecorativeBlob } from '@/components/Icons';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';
import {
  dateLocale,
  displayValue,
  jobParticularities,
  jobRequirements,
  jobTitle,
  localizedPath,
} from '@/lib/i18n';
import {
  breadcrumbJsonLd,
  jobMetaDescription,
  jobPostingJsonLd,
  publicPageMetadata,
} from '@/lib/seo';
import type { Job } from '@/types';

export const dynamic = 'force-dynamic';

async function fetchJob(id: string): Promise<Job | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from('jobs').select('*').eq('id', id).eq('status', 'active').maybeSingle();
    return (data as Job) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await fetchJob(params.id);
  if (!job) return { title: 'Job not found' };
  return publicPageMetadata({
    title: `${jobTitle(job, 'en')}${job.city ? ` · ${job.city}` : ''}`,
    description: jobMetaDescription(job, 'en'),
    path: `/en/jobs/${params.id}`,
    locale: 'en',
    frPath: `/postes/${params.id}`,
    enPath: `/en/jobs/${params.id}`,
  });
}

export default async function EnglishJobDetailPage({ params }: { params: { id: string } }) {
  const job = await fetchJob(params.id);
  if (!job) notFound();

  const interestedHref = `${localizedPath('en', 'apply')}?mandat_id=${job.id}`;
  const requirements = jobRequirements(job, 'en');
  const particularities = jobParticularities(job, 'en');

  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id={`job-schema-${job.id}`}
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            jobPostingJsonLd(job, 'en'),
            breadcrumbJsonLd([
              { name: 'Home', url: '/en' },
              { name: 'Jobs', url: '/en/jobs' },
              { name: jobTitle(job, 'en'), url: `/en/jobs/${job.id}` },
            ]),
          ],
        }}
      />
      <section className="relative section pt-16 pb-12 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[450px] w-[450px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="mb-8">
            <Link href="/en/jobs" className="text-[14px] text-fg-muted hover:text-fg inline-flex items-center gap-1">
              <span aria-hidden>←</span> All jobs
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <article className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                  {displayValue('en', job.profession)}
                </p>
                <UrgencyBadge urgency={job.urgency} locale="en" />
              </div>
              <h1 className="mt-3 text-display-lg text-fg">{jobTitle(job, 'en')}</h1>

              <div className="mt-6 text-[15px] text-fg-muted">
                {[job.establishment, job.city, job.region].filter(Boolean).join(' · ')}
              </div>

              <dl className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Detail label="Department" value={displayValue('en', job.department)} />
                <Detail label="Shift" value={displayValue('en', job.shift)} />
                <Detail label="Schedule" value={job.schedule} />
                <Detail label="Assignment type" value={displayValue('en', job.mandate_type)} />
                <Detail label="Start date" value={formatDate(job.start_date, dateLocale('en'))} />
                <Detail label="Duration" value={job.duration} />
                <Detail label="Compensation" value={job.salary} />
                <Detail label="Region" value={job.region} />
              </dl>

              {requirements && (
                <section className="mt-12">
                  <h2 className="text-[20px] font-semibold text-fg">Requirements</h2>
                  <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg whitespace-pre-line">
                    {requirements}
                  </p>
                </section>
              )}

              {particularities && (
                <section className="mt-10">
                  <h2 className="text-[20px] font-semibold text-fg">Notes</h2>
                  <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg whitespace-pre-line">
                    {particularities}
                  </p>
                </section>
              )}

              {job.required_documents && job.required_documents.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-[20px] font-semibold text-fg">Required documents</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {job.required_documents.map((d) => (
                      <li key={d} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[13.5px] text-fg">
                        {displayValue('en', d)}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-12 flex flex-wrap gap-3">
                <Link href={interestedHref} className="btn-primary">I want this assignment</Link>
                <Link href="/en/contact" className="btn-secondary">Ask a question</Link>
              </div>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-6 shadow-card">
                <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">Summary</p>
                <dl className="mt-4 space-y-3.5 text-[14px]">
                  <SidebarItem label="Facility" value={job.establishment} />
                  <SidebarItem label="City" value={job.city} />
                  <SidebarItem label="Department" value={displayValue('en', job.department)} />
                  <SidebarItem label="Shift" value={displayValue('en', job.shift)} />
                  <SidebarItem label="Assignment type" value={displayValue('en', job.mandate_type)} />
                  <SidebarItem label="Start date" value={formatDate(job.start_date, dateLocale('en'))} />
                </dl>

                <div className="mt-6 flex flex-col gap-2">
                  <Link href={interestedHref} className="btn-primary">I want this assignment</Link>
                  <Link href="/en/contact" className="btn-secondary">Ask a question</Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[12.5px] font-medium uppercase tracking-wider text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-[15px] text-fg">{value}</dd>
    </div>
  );
}

function SidebarItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <dt className="text-fg-subtle">{label}</dt>
      <dd className="text-right text-fg">{value}</dd>
    </div>
  );
}
