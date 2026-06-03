-- =====================================================================
-- ATS V10 - Contenu public bilingue complet pour les postes
-- =====================================================================
-- A executer dans Supabase SQL Editor sur une base ATS V9 existante.
-- Ne drop aucune donnee.
-- =====================================================================

alter table public.jobs
  add column if not exists description text,
  add column if not exists description_en text,
  add column if not exists establishment_en text,
  add column if not exists schedule_en text,
  add column if not exists duration_en text,
  add column if not exists salary_en text,
  add column if not exists benefits text,
  add column if not exists benefits_en text;

notify pgrst, 'reload schema';
