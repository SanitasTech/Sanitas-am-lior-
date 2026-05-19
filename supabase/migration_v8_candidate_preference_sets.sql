-- =====================================================================
-- ATS V8 - Preferences croisees par groupes de mandats
-- =====================================================================
-- Migration additive. Ne supprime aucune donnee.
-- A executer dans Supabase SQL Editor apres V7.
-- =====================================================================

create table if not exists public.candidate_preference_sets (
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

create index if not exists idx_candidate_preference_sets_candidate_priority
  on public.candidate_preference_sets(candidate_id, active, priority);
create index if not exists idx_candidate_preference_sets_professions
  on public.candidate_preference_sets using gin (professions);
create index if not exists idx_candidate_preference_sets_regions
  on public.candidate_preference_sets using gin (regions);
create index if not exists idx_candidate_preference_sets_departments
  on public.candidate_preference_sets using gin (departments);

drop trigger if exists trg_candidate_preference_sets_updated_at on public.candidate_preference_sets;
create trigger trg_candidate_preference_sets_updated_at before update on public.candidate_preference_sets
for each row execute function public.set_updated_at();

insert into public.candidate_preference_sets (
  candidate_id,
  label,
  priority,
  professions,
  regions,
  departments,
  shifts,
  mandate_types,
  start_date,
  mobility,
  salary_floor,
  constraints,
  active
)
select
  c.id,
  'Choix principal',
  1,
  coalesce(nullif(cp.qualified_professions, '{}'), case when cp.profession is not null and cp.profession <> '' then array[cp.profession] else '{}'::text[] end),
  coalesce(ca.preferred_regions, '[]'::jsonb),
  coalesce(ca.preferred_departments, '{}'::text[]),
  coalesce(ca.preferred_shifts, '{}'::text[]),
  coalesce(cp.preferred_mandate_types, '{}'::text[]),
  ca.start_availability,
  cp.mobility,
  cp.salary_expectations,
  ca.constraints,
  true
from public.candidates c
left join public.candidate_profiles cp on cp.candidate_id = c.id
left join public.candidate_availability ca on ca.candidate_id = c.id
where not exists (
  select 1
  from public.candidate_preference_sets cps
  where cps.candidate_id = c.id
);

alter table public.applications
  add column if not exists preference_set_id uuid references public.candidate_preference_sets(id) on delete set null;

alter table public.match_scores
  add column if not exists preference_set_id uuid references public.candidate_preference_sets(id) on delete set null,
  add column if not exists fit_level text,
  add column if not exists decision text,
  add column if not exists validation_questions jsonb not null default '[]'::jsonb;

alter table public.candidate_preference_sets enable row level security;

grant all on public.candidate_preference_sets to authenticated;

drop policy if exists "admin manage candidate preference sets" on public.candidate_preference_sets;
create policy "admin manage candidate preference sets" on public.candidate_preference_sets for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "candidate reads own preference sets" on public.candidate_preference_sets;
create policy "candidate reads own preference sets" on public.candidate_preference_sets
  for select to authenticated using (
    candidate_id in (select id from public.candidates where auth_user_id = auth.uid())
  );

notify pgrst, 'reload schema';
