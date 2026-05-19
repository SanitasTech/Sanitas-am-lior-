-- =====================================================================
-- ATS V6 - Operating model oriente mandats combles
-- =====================================================================
-- A executer sur une base ATS V2/V5 existante.
-- Ne supprime aucune donnee.
-- =====================================================================

-- Aligner les anciens statuts vers le vocabulaire de production.
update public.applications
set status = 'À appeler'
where status in ('À rappeler', 'A rappeler');

update public.applications
set status = 'Qualifié'
where status in ('Contacté', 'Contacte');

update public.applications
set status = 'Inactif'
where status = 'Non disponible';

-- Index utile pour le cockpit Today et la file d actions.
create index if not exists idx_recruiter_tasks_type_status_due
  on public.recruiter_tasks(task_type, status, due_at);

-- Modeles recruteur standardises.
insert into public.message_templates (code, title, channel, subject, body, active)
values
  (
    'call_candidate',
    'Appel candidat',
    'phone',
    null,
    'Bonjour {{first_name}}, ici Sanitas. Je vous appelle pour confirmer vos disponibilites, vos regions et les mandats qui pourraient vous convenir cette semaine.',
    true
  ),
  (
    'missing_cv',
    'Relance CV',
    'email',
    'Votre CV est requis pour completer votre dossier Sanitas',
    'Bonjour {{first_name}}, il nous manque votre CV pour finaliser votre dossier et vous proposer aux bons mandats. Vous pouvez l ajouter dans votre espace candidat ou nous appeler au 450 973-9696.',
    true
  ),
  (
    'availability_check',
    'Validation disponibilite',
    'phone',
    null,
    'Valider: date de depart, quarts acceptes, regions, departements, contraintes, hebergement, transport et meilleur moment pour etre joint.',
    true
  ),
  (
    'client_presentation',
    'Presentation client',
    'email',
    'Candidat a presenter: {{first_name}} {{last_name}}',
    'Profil a presenter: titre admissible, experience, disponibilite, regions acceptees, documents recus et points a valider. Ajouter les forces pertinentes pour ce mandat.',
    true
  ),
  (
    'clean_refusal',
    'Refus propre',
    'email',
    'Suivi de votre dossier Sanitas',
    'Bonjour {{first_name}}, merci pour votre interet. Pour ce mandat precis, nous ne pouvons pas avancer votre dossier. Nous conservons votre profil pour les opportunites compatibles.',
    true
  )
on conflict (code) do update
set title = excluded.title,
    channel = excluded.channel,
    subject = excluded.subject,
    body = excluded.body,
    active = excluded.active;

notify pgrst, 'reload schema';
