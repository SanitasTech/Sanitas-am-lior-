-- =====================================================================
-- Agence Sanitas - Seed data (DEMO)
-- =====================================================================
-- À exécuter après schema.sql.
-- Les enregistrements is_demo=true peuvent être supprimés en production.
-- =====================================================================

-- ---------------------------------------------------------------------
-- job_titles : nomenclature de base CPNSSS (à enrichir manuellement)
-- Source de référence : https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification
-- ---------------------------------------------------------------------
insert into public.job_titles (code, title, category, requires_permit, source_url, active)
values
  ('1912', 'Infirmier(ère) clinicien(ne)', 'Soins infirmiers', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1911', 'Infirmier(ère)', 'Soins infirmiers', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('2471', 'Infirmier(ère) auxiliaire', 'Soins infirmiers', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('3480', 'Préposé(e) aux bénéficiaires', 'Soutien aux soins', false, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('3589', 'Auxiliaire aux services de santé et sociaux (ASSS)', 'Soutien aux soins', false, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('2244', 'Inhalothérapeute', 'Professionnels cliniques', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1545', 'Physiothérapeute', 'Réadaptation', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1543', 'Ergothérapeute', 'Réadaptation', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1550', 'Travailleur(se) social(e)', 'Psychosocial', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1546', 'Psychologue', 'Psychosocial', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('2255', 'Technologue en radiologie', 'Technologie médicale', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1208', 'Pharmacien(ne)', 'Professionnels cliniques', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1219', 'Nutritionniste', 'Professionnels cliniques', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('1206', 'Médecin', 'Médecine', true, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true),
  ('5314', 'Agent(e) administratif(ve)', 'Administration', false, 'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification', true)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Dossier candidat DEMO ATS
-- ---------------------------------------------------------------------
insert into public.candidates (
  id, first_name, last_name, phone, email, preferred_contact, best_contact_time,
  city_residence, region_residence, postal_code, consent_data, consent_data_at,
  mailing_list_opt_in, mailing_list_opt_in_at, profile_completion_score, last_active_at
) values (
  '00000000-0000-0000-0000-000000000101',
  'Infirmier(ère)',
  'Nadia',
  'Tremblay',
  '514 555-0199',
  'nadia.demo@example.com',
  'Téléphone',
  'Après-midi',
  'Montréal',
  'Montréal',
  'H2X 1Y4',
  true,
  now(),
  true,
  now(),
  88,
  now()
) on conflict (id) do nothing;

insert into public.candidate_profiles (
  candidate_id, profession, qualified_professions, years_experience, permit_status, permit_number,
  work_authorization, languages, mobility, preferred_mandate_types
) values (
  '00000000-0000-0000-0000-000000000101',
  'Infirmier(ère)',
  ARRAY['Infirmier(ère)', 'Infirmier(ère) clinicien(ne)']::text[],
  '6 à 10 ans',
  'Oui, valide',
  'OIIQ-DEMO',
  'Oui',
  ARRAY['Français', 'Anglais']::text[],
  'Régionale',
  ARRAY['Remplacement', 'Long terme']::text[]
) on conflict (candidate_id) do update
set profession = excluded.profession,
    qualified_professions = excluded.qualified_professions,
    years_experience = excluded.years_experience,
    permit_status = excluded.permit_status,
    permit_number = excluded.permit_number,
    work_authorization = excluded.work_authorization,
    languages = excluded.languages,
    mobility = excluded.mobility,
    preferred_mandate_types = excluded.preferred_mandate_types;

insert into public.candidate_availability (
  candidate_id, start_availability, preferred_hours, preferred_shifts,
  preferred_regions, preferred_departments, housing_required, transport_available
) values (
  '00000000-0000-0000-0000-000000000101',
  'Dans 2 semaines',
  'Temps plein',
  ARRAY['Jour', 'Soir']::text[],
  '[{"region":"Abitibi-Témiscamingue","all_region":true,"cities":[]},{"region":"Montréal","all_region":true,"cities":[]}]'::jsonb,
  ARRAY['Chirurgie', 'Médecine']::text[],
  'Selon la distance',
  'Oui, véhicule personnel'
) on conflict (candidate_id) do update
set start_availability = excluded.start_availability,
    preferred_hours = excluded.preferred_hours,
    preferred_shifts = excluded.preferred_shifts,
    preferred_regions = excluded.preferred_regions,
    preferred_departments = excluded.preferred_departments,
    housing_required = excluded.housing_required,
    transport_available = excluded.transport_available;

insert into public.candidate_preference_sets (
  candidate_id, label, priority, professions, regions, departments, shifts,
  mandate_types, start_date, mobility, constraints, active
) values (
  '00000000-0000-0000-0000-000000000101',
  'Abitibi ou Montreal - chirurgie',
  1,
  ARRAY['Infirmier(Ã¨re)', 'Infirmier(Ã¨re) clinicien(ne)']::text[],
  '[{"region":"Abitibi-TÃ©miscamingue","all_region":true,"cities":[]},{"region":"MontrÃ©al","all_region":true,"cities":[]}]'::jsonb,
  ARRAY['Chirurgie', 'MÃ©decine']::text[],
  ARRAY['Jour', 'Soir']::text[],
  ARRAY['Remplacement', 'Long terme']::text[],
  'Dans 2 semaines',
  'RÃ©gionale',
  'Hebergement a valider hors Montreal.',
  true
) on conflict do nothing;

insert into public.recruiter_tasks (
  candidate_id, task_type, title, details, due_at, status
) values (
  '00000000-0000-0000-0000-000000000101',
  'availability',
  'Valider disponibilité Nadia',
  'Confirmer disponibilité pour Abitibi et hébergement.',
  now() + interval '1 day',
  'open'
);

-- ---------------------------------------------------------------------
-- message_templates : modeles recruteur
-- ---------------------------------------------------------------------
insert into public.message_templates (code, title, channel, subject, body, active)
values
  ('missing_cv', 'Relance CV', 'email', 'Votre CV est requis pour compléter votre dossier Sanitas', 'Bonjour {{first_name}}, il nous manque votre CV pour finaliser votre dossier. Vous pouvez l’ajouter dans votre espace candidat ou nous appeler au 450 973-9696.', true),
  ('availability_check', 'Validation disponibilité', 'phone', null, 'Valider date de début, quarts acceptés, régions et contraintes avant présentation.', true),
  ('ready_to_present', 'Dossier prêt', 'email', 'Votre dossier Sanitas avance', 'Bonjour {{first_name}}, votre dossier est complet. Notre équipe vérifie les mandats compatibles et vous contacte rapidement.', true)
on conflict (code) do update
set title = excluded.title,
    channel = excluded.channel,
    subject = excluded.subject,
    body = excluded.body,
    active = excluded.active;

-- ---------------------------------------------------------------------
-- jobs : 3 postes DEMO actifs
-- ---------------------------------------------------------------------
delete from public.jobs
where is_demo = true;

insert into public.jobs (
  title, profession, region, city, establishment, department, shift, schedule,
  mandate_type, start_date, duration, salary, urgency, requirements, particularities,
  required_documents, extra_questions, status, is_demo
) values
(
  'Infirmier(ère) — Chirurgie',
  'Infirmier(ère)',
  'Abitibi-Témiscamingue',
  'Amos',
  'Hôpital d''Amos',
  'Chirurgie',
  'Jour',
  '7h à 15h30, semaine',
  'Remplacement long terme',
  '2026-06-01',
  '6 mois renouvelables',
  'Selon convention + primes',
  'urgent',
  'Permis d''exercice OIIQ valide. Expérience récente en chirurgie souhaitée. RCR à jour.',
  'Une fin de semaine sur deux. Hébergement disponible. Prime d''éloignement applicable.',
  ARRAY['CV', 'Permis d''exercice', 'RCR']::text[],
  '[
    {"id":"q1","label":"Avez-vous une expérience récente en chirurgie ?","type":"yes_no","required":true},
    {"id":"q2","label":"Êtes-vous disponible pour une orientation préalable ?","type":"yes_no","required":true},
    {"id":"q3","label":"Acceptez-vous une fin de semaine sur deux ?","type":"yes_no","required":true}
  ]'::jsonb,
  'active',
  true
),
(
  'Infirmier(ère) auxiliaire — CHSLD',
  'Infirmier(ère) auxiliaire',
  'Lanaudière',
  'Joliette',
  'CHSLD Joliette',
  'Centre d''hébergement et de soins de longue durée',
  'Soir',
  '15h à 23h, semaine',
  'Remplacement',
  '2026-05-25',
  '3 mois',
  'Selon convention',
  'high',
  'Permis OIIAQ valide. Expérience en gériatrie un atout.',
  'Équipe stable, milieu structuré.',
  ARRAY['CV', 'Permis d''exercice', 'RCR']::text[],
  '[
    {"id":"q1","label":"Avez-vous de l''expérience en CHSLD ?","type":"yes_no","required":false},
    {"id":"q2","label":"Êtes-vous à l''aise avec la médication ?","type":"yes_no","required":true}
  ]'::jsonb,
  'active',
  true
),
(
  'Préposé(e) aux bénéficiaires — Gériatrie',
  'Préposé(e) aux bénéficiaires',
  'Montréal',
  'Montréal',
  'CHSLD secteur Est',
  'Gériatrie',
  'Nuit',
  '23h à 7h30',
  'Temporaire',
  '2026-05-20',
  '1 mois',
  'Selon convention + prime de nuit',
  'normal',
  'PDSB à jour. RCR à jour.',
  'Quart de nuit. Stationnement gratuit. Accès en transport en commun.',
  ARRAY['CV', 'PDSB', 'RCR']::text[],
  '[
    {"id":"q1","label":"Êtes-vous à l''aise avec les transferts ?","type":"yes_no","required":true}
  ]'::jsonb,
  'active',
  true
)
on conflict do nothing;
