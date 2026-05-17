import Link from 'next/link';
import type { Metadata } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
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
          <p className="mt-2 text-fg-muted">Créez, modifiez et désactivez les mandats publiés.</p>
        </div>
        <Link href="/admin/postes/nouveau" className="btn-primary">Créer un poste</Link>
      </header>

      <form className="card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="profession">Profession</label>
            <input id="profession" name="profession" defaultValue={param(searchParams, 'profession')} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="region">Région</label>
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
            <Link href="/admin/postes" className="btn-secondary">Réinitialiser</Link>
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
                <Th>Département</Th>
                <Th>Quart</Th>
                <Th>Urgence</Th>
                <Th>Statut</Th>
                <Th>Début</Th>
                <Th>Soumissions</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.length === 0 && (
                <tr><td colSpan={10} className="p-10 text-center text-fg-muted">Aucun poste.</td></tr>
              )}
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-fg">{j.title}</p>
                    <p className="text-fg-muted">{j.establishment || '—'}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-fg">{j.profession}</td>
                  <td className="px-4 py-3 align-top text-fg">
                    {[j.city, j.region].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-3 align-top text-fg-muted">{j.department || '—'}</td>
                  <td className="px-4 py-3 align-top text-fg-muted">{j.shift || '—'}</td>
                  <td className="px-4 py-3 align-top"><UrgencyBadge urgency={j.urgency} /></td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${
                      j.status === 'active'
                        ? 'bg-success-soft text-success'
                        : j.status === 'draft'
                        ? 'bg-warning-soft text-warning'
                        : 'bg-muted text-fg-muted'
                    }`}>
                      {j.status === 'active' ? 'Actif' : j.status === 'draft' ? 'Brouillon' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-fg-muted">{formatDate(j.start_date)}</td>
                  <td className="px-4 py-3 align-top text-fg tabular-nums">
                    {Array.isArray(j.applications) ? j.applications[0]?.count || 0 : 0}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link href={`/admin/postes/${j.id}`} className="text-accent hover:underline">
                      Modifier
                    </Link>
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
  return <th className="text-left font-medium uppercase tracking-wider text-[11.5px] px-4 py-3">{children}</th>;
}
