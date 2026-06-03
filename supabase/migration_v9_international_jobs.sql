-- =====================================================================
-- ATS V9 - Mandats internationaux
-- =====================================================================
-- A executer dans Supabase SQL Editor sur une base ATS V8 existante.
-- Ne drop aucune donnee.
-- =====================================================================

alter table public.jobs
  add column if not exists country text not null default 'Canada',
  add column if not exists eligible_countries text[] not null default '{}';

update public.jobs
set country = 'Canada'
where country is null or country = '';

create index if not exists idx_jobs_country
  on public.jobs(country);

notify pgrst, 'reload schema';
