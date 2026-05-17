-- =====================================================================
-- ATS V4 - Professions admissibles multiples par candidat
-- =====================================================================
-- A executer dans Supabase SQL Editor sur une base ATS V2/V3 existante.
-- Ne drop aucune donnee.
-- =====================================================================

alter table public.candidate_profiles
  add column if not exists qualified_professions text[] not null default '{}';

update public.candidate_profiles
set qualified_professions = array[profession]
where (qualified_professions is null or array_length(qualified_professions, 1) is null)
  and profession is not null
  and profession <> '';

create index if not exists idx_candidate_profiles_qualified_professions
  on public.candidate_profiles using gin (qualified_professions);

insert into public.job_titles (code, title, category, requires_permit, source_url, active)
select
  '1912',
  'Infirmier(ère) clinicien(ne)',
  'Soins infirmiers',
  true,
  'https://cpnsss.gouv.qc.ca/titres-demploi-et-salaires/nomenclature-et-mecanisme-de-modification',
  true
where not exists (
  select 1 from public.job_titles where title = 'Infirmier(ère) clinicien(ne)'
);

notify pgrst, 'reload schema';
