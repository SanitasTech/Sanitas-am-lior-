# Agence Sanitas — Site public + Outil de recrutement

MVP complet en **Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Zod**.

Le projet comprend deux parties cohérentes :

- **Site public premium** orienté candidats et établissements (`/`, `/postes`, `/postuler`, `/entrevue`, `/etablissements`, etc.).
- **Outil de recrutement admin** sécurisé pour l'équipe Sanitas (`/admin/candidats`, `/admin/postes`, `/admin/demandes`).

L'entrevue candidat est codée nativement dans l'app pour garder un mapping fiable
entre **candidat ↔ mandat**, sans dépendance externe ni webhook.

---

## 1. Installation

```bash
npm install
cp .env.example .env.local
# remplir les variables (voir §3)
npm run dev
```

L'app tourne sur http://localhost:3000.

Pour la prod :

```bash
npm run build
npm start
```

## 2. Stack & choix techniques

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 14 App Router | SSR par défaut, Route Handlers, server components |
| Langage | TypeScript strict | Sécurité + DX |
| UI | Tailwind CSS, tokens OKLCH | Palette calme, contrôle précis, pas de surcouche |
| DB & auth | Supabase (Postgres + Auth + Storage) | Plan gratuit suffisant pour le MVP |
| Validation | Zod | Source unique de vérité côté API |
| Hébergement | Vercel | Compatible Next, plan gratuit |

Pas de Tally. Pas de chatbot. Pas de matching IA. Pas de CRM complet.

## 3. Variables d'environnement

Créer `.env.local` à la racine :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Le `SUPABASE_SERVICE_ROLE_KEY` n'est jamais exposé au client : il est utilisé
uniquement dans les routes API (`app/api/*`) qui s'exécutent côté serveur.

## 4. Configuration Supabase

1. Créer un projet Supabase (plan gratuit).
2. Aller dans **SQL Editor** et exécuter :
   - `supabase/schema.sql` (tables, indexes, triggers, RLS, policies)
   - `supabase/seed.sql` (job_titles + 3 postes DEMO marqués `is_demo = true`)
3. Aller dans **Storage** et créer un bucket :
   - **Nom** : `candidate-documents`
   - **Public** : Non (privé)
   - Ne pas créer de policy publique. L'accès admin se fait par URLs signées
     générées côté serveur avec la clé service role.
4. Copier l'URL du projet et les clés (Settings → API) dans `.env.local`.

### Créer un compte recruteur

1. Dans **Authentication → Users**, cliquer sur « Add user » et créer un compte
   avec courriel + mot de passe.
2. Récupérer son `id` (uuid) dans la liste des users.
3. Dans **SQL Editor**, exécuter :

```sql
insert into public.profiles_admin (id, full_name, role)
values ('<UUID_DU_USER>', 'Prénom Nom', 'recruiter');
```

Ce profil dans `profiles_admin` est ce qui autorise l'accès à `/admin/*`
(vérifié par la fonction `is_admin()` côté RLS et par `requireAdmin()` côté app).

## 5. Routes

### Publiques

| Route | Description |
|---|---|
| `/` | Accueil premium + moteur de recherche + mandats urgents |
| `/postes` | Liste filtrable des mandats actifs |
| `/postes/[id]` | Fiche détaillée + CTA Je veux ce mandat |
| `/postuler` (`?mandat_id=…`) | Profil rapide (étape 1) |
| `/entrevue` (`?mandat_id=…`) | Entrevue complète (étape 2) |
| `/merci` (`?type=posting|spontaneous`) | Confirmation après soumission |
| `/etablissements` | Demande de personnel par un établissement |
| `/a-propos`, `/contact`, `/politique-confidentialite` | Pages institutionnelles |

### Admin (protégées)

| Route | Description |
|---|---|
| `/admin/login` | Connexion Supabase Auth |
| `/admin/candidats` | Tableau de bord soumissions + KPI + filtres |
| `/admin/candidats/[id]` | Fiche recruteur complète (compatibilité, docs, notes, historique) |
| `/admin/postes` | Liste des postes + filtres |
| `/admin/postes/nouveau` | Création d'un poste |
| `/admin/postes/[id]` | Modification d'un poste |
| `/admin/demandes` | Demandes des établissements + transformation en poste |

### API (Route Handlers)

| Route | Méthode | Description |
|---|---|---|
| `/api/submissions` | POST | Crée candidat + soumission + documents + event |
| `/api/documents` | POST | Téléverse un fichier dans le bucket privé |
| `/api/establishment-requests` | POST | Enregistre une demande publique |
| `/api/contact` | POST | Enregistre un message de contact |
| `/api/admin/status` | POST | (Admin) change le statut d'une soumission |
| `/api/admin/notes` | POST | (Admin) ajoute une note interne |
| `/api/admin/jobs` | POST / PUT / DELETE | (Admin) CRUD postes (DELETE désactive) |
| `/api/admin/establishment-requests` | PUT / POST | (Admin) change statut / transforme en poste |

## 6. Concept central : deux types de soumission

| Mode | Déclenchement | `submission_type` | `job_id` | `posting_snapshot` |
|---|---|---|---|---|
| Mandat précis | `/postuler?mandat_id=ID` | `posting` | UUID | snapshot du poste |
| Candidature spontanée | `/postuler` sans paramètre | `spontaneous` | `null` | `null` |

Le snapshot est figé au moment de la soumission, ce qui permet au recruteur de
voir exactement à quel mandat le candidat a répondu, même si le poste a évolué
depuis.

L'entrevue (`/entrevue`) s'adapte au mode :

- En mode **posting** : la profession et la région sont déduites du mandat,
  la question fin de semaine sur deux apparaît si le mandat est un remplacement
  ou long terme, et les `extra_questions` du poste sont rendues dynamiquement.
- En mode **spontaneous** : le candidat précise tout (régions/villes,
  départements souhaités, quarts, attentes salariales).

## 7. Sécurité

- **Middleware** (`middleware.ts`) : protège `/admin/*` sauf `/admin/login`.
  Toute requête non authentifiée est redirigée vers la page de connexion.
- **Layout `(panel)`** : vérifie en plus que l'utilisateur est dans
  `profiles_admin` avant de rendre les pages admin.
- **RLS activé sur toutes les tables**. Seules les tables `jobs` (status='active')
  et `job_titles` (active=true) ont une lecture publique.
- **Service role key** uniquement côté serveur (`lib/supabase/admin.ts` est
  marqué `import 'server-only'`). Jamais exposé au navigateur.
- **Pas de données personnelles dans l'URL** : le passage entre `/postuler` et
  `/entrevue` utilise `sessionStorage`. Seul le `mandat_id` (public) transite par
  l'URL.
- **Consentement** : enregistré avec un booléen + timestamp.
- **Données non collectées** : pas de NAS, pas de date de naissance, pas
  d'adresse complète, pas d'antécédents judiciaires, pas de références.
- **Bucket Storage privé** : `candidate-documents`, accessible uniquement via
  URLs signées générées côté admin.
- **Erreurs neutres** côté API pour ne pas divulguer d'info sensible.

## 8. Validation

Toutes les entrées utilisateur passent par des schémas Zod centralisés dans
`lib/validation.ts`. Les routes API rejettent toute donnée invalide avec un
message en clair pour le candidat, et un statut HTTP cohérent.

## 9. Documents

- Stockés dans le bucket privé `candidate-documents`.
- Un enregistrement `documents` est créé même quand le candidat choisit
  « Je l'enverrai plus tard » (status `À recevoir`).
- Le téléchargement par le recruteur via URL signée est prévu dans
  l'architecture mais simplifié dans cette première version (affichage du nom de
  fichier dans la fiche). À brancher quand votre policy d'accès aux fichiers est
  validée.

## 10. Limites MVP (volontaires)

Pour rester simple, robuste et maintenable, le MVP **ne contient pas** :

- Espace candidat avec login.
- Chatbot ni matching IA.
- Génération de PDF.
- Automatisations email complexes (un seul flux : soumission → admin).
- Multi-langue complet (FR uniquement).
- Scraping automatique de la nomenclature CPNSSS.
- Téléchargement direct des documents depuis l'admin (le record est créé et
  consultable, mais l'URL signée est à activer dans l'itération suivante).

Ces éléments sont prévus dans le modèle de données ou la structure de routes,
mais non implémentés pour éviter de la dette technique prématurée.

## 11. Scénarios de validation

| Scénario | Étapes clés |
|---|---|
| Mandat précis | `/postes` → fiche poste → `/postuler?mandat_id=ID` → entrevue → soumission `posting` |
| Spontanée | `/postuler` → profession sélectionnée → entrevue → soumission `spontaneous` |
| Établissement | `/etablissements` → formulaire → admin reçoit dans `/admin/demandes` → transforme en poste |
| Contact | `/contact` → formulaire → admin peut consulter dans `contact_messages` |

`npm run build` doit fonctionner sans erreur. `npm run typecheck` également.

## 12. Coordonnées

**Agence Sanitas**
Agence de placement en santé
Suite 570, 4 Place Laval, Laval, QC, H7N 5Y3
450 973-9696
rh@agencesanitas.com
