import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import UrgencyBadge from '@/components/UrgencyBadge';
import { DecorativeBlob } from '@/components/Icons';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  breadcrumbJsonLd,
  jobMetaDescription,
  jobPostingJsonLd,
  publicPageMetadata,
} from '@/lib/seo';
import { displayValue } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import type { Job } from '@/types';

export const dynamic = 'force-dynamic';

async function fetchJob(id: string): Promise<Job | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle();
    return (data as Job) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const job = await fetchJob(params.id);
  if (!job) return { title: 'Poste introuvable' };
  const metaLocation = job.city || (job.country && job.country !== 'Canada' ? displayValue('fr', job.country) : '');
  return publicPageMetadata({
    title: `${job.title}${metaLocation ? ` · ${metaLocation}` : ''}`,
    description: jobMetaDescription(job, 'fr'),
    path: `/postes/${params.id}`,
    frPath: `/postes/${params.id}`,
    enPath: `/en/jobs/${params.id}`,
  });
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await fetchJob(params.id);
  if (!job) notFound();

  const interestedHref = `/postuler?mandat_id=${job.id}`;
  const country = job.country || 'Canada';
  const isInternational = country !== 'Canada';
  const eligibleCountries = job.eligible_countries || [];

  return (
    <PublicLayout>
      <SeoJsonLd
        id={`job-schema-${job.id}`}
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            jobPostingJsonLd(job, 'fr'),
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'Postes', url: '/postes' },
              { name: job.title, url: `/postes/${job.id}` },
            ]),
          ],
        }}
      />
      <section className="relative section pt-16 pb-12 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[450px] w-[450px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="mb-8">
            <Link href="/postes" className="text-[14px] text-fg-muted hover:text-fg inline-flex items-center gap-1">
              <span aria-hidden>←</span> Tous les postes
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <article className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                  {job.profession}
                </p>
                <UrgencyBadge urgency={job.urgency} />
                {isInternational && (
                  <span className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-[12px] font-medium text-accent">
                    International
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-display-lg text-fg">{job.title}</h1>

              <div className="mt-6 text-[15px] text-fg-muted">
                {[job.establishment, job.city, job.region, isInternational ? displayValue('fr', country) : null].filter(Boolean).join(' · ')}
              </div>

              <dl className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {isInternational && <Detail label="Pays" value={displayValue('fr', country)} />}
                <Detail label="Département" value={job.department} />
                <Detail label="Quart" value={job.shift} />
                <Detail label="Horaire" value={job.schedule} />
                <Detail label="Type de mandat" value={job.mandate_type} />
                <Detail label="Date de début" value={formatDate(job.start_date)} />
                <Detail label="Durée" value={job.duration} />
                <Detail label="Rémunération" value={job.salary} />
                <Detail label={isInternational ? 'Région / territoire' : 'Région'} value={job.region} />
              </dl>

              {isInternational && eligibleCountries.length > 0 && (
                <section className="mt-10 rounded-xl border border-accent/30 bg-accent-soft/30 p-5">
                  <h2 className="text-[18px] font-semibold text-fg">Mandat international</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">
                    Ce mandat est situé en {displayValue('fr', country)}. Les candidatures sont
                    acceptées depuis : {eligibleCountries.map((value) => displayValue('fr', value)).join(', ')}.
                  </p>
                </section>
              )}

              {job.requirements && (
                <section className="mt-12">
                  <h2 className="text-[20px] font-semibold text-fg">Exigences</h2>
                  <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg whitespace-pre-line">
                    {job.requirements}
                  </p>
                </section>
              )}

              {job.particularities && (
                <section className="mt-10">
                  <h2 className="text-[20px] font-semibold text-fg">Particularités</h2>
                  <p className="mt-3 max-w-prose text-[15.5px] leading-relaxed text-fg whitespace-pre-line">
                    {job.particularities}
                  </p>
                </section>
              )}

              {job.required_documents && job.required_documents.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-[20px] font-semibold text-fg">Documents requis</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {job.required_documents.map((d) => (
                      <li
                        key={d}
                        className="rounded-full border border-border bg-surface px-3 py-1.5 text-[13.5px] text-fg"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-12 flex flex-wrap gap-3">
                <Link href={interestedHref} className="btn-primary">
                  Je veux ce mandat
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Poser une question
                </Link>
              </div>
            </article>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-6 shadow-card">
                <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
                  Résumé
                </p>
                <dl className="mt-4 space-y-3.5 text-[14px]">
                  <SidebarItem label="Établissement" value={job.establishment} />
                  {isInternational && <SidebarItem label="Pays" value={displayValue('fr', country)} />}
                  <SidebarItem label="Ville" value={job.city} />
                  <SidebarItem label={isInternational ? 'Territoire' : 'Région'} value={job.region} />
                  <SidebarItem label="Département" value={job.department} />
                  <SidebarItem label="Quart" value={job.shift} />
                  <SidebarItem label="Type de mandat" value={job.mandate_type} />
                  <SidebarItem label="Date de début" value={formatDate(job.start_date)} />
                </dl>

                <div className="mt-6 flex flex-col gap-2">
                  <Link href={interestedHref} className="btn-primary">
                    Je veux ce mandat
                  </Link>
                  <Link href="/contact" className="btn-secondary">
                    Poser une question
                  </Link>
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
