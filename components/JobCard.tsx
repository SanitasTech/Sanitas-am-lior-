import Link from 'next/link';
import type { Job } from '@/types';
import UrgencyBadge from './UrgencyBadge';
import { formatDate } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  variant?: 'default' | 'compact';
}

export default function JobCard({ job, variant = 'default' }: JobCardProps) {
  const meta: string[] = [];
  if (job.establishment) meta.push(job.establishment);
  if (job.city) meta.push(job.city);
  if (job.department) meta.push(job.department);

  return (
    <article className="card p-6 transition-shadow hover:shadow-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium uppercase tracking-wider text-fg-subtle">
            {job.profession}
          </p>
          <h3 className="mt-1 text-[20px] font-semibold tracking-tight text-fg leading-snug">
            {job.title}
          </h3>
        </div>
        <UrgencyBadge urgency={job.urgency} />
      </div>

      {meta.length > 0 && (
        <p className="text-[15px] text-fg-muted leading-relaxed">{meta.join(' · ')}</p>
      )}

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[14.5px]">
        {job.shift && (
          <div>
            <dt className="text-fg-subtle">Quart</dt>
            <dd className="text-fg">{job.shift}</dd>
          </div>
        )}
        {job.mandate_type && (
          <div>
            <dt className="text-fg-subtle">Type</dt>
            <dd className="text-fg">{job.mandate_type}</dd>
          </div>
        )}
        {job.start_date && (
          <div>
            <dt className="text-fg-subtle">Début</dt>
            <dd className="text-fg">{formatDate(job.start_date)}</dd>
          </div>
        )}
        {job.region && (
          <div>
            <dt className="text-fg-subtle">Région</dt>
            <dd className="text-fg">{job.region}</dd>
          </div>
        )}
      </dl>

      {variant === 'default' && job.salary && (
        <p className="text-[14.5px] text-fg-muted">
          <span className="text-fg-subtle">Rémunération · </span>
          {job.salary}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:gap-3 pt-2">
        <Link href={`/postes/${job.id}`} className="btn-secondary btn-sm">
          Voir le poste
        </Link>
        <Link href={`/postuler?mandat_id=${job.id}`} className="btn-primary btn-sm">
          Je suis intéressé
        </Link>
      </div>
    </article>
  );
}
