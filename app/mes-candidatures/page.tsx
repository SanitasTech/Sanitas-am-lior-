import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import StatusBadge from '@/components/StatusBadge';
import TypeBadge from '@/components/TypeBadge';
import { DecorativeBlob } from '@/components/Icons';
import { getCurrentCandidate } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDateTime } from '@/lib/utils';
import type { Submission } from '@/types';

export const metadata: Metadata = {
  title: 'Mes candidatures',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function MesCandidaturesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/mes-candidatures');
  const candidate = await getCurrentCandidate();

  let submissions: Submission[] = [];
  if (candidate) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('candidate_id', candidate.id)
      .order('created_at', { ascending: false });
    submissions = (data || []) as Submission[];
  }

  return (
    <PublicLayout>
      <section className="relative section pt-16 pb-24 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-4xl relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Espace candidat
          </p>
          <h1 className="mt-2 text-display-md text-fg">Mes candidatures</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted max-w-prose">
            Historique de toutes vos candidatures, avec leur statut actuel suivi par l'équipe
            Sanitas.
          </p>

          <div className="mt-10 space-y-4">
            {submissions.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="text-fg-muted">Vous n'avez pas encore de candidature.</p>
                <Link href="/postes" className="btn-primary mt-5 inline-flex">
                  Voir les postes ouverts
                </Link>
              </div>
            ) : (
              submissions.map((s) => {
                const type = s.application_type || s.submission_type || 'spontaneous';
                const isPosting = type === 'posting';
                const title = isPosting
                  ? (s.posting_snapshot?.title as string) || 'Mandat'
                  : 'Candidature spontanée';
                const meta = isPosting
                  ? [
                      s.posting_snapshot?.establishment,
                      s.posting_snapshot?.city,
                      s.posting_snapshot?.department,
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : 'Profil envoyé pour mandats compatibles';
                return (
                  <article key={s.id} className="card p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <TypeBadge type={type} />
                        </div>
                        <h2 className="text-[18px] font-semibold text-fg">{title}</h2>
                        <p className="mt-1 text-[14.5px] text-fg-muted">{meta}</p>
                        <p className="mt-2 text-[13px] text-fg-subtle">
                          Soumise le {formatDateTime(s.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <p className="mt-10 text-[13.5px] text-fg-muted">
            Une question sur l'une de vos candidatures ?{' '}
            <a href="mailto:rh@agencesanitas.com" className="underline">
              Écrivez-nous
            </a>{' '}
            ou appelez le 450 973-9696.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
