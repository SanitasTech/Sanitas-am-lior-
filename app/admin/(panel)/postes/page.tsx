import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';
import UrgencyBadge from '@/components/UrgencyBadge';
import type { Job } from '@/types';

export const metadata: Metadata = { title: 'Postes', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(sp: Props['searchParams'], k: string): string {
  const v = sp[k];
  if (Array.isArray(v)) return v[0] || '';
  return v || '';
}

async function fetchJobs(sp: Props['searchParams']) {
  const supabase = createSupabaseAdminClient();
  let q = supabase.from('jobs').select('*, applications:applications(count)').order('created_at', { ascending: false });
  const profession = param(sp, 'profession');
  const region = param(sp, 'region');
  const status = param(sp, 'status');
  if (profession) q = q.eq('profession', profession);
  if (region) q = q.eq('region', region);
  if (status) q = q.eq('status', status);
  const { data } = await q.limit(200);
  return (data || []) as unknown as Array<Job & { applications: { count: number }[] }>;
}

export default async function AdminJobsPage({ searchParams }: Props) {
  const jobs = await fetchJobs(searchParams);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-display-md text-fg">Postes</h1>
          <p className="mt-2 text-fg-muted">Creez, modifiez et desactivez les mandats publies.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/recherche-mandat" className="btn-secondary">Recherche mandat</Link>
          <Link href="/admin/postes/nouveau" className="btn-primary">Creer un poste</Link>
        </div>
      </header>

      <form className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="profession">Profession</label>
            <input id="profession" name="profession" defaultValue={param(searchParams, 'profession')} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="region">Region</label>
            <input id="region" name="region" defaultValue={param(searchParams, 'region')} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="status">Statut</label>
            <select id="status" name="status" defaultValue={param(searchParams, 'status')} className="input">
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="draft">Brouillon</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary">Filtrer</button>
            <Link href="/admin/postes" className="btn-secondary">Reinitialiser</Link>
          </div>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-muted text-fg-subtle">
              <tr>
                <Th>Poste</Th>
                <Th>Profession</Th>
                <Th>Lieu</Th>
                <Th>Departement</Th>
                <Th>Quart</Th>
                <Th>Urgence</Th>
                <Th>Statut</Th>
                <Th>Debut</Th>
                <Th>Soumissions</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.length === 0 && (
                <tr><td colSpan={10} className="p-10 text-center text-fg-muted">Aucun poste.</td></tr>
              )}
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-fg">{job.title}</p>
                    <p className="text-fg-muted">{job.establishment || '-'}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-fg">{job.profession}</td>
                  <td className="px-4 py-3 align-top text-fg">
                    {[job.city, job.region].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-3 align-top text-fg-muted">{job.department || '-'}</td>
                  <td className="px-4 py-3 align-top text-fg-muted">{job.shift || '-'}</td>
                  <td className="px-4 py-3 align-top"><UrgencyBadge urgency={job.urgency} /></td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                      job.status === 'active'
                        ? 'bg-success-soft text-success'
                        : job.status === 'draft'
                        ? 'bg-warning-soft text-warning'
                        : 'bg-muted text-fg-muted'
                    }`}>
                      {job.status === 'active' ? 'Actif' : job.status === 'draft' ? 'Brouillon' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-fg-muted">{formatDate(job.start_date)}</td>
                  <td className="px-4 py-3 align-top text-fg tabular-nums">
                    {Array.isArray(job.applications) ? job.applications[0]?.count || 0 : 0}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/recherche-mandat?job_id=${job.id}`} className="text-accent hover:underline">
                        Chercher
                      </Link>
                      <Link href={`/admin/postes/${job.id}`} className="text-accent hover:underline">
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-[11.5px] font-medium uppercase tracking-wider">{children}</th>;
}
