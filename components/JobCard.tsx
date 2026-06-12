import Link from 'next/link';
import type { Job } from '@/types';
import Badge from './Badge';
import UrgencyBadge from './UrgencyBadge';
import { MapPinIcon, ArrowRightIcon } from './Icons';
import { formatDate } from '@/lib/utils';
import { isRemoteRegion } from '@/lib/constants';
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
  const remoteRegion = !isInternational && isRemoteRegion(job.region);
  const establishment = jobEstablishment(job, locale);
  const salary = jobSalary(job, locale);
  const meta: string[] = [];
  if (establishment) meta.push(establishment);
  if (job.city) meta.push(job.city);
  if (isInternational) meta.push(displayValue(locale, country));
  if (job.department) meta.push(displayValue(locale, job.department));

  const facts: Array<{ label: string; value: string }> = [];
  if (job.shift) facts.push({ label: copy.shift, value: displayValue(locale, job.shift) });
  if (job.mandate_type) facts.push({ label: copy.type, value: displayValue(locale, job.mandate_type) });
  if (job.start_date) facts.push({ label: copy.start, value: formatDate(job.start_date, dateLocale(locale)) });
  if (job.region) {
    facts.push({ label: isInternational ? copy.territory : copy.region, value: job.region });
  }

  const hasBadges = (job.urgency && job.urgency !== 'normal') || isInternational || remoteRegion;

  return (
    <article className="card-interactive p-6 flex flex-col gap-4">
      {hasBadges && (
        <div className="flex flex-wrap items-center gap-2">
          <UrgencyBadge urgency={job.urgency} locale={locale} />
          {isInternational && <Badge variant="accent">International</Badge>}
          {remoteRegion && (
            <Badge variant="success">{locale === 'en' ? 'Remote region' : 'Région éloignée'}</Badge>
          )}
        </div>
      )}

      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
          {displayValue(locale, job.profession)}
        </p>
        <h3 className="mt-1.5 text-[20px] font-semibold tracking-tight leading-snug">
          <Link
            href={localizedJobPath(locale, job.id)}
            className="text-fg transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent"
          >
            {jobTitle(job, locale)}
          </Link>
        </h3>
        {meta.length > 0 && (
          <p className="mt-2 flex items-start gap-1.5 text-[15px] text-fg-muted leading-relaxed">
            <MapPinIcon className="mt-1 h-4 w-4 shrink-0 text-fg-subtle" />
            <span>{meta.join(' · ')}</span>
          </p>
        )}
      </div>

      {facts.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {facts.map((fact) => (
            <li key={fact.label} className="tag text-[13.5px]">
              <span className="text-fg-subtle">{fact.label}</span>
              <span className="font-medium text-fg">{fact.value}</span>
            </li>
          ))}
        </ul>
      )}

      {isInternational && job.eligible_countries && job.eligible_countries.length > 0 && (
        <p className="text-[13.5px] text-fg-muted">
          <span className="text-fg-subtle">
            {locale === 'en' ? 'Applicants from ' : 'Candidats depuis '}
          </span>
          {job.eligible_countries.map((value) => displayValue(locale, value)).join(', ')}
        </p>
      )}

      {variant === 'default' && salary && (
        <p className="text-[15px] text-fg">
          <span className="text-fg-subtle">{copy.salary} · </span>
          <span className="font-semibold">{salary}</span>
        </p>
      )}

      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-3">
        <Link
          href={`${localizedPath(locale, 'apply')}?mandat_id=${job.id}`}
          className="btn-primary btn-sm"
        >
          {copy.interested}
        </Link>
        <Link
          href={localizedJobPath(locale, job.id)}
          className="inline-flex items-center gap-1.5 text-[14.5px] font-medium text-fg-muted transition-colors hover:text-accent"
        >
          {copy.viewJob}
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <p className="text-[12.5px] text-fg-subtle -mt-1">
        {locale === 'en' ? 'Resume required to apply' : 'CV requis pour postuler'}
      </p>
    </article>
  );
}
