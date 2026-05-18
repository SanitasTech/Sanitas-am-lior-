# Supabase ATS V2

Cette V2 repart sur un schema propre. Les anciennes migrations
`migration_v2_auth.sql` et `migration_v3_candidate_crm_v2.sql` sont conservees
comme garde-fous no-op, mais ne doivent plus etre executees.

## 1. Reinitialiser les tables metier

Dans Supabase SQL Editor, executer:

1. `supabase/schema.sql`
2. `supabase/seed.sql` optionnellement, pour charger les donnees de demo

`schema.sql` supprime et recree les tables ATS/CRM metier:

- `candidates`
- `candidate_profiles`
- `candidate_availability`
- `candidate_documents`
- `jobs`
- `applications`
- `application_documents`
- `match_scores`
- `recruiter_tasks`
- `internal_notes`
- `activity_events`
- `message_templates`
- `establishment_requests`
- `contact_messages`

La table `profiles_admin` est preservee.

Si `schema.sql` a ete interrompu autour de la section RLS/policies, ne relance
pas forcement tout le reset si tu veux garder les donnees deja creees. Execute
plutot `supabase/fix_ats_v2_policies.sql`: il recree les policies, remet les
grants publics des postes et retire les doublons demo crees par des seeds
repetees.

Pour ajouter le matching métier strict avec plusieurs titres admissibles par
candidat, executer ensuite `supabase/migration_v4_candidate_qualified_professions.sql`.
Cette migration ajoute `candidate_profiles.qualified_professions` sans effacer
les donnees existantes.

Pour ajouter les textes anglais publics des postes, executer ensuite
`supabase/migration_v5_public_i18n_jobs.sql`. Cette migration ajoute
`jobs.title_en`, `jobs.requirements_en` et `jobs.particularities_en` sans
effacer les donnees existantes.

## 2. Storage documents

Dans Supabase Storage:

- creer le bucket prive `candidate-documents` s'il n'existe pas;
- conserver les fichiers sous `owner/{auth_user_id}/...` pour les candidats;
- les routes serveur continuent d'utiliser la cle `service_role` pour les
  actions recruteur.

## 3. URL de redirection

Dans Supabase -> Authentication -> URL Configuration:

- Site URL local: `http://localhost:3000`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://ton-domaine.com/auth/callback`

## 4. Google OAuth

Dans Google Cloud Console:

1. Creer ou choisir un projet.
2. Creer un OAuth client ID de type Web application.
3. Ajouter l'URI de rappel Supabase:
   `https://TON_PROJET.supabase.co/auth/v1/callback`
4. Copier le Client ID et le Client Secret.

Dans Supabase -> Authentication -> Providers -> Google:

1. Activer Google.
2. Coller le Client ID et le Client Secret.
3. Sauvegarder.

## 5. Email

Le parcours candidat principal est Google. Le lien magique peut rester actif,
mais pour eviter les limites Supabase en production, configurer un SMTP externe
comme Resend dans Project Settings -> Auth -> SMTP Settings.

## 6. Verifier

Apres application du schema:

1. `npm run typecheck`
2. `npm run build`
3. `npm run start`
4. Ouvrir `http://localhost:3000/connexion`
5. Cliquer sur Google, puis verifier `/mon-profil`, `/postuler`,
   `/mes-documents`, `/admin`, `/admin/candidats`, `/admin/applications`,
   `/admin/postes` et `/admin/taches`.

Les candidatures en ligne n'ont pas d'acces invite. Si un candidat ne veut pas
postuler en ligne, l'interface propose l'appel a Sanitas au `450 973-9696`.
