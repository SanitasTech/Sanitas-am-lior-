import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import PublicLayout from '@/components/PublicLayout';
import ProfileForm from './ProfileForm';
import { getCurrentUser, getOrCreateCandidate } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { computeMatchScore } from '@/lib/ats';
import { buildCandidateReadiness, readinessPercent } from '@/lib/ats-operating-model';
import { checkAtsSchemaHealth } from '@/lib/ats-schema-health';
import { COMPANY } from '@/lib/constants';
import { DecorativeBlob, SearchIcon, SendIcon, ChatIcon } from '@/components/Icons';
import type { Application, CandidateDocument, Job } from '@/types';

export const metadata: Metadata = {
  title: 'Mon espace',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

async function fetchDashboard(candidateId: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: applications }, { data: documents }, { data: jobs }] = await Promise.all([
    supabase
      .from('applications')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .eq('is_current', true),
    supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),
  ]);

  return {
    applications: (applications || []) as Application[],
    documents: (documents || []) as CandidateDocument[],
    jobs: (jobs || []) as Job[],
  };
}

export default async function MonProfilPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/connexion?redirect=/mon-profil');

  const candidate = await getOrCreateCandidate();
  if (!candidate) {
    const health = await checkAtsSchemaHealth();
    return (
      <PublicLayout>
        <section className="section pt-16 pb-24">
          <div className="container-page max-w-2xl">
            <div className="card p-6">
              <p className="eyebrow">Configuration requise</p>
              <h1 className="mt-2 text-display-sm text-fg">Le portail candidat attend le schema ATS V2.</h1>
              <p className="mt-3 text-fg-muted">
                Votre connexion fonctionne, mais la base Supabase n'a pas encore toutes les tables
                du nouveau dossier candidat. Executez le reset V2, puis revenez sur cette page.
              </p>
              {health.missingTables.length > 0 && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
                  Tables manquantes: {health.missingTables.join(', ')}
                </p>
              )}
              {health.otherErrors.length > 0 && (
                <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[14px] text-amber-900">
                  Verification Supabase: {health.otherErrors.join(' | ')}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/connexion" className="btn-secondary">
                  Revenir a la connexion
                </Link>
                <a href={`tel:${COMPANY.phone.replace(/\D/g, '')}`} className="btn-primary">
                  Appeler Sanitas
                </a>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const dashboard = await fetchDashboard(candidate.id);
  const completion = candidate.profile_completion_score ?? 0;
  const hasFirstName = !!candidate.first_name && candidate.first_name.trim().length > 0;
  const readiness = buildCandidateReadiness({ candidate, documents: dashboard.documents });
  const readinessScore = readinessPercent(readiness);
  const matchedJobs = dashboard.jobs
    .map((job) => ({ job, match: computeMatchScore(candidate, job, dashboard.documents) }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 4);
  const openApplications = dashboard.applications.filter(
    (application) => !['Placé', 'Refusé', 'Non disponible'].includes(application.status)
  );
  return (
    <PublicLayout>
      <section className="relative pt-12 pb-10 overflow-hidden bg-muted/30 border-b border-border">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <p className="eyebrow">Mon espace candidat</p>
          <h1 className="mt-2 text-display-md text-fg">
            {hasFirstName ? (
              <>
                Bonjour <span className="text-accent">{candidate.first_name}</span>.
              </>
            ) : (
              <>Bienvenue.</>
            )}
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-fg-muted max-w-prose">
            Votre dossier Sanitas centralise profil, documents et candidatures. Les prochaines
            étapes restent visibles pour postuler vite, sans répéter les mêmes informations.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-[420px_1fr_320px]">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold uppercase tracking-wider text-fg-subtle">
                  Profil complété
                </span>
                <span className="text-[14px] font-medium text-fg tabular-nums">{Math.max(completion, readinessScore)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500 ease-out-quart"
                  style={{ width: `${Math.max(completion, readinessScore)}%` }}
                />
              </div>
              <p className="mt-3 text-[13.5px] text-fg-muted">
                Plus le dossier est complet, plus l'équipe peut proposer des mandats adaptés.
              </p>
            </div>

            <div className="card p-5">
              <h2 className="text-[17px] font-semibold text-fg">État du dossier</h2>
              <div className="mt-4 space-y-2">
                {readiness.every((block) => block.ready) ? (
                  <p className="text-[14.5px] text-fg-muted">
                    Votre dossier est prêt. Vous pouvez postuler rapidement aux mandats compatibles.
                  </p>
                ) : (
                  readiness.filter((block) => !block.ready).map((block) => (
                    <div key={block.id} className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
                      <span className="mt-1 text-warning" aria-hidden>•</span>
                      <div>
                        <p className="text-[14.5px] font-medium text-fg">{block.label}</p>
                        <p className="text-[12.5px] text-fg-subtle">{block.missing.join(', ')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-[17px] font-semibold text-fg">Besoin d'aide?</h2>
              <p className="mt-2 text-[14.5px] text-fg-muted">
                Si vous préférez ne pas postuler en ligne, appelez Sanitas.
              </p>
              <a href={COMPANY.phoneHref} className="btn-primary mt-4 w-full">
                Appeler {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section pt-10 pb-6">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            <ActionCard
              icon={<SearchIcon className="h-6 w-6" />}
              title="Postes compatibles"
              description="Parcourez les mandats ouverts et confirmez votre intérêt en quelques étapes."
              cta="Parcourir"
              href="/postes"
              primary
            />
            <ActionCard
              icon={<SendIcon className="h-6 w-6" />}
              title="Candidature spontanée"
              description="Activez ou mettez à jour votre profil pour les mandats compatibles."
              cta="Activer mon profil"
              href="/postuler"
            />
            <ActionCard
              icon={<ChatIcon className="h-6 w-6" />}
              title="Suivi"
              description={`${dashboard.applications.length} candidature${dashboard.applications.length > 1 ? 's' : ''} dans votre espace.`}
              cta="Voir l'avancement"
              href="/mes-candidatures"
            />
          </div>
        </div>
      </section>

      <section className="section pt-6 pb-24">
        <div className="container-page">
          <div className="mb-8 grid gap-4 lg:grid-cols-2">
            <div className="card p-5">
              <h2 className="text-[18px] font-semibold text-fg">Candidatures en cours</h2>
              <div className="mt-4 space-y-3">
                {openApplications.length === 0 ? (
                  <p className="text-[14.5px] text-fg-muted">Aucune candidature active pour le moment.</p>
                ) : (
                  openApplications.map((application) => (
                    <Link key={application.id} href="/mes-candidatures" className="block rounded-lg border border-border p-3 hover:bg-muted/60">
                      <p className="font-medium text-fg">
                        {application.application_type === 'posting'
                          ? (application.posting_snapshot?.title as string) || 'Mandat précis'
                          : 'Candidature spontanée'}
                      </p>
                      <p className="mt-1 text-[13px] text-fg-muted">{application.status}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-[18px] font-semibold text-fg">Postes compatibles</h2>
              <div className="mt-4 space-y-3">
                {matchedJobs.length === 0 ? (
                  <p className="text-[14.5px] text-fg-muted">Aucun poste actif affiché pour le moment.</p>
                ) : (
                  matchedJobs.map(({ job, match }) => (
                    <Link key={job.id} href={`/postes/${job.id}`} className="block rounded-lg border border-border p-3 hover:bg-muted/60">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-fg">{job.title}</p>
                        <span className="tag">{match.score}%</span>
                      </div>
                      <p className="mt-1 text-[13px] text-fg-muted">{[job.city, job.region, job.shift].filter(Boolean).join(' · ')}</p>
                      <p className="mt-1 text-[12.5px] text-fg-subtle">
                        {match.reasons.slice(0, 2).map((reason) => `${reason.label}: ${reason.detail}`).join(' | ')}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-display-md text-fg">Mon profil</h2>
                <p className="mt-2 text-[15.5px] text-fg-muted max-w-prose">
                  Renseignez vos informations une fois. Elles serviront à toutes vos candidatures.
                </p>
              </div>
              <Link href="/mes-documents" className="btn-secondary btn-sm">
                {dashboard.documents.length} document{dashboard.documents.length > 1 ? 's' : ''}
              </Link>
            </div>

            <ProfileForm initial={candidate} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function ActionCard({
  icon,
  title,
  description,
  cta,
  href,
  primary,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  href: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="card-interactive p-6 flex flex-col gap-3 group"
    >
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="text-[18px] font-semibold text-fg">{title}</h3>
      <p className="text-[14.5px] text-fg-muted leading-relaxed flex-1">{description}</p>
      <span
        className={
          primary
            ? 'text-[14.5px] font-medium text-accent group-hover:underline'
            : 'text-[14.5px] font-medium text-fg group-hover:underline'
        }
      >
        {cta} →
      </span>
    </Link>
  );
}
