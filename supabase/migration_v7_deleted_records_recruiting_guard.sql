-- =====================================================================
-- ATS V7 - Garde-fou global contre les dossiers supprimes
-- =====================================================================
-- A executer apres V6.
-- Ne supprime aucun candidat. Retire seulement les candidats orphelins
-- du vivier actif et purge les scores qui ne doivent plus alimenter
-- les mandats presentables.
-- =====================================================================

-- Un candidat sans candidature active ne doit plus alimenter le matching.
update public.candidates c
set status = 'inactive'
where status = 'active'
  and not exists (
    select 1
    from public.applications a
    where a.candidate_id = c.id
      and coalesce(a.status, 'Nouveau') not in (
        'Placé', 'Place',
        'Refusé', 'Refuse',
        'Inactif',
        'Non disponible'
      )
  );

-- Purger les scores des candidats qui ne sont plus actifs.
delete from public.match_scores ms
using public.candidates c
where ms.candidate_id = c.id
  and c.status <> 'active';

-- Purger les scores de candidats qui n'ont plus aucune candidature active.
delete from public.match_scores ms
where not exists (
  select 1
  from public.applications a
  where a.candidate_id = ms.candidate_id
    and coalesce(a.status, 'Nouveau') not in (
      'Placé', 'Place',
      'Refusé', 'Refuse',
      'Inactif',
      'Non disponible'
    )
);

-- Purger les scores des candidatures supprimees explicitement pour un mandat.
delete from public.match_scores ms
using public.activity_events e
where e.event_type = 'application_deleted'
  and e.candidate_id = ms.candidate_id
  and e.job_id = ms.job_id;

notify pgrst, 'reload schema';
