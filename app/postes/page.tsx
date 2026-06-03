import { unstable_noStore as noStore } from 'next/cache';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import JobFilters from '@/components/JobFilters';
import JobCard from '@/components/JobCard';
import PopularSearchLinks from '@/components/PopularSearchLinks';
import { DecorativeBlob } from '@/components/Icons';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { breadcrumbJsonLd, itemListJsonLd, jobMetaDescription, publicPageMetadata, webPageJsonLd } from '@/lib/seo';
import type { Job } from '@/types';
import { urgencyOrder } from '@/lib/utils';

export const metadata = publicPageMetadata({
  title: 'Emplois en santé | Mandats Québec et internationaux',
  description:
    'Consultez les mandats actifs en santé avec Agence Sanitas, au Québec et à l’international. Filtrez par profession, pays, région, département, quart et type de mandat.',
  path: '/postes',
  frPath: '/postes',
  enPath: '/en/jobs',
});

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(sp: Props['searchParams'], k: string): string {
  const v = sp[k];
  if (Array.isArray(v)) return v[0] || '';
  return v || '';
}

async function fetchJobs(sp: Props['searchParams']): Promise<Job[]> {
  noStore();
  try {
    const supabase = createSupabaseAdminClient();
    let q = supabase.from('jobs').select('*').eq('status', 'active');

    const profession = param(sp, 'profession');
    const country = param(sp, 'country');
    const region = param(sp, 'region');
    const city = param(sp, 'city');
    const establishment = param(sp, 'establishment');
    const department = param(sp, 'department');
    const shift = param(sp, 'shift');
    const mandate_type = param(sp, 'mandate_type');
    const urgency = param(sp, 'urgency');

    if (profession) q = q.eq('profession', profession);
    if (country) q = q.eq('country', country);
    if (region) q = q.eq('region', region);
    if (city) q = q.ilike('city', `%${city}%`);
    if (establishment) q = q.ilike('establishment', `%${establishment}%`);
    if (department) q = q.eq('department', department);
    if (shift) q = q.eq('shift', shift);
    if (mandate_type) q = q.eq('mandate_type', mandate_type);
    if (urgency) q = q.eq('urgency', urgency);

    const { data } = await q.order('created_at', { ascending: false }).limit(60);
    const jobs = (data || []) as Job[];
    return jobs.sort((a, b) => {
      const u = urgencyOrder(a.urgency) - urgencyOrder(b.urgency);
      if (u !== 0) return u;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  } catch {
    return [];
  }
}

export default async function PostesPage({ searchParams }: Props) {
  const jobs = await fetchJobs(searchParams);

  return (
    <PublicLayout>
      <SeoJsonLd
        id="jobs-list-schema"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            webPageJsonLd({
              name: 'Mandats et emplois en santé au Québec',
              description:
                'Mandats actifs en santé au Québec pour infirmières, infirmières auxiliaires, PAB, ASSS et autres professionnels.',
              url: '/postes',
            }),
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: 'Postes', url: '/postes' },
            ]),
            itemListJsonLd(
              jobs.slice(0, 30).map((job) => ({
                name: job.title,
                url: `/postes/${job.id}`,
                description: jobMetaDescription(job, 'fr'),
              })),
            ),
          ],
        }}
      />
      <section className="relative section pt-16 pb-8 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[450px] w-[450px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Postes</p>
          <h1 className="mt-2 text-display-lg text-fg">Mandats en santé</h1>
          <p className="mt-4 max-w-prose text-[16px] leading-relaxed text-fg-muted">
            Filtrez les postes par profession, pays, région, ville, établissement, département,
            quart ou type de mandat. Les postes affichés sont actifs et provenant d'Agence Sanitas.
          </p>
        </div>
      </section>

      <section className="pb-12">
        <div className="container-page space-y-6">
          <JobFilters />
          <PopularSearchLinks />
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page">
          {jobs.length === 0 ? (
            <div className="card p-10 text-center">
              <h2 className="text-[20px] font-semibold text-fg">Aucun poste ne correspond.</h2>
              <p className="mt-3 max-w-prose mx-auto text-fg-muted leading-relaxed">
                Essayez d'élargir vos critères, ou envoyez-nous votre profil. Nous vous contacterons
                lorsqu'un mandat compatible sera disponible.
              </p>
              <div className="mt-6 flex justify-center gap-3 flex-wrap">
                <a href="/postuler" className="btn-primary">Envoyer mon profil</a>
                <a href="/postes" className="btn-secondary">Réinitialiser</a>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13.5px] text-fg-muted mb-5">
                {jobs.length} poste{jobs.length > 1 ? 's' : ''} disponible{jobs.length > 1 ? 's' : ''}
              </p>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
