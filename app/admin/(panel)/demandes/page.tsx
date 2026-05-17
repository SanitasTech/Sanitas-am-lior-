import type { Metadata } from 'next';
import StatusBadge from '@/components/StatusBadge';
import UrgencyBadge from '@/components/UrgencyBadge';
import EstablishmentActions from './EstablishmentActions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';
import type { EstablishmentRequest } from '@/types';

export const metadata: Metadata = { title: 'Demandes établissements', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

async function fetchRequests(): Promise<EstablishmentRequest[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('establishment_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  return (data || []) as EstablishmentRequest[];
}

export default async function DemandesPage() {
  const requests = await fetchRequests();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display-md text-fg">Demandes d'établissements</h1>
        <p className="mt-2 text-fg-muted">
          Suivez les besoins reçus. Changez le statut ou créez un poste à partir d'une demande.
        </p>
      </header>

      <section className="space-y-4">
        {requests.length === 0 ? (
          <div className="card p-10 text-center text-fg-muted">
            Aucune demande reçue pour le moment.
          </div>
        ) : (
          requests.map((r) => (
            <article key={r.id} className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[18px] font-semibold text-fg">
                    {r.establishment || 'Établissement non précisé'}
                  </h2>
                  <p className="text-[14px] text-fg-muted mt-1">
                    {[r.city, r.region].filter(Boolean).join(', ')}
                    {r.department && ` · ${r.department}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <UrgencyBadge urgency={r.urgency} />
                  <StatusBadge status={r.status} />
                </div>
              </div>

              <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4 text-[14px]">
                <Info label="Contact" value={r.contact_name} />
                <Info label="Fonction" value={r.function_title} />
                <Info label="Téléphone" value={r.phone} />
                <Info label="Courriel" value={r.email} />
                <Info label="Profession" value={r.profession_requested} />
                <Info label="Nb ressources" value={r.number_of_resources?.toString()} />
                <Info label="Quart" value={r.shift} />
                <Info label="Début" value={r.start_date} />
                <Info label="Durée" value={r.duration} />
                <Info label="Reçue le" value={formatDateTime(r.created_at)} />
              </dl>

              {r.details && (
                <div className="mt-5 rounded-xl bg-muted/40 p-4 text-[14px] text-fg whitespace-pre-wrap">
                  {r.details}
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-border">
                <EstablishmentActions request={r} />
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12.5px] text-fg-subtle">{label}</dt>
      <dd className="text-fg break-words">{value || '—'}</dd>
    </div>
  );
}
