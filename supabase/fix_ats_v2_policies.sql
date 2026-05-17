-- =====================================================================
-- Agence Sanitas - Repair ATS V2 policies after a partial schema run
-- =====================================================================
-- Use this if schema.sql stopped around the RLS section and public pages
-- can no longer read active jobs.
--
-- It is idempotent: it recreates policies and removes duplicate demo jobs
-- created by repeated seed.sql runs.
-- =====================================================================

-- RLS should be enabled on every operational table.
alter table public.profiles_admin enable row level security;
alter table public.job_titles enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.candidate_availability enable row level security;
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

-- Basic grants for PostgREST roles. RLS still decides which rows are visible.
grant usage on schema public to anon, authenticated;
grant select on public.job_titles to anon, authenticated;
grant select on public.jobs to anon, authenticated;
grant all on public.profiles_admin to authenticated;
grant all on public.candidates to authenticated;
grant all on public.candidate_profiles to authenticated;
grant all on public.candidate_availability to authenticated;
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

-- Repeated seed.sql runs can create duplicate demo jobs. Keep one of each.
with ranked_demo_jobs as (
  select
    id,
    row_number() over (
      partition by title, establishment, start_date
      order by created_at desc, id desc
    ) as rn
  from public.jobs
  where is_demo = true
)
delete from public.jobs j
using ranked_demo_jobs r
where j.id = r.id
  and r.rn > 1;

notify pgrst, 'reload schema';
