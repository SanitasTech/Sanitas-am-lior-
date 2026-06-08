import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import JobFilters from '@/components/JobFilters';
import JobCard from '@/components/JobCard';
import PopularSearchLinks from '@/components/PopularSearchLinks';
import { DecorativeBlob } from '@/components/Icons';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  itemListJsonLd,
  jobMetaDescription,
  publicPageMetadata,
  serviceJsonLd,
} from '@/lib/seo';
import type { Job } from '@/types';
import { urgencyOrder } from '@/lib/utils';

export const metadata = publicPageMetadata({
  title: 'Mandats infirmiers au Québec | Emplois en santé Sanitas',
  description:
    'Consultez les mandats infirmiers et emplois en santé actifs avec Agence Sanitas. Filtrez par profession, région, département, quart, pays et type de mandat.',
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
            collectionPageJsonLd({
              name: 'Mandats infirmiers et emplois en santé',
              description:
                'Mandats actifs au Québec et à l’international pour infirmières, infirmières cliniciennes et autres professionnels de la santé.',
              url: '/postes',
            }),
            serviceJsonLd({
              name: 'Recherche de mandats infirmiers et emplois en santé',
              description:
                'Service de mise en relation entre professionnels de la santé et mandats actifs au Québec ou à l’international.',
              url: '/postes',
              serviceType: 'Healthcare job matching',
              audience: 'candidates',
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
          <h1 className="mt-2 text-display-lg text-fg">Mandats infirmiers et emplois en santé</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-fg-muted">
            Filtrez les postes par profession, pays, région, ville, établissement, département,
            quart ou type de mandat. Pour les infirmières du Québec, les recherches clés sont
            maintenant regroupées par régions éloignées, département et type de mandat.
          </p>
        </div>
      </section>

      <section className="pb-10">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            <PriorityLink
              href="/emplois-infirmieres-quebec"
              eyebrow="Infirmiers au Québec"
              title="Emplois infirmières, autorisées et cliniciennes"
              body="Page cible pour les mandats infirmiers au Québec, avec régions, départements et quarts."
            />
            <PriorityLink
              href="/mandats-infirmiers-region-eloignee"
              eyebrow="Régions éloignées"
              title="Baie-James, Grand Nord, Gaspésie et Côte-Nord"
              body="Accès rapide aux mandats infirmiers en régions éloignées et aux besoins prioritaires."
            />
            <PriorityLink
              href="/mandats-infirmiers-urgence-quebec"
              eyebrow="Départements"
              title="Urgence, soins intensifs, bloc opératoire"
              body="Recherche par département pour les profils infirmiers spécialisés."
            />
          </div>
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

function PriorityLink({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-card">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-[18px] font-semibold leading-snug text-fg group-hover:text-accent">
        {title}
      </h2>
      <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">{body}</p>
    </Link>
  );
}
