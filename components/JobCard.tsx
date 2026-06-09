import Link from 'next/link';
import type { Job } from '@/types';
import UrgencyBadge from './UrgencyBadge';
import { formatDate } from '@/lib/utils';
import {
  PUBLIC_COPY,
  dateLocale,
  displayValue,
  jobEstablishment,
  jobSalary,
  jobTitle,
  localizedJobPath,
  localizedPath,
  type Locale,
} from '@/lib/i18n';

interface JobCardProps {
  job: Job;
  variant?: 'default' | 'compact';
  locale?: Locale;
}

export default function JobCard({ job, variant = 'default', locale = 'fr' }: JobCardProps) {
  const copy = PUBLIC_COPY[locale].jobs;
  const country = job.country || 'Canada';
  const isInternational = country !== 'Canada';
  const establishment = jobEstablishment(job, locale);
  const salary = jobSalary(job, locale);
  const meta: string[] = [];
  if (establishment) meta.push(establishment);
  if (job.city) meta.push(job.city);
  if (isInternational) meta.push(displayValue(locale, country));
  if (job.department) meta.push(displayValue(locale, job.department));

  return (
    <article className="card p-6 transition-shadow hover:shadow-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium uppercase tracking-wider text-fg-subtle">
            {displayValue(locale, job.profession)}
          </p>
          <h3 className="mt-1 text-[20px] font-semibold tracking-tight leading-snug">
            <Link
              href={localizedJobPath(locale, job.id)}
              className="text-fg transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
            >
              {jobTitle(job, locale)}
            </Link>
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <UrgencyBadge urgency={job.urgency} locale={locale} />
          {isInternational && (
            <span className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[11.5px] font-medium text-accent">
              International
            </span>
          )}
        </div>
      </div>

      {meta.length > 0 && <p className="text-[15px] text-fg-muted leading-relaxed">{meta.join(' · ')}</p>}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px]">
        {job.shift && (
          <div>
            <dt className="text-fg-subtle">{copy.shift}</dt>
            <dd className="text-fg">{displayValue(locale, job.shift)}</dd>
          </div>
        )}
        {job.mandate_type && (
          <div>
            <dt className="text-fg-subtle">{copy.type}</dt>
            <dd className="text-fg">{displayValue(locale, job.mandate_type)}</dd>
          </div>
        )}
        {job.start_date && (
          <div>
            <dt className="text-fg-subtle">{copy.start}</dt>
            <dd className="text-fg">{formatDate(job.start_date, dateLocale(locale))}</dd>
          </div>
        )}
        {isInternational && (
          <div>
            <dt className="text-fg-subtle">{copy.country}</dt>
            <dd className="text-fg">{displayValue(locale, country)}</dd>
          </div>
        )}
        {job.region && (
          <div>
            <dt className="text-fg-subtle">{isInternational ? copy.territory : copy.region}</dt>
            <dd className="text-fg">{job.region}</dd>
          </div>
        )}
      </dl>

      {isInternational && job.eligible_countries && job.eligible_countries.length > 0 && (
        <p className="text-[13.5px] text-fg-muted">
          <span className="text-fg-subtle">
            {locale === 'en' ? 'Applicants from ' : 'Candidats depuis '}
          </span>
          {job.eligible_countries.map((value) => displayValue(locale, value)).join(', ')}
        </p>
      )}

      {variant === 'default' && salary && (
        <p className="text-[14.5px] text-fg-muted">
          <span className="text-fg-subtle">{copy.salary} · </span>
          {salary}
        </p>
      )}

      <p className="text-[13px] font-medium text-fg-subtle">
        {locale === 'en' ? 'Resume required to apply' : 'CV requis pour postuler'}
      </p>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:gap-3 pt-2">
        <Link href={localizedJobPath(locale, job.id)} className="btn-secondary btn-sm">
          {copy.viewJob}
        </Link>
        <Link href={`${localizedPath(locale, 'apply')}?mandat_id=${job.id}`} className="btn-primary btn-sm">
          {copy.interested}
        </Link>
      </div>
    </article>
  );
}
