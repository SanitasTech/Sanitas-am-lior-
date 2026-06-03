-- =====================================================================
-- Agence Sanitas - Schema Supabase ATS V2
-- =====================================================================
-- Reset des tables metier. Les users Supabase Auth et profiles_admin sont
-- conserves quand ils existent pour ne pas casser l'acces recruteur.
-- A executer dans Supabase SQL Editor.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Reset metier
-- ---------------------------------------------------------------------
drop table if exists public.application_documents cascade;
drop table if exists public.match_scores cascade;
drop table if exists public.recruiter_tasks cascade;
drop table if exists public.message_templates cascade;
drop table if exists public.activity_events cascade;
drop table if exists public.internal_notes cascade;
drop table if exists public.applications cascade;
drop table if exists public.candidate_documents cascade;
drop table if exists public.candidate_preference_sets cascade;
drop table if exists public.candidate_availability cascade;
drop table if exists public.candidate_profiles cascade;
drop table if exists public.submission_documents cascade;
drop table if exists public.submission_events cascade;
drop table if exists public.documents cascade;
drop table if exists public.submissions cascade;
drop table if exists public.establishment_requests cascade;
drop table if exists public.contact_messages cascade;
drop table if exists public.jobs cascade;
drop table if exists public.job_titles cascade;
drop table if exists public.candidates cascade;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles_admin (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'recruiter',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles_admin where id = uid);
$$;

-- ---------------------------------------------------------------------
-- Reference jobs
-- ---------------------------------------------------------------------
create table public.job_titles (
  id uuid primary key default gen_random_uuid(),
  code text,
  title text not null,
  category text,
  requires_permit boolean not null default false,
  source_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  profession text not null,
  job_title_id uuid references public.job_titles(id) on delete set null,
  country text not null default 'Canada',
  eligible_countries text[] not null default '{}',
  region text not null,
  city text,
  establishment text,
  department text,
  shift text,
  schedule text,
  mandate_type text,
  start_date text,
  duration text,
  salary text,
  urgency text not null default 'normal' check (urgency in ('normal', 'high', 'urgent')),
  requirements text,
  requirements_en text,
  particularities text,
  particularities_en text,
  required_documents text[] not null default '{}',
  extra_questions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'inactive', 'draft')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_jobs_status on public.jobs(status);
create index idx_jobs_profession on public.jobs(profession);
create index idx_jobs_country on public.jobs(country);
create index idx_jobs_region on public.jobs(region);
create index idx_jobs_urgency on public.jobs(urgency);
create trigger trg_jobs_updated_at before update on public.jobs
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Candidate dossier
-- ---------------------------------------------------------------------
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  email text,
  preferred_contact text,
  best_contact_time text,
  city_residence text,
  region_residence text,
  postal_code text,
  status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
  consent_data boolean not null default false,
  consent_data_at timestamptz,
  mailing_list_opt_in boolean not null default false,
  mailing_list_opt_in_at timestamptz,
  profile_completion_score integer not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_candidates_auth_user on public.candidates(auth_user_id)
  where auth_user_id is not null;
create index idx_candidates_email on public.candidates(lower(email));
create index idx_candidates_phone on public.candidates(phone);
create index idx_candidates_status on public.candidates(status);
create trigger trg_candidates_updated_at before update on public.candidates
for each row execute function public.set_updated_at();

create table public.candidate_profiles (
  candidate_id uuid primary key references public.candidates(id) on delete cascade,
  profession text,
  qualified_professions text[] not null default '{}',
  years_experience text,
  permit_status text,
  permit_number text,
  work_authorization text,
  languages text[] not null default '{}',
  mobility text,
  preferred_mandate_types text[] not null default '{}',
  preferred_establishments text,
  avoided_establishments text,
  salary_expectations text,
  notes_for_recruiter text,
  updated_at timestamptz not null default now()
);

create index idx_candidate_profiles_profession on public.candidate_profiles(profession);
create index idx_candidate_profiles_qualified_professions
  on public.candidate_profiles using gin (qualified_professions);
create trigger trg_candidate_profiles_updated_at before update on public.candidate_profiles
for each row execute function public.set_updated_at();

create table public.candidate_availability (
  candidate_id uuid primary key references public.candidates(id) on delete cascade,
  start_availability text,
  exact_start_date date,
  preferred_hours text,
  preferred_shifts text[] not null default '{}',
  preferred_regions jsonb not null default '[]'::jsonb,
  preferred_departments text[] not null default '{}',
  housing_required text,
  transport_available text,
  constraints text,
  updated_at timestamptz not null default now()
);

create trigger trg_candidate_availability_updated_at before update on public.candidate_availability
for each row execute function public.set_updated_at();

create table public.candidate_preference_sets (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  label text not null default 'Choix principal',
  priority integer not null default 1,
  professions text[] not null default '{}',
  regions jsonb not null default '[]'::jsonb,
  departments text[] not null default '{}',
  shifts text[] not null default '{}',
  mandate_types text[] not null default '{}',
  start_date text,
  mobility text,
  salary_floor text,
  constraints text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_candidate_preference_sets_candidate_priority
  on public.candidate_preference_sets(candidate_id, active, priority);
create index idx_candidate_preference_sets_professions
  on public.candidate_preference_sets using gin (professions);
create index idx_candidate_preference_sets_regions
  on public.candidate_preference_sets using gin (regions);
create index idx_candidate_preference_sets_departments
  on public.candidate_preference_sets using gin (departments);
create trigger trg_candidate_preference_sets_updated_at before update on public.candidate_preference_sets
for each row execute function public.set_updated_at();

create table public.candidate_documents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  document_type text not null,
  status text not null default 'À recevoir' check (status in ('À recevoir', 'Reçu', 'À renouveler', 'Non applicable')),
  file_path text,
  file_name text,
  uploaded_at timestamptz,
  expires_at timestamptz,
  is_current boolean not null default true,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_candidate_documents_candidate on public.candidate_documents(candidate_id);
create index idx_candidate_documents_current on public.candidate_documents(candidate_id, document_type, is_current, uploaded_at desc);
create unique index idx_candidate_documents_one_current
  on public.candidate_documents(candidate_id, document_type)
  where is_current = true and status = 'Reçu';

-- ---------------------------------------------------------------------
-- Applications / ATS pipeline
-- ---------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  application_type text not null check (application_type in ('posting', 'spontaneous')),
  job_id uuid references public.jobs(id) on delete set null,
  preference_set_id uuid references public.candidate_preference_sets(id) on delete set null,
  posting_snapshot jsonb,
  answers jsonb not null default '{}'::jsonb,
  completion_score integer not null default 0,
  status text not null default 'Nouveau',
  status_reason text,
  source text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint one_application_per_job unique (candidate_id, job_id)
);

create unique index idx_applications_one_spontaneous
  on public.applications(candidate_id)
  where application_type = 'spontaneous';
create index idx_applications_candidate on public.applications(candidate_id);
create index idx_applications_job on public.applications(job_id);
create index idx_applications_status on public.applications(status);
create index idx_applications_created on public.applications(created_at desc);
create trigger trg_applications_updated_at before update on public.applications
for each row execute function public.set_updated_at();

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  candidate_document_id uuid references public.candidate_documents(id) on delete set null,
  document_type text not null,
  status text not null default 'À recevoir',
  file_path text,
  file_name text,
  created_at timestamptz not null default now()
);

create unique index idx_application_documents_unique_type
  on public.application_documents(application_id, document_type);
create index idx_application_documents_application on public.application_documents(application_id);
create index idx_application_documents_candidate_doc on public.application_documents(candidate_document_id);

create table public.match_scores (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  preference_set_id uuid references public.candidate_preference_sets(id) on delete set null,
  score integer not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  fit_level text,
  decision text,
  validation_questions jsonb not null default '[]'::jsonb,
  calculated_at timestamptz not null default now(),
  unique(candidate_id, job_id)
);

create index idx_match_scores_job_score on public.match_scores(job_id, score desc);
create index idx_match_scores_candidate_score on public.match_scores(candidate_id, score desc);

-- ---------------------------------------------------------------------
-- Recruiter workflow
-- ---------------------------------------------------------------------
create table public.recruiter_tasks (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  task_type text not null default 'follow_up',
  title text not null,
  details text,
  due_at timestamptz,
  status text not null default 'open' check (status in ('open', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_recruiter_tasks_status_due on public.recruiter_tasks(status, due_at);
create index idx_recruiter_tasks_candidate on public.recruiter_tasks(candidate_id);
create trigger trg_recruiter_tasks_updated_at before update on public.recruiter_tasks
for each row execute function public.set_updated_at();

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  recruiter_id uuid references auth.users(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create index idx_notes_candidate on public.internal_notes(candidate_id);
create index idx_notes_application on public.internal_notes(application_id);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references public.candidates(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_candidate on public.activity_events(candidate_id, created_at desc);
create index idx_activity_application on public.activity_events(application_id, created_at desc);

create table public.message_templates (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  channel text not null default 'email',
  subject text,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_message_templates_updated_at before update on public.message_templates
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Establishment requests and contact
-- ---------------------------------------------------------------------
create table public.establishment_requests (
  id uuid primary key default gen_random_uuid(),
  establishment text,
  contact_name text,
  function_title text,
  phone text,
  email text,
  region text,
  city text,
  department text,
  profession_requested text,
  number_of_resources integer,
  shift text,
  start_date text,
  duration text,
  urgency text,
  details text,
  consent_contact boolean not null default false,
  status text not null default 'Nouvelle',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_estab_status on public.establishment_requests(status);
create index idx_estab_urgency on public.establishment_requests(urgency);
create trigger trg_estab_updated_at before update on public.establishment_requests
for each row execute function public.set_updated_at();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  request_type text,
  name text,
  phone text,
  email text,
  message text,
  consent_contact boolean not null default false,
  status text not null default 'Nouveau',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.profiles_admin enable row level security;
alter table public.job_titles enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.candidate_availability enable row level security;
alter table public.candidate_preference_sets enable row level security;
alter table public.candidate_documents enable row level security;
alter table public.applications enable row level security;
alter table public.application_documents enable row level security;
alter table public.match_scores enable row level security;
alter table public.recruiter_tasks enable row level security;
alter table public.internal_notes enable row level security;
alter table public.activity_events enable row level security;
alter table public.message_templates enable row level security;
alter table public.establishment_requests enable row level security;
alter table public.contact_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.job_titles to anon, authenticated;
grant select on public.jobs to anon, authenticated;
grant all on public.profiles_admin to authenticated;
grant all on public.candidates to authenticated;
grant all on public.candidate_profiles to authenticated;
grant all on public.candidate_availability to authenticated;
grant all on public.candidate_preference_sets to authenticated;
grant all on public.candidate_documents to authenticated;
grant all on public.applications to authenticated;
grant all on public.application_documents to authenticated;
grant all on public.match_scores to authenticated;
grant all on public.recruiter_tasks to authenticated;
grant all on public.internal_notes to authenticated;
grant all on public.activity_events to authenticated;
grant all on public.message_templates to authenticated;
grant all on public.establishment_requests to authenticated;
grant all on public.contact_messages to authenticated;

drop policy if exists "admin can read own profile" on public.profiles_admin;
create policy "admin can read own profile" on public.profiles_admin
  for select to authenticated using (id = auth.uid());

drop policy if exists "public read active job titles" on public.job_titles;
create policy "public read active job titles" on public.job_titles
  for select to anon, authenticated using (active = true);

drop policy if exists "public read active jobs" on public.jobs;
create policy "public read active jobs" on public.jobs
  for select to anon, authenticated using (status = 'active');

-- Admin full access on operational tables.
drop policy if exists "admin manage job titles" on public.job_titles;
create policy "admin manage job titles" on public.job_titles for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage jobs" on public.jobs;
create policy "admin manage jobs" on public.jobs for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage candidates" on public.candidates;
create policy "admin manage candidates" on public.candidates for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage candidate profiles" on public.candidate_profiles;
create policy "admin manage candidate profiles" on public.candidate_profiles for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage candidate availability" on public.candidate_availability;
create policy "admin manage candidate availability" on public.candidate_availability for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage candidate preference sets" on public.candidate_preference_sets;
create policy "admin manage candidate preference sets" on public.candidate_preference_sets for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage candidate documents" on public.candidate_documents;
create policy "admin manage candidate documents" on public.candidate_documents for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage applications" on public.applications;
create policy "admin manage applications" on public.applications for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage application documents" on public.application_documents;
create policy "admin manage application documents" on public.application_documents for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage match scores" on public.match_scores;
create policy "admin manage match scores" on public.match_scores for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage recruiter tasks" on public.recruiter_tasks;
create policy "admin manage recruiter tasks" on public.recruiter_tasks for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage notes" on public.internal_notes;
create policy "admin manage notes" on public.internal_notes for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage activity" on public.activity_events;
create policy "admin manage activity" on public.activity_events for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage message templates" on public.message_templates;
create policy "admin manage message templates" on public.message_templates for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage establishment requests" on public.establishment_requests;
create policy "admin manage establishment requests" on public.establishment_requests for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "admin manage contact messages" on public.contact_messages;
create policy "admin manage contact messages" on public.contact_messages for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Candidate read access to own dossier.
drop policy if exists "candidate reads own row" on public.candidates;
create policy "candidate reads own row" on public.candidates
  for select to authenticated using (auth_user_id = auth.uid());

drop policy if exists "candidate reads own profile" on public.candidate_profiles;
create policy "candidate reads own profile" on public.candidate_profiles
  for select to authenticated using (
    candidate_id in (select id from public.candidates where auth_user_id = auth.uid())
  );

drop policy if exists "candidate reads own availability" on public.candidate_availability;
create policy "candidate reads own availability" on public.candidate_availability
  for select to authenticated using (
    candidate_id in (select id from public.candidates where auth_user_id = auth.uid())
  );

drop policy if exists "candidate reads own preference sets" on public.candidate_preference_sets;
create policy "candidate reads own preference sets" on public.candidate_preference_sets
  for select to authenticated using (
    candidate_id in (select id from public.candidates where auth_user_id = auth.uid())
  );

drop policy if exists "candidate reads own documents" on public.candidate_documents;
create policy "candidate reads own documents" on public.candidate_documents
  for select to authenticated using (
    candidate_id in (select id from public.candidates where auth_user_id = auth.uid())
  );

drop policy if exists "candidate reads own applications" on public.applications;
create policy "candidate reads own applications" on public.applications
  for select to authenticated using (
    candidate_id in (select id from public.candidates where auth_user_id = auth.uid())
  );

drop policy if exists "candidate reads own application documents" on public.application_documents;
create policy "candidate reads own application documents" on public.application_documents
  for select to authenticated using (
    application_id in (
      select a.id
      from public.applications a
      join public.candidates c on c.id = a.candidate_id
      where c.auth_user_id = auth.uid()
    )
  );

drop policy if exists "candidate reads own match scores" on public.match_scores;
create policy "candidate reads own match scores" on public.match_scores
  for select to authenticated using (
    candidate_id in (select id from public.candidates where auth_user_id = auth.uid())
  );

-- Public inserts still go through service_role route handlers.

-- ---------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------
-- Bucket prive requis: candidate-documents.
-- Les fichiers candidats sont stockes sous owner/{auth_user_id}/...
