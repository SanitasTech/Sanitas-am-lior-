-- =====================================================================
-- ATS V5 - Champs anglais publics pour les postes
-- =====================================================================
-- A executer dans Supabase SQL Editor sur une base ATS V2/V3/V4 existante.
-- Migration additive: ne supprime aucune donnee.
-- =====================================================================

alter table public.jobs
  add column if not exists title_en text,
  add column if not exists requirements_en text,
  add column if not exists particularities_en text;

notify pgrst, 'reload schema';
