import Link from 'next/link';
import type { Metadata } from 'next';
import KpiCard from '@/components/KpiCard';
import StatusBadge from '@/components/StatusBadge';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hydrateCandidate, missingRequiredDocuments } from '@/lib/ats';
import { formatDateTime } from '@/lib/utils';
import type { Application, Candidate, CandidateDocument } from '@/types';

export const metadata: Metadata = { title: 'Candidats', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(sp: Props['searchParams'], key: string) {
  const value = sp[key];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

interface CandidateRow extends Candidate {
  applications?: Application[];
  documents?: CandidateDocument[];
}

async function fetchCandidates(sp: Props['searchParams']) {
  const supabase = createSupabaseAdminClient();
  const search = param(sp, 'q').trim().toLowerCase();
  const status = param(sp, 'status');
  const profession = param(sp, 'profession').trim();

  const { data } = await supabase
    .from('candidates')
    .select('*, profile:candidate_profiles(*), availability:candidate_availability(*), applications(*), documents:candidate_documents(*)')
    .order('last_active_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(300);

  let rows = (data || []).map((row) => {
    const record = row as Record<string, unknown>;
    const candidate = hydrateCandidate(
      record,
      record.profile as Record<string, unknown>,
      record.availability as Record<string, unknown>
    ) as CandidateRow;
    candidate.applications = (record.applications as Application[] | undefined) || [];
    candidate.documents = (record.documents as CandidateDocument[] | undefined) || [];
    return candidate;
  });

  if (status) rows = rows.filter((candidate) => candidate.status === status);
  if (profession) {
    rows = rows.filter((candidate) =>
      candidate.profession === profession ||
      (candidate.qualified_professions || []).some((item) =>
        item.toLowerCase().includes(profession.toLowerCase())
      )
    );
  }
  if (search) {
    rows = rows.filter((candidate) =>
      [
        candidate.first_name,
        candidate.last_name,
        candidate.email,
        candidate.phone,
        candidate.profession,
        ...(candidate.qualified_professions || []),
        candidate.city_residence,
        candidate.region_residence,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search)
    );
  }

  const ready = rows.filter((candidate) => missingRequiredDocuments(candidate, candidate.documents || []).length === 0).length;
  const incomplete = rows.filter((candidate) => (candidate.profile_completion_score || 0) < 70).length;
  const activeApplications = rows.reduce((sum, candidate) => sum + (candidate.applications?.length || 0), 0);

  return { rows, kpi: { total: rows.length, ready, incomplete, activeApplications } };
}

export default async function AdminCandidatesPage({ searchParams }: Props) {
  const { rows, kpi } = await fetchCandidates(searchParams);
  const currentSearch = param(searchParams, 'q');

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Dossiers candidats</p>
          <h1 className="mt-1 text-display-md text-fg">Candidats</h1>
          <p className="mt-2 text-fg-muted">
            Une fiche par personne, avec candidatures, documents, tâches et compatibilités.
          </p>
        </div>
        <Link href="/admin/applications" className="btn-primary">Voir le pipeline</Link>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Dossiers" value={kpi.total} />
        <KpiCard label="Prêts" value={kpi.ready} />
        <KpiCard label="Incomplets" value={kpi.incomplete} />
        <KpiCard label="Candidatures" value={kpi.activeApplications} />
      </section>

      <form className="card p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
          <div>
            <label className="label" htmlFor="q">Recherche</label>
            <input
              id="q"
              name="q"
              defaultValue={currentSearch}
              placeholder="Nom, courriel, téléphone, profession, ville"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="profession">Profession</label>
            <input id="profession" name="profession" defaultValue={param(searchParams, 'profession')} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="status">Statut</label>
            <select id="status" name="status" defaultValue={param(searchParams, 'status')} className="input">
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="blocked">Bloqué</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary">Filtrer</button>
            <Link href="/admin/candidats" className="btn-secondary">Reset</Link>
          </div>
        </div>
      </form>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-muted text-fg-subtle">
              <tr>
                <Th>Candidat</Th>
                <Th>Profil</Th>
                <Th>Disponibilité</Th>
                <Th>Documents</Th>
                <Th>Candidatures</Th>
                <Th>Dernière activité</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-fg-muted">
                    Aucun dossier ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                rows.map((candidate) => {
                  const docs = candidate.documents || [];
                  const missing = missingRequiredDocuments(candidate, docs);
                  const latestApplication = [...(candidate.applications || [])].sort((a, b) =>
                    b.created_at.localeCompare(a.created_at)
                  )[0];
                  return (
                    <tr key={candidate.id} className="hover:bg-muted/50">
                      <Td>
                        <p className="font-medium text-fg">{candidate.first_name} {candidate.last_name}</p>
                        <p className="text-fg-muted">{candidate.phone || candidate.email || 'Contact à compléter'}</p>
                        <p className="text-fg-subtle">{[candidate.city_residence, candidate.region_residence].filter(Boolean).join(', ') || 'Résidence à compléter'}</p>
                      </Td>
                      <Td>
                        <p className="text-fg">{candidate.profession || 'Métier principal à compléter'}</p>
                        {(candidate.qualified_professions || []).length > 0 && (
                          <p className="text-[12px] text-fg-subtle">
                            {(candidate.qualified_professions || []).join(', ')}
                          </p>
                        )}
                        <p className="text-fg-muted">{candidate.years_experience || 'Expérience à compléter'}</p>
                        <p className="mt-1 text-[12px] text-fg-subtle">{candidate.profile_completion_score || 0}% complété</p>
                      </Td>
                      <Td>
                        <p className="text-fg">{candidate.start_availability || 'À confirmer'}</p>
                        <p className="text-fg-muted">{(candidate.preferred_shifts || []).join(', ') || 'Quarts à confirmer'}</p>
                      </Td>
                      <Td>
                        <span className={missing.length === 0 ? 'tag bg-success-soft text-success' : 'tag bg-warning-soft text-warning'}>
                          {missing.length === 0 ? 'Dossier doc prêt' : `${missing.length} manquant(s)`}
                        </span>
                        {missing.length > 0 && <p className="mt-1 text-[12px] text-fg-subtle">{missing.join(', ')}</p>}
                      </Td>
                      <Td>
                        <p className="tabular-nums text-fg">{candidate.applications?.length || 0}</p>
                        {latestApplication && <StatusBadge status={latestApplication.status} />}
                      </Td>
                      <Td className="text-fg-muted whitespace-nowrap">
                        {formatDateTime(candidate.last_active_at || candidate.updated_at || candidate.created_at)}
                      </Td>
                      <Td className="text-right">
                        <Link href={`/admin/candidats/${candidate.id}`} className="text-accent hover:underline">
                          Ouvrir
                        </Link>
                      </Td>
                    </tr>
                  );
                })
              )}
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

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className || ''}`}>{children}</td>;
}
