import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import Badge from '@/components/Badge';
import UrgencyBadge from '@/components/UrgencyBadge';
import { DecorativeBlob, MapPinIcon } from '@/components/Icons';
import { isRemoteRegion } from '@/lib/constants';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';
import {
  dateLocale,
  displayValue,
  jobBenefits,
  jobDescription,
  jobDuration,
  jobEstablishment,
  jobParticularities,
  jobRequirements,
  jobSalary,
  jobSchedule,
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
  const metaLocation = job.city || (job.country && job.country !== 'Canada' ? displayValue('en', job.country) : '');
  return publicPageMetadata({
    title: `${jobTitle(job, 'en')}${metaLocation ? ` · ${metaLocation}` : ''}`,
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
  const description = jobDescription(job, 'en');
  const benefits = jobBenefits(job, 'en');
  const requirements = jobRequirements(job, 'en');
  const particularities = jobParticularities(job, 'en');
  const establishment = jobEstablishment(job, 'en');
  const schedule = jobSchedule(job, 'en');
  const duration = jobDuration(job, 'en');
  const salary = jobSalary(job, 'en');
  const country = job.country || 'Canada';
  const isInternational = country !== 'Canada';
  const eligibleCountries = job.eligible_countries || [];

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
                <p className="eyebrow">{displayValue('en', job.profession)}</p>
                <UrgencyBadge urgency={job.urgency} locale="en" />
                {isInternational && <Badge variant="accent">International</Badge>}
                {!isInternational && isRemoteRegion(job.region) && (
                  <Badge variant="success">Remote region</Badge>
                )}
              </div>
              <h1 className="mt-3 text-display-lg text-fg">{jobTitle(job, 'en')}</h1>

              <div className="mt-5 flex items-start gap-2 text-[15.5px] text-fg-muted">
                <MapPinIcon className="mt-1 h-4 w-4 shrink-0 text-fg-subtle" />
                <span>
                  {[establishment, job.city, job.region, isInternational ? displayValue('en', country) : null].filter(Boolean).join(' · ')}
                </span>
              </div>

              <section className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <h2 className="text-[20px] font-semibold text-fg">Assignment summary</h2>
                <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Detail label="Profession" value={displayValue('en', job.profession)} />
                  <Detail label="Department" value={displayValue('en', job.department)} />
                  <Detail label={isInternational ? 'Region / territory' : 'Region'} value={job.region} />
                  <Detail label="Shift" value={displayValue('en', job.shift)} />
                  <Detail label="Compensation" value={salary} />
                  <Detail label="Start date" value={formatDate(job.start_date, dateLocale('en'))} />
                </dl>

                {job.required_documents && job.required_documents.length > 0 && (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-[12.5px] font-medium uppercase tracking-wider text-fg-subtle">
                      Required documents
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {job.required_documents.map((d) => (
                        <li
                          key={d}
                          className="rounded-full border border-border bg-bg px-3 py-1.5 text-[13.5px] text-fg"
                        >
                          {displayValue('en', d)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {description && (
                <section className="mt-10">
                  <h2 className="text-[20px] font-semibold text-fg">Description</h2>
                  <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg whitespace-pre-line">
                    {description}
                  </p>
                </section>
              )}

              <dl className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {isInternational && <Detail label="Country" value={displayValue('en', country)} />}
                <Detail label="Department" value={displayValue('en', job.department)} />
                <Detail label="Shift" value={displayValue('en', job.shift)} />
                <Detail label="Schedule" value={schedule} />
                <Detail label="Assignment type" value={displayValue('en', job.mandate_type)} />
                <Detail label="Start date" value={formatDate(job.start_date, dateLocale('en'))} />
                <Detail label="Duration" value={duration} />
                <Detail label="Compensation" value={salary} />
                <Detail label={isInternational ? 'Region / territory' : 'Region'} value={job.region} />
              </dl>

              {isInternational && eligibleCountries.length > 0 && (
                <section className="mt-10 rounded-xl border border-accent/30 bg-accent-soft/30 p-5">
                  <h2 className="text-[18px] font-semibold text-fg">International assignment</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
                    This assignment is located in {displayValue('en', country)}. Applications are
                    accepted from: {eligibleCountries.map((value) => displayValue('en', value)).join(', ')}.
                  </p>
                </section>
              )}

              {requirements && (
                <section className="mt-12">
                  <h2 className="text-[20px] font-semibold text-fg">Requirements</h2>
                  <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg whitespace-pre-line">
                    {requirements}
                  </p>
                </section>
              )}

              {benefits && (
                <section className="mt-10">
                  <h2 className="text-[20px] font-semibold text-fg">Benefits</h2>
                  <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg whitespace-pre-line">
                    {benefits}
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

              <section className="mt-12 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                <h2 className="text-[20px] font-semibold text-fg">How to apply</h2>
                <ol className="mt-4 grid gap-3 text-[15px] leading-relaxed text-fg-muted sm:grid-cols-2">
                  <li className="rounded-xl border border-border bg-bg p-4">
                    <span className="block text-[13px] font-semibold uppercase tracking-wider text-accent">1</span>
                    Sign in with Google to find or create your Sanitas candidate file.
                  </li>
                  <li className="rounded-xl border border-border bg-bg p-4">
                    <span className="block text-[13px] font-semibold uppercase tracking-wider text-accent">2</span>
                    Upload your resume, or reuse the one already in your file.
                  </li>
                  <li className="rounded-xl border border-border bg-bg p-4">
                    <span className="block text-[13px] font-semibold uppercase tracking-wider text-accent">3</span>
                    Confirm only the details that matter for this assignment.
                  </li>
                  <li className="rounded-xl border border-border bg-bg p-4">
                    <span className="block text-[13px] font-semibold uppercase tracking-wider text-accent">4</span>
                    Submit your application; you can complete your preferences afterward.
                  </li>
                </ol>
              </section>

              <div className="mt-12 flex flex-wrap gap-3">
                <Link
                  href={interestedHref}
                  className="btn-primary"
                  data-analytics-event="job_apply_click"
                  data-analytics-label="job_detail_inline_cta_en"
                  data-analytics-job-id={job.id}
                  data-analytics-job-title={jobTitle(job, 'en')}
                  data-analytics-location={job.region || job.city || country}
                >
                  I want this assignment
                </Link>
                <Link href="/en/contact" className="btn-secondary">Ask a question</Link>
              </div>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-6 shadow-card">
                <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">Summary</p>
                <dl className="mt-4 space-y-3.5 text-[14px]">
                  <SidebarItem label="Facility" value={establishment} />
                  {isInternational && <SidebarItem label="Country" value={displayValue('en', country)} />}
                  <SidebarItem label="City" value={job.city} />
                  <SidebarItem label={isInternational ? 'Territory' : 'Region'} value={job.region} />
                  <SidebarItem label="Department" value={displayValue('en', job.department)} />
                  <SidebarItem label="Shift" value={displayValue('en', job.shift)} />
                  <SidebarItem label="Assignment type" value={displayValue('en', job.mandate_type)} />
                  <SidebarItem label="Start date" value={formatDate(job.start_date, dateLocale('en'))} />
                </dl>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href={interestedHref}
                    className="btn-primary"
                    data-analytics-event="job_apply_click"
                    data-analytics-label="job_detail_sidebar_cta_en"
                    data-analytics-job-id={job.id}
                    data-analytics-job-title={jobTitle(job, 'en')}
                    data-analytics-location={job.region || job.city || country}
                  >
                    I want this assignment
                  </Link>
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
