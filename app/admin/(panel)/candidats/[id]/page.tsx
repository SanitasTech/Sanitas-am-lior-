import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TypeBadge from '@/components/TypeBadge';
import StatusBadge from '@/components/StatusBadge';
import CompatibilityChecklist from '@/components/CompatibilityChecklist';
import DangerZone from '@/components/admin/DangerZone';
import TaskQuickCreate from '@/components/admin/TaskQuickCreate';
import TaskStatusButton from '@/components/admin/TaskStatusButton';
import StatusUpdater from './StatusUpdater';
import NoteForm from './NoteForm';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hydrateCandidate, missingRequiredDocuments, requiredDocumentsForProfessions } from '@/lib/ats';
import { formatDateTime } from '@/lib/utils';
import type {
  ActivityEvent,
  Application,
  Candidate,
  CandidateDocument,
  InternalNote,
  MatchScore,
  RecruiterTask,
} from '@/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Fiche candidat', robots: { index: false, follow: false } };

interface CandidateDetailData {
  candidate: Candidate;
  applications: Application[];
  documents: CandidateDocument[];
  notes: InternalNote[];
  tasks: RecruiterTask[];
  events: ActivityEvent[];
  matches: Array<MatchScore & { job?: { title?: string; establishment?: string; region?: string; shift?: string } }>;
}

async function resolveCandidateId(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data: candidate } = await supabase.from('candidates').select('id').eq('id', id).maybeSingle();
  if (candidate?.id) return candidate.id as string;
  const { data: application } = await supabase
    .from('applications')
    .select('candidate_id')
    .eq('id', id)
    .maybeSingle();
  return (application?.candidate_id as string | undefined) || null;
}

async function fetchCandidate(id: string): Promise<CandidateDetailData | null> {
  const candidateId = await resolveCandidateId(id);
  if (!candidateId) return null;
  const supabase = createSupabaseAdminClient();
  const [
    { data: candidateRow },
    { data: applications },
    { data: documents },
    { data: notes },
    { data: tasks },
    { data: events },
    { data: matches },
  ] = await Promise.all([
    supabase
      .from('candidates')
      .select('*, profile:candidate_profiles(*), availability:candidate_availability(*)')
      .eq('id', candidateId)
      .maybeSingle(),
    supabase
      .from('applications')
      .select('*, job:jobs(*), application_documents(*)')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false }),
    supabase
      .from('candidate_documents')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('is_current', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('internal_notes')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false }),
    supabase
      .from('recruiter_tasks')
      .select('*, job:jobs(*), application:applications(*)')
      .eq('candidate_id', candidateId)
      .order('status', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('activity_events')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(80),
    supabase
      .from('match_scores')
      .select('*, job:jobs(title, establishment, region, shift)')
      .eq('candidate_id', candidateId)
      .order('score', { ascending: false })
      .limit(10),
  ]);

  const row = candidateRow as Record<string, unknown> | null;
  const candidate = hydrateCandidate(
    row,
    row?.profile as Record<string, unknown>,
    row?.availability as Record<string, unknown>
  );
  if (!candidate) return null;

  return {
    candidate,
    applications: (applications || []) as unknown as Application[],
    documents: (documents || []) as CandidateDocument[],
    notes: (notes || []) as InternalNote[],
    tasks: (tasks || []) as unknown as RecruiterTask[],
    events: (events || []) as ActivityEvent[],
    matches: (matches || []) as CandidateDetailData['matches'],
  };
}

export default async function CandidateDetail({ params }: { params: { id: string } }) {
  const data = await fetchCandidate(params.id);
  if (!data) notFound();
  const { candidate, applications, documents, notes, tasks, events, matches } = data;
  const currentDocs = documents.filter((doc) => doc.is_current !== false);
  const missingDocs = missingRequiredDocuments(candidate, currentDocs);
  const requiredDocs = requiredDocumentsForProfessions(
    candidate.qualified_professions && candidate.qualified_professions.length > 0
      ? candidate.qualified_professions
      : [candidate.profession]
  );
  const openTasks = tasks.filter((task) => task.status === 'open');

  const checklistItems = [
    { label: 'Contact joignable', state: candidate.phone || candidate.email ? 'ok' : 'warn' },
    { label: 'Métiers admissibles', state: (candidate.qualified_professions || []).length > 0 || candidate.profession ? 'ok' : 'warn' },
    { label: 'Disponibilité indiquée', state: candidate.start_availability ? 'ok' : 'warn' },
    { label: 'Territoire défini', state: (candidate.preferred_regions || []).length > 0 ? 'ok' : 'warn' },
    { label: 'CV reçu', state: missingDocs.includes('CV') ? 'warn' : 'ok' },
    { label: `Profil ${candidate.profile_completion_score || 0}%`, state: (candidate.profile_completion_score || 0) >= 70 ? 'ok' : 'warn' },
  ] as Array<{ label: string; state: 'ok' | 'warn' | 'na' }>;

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <Link href="/admin/candidats" className="text-[13.5px] text-fg-muted hover:text-fg">
          ← Retour aux candidats
        </Link>
        <span className={missingDocs.length === 0 ? 'tag bg-success-soft text-success' : 'tag bg-warning-soft text-warning'}>
          {missingDocs.length === 0 ? 'Dossier prêt' : `${missingDocs.length} document(s) à recevoir`}
        </span>
      </div>

      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Fiche candidat</p>
            <h1 className="mt-1 text-display-md text-fg">{candidate.first_name} {candidate.last_name}</h1>
            <p className="mt-2 text-fg-muted">
              {candidate.profession || 'Profession à compléter'} · {candidate.city_residence || 'Ville à compléter'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidate.phone && <a href={`tel:${candidate.phone}`} className="btn-primary btn-sm">Appeler</a>}
            {candidate.email && <a href={`mailto:${candidate.email}`} className="btn-secondary btn-sm">Courriel</a>}
            <Link href="/admin/applications" className="btn-secondary btn-sm">Pipeline</Link>
          </div>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-4 text-[14px]">
          <Info label="Téléphone" value={candidate.phone} />
          <Info label="Courriel" value={candidate.email} />
          <Info label="Contact préféré" value={candidate.preferred_contact} />
          <Info label="Moment idéal" value={candidate.best_contact_time} />
          <Info label="Région" value={candidate.region_residence} />
          <Info label="Autorisation" value={candidate.work_authorization} />
          <Info label="Langues" value={(candidate.languages || []).join(', ')} />
          <Info label="Dernière activité" value={formatDateTime(candidate.last_active_at || candidate.updated_at)} />
        </dl>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          <section className="card p-6">
            <h2 className="text-[18px] font-semibold text-fg">Candidatures</h2>
            <div className="mt-4 space-y-3">
              {applications.length === 0 ? (
                <p className="text-fg-muted">Aucune candidature encore liée à ce dossier.</p>
              ) : (
                applications.map((application) => (
                  <article key={application.id} className="rounded-lg border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <TypeBadge type={application.application_type} />
                          <StatusBadge status={application.status} />
                        </div>
                        <h3 className="mt-2 font-semibold text-fg">
                          {application.application_type === 'posting'
                            ? (application.posting_snapshot?.title as string) || 'Mandat précis'
                            : 'Candidature spontanée'}
                        </h3>
                        <p className="mt-1 text-[13px] text-fg-muted">
                          {formatDateTime(application.created_at)}
                        </p>
                      </div>
                      <div className="min-w-[260px]">
                        <StatusUpdater applicationId={application.id} currentStatus={application.status} />
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold text-fg">Documents</h2>
                <p className="mt-1 text-[13.5px] text-fg-muted">Documents durables du candidat, réutilisés sur les candidatures.</p>
              </div>
              <span className="tag">{currentDocs.length} courant(s)</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead className="text-fg-subtle text-[12px] uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-2">Document</th>
                    <th className="text-left py-2">Statut</th>
                    <th className="text-left py-2">Fichier</th>
                    <th className="text-right py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requiredDocs.map((type) => {
                    const doc = currentDocs.find((item) => item.document_type === type);
                    return (
                      <tr key={type}>
                        <td className="py-3 text-fg">{type}</td>
                        <td className="py-3">
                          <span className={doc?.status === 'Reçu' ? 'tag bg-success-soft text-success' : 'tag bg-warning-soft text-warning'}>
                            {doc?.status || 'À recevoir'}
                          </span>
                        </td>
                        <td className="py-3 text-fg-muted">{doc?.file_name || '—'}</td>
                        <td className="py-3 text-right">
                          {doc?.file_path ? (
                            <div className="inline-flex gap-3">
                              <a href={`/api/admin/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Voir</a>
                              <a href={`/api/admin/documents/${doc.id}?mode=download`} className="text-accent hover:underline">Télécharger</a>
                            </div>
                          ) : (
                            <span className="text-[13px] text-fg-subtle">À demander</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-[18px] font-semibold text-fg">Profil opérationnel</h2>
            <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2 text-[14px]">
              <Info label="Métier principal" value={candidate.profession} />
              <Info label="Métiers admissibles" value={(candidate.qualified_professions || []).join(', ')} />
              <Info label="Expérience" value={candidate.years_experience} />
              <Info label="Permis" value={candidate.permit_status} />
              <Info label="Numéro de permis" value={candidate.permit_number} />
              <Info label="Départ" value={candidate.start_availability} />
              <Info label="Heures" value={candidate.preferred_hours} />
              <Info label="Quarts" value={(candidate.preferred_shifts || []).join(', ')} />
              <Info label="Mobilité" value={candidate.mobility} />
              <Info label="Régions" value={(candidate.preferred_regions || []).map((r) => r.region).join(', ')} />
              <Info label="Départements" value={(candidate.preferred_departments || []).join(', ')} />
              <Info label="Établissements souhaités" value={candidate.preferred_establishments} />
              <Info label="Établissements à éviter" value={candidate.avoided_establishments} />
              <Info label="Hébergement" value={candidate.housing_required} />
              <Info label="Transport" value={candidate.transport_available} />
              <Info label="Contraintes" value={candidate.constraints} />
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-[18px] font-semibold text-fg">Notes internes</h2>
            <div className="mt-4">
              <NoteForm candidateId={candidate.id} />
            </div>
            <div className="mt-6 space-y-3">
              {notes.length === 0 ? (
                <p className="text-[14px] text-fg-muted">Aucune note pour le moment.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-[12.5px] text-fg-subtle">{formatDateTime(note.created_at)}</p>
                    <p className="mt-1 text-[14px] text-fg whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <DangerZone
            title="Suppression"
            description="Supprime le dossier candidat et ses candidatures. À utiliser seulement pour les tests ou demandes de suppression."
            redirectAfterHardDelete="/admin/candidats"
            actions={[
              {
                label: 'candidate',
                buttonLabel: 'Supprimer le candidat',
                confirmText: `Supprimer définitivement ${candidate.first_name} ${candidate.last_name} ?`,
                endpoint: `/api/admin/candidates?id=${candidate.id}`,
                variant: 'hard',
              },
            ]}
          />
        </div>

        <aside className="xl:sticky xl:top-20 xl:self-start space-y-5">
          <section className="card p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
              Santé du dossier
            </p>
            <div className="mt-4">
              <CompatibilityChecklist items={checklistItems} />
            </div>
          </section>

          <section className="card p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
              Actions rapides
            </p>
            <div className="mt-4">
              <TaskQuickCreate candidateId={candidate.id} compact />
            </div>
          </section>

          <section className="card p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
              Tâches
            </p>
            <div className="mt-4 space-y-3">
              {openTasks.length === 0 ? (
                <p className="text-[13.5px] text-fg-muted">Aucune tâche ouverte.</p>
              ) : (
                openTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-border bg-surface p-3">
                    <p className="text-[14px] font-medium text-fg">{task.title}</p>
                    {task.due_at && <p className="mt-1 text-[12px] text-fg-subtle">{formatDateTime(task.due_at)}</p>}
                    <div className="mt-2"><TaskStatusButton id={task.id} /></div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
              Compatibilités
            </p>
            <div className="mt-4 space-y-3">
              {matches.length === 0 ? (
                <p className="text-[13.5px] text-fg-muted">Aucun score calculé encore.</p>
              ) : (
                matches.map((match) => (
                  <div key={match.id} className="rounded-lg border border-border bg-surface p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-medium text-fg">{match.job?.title || 'Mandat'}</p>
                      <span className="tabular-nums text-[14px] font-semibold text-fg">{match.score}%</span>
                    </div>
                    <p className="mt-1 text-[12.5px] text-fg-muted">
                      {[match.job?.establishment, match.job?.region, match.job?.shift].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card p-5">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle">
              Historique
            </p>
            <ul className="mt-4 space-y-3">
              {events.length === 0 ? (
                <li className="text-[13.5px] text-fg-muted">Aucun événement.</li>
              ) : (
                events.map((event) => (
                  <li key={event.id} className="text-[13.5px]">
                    <p className="text-fg">{translateEvent(event.event_type)}</p>
                    <p className="text-fg-subtle text-[12.5px]">{formatDateTime(event.created_at)}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </aside>
      </div>
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

function translateEvent(type: string) {
  switch (type) {
    case 'application_created':
      return 'Candidature créée';
    case 'application_updated':
      return 'Candidature mise à jour';
    case 'status_changed':
      return 'Statut modifié';
    case 'note_added':
      return 'Note ajoutée';
    case 'task_created':
      return 'Tâche créée';
    case 'task_status_changed':
      return 'Tâche modifiée';
    default:
      return type;
  }
}
