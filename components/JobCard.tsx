import Link from 'next/link';
import type { Job } from '@/types';
import UrgencyBadge from './UrgencyBadge';
import { formatDate } from '@/lib/utils';
import {
  PUBLIC_COPY,
  dateLocale,
  displayValue,
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
  const meta: string[] = [];
  if (job.establishment) meta.push(job.establishment);
  if (job.city) meta.push(job.city);
  if (job.department) meta.push(displayValue(locale, job.department));

  return (
    <article className="card p-6 transition-shadow hover:shadow-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium uppercase tracking-wider text-fg-subtle">
            {displayValue(locale, job.profession)}
          </p>
          <h3 className="mt-1 text-[20px] font-semibold tracking-tight text-fg leading-snug">
            {jobTitle(job, locale)}
          </h3>
        </div>
        <UrgencyBadge urgency={job.urgency} locale={locale} />
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
        {job.region && (
          <div>
            <dt className="text-fg-subtle">{copy.region}</dt>
            <dd className="text-fg">{job.region}</dd>
          </div>
        )}
      </dl>

      {variant === 'default' && job.salary && (
        <p className="text-[14.5px] text-fg-muted">
          <span className="text-fg-subtle">{copy.salary} · </span>
          {job.salary}
        </p>
      )}

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
