// =====================================================================
// Agence Sanitas - Étapes du wizard candidat
// =====================================================================
//
// Chaque step reçoit `form`, `setForm`, `errors`, locale, mode/job.
// Les composants visuels existants (SegmentedChoices, DepartmentGroups,
// DocumentUploadChoice) sont réutilisés tels quels.

'use client';

import type { Dispatch, SetStateAction } from 'react';
import DepartmentGroups from '@/components/DepartmentGroups';
import DocumentUploadChoice from '@/components/DocumentUploadChoice';
import PreferenceSetEditor from '@/components/PreferenceSetEditor';
import SegmentedChoices from '@/components/SegmentedChoices';
import {
  CONTACT_PREFS,
  INTERNATIONAL_WORK_AUTH,
  LANGUAGES,
  PERMIT_STATUSES,
  PROFESSIONS,
  QUEBEC_REGIONS,
  SHIFTS,
  START_AVAILABILITY,
  WORK_AUTH,
  YEARS_EXPERIENCE,
  YES_NO_DISCUSS,
  DEFAULT_JOB_COUNTRY,
  isInternationalCountry,
  professionListCovers,
  professionRequiresPermit,
} from '@/lib/constants';
import { displayValue, type Locale } from '@/lib/i18n';
import { mandateRequiresWeekendCheck } from '@/lib/utils';
import type { ExtraQuestion, Job, RegionChoice } from '@/types';
import { Field, StepIntro } from './WizardShell';
import {
  buildDocumentList,
  emptyRegionChoice,
  type DocumentValue,
  type FormState,
  type Mode,
} from './form-state';

// ---------------------------------------------------------------------
// Props partagées
// ---------------------------------------------------------------------

export interface StepProps {
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  errors: Record<string, string>;
  mode: Mode;
  job: Job | null | undefined;
  locale: Locale;
  /** Types de documents pré-existants en dossier au moment du chargement. */
  reusedDocTypes?: Set<string>;
  /** Raccourci offert quand le profil est complet (mode posting). */
  canJumpToReview?: boolean;
  onJumpToReview?: () => void;
}

function tr(locale: Locale, fr: string, en: string): string {
  return locale === 'en' ? en : fr;
}

function setField<K extends keyof FormState>(
  setForm: Dispatch<SetStateAction<FormState>>,
  key: K,
  value: FormState[K]
) {
  setForm((current) => ({ ...current, [key]: value }));
}

// =====================================================================
// 1. Identité
// =====================================================================

export function StepIdentity({
  form,
  setForm,
  errors,
  mode,
  job,
  locale,
  canJumpToReview,
  onJumpToReview,
}: StepProps) {
  const en = locale === 'en';
  const isPosting = mode === 'posting';
  const isInternationalPosting =
    mode === 'posting' && isInternationalCountry(job?.country || DEFAULT_JOB_COUNTRY);
  const residenceOptions =
    isInternationalPosting && job?.eligible_countries && job.eligible_countries.length > 0
      ? job.eligible_countries
      : QUEBEC_REGIONS;
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={tr(locale, 'Étape 1', 'Step 1')}
        title={isPosting ? tr(locale, 'Tes coordonnées', 'Your contact details') : tr(locale, 'Parlons de toi', 'Tell us about you')}
        description={
          isPosting
            ? tr(
                locale,
                'On commence par ce qui permet au recruteur de te joindre. Le reste du formulaire reste centré sur ce mandat.',
                'We start with what lets the recruiter reach you. The rest of the form stays focused on this assignment.'
              )
            : tr(
                locale,
                'Ces infos servent à te recontacter rapidement. Téléphone ou courriel suffit, choisis ce que tu préfères.',
                'These details let us reach you quickly. Phone or email — pick what works.'
              )
        }
      />

      {canJumpToReview && onJumpToReview && (
        <div className="rounded-xl border border-success/30 bg-success-soft/40 px-4 py-3.5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14.5px] font-medium text-fg">
                {en ? 'Your file is up to date.' : 'Ton dossier est déjà à jour.'}
              </p>
              <p className="text-[12.5px] text-fg-muted">
                {en
                  ? 'Skip the form and confirm in one click.'
                  : 'Saute le formulaire et confirme en un clic.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onJumpToReview}
              className="btn-primary btn-sm whitespace-nowrap"
            >
              {en ? 'Go to confirmation →' : 'Aller à la confirmation →'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tr(locale, 'Prénom', 'First name')} required error={errors.first_name}>
          <input
            className="input"
            value={form.first_name}
            onChange={(e) => setField(setForm, 'first_name', e.target.value)}
            autoComplete="given-name"
            autoCapitalize="words"
            spellCheck={false}
            inputMode="text"
          />
        </Field>
        <Field label={tr(locale, 'Nom', 'Last name')} required error={errors.last_name}>
          <input
            className="input"
            value={form.last_name}
            onChange={(e) => setField(setForm, 'last_name', e.target.value)}
            autoComplete="family-name"
            autoCapitalize="words"
            spellCheck={false}
          />
        </Field>
        <Field
          label={tr(locale, 'Téléphone', 'Phone')}
          error={errors.phone}
          helper={tr(locale, 'Téléphone ou courriel — un seul suffit.', 'Phone or email — one is enough.')}
        >
          <input
            className="input"
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setField(setForm, 'phone', e.target.value)}
            autoComplete="tel"
            placeholder={tr(locale, '514 555-0100', '514 555-0100')}
          />
        </Field>
        <Field label={tr(locale, 'Courriel', 'Email')} error={errors.email}>
          <input
            className="input"
            type="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => setField(setForm, 'email', e.target.value)}
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={tr(locale, 'prenom@exemple.com', 'name@example.com')}
          />
        </Field>
        <Field label={tr(locale, 'Ville', 'City')} required error={errors.city_residence}>
          {/* TODO future : autocomplete villes Québec (~1100 municipalités) */}
          <input
            className="input"
            value={form.city_residence}
            onChange={(e) => setField(setForm, 'city_residence', e.target.value)}
            autoComplete="address-level2"
            autoCapitalize="words"
          />
        </Field>
        <Field
          label={isInternationalPosting ? tr(locale, 'Pays de résidence', 'Country of residence') : tr(locale, 'Région', 'Region')}
          required
          error={errors.region_residence}
          helper={
            isInternationalPosting
              ? tr(
                  locale,
                  'Sélectionne le pays depuis lequel tu postules actuellement.',
                  'Select the country where you currently live.'
                )
              : undefined
          }
        >
          <select
            className="input"
            value={form.region_residence}
            onChange={(e) => setField(setForm, 'region_residence', e.target.value)}
          >
            <option value="">{tr(locale, 'Choisir', 'Select')}</option>
            {residenceOptions.map((region) => (
              <option key={region} value={region}>
                {displayValue(locale, region)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <details className="rounded-lg border border-border bg-muted/20 group">
        <summary className="cursor-pointer list-none px-4 py-3 text-[14px] font-medium text-fg flex items-center justify-between">
          <span>{tr(locale, 'Comment veux-tu être contacté(e) ? (optionnel)', 'How do you want to be contacted? (optional)')}</span>
          <span className="text-fg-subtle text-[12px] group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div className="px-4 pb-4">
          <Field label={tr(locale, 'Moyen préféré', 'Preferred method')}>
            <SegmentedChoices
              options={CONTACT_PREFS}
              value={form.preferred_contact}
              onChange={(v) => setField(setForm, 'preferred_contact', v as string)}
            />
          </Field>
        </div>
      </details>

      <p className="text-[12.5px] text-fg-subtle">
        {en
          ? 'Tip: enable autofill in your browser to go faster next time.'
          : 'Astuce : active le remplissage automatique de ton navigateur pour aller plus vite.'}
      </p>
    </div>
  );
}

// =====================================================================
// 2. Métier
// =====================================================================

export function StepWork({ form, setForm, errors, mode, job, locale }: StepProps) {
  const isPosting = mode === 'posting';
  const isInternationalPosting =
    isPosting && isInternationalCountry(job?.country || DEFAULT_JOB_COUNTRY);
  const needsPermitField =
    form.qualified_professions.some((p) => professionRequiresPermit(p)) ||
    professionRequiresPermit(form.profession);
  const professionOptions =
    isPosting && job?.profession
      ? PROFESSIONS.filter((profession) => professionListCovers([profession], job.profession))
      : PROFESSIONS;
  const workAuthorizationOptions = isInternationalPosting ? INTERNATIONAL_WORK_AUTH : WORK_AUTH;

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={isPosting ? tr(locale, 'Étape 3', 'Step 3') : tr(locale, 'Étape 2', 'Step 2')}
        title={tr(locale, 'Ton métier', 'Your work')}
        description={
          isPosting
            ? tr(
                locale,
                "Confirme que tu es qualifié(e) pour ce mandat, puis dis-nous combien d'années d'expérience tu as.",
                'Confirm you are qualified for this assignment and how many years of experience you have.'
              )
            : tr(
                locale,
                "Choisis les titres pour lesquels tu peux être présentée. On utilisera ça pour ne te proposer que des mandats qui te conviennent.",
                'Pick the titles you can be presented for. We will only suggest assignments that match.'
              )
        }
      />

      {isPosting && job?.profession && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-[12px] uppercase tracking-wider text-fg-subtle">
            {tr(locale, 'Mandat sélectionné', 'Selected assignment')}
          </p>
          <p className="mt-1 text-[15px] font-medium text-fg">{displayValue(locale, job.profession)}</p>
          {isInternationalPosting && (
            <p className="mt-2 text-[13px] leading-relaxed text-fg-muted">
              {tr(
                locale,
                `Mandat international situé en ${displayValue(locale, job.country || '')}. Le CV et les informations de spécialité permettront de valider la suite du processus.`,
                `International assignment located in ${displayValue(locale, job.country || '')}. Your resume and specialty details will be used to confirm the next steps.`
              )}
            </p>
          )}
        </div>
      )}

      <Field
        label={tr(locale, 'Titres pour lesquels tu es qualifié(e)', 'Titles you are qualified for')}
        required
        error={errors.qualified_professions}
        helper={tr(
          locale,
          isPosting
            ? 'On affiche seulement les titres compatibles avec le mandat. Choisis ce qui correspond réellement à ton permis ou diplôme.'
            : 'Sélectionne uniquement les titres pour lesquels tu as les qualifications réelles.',
          isPosting
            ? 'Only titles compatible with this assignment are shown. Select what truly matches your license or diploma.'
            : 'Select only the titles where you actually have the qualifications.'
        )}
      >
        <SegmentedChoices
          options={professionOptions.length > 0 ? professionOptions : PROFESSIONS}
          value={form.qualified_professions}
          multi
          onChange={(value) => {
            const next = value as string[];
            setForm((current) => ({
              ...current,
              qualified_professions: next,
              profession:
                current.profession && next.includes(current.profession)
                  ? current.profession
                  : next[0] || current.profession,
            }));
          }}
        />
        {isPosting && job?.profession && !professionListCovers(form.qualified_professions, job.profession) && (
          <p className="mt-2 rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-[13px] text-warning">
            {tr(
              locale,
              `Ce mandat demande ${displayValue(locale, job.profession)}. Ajoute ce titre seulement si tu es qualifié(e).`,
              `This assignment requires ${displayValue(locale, job.profession)}. Add this title only if you are qualified.`
            )}
          </p>
        )}
      </Field>

      <Field
        label={tr(locale, "Années d'expérience", 'Years of experience')}
        required
        error={errors.years_experience}
      >
        <SegmentedChoices
          options={YEARS_EXPERIENCE}
          value={form.years_experience}
          onChange={(v) => setField(setForm, 'years_experience', v as string)}
        />
      </Field>

      {needsPermitField && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
          <Field label={tr(locale, "Permis d'exercice", 'Professional permit')}>
            <SegmentedChoices
              options={PERMIT_STATUSES}
              value={form.permit_status}
              onChange={(v) => setField(setForm, 'permit_status', v as string)}
            />
          </Field>
          <Field label={tr(locale, 'Numéro de permis', 'Permit number')}>
            <input
              className="input"
              value={form.permit_number}
              onChange={(e) => setField(setForm, 'permit_number', e.target.value)}
              autoCapitalize="characters"
              spellCheck={false}
            />
          </Field>
        </div>
      )}

      <Field
        label={tr(locale, 'Langues de travail', 'Working languages')}
        required
        error={errors.languages}
      >
        <SegmentedChoices
          options={LANGUAGES}
          value={form.languages}
          onChange={(v) => setField(setForm, 'languages', v as string[])}
          multi
        />
      </Field>

      <Field
        label={
          isInternationalPosting
            ? tr(
                locale,
                `Disponibilité pour travailler en ${displayValue(locale, job?.country || '')}`,
                `Availability to work in ${displayValue(locale, job?.country || '')}`
              )
            : tr(locale, 'Autorisation de travailler au Canada', 'Authorization to work in Canada')
        }
        required
        error={errors.work_authorization}
        helper={
          isInternationalPosting
            ? tr(
                locale,
                "Indique si cette opportunité internationale est réaliste pour toi. L'équipe confirmera les étapes exactes après réception du CV.",
                'Tell us whether this international opportunity is realistic for you. The team will confirm the exact steps after reviewing your resume.'
              )
            : undefined
        }
      >
        <SegmentedChoices
          options={workAuthorizationOptions}
          value={form.work_authorization}
          onChange={(v) => setField(setForm, 'work_authorization', v as string)}
        />
      </Field>
    </div>
  );
}

// =====================================================================
// 3. Disponibilités
// =====================================================================

export function StepAvailability({ form, setForm, errors, mode, job, locale }: StepProps) {
  const isPosting = mode === 'posting';
  const isInternationalPosting =
    isPosting && isInternationalCountry(job?.country || DEFAULT_JOB_COUNTRY);
  const mandateRegionOptions =
    isInternationalPosting && job?.region ? [job.region] : QUEBEC_REGIONS;
  const needsWeekendCheck = isPosting && mandateRequiresWeekendCheck(job?.mandate_type);
  const fixedMandateShift = isPosting && !!job?.shift;
  const requiresShiftChoice = isPosting ? !isInternationalPosting && !job?.shift : true;
  const availabilityDetails = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={tr(locale, 'Heures souhaitées', 'Preferred hours')}>
        <input
          className="input"
          value={form.preferred_hours}
          onChange={(e) => setField(setForm, 'preferred_hours', e.target.value)}
          placeholder={tr(locale, 'Ex. temps plein, 24 à 32 h', 'Ex. full time, 24 to 32 h')}
        />
      </Field>
      <Field label={tr(locale, 'Date exacte si tu la connais', 'Exact date if you know')}>
        <input
          className="input"
          type="date"
          value={form.exact_start_date}
          onChange={(e) => setField(setForm, 'exact_start_date', e.target.value)}
        />
      </Field>
    </div>
  );

  function updateRegionChoice(idx: number, patch: Partial<RegionChoice>) {
    setForm((current) => ({
      ...current,
      region_choices: current.region_choices.map((region, i) =>
        i === idx ? { ...region, ...patch } : region
      ),
    }));
  }

  function addRegionChoice() {
    setForm((current) => ({
      ...current,
      region_choices: [...current.region_choices, emptyRegionChoice()],
    }));
  }

  function removeRegionChoice(idx: number) {
    setForm((current) => ({
      ...current,
      region_choices: current.region_choices.filter((_, i) => i !== idx),
    }));
  }

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={tr(locale, 'Étape 4', 'Step 4')}
        title={isPosting ? tr(locale, 'Disponibilité pour ce mandat', 'Availability for this assignment') : tr(locale, 'Tes disponibilités', 'Your availability')}
        description={
          isInternationalPosting
            ? tr(
                locale,
                'Confirme ton délai de départ et tes disponibilités pratiques. Les détails employeur seront validés après analyse de ton CV.',
                'Confirm your relocation timing and practical availability. Employer details will be confirmed after your resume is reviewed.'
              )
            : isPosting
            ? tr(
                locale,
                'Confirme quand tu peux commencer et les quarts que tu acceptes pour ce mandat.',
                'Confirm when you can start and the shifts you accept for this assignment.'
              )
            : tr(
                locale,
                'Dis-nous où, quand et comment tu veux travailler. On respectera tes choix.',
                'Tell us where, when and how you want to work. We will respect your choices.'
              )
        }
      />

      {isPosting && (
        <div className="rounded-xl border border-border bg-muted/25 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-fg-subtle">
            {tr(locale, 'Mandat ciblé', 'Target assignment')}
          </p>
          <dl className="mt-3 grid gap-3 text-[14px] sm:grid-cols-3">
            <div>
              <dt className="text-fg-subtle">
                {isInternationalPosting ? tr(locale, 'Pays', 'Country') : tr(locale, 'Région', 'Region')}
              </dt>
              <dd className="font-medium text-fg">
                {isInternationalPosting
                  ? displayValue(locale, job?.country || '')
                  : job?.region || tr(locale, 'À confirmer', 'To confirm')}
              </dd>
            </div>
            <div>
              <dt className="text-fg-subtle">{tr(locale, 'Département', 'Department')}</dt>
              <dd className="font-medium text-fg">
                {displayValue(locale, job?.department || '') || tr(locale, 'À confirmer', 'To confirm')}
              </dd>
            </div>
            <div>
              <dt className="text-fg-subtle">{tr(locale, 'Quart', 'Shift')}</dt>
              <dd className="font-medium text-fg">
                {displayValue(locale, job?.shift || '') || tr(locale, 'À confirmer', 'To confirm')}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[13.5px] leading-relaxed text-fg-muted">
            {tr(
              locale,
              'On ne te redemande pas toutes tes préférences ici. Elles pourront être complétées après l’envoi.',
              'We are not asking for all your preferences here. You can complete them after submission.'
            )}
          </p>
        </div>
      )}

      <Field
        label={tr(locale, 'Tu peux commencer', 'You can start')}
        required
        error={errors.start_availability}
      >
        <SegmentedChoices
          options={START_AVAILABILITY}
          value={form.start_availability}
          onChange={(v) => setField(setForm, 'start_availability', v as string)}
        />
      </Field>

      {isPosting ? (
        <details className="rounded-lg border border-border bg-muted/20 group">
          <summary className="cursor-pointer list-none px-4 py-3 text-[14px] font-medium text-fg flex items-center justify-between">
            <span>{tr(locale, 'Ajouter une précision de disponibilité (optionnel)', 'Add an availability detail (optional)')}</span>
            <span className="text-fg-subtle text-[12px] group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="px-4 pb-4">{availabilityDetails}</div>
        </details>
      ) : (
        availabilityDetails
      )}

      {!isPosting && (
        <PreferenceSetEditor
          value={form.preference_sets}
          locale={locale}
          regionOptions={mandateRegionOptions}
          onChange={(preferenceSets) => {
            const first = preferenceSets[0];
            setForm((current) => ({
              ...current,
              preference_sets: preferenceSets,
              qualified_professions:
                first?.professions && first.professions.length > 0
                  ? first.professions
                  : current.qualified_professions,
              shifts_accepted:
                first?.shifts && first.shifts.length > 0 ? first.shifts : current.shifts_accepted,
              region_choices:
                first?.regions && first.regions.length > 0 ? first.regions : current.region_choices,
              preferred_departments:
                first?.departments && first.departments.length > 0
                  ? first.departments
                  : current.preferred_departments,
            }));
          }}
        />
      )}

      {fixedMandateShift ? (
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-[12px] font-medium uppercase tracking-wider text-fg-subtle">
            {tr(locale, 'Quart du mandat', 'Assignment shift')}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-fg">
            {displayValue(locale, job?.shift || '')}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
            {tr(
              locale,
              'Ce quart sera transmis avec ta candidature. Si tu as une contrainte, indique-la dans la précision optionnelle.',
              'This shift will be included with your application. If you have a constraint, add it in the optional detail.'
            )}
          </p>
        </div>
      ) : (
        <Field
          label={
            requiresShiftChoice
              ? tr(locale, 'Quarts que tu acceptes', 'Shifts you accept')
              : tr(locale, 'Préférence d’horaire, si déjà connue', 'Schedule preference, if already known')
          }
          required={requiresShiftChoice}
          error={errors.shifts_accepted}
          helper={
            requiresShiftChoice
              ? undefined
              : tr(
                  locale,
                  'Optionnel pour ce mandat international. Tu peux laisser vide si l’horaire sera validé plus tard.',
                  'Optional for this international assignment. You can leave it blank if the schedule will be confirmed later.'
                )
          }
        >
          <SegmentedChoices
            options={SHIFTS}
            value={form.shifts_accepted}
            onChange={(v) => setField(setForm, 'shifts_accepted', v as string[])}
            multi
          />
        </Field>
      )}

      {needsWeekendCheck && (
        <Field label={tr(locale, 'Fin de semaine sur deux acceptable ?', 'Every second weekend acceptable?')}>
          <SegmentedChoices
            options={YES_NO_DISCUSS}
            value={form.weekend_two_in_one}
            onChange={(v) => setField(setForm, 'weekend_two_in_one', v as string)}
          />
        </Field>
      )}

      <InterviewSlotsField
        slots={form.interview_slots}
        onChange={(slots) => setField(setForm, 'interview_slots', slots)}
        locale={locale}
      />

      {!isPosting && (
      <div data-error={!!errors.region_choices} className="space-y-3">
        <p className="label">
          {isInternationalPosting
            ? tr(locale, 'Territoire accepté', 'Accepted territory')
            : isPosting
            ? tr(locale, 'Régions acceptées', 'Accepted regions')
            : tr(locale, 'Où tu veux travailler', 'Where you want to work')}
          {!isPosting && <span className="ml-0.5 text-danger">*</span>}
        </p>
        {form.region_choices.map((regionChoice, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-surface p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Field
                label={
                  isPosting
                    ? isInternationalPosting
                      ? tr(locale, 'Territoire du mandat', 'Assignment territory')
                      : tr(locale, 'Région du mandat', 'Assignment region')
                    : `${tr(locale, 'Région', 'Region')} ${idx + 1}`
                }
              >
                <select
                  className="input"
                  value={regionChoice.region}
                  onChange={(e) => updateRegionChoice(idx, { region: e.target.value })}
                >
                  <option value="">{tr(locale, 'Choisir', 'Select')}</option>
                  {mandateRegionOptions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </Field>
              {form.region_choices.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRegionChoice(idx)}
                  className="btn-ghost btn-sm self-end"
                >
                  {tr(locale, 'Retirer', 'Remove')}
                </button>
              )}
            </div>
            <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-fg"
                checked={regionChoice.all_region}
                onChange={(e) =>
                  updateRegionChoice(idx, {
                    all_region: e.target.checked,
                    cities: e.target.checked ? [] : regionChoice.cities,
                  })
                }
              />
              <span className="text-[14px] text-fg">
                {isInternationalPosting
                  ? tr(locale, 'Tout ce territoire me convient', 'This whole territory works for me')
                  : tr(locale, 'Toute la région me convient', 'Whole region works for me')}
              </span>
            </label>
            {!regionChoice.all_region && (
              <div className="mt-3">
                <Field
                  label={tr(locale, 'Villes ou villages acceptés', 'Accepted cities or towns')}
                  helper={tr(
                    locale,
                    isInternationalPosting
                      ? 'Sépare par des virgules si certaines villes seulement te conviennent.'
                      : 'Sépare par des virgules. Beaucoup de mandats sont en région — pense aussi aux villages.',
                    isInternationalPosting
                      ? 'Comma separated if only certain cities work for you.'
                      : 'Comma separated. Many assignments are in small towns — include those too.'
                  )}
                >
                  {/* TODO future : autocomplete villes/villages Québec */}
                  <input
                    className="input"
                    value={regionChoice.cities.join(', ')}
                    onChange={(e) =>
                      updateRegionChoice(idx, {
                        cities: e.target.value
                          .split(',')
                          .map((city) => city.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
              </div>
            )}
          </div>
        ))}
        {errors.region_choices && (
          <p className="error-text" data-error="true">
            {errors.region_choices}
          </p>
        )}
        {!isPosting && (
          <button type="button" onClick={addRegionChoice} className="btn-secondary btn-sm">
            {tr(locale, '+ Ajouter une région', '+ Add a region')}
          </button>
        )}
      </div>
      )}

      {!isPosting && (
        <DepartmentGroups
          value={form.preferred_departments}
          onChange={(value) => setField(setForm, 'preferred_departments', value)}
          label={
            isPosting
              ? tr(locale, 'Départements similaires acceptés', 'Similar departments accepted')
              : tr(locale, 'Départements souhaités', 'Preferred departments')
          }
        />
      )}

      {!isPosting && (
        <Field label={tr(locale, 'Tu as un véhicule personnel ?', 'Do you have a personal vehicle?')}>
          <SegmentedChoices
            options={['Oui', 'Non']}
            value={form.transport_available === 'Oui, véhicule personnel' ? 'Oui' : form.transport_available === 'Non' ? 'Non' : ''}
            onChange={(v) => {
              const value = v as string;
              setField(
                setForm,
                'transport_available',
                value === 'Oui' ? 'Oui, véhicule personnel' : value === 'Non' ? 'Non' : ''
              );
            }}
          />
        </Field>
      )}
    </div>
  );
}

// =====================================================================
// 4. Documents
// =====================================================================

export function StepDocuments({
  form,
  setForm,
  errors,
  mode,
  job,
  locale,
  reusedDocTypes,
}: StepProps) {
  const isPosting = mode === 'posting';
  const extraQuestions: ExtraQuestion[] =
    isPosting && job?.extra_questions ? job.extra_questions : [];
  const documentList = buildDocumentList(form, job);
  const visibleDocumentList = isPosting
    ? documentList.filter((document) => document.type === 'CV')
    : documentList;
  const hiddenOptionalCount = documentList.length - visibleDocumentList.length;
  const hasReused = (reusedDocTypes?.size ?? 0) > 0;

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={isPosting ? tr(locale, 'Étape 2', 'Step 2') : tr(locale, 'Étape 3', 'Step 3')}
        title={isPosting ? tr(locale, 'CV obligatoire', 'Resume required') : tr(locale, 'CV et documents', 'Resume and documents')}
        description={tr(
          locale,
          isPosting
            ? 'Le CV est obligatoire pour envoyer ta candidature à ce mandat. Les autres documents pourront suivre après.'
            : 'Le CV est obligatoire. Tu peux aussi ajouter tes documents disponibles; les autres pourront suivre plus tard.',
          isPosting
            ? 'Your resume is required to submit your application for this assignment. Other documents can follow afterward.'
            : 'Your resume is required. You can also add the documents you already have; others can follow later.'
        )}
      />

      {hasReused && (
        <div className="rounded-xl border border-accent/30 bg-accent-soft/40 px-4 py-3 text-[13.5px] text-fg">
          <p>
            <span className="font-medium">
              {tr(locale, '✓ Tu as déjà des documents en dossier.', '✓ You already have documents on file.')}
            </span>{' '}
            <span className="text-fg-muted">
              {tr(
                locale,
                'On les a préchargés. Remplace-les seulement si tu as une version plus récente.',
                'They are preloaded. Replace only if you have a newer version.'
              )}
            </span>
          </p>
        </div>
      )}

      <div className="space-y-3" data-error={!!errors.cv}>
        {visibleDocumentList.map((doc) => (
          <DocumentUploadChoice
            key={doc.type}
            documentType={doc.type}
            required={doc.required}
            requestedByPosting={doc.requestedByPosting}
            reused={reusedDocTypes?.has(doc.type) ?? false}
            value={form.documents[doc.type]}
            locale={locale}
            onChange={(value: DocumentValue) =>
              setForm((current) => ({
                ...current,
                documents: { ...current.documents, [doc.type]: value },
              }))
            }
          />
        ))}
      </div>
      {errors.cv && (
        <p className="error-text" data-error="true">
          {errors.cv}
        </p>
      )}

      {isPosting && !form.documents.CV?.file_path && (
        <div className="rounded-xl border border-warning/30 bg-warning-soft/40 px-4 py-3 text-[13.5px] leading-relaxed text-fg-muted">
          {tr(
            locale,
            'Sans CV, la candidature ne peut pas être envoyée. Si tu dois revenir plus tard, le brouillon reste sauvegardé sur cet appareil.',
            'Without a resume, the application cannot be submitted. If you need to come back later, the draft stays saved on this device.'
          )}
        </div>
      )}

      {isPosting && hiddenOptionalCount > 0 && (
        <div className="rounded-xl border border-border bg-muted/25 px-4 py-3 text-[13.5px] leading-relaxed text-fg-muted">
          {tr(
            locale,
            "Les documents secondaires pourront être ajoutés après l'envoi si le recruteur en a besoin.",
            'Secondary documents can be added after submission if the recruiter needs them.'
          )}
        </div>
      )}

      {extraQuestions.length > 0 && (
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="text-[16px] font-semibold text-fg">
            {tr(locale, 'Questions du mandat', 'Assignment questions')}
          </h3>
          {extraQuestions.map((question) => (
            <ExtraQuestionField
              key={question.id}
              question={question}
              value={form.extra_answers[question.id]}
              error={errors[`q_${question.id}`]}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  extra_answers: { ...current.extra_answers, [question.id]: value },
                }))
              }
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExtraQuestionField({
  question,
  value,
  error,
  onChange,
  locale,
}: {
  question: ExtraQuestion;
  value: string | boolean | undefined;
  error?: string;
  onChange: (value: string | boolean) => void;
  locale: Locale;
}) {
  if (question.type === 'textarea') {
    return (
      <Field label={question.label} required={question.required} error={error}>
        <textarea
          className="textarea"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </Field>
    );
  }
  if (question.type === 'select') {
    return (
      <Field label={question.label} required={question.required} error={error}>
        <select
          className="input"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{tr(locale, 'Choisir', 'Select')}</option>
          {(question.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  if (question.type === 'yes_no') {
    return (
      <Field label={question.label} required={question.required} error={error}>
        <SegmentedChoices
          options={YES_NO_DISCUSS}
          value={(value as string) || ''}
          onChange={(next) => onChange(next as string)}
        />
      </Field>
    );
  }
  return (
    <Field label={question.label} required={question.required} error={error}>
      <input
        className="input"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

// =====================================================================
// 5. Confirmation & envoi
// =====================================================================

export function StepReview({ form, setForm, errors, mode, job, locale }: StepProps) {
  const isPosting = mode === 'posting';
  const isInternationalPosting =
    isPosting && isInternationalCountry(job?.country || DEFAULT_JOB_COUNTRY);
  const en = locale === 'en';
  const cvIsReady = form.documents.CV?.status === 'Reçu' && !!form.documents.CV?.file_path;
  const hasContact = !!(form.phone || form.email);
  const hasMinimumWorkInfo =
    form.qualified_professions.length > 0 &&
    !!form.years_experience &&
    form.languages.length > 0 &&
    !!form.work_authorization;
  const hasAvailability =
    !!form.start_availability &&
    (isInternationalPosting || form.shifts_accepted.length > 0 || !!job?.shift);
  const readinessItems = isPosting
    ? [
        {
          label: tr(locale, 'Contact', 'Contact'),
          value: hasContact
            ? tr(locale, 'Sanitas peut te joindre rapidement.', 'Sanitas can reach you quickly.')
            : tr(locale, 'Téléphone ou courriel manquant.', 'Phone or email is missing.'),
          ok: hasContact,
        },
        {
          label: tr(locale, 'CV', 'Resume'),
          value: cvIsReady
            ? tr(locale, 'Le CV est reçu pour ce mandat.', 'Your resume is attached to this assignment.')
            : tr(locale, 'Le CV est requis pour envoyer.', 'A resume is required before sending.'),
          ok: cvIsReady,
        },
        {
          label: tr(locale, 'Admissibilité minimale', 'Minimum eligibility'),
          value: hasMinimumWorkInfo
            ? tr(locale, 'Titre, expérience, langue et autorisation sont confirmés.', 'Title, experience, language and authorization are confirmed.')
            : tr(locale, 'Il manque une information pour analyser ton profil.', 'One detail is missing to review your profile.'),
          ok: hasMinimumWorkInfo,
        },
        {
          label: tr(locale, 'Disponibilité', 'Availability'),
          value: hasAvailability
            ? tr(locale, 'Le recruteur sait quand te considérer.', 'The recruiter knows when to consider you.')
            : tr(locale, 'Indique quand tu peux commencer.', 'Tell us when you can start.'),
          ok: hasAvailability,
        },
      ]
    : [
        {
          label: tr(locale, 'Contact', 'Contact'),
          value: hasContact
            ? tr(locale, 'Sanitas peut te joindre rapidement.', 'Sanitas can reach you quickly.')
            : tr(locale, 'Téléphone ou courriel manquant.', 'Phone or email is missing.'),
          ok: hasContact,
        },
        {
          label: tr(locale, 'CV', 'Resume'),
          value: cvIsReady
            ? tr(locale, 'Ton profil est exploitable par un recruteur.', 'Your profile can be reviewed by a recruiter.')
            : tr(locale, 'Le CV est requis pour activer ton profil.', 'A resume is required to activate your profile.'),
          ok: cvIsReady,
        },
        {
          label: tr(locale, 'Métier', 'Work'),
          value:
            form.qualified_professions.length > 0 && !!form.years_experience
              ? tr(locale, 'Tes titres et ton expérience sont clairs.', 'Your titles and experience are clear.')
              : tr(locale, 'Précise tes titres et ton expérience.', 'Add your titles and experience.'),
          ok: form.qualified_professions.length > 0 && !!form.years_experience,
        },
        {
          label: tr(locale, 'Préférences', 'Preferences'),
          value:
            form.region_choices.some((region) => region.region) && !!form.start_availability
              ? tr(locale, 'On peut chercher des mandats compatibles.', 'We can search for matching assignments.')
              : tr(locale, 'Ajoute au moins une région et ta disponibilité.', 'Add at least one region and your availability.'),
          ok: form.region_choices.some((region) => region.region) && !!form.start_availability,
        },
      ];

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={tr(locale, 'Dernière étape', 'Last step')}
        title={tr(locale, 'Vérifier et envoyer', 'Review and send')}
        description={
          isPosting
            ? tr(
                locale,
                "On vérifie seulement ce qui permet d'analyser ce mandat maintenant. Tes préférences générales pourront être complétées après l'envoi.",
                'We are only checking what is needed to review this assignment now. Broader preferences can be completed after sending.'
              )
            : tr(
                locale,
                'On vérifie que ton profil est exploitable par un recruteur avant de l’activer.',
                'We are checking that your profile can be reviewed by a recruiter before activating it.'
              )
        }
      />

      <ApplicationReadinessPanel
        title={
          isPosting
            ? tr(locale, 'Ce qui part au recruteur', 'What goes to the recruiter')
            : tr(locale, 'Ce qui rend ton profil exploitable', 'What makes your profile usable')
        }
        description={
          isPosting
            ? tr(
                locale,
                'La candidature est courte, mais elle doit permettre une vraie décision : rappeler, valider ou présenter.',
                'The application is short, but it must allow a real decision: call, validate or present.'
              )
            : tr(
                locale,
                'Un profil utile contient assez d’information pour recevoir des mandats pertinents.',
                'A useful profile has enough information to receive relevant assignments.'
              )
        }
        items={readinessItems}
      />

      <div className="rounded-xl border border-border bg-surface divide-y divide-border">
        <ReviewRow
          label={tr(locale, 'Nom', 'Name')}
          value={[form.first_name, form.last_name].filter(Boolean).join(' ') || '—'}
        />
        <ReviewRow
          label={tr(locale, 'Contact', 'Contact')}
          value={[form.phone, form.email].filter(Boolean).join(' · ') || '—'}
        />
        <ReviewRow
          label={
            isInternationalPosting
              ? tr(locale, 'Résidence actuelle', 'Current residence')
              : tr(locale, 'Résidence', 'Residence')
          }
          value={[form.city_residence, form.region_residence].filter(Boolean).join(', ') || '—'}
        />
        <ReviewRow
          label={tr(locale, 'Titres', 'Titles')}
          value={
            form.qualified_professions.length > 0
              ? form.qualified_professions.map((p) => displayValue(locale, p)).join(', ')
              : '—'
          }
        />
        <ReviewRow
          label={tr(locale, 'Expérience', 'Experience')}
          value={displayValue(locale, form.years_experience) || '—'}
        />
        <ReviewRow
          label={
            isInternationalPosting
              ? tr(locale, 'Relocalisation', 'Relocation')
              : tr(locale, 'Autorisation', 'Authorization')
          }
          value={displayValue(locale, form.work_authorization) || '—'}
        />
        <ReviewRow
          label={
            isInternationalPosting
              ? tr(locale, 'Horaire préféré', 'Preferred schedule')
              : tr(locale, 'Quarts', 'Shifts')
          }
          value={
            form.shifts_accepted.length > 0
              ? form.shifts_accepted.map((s) => displayValue(locale, s)).join(', ')
              : isInternationalPosting
                ? tr(locale, 'À confirmer', 'To confirm')
                : '—'
          }
        />
        <ReviewRow
          label={tr(locale, 'Début', 'Start')}
          value={displayValue(locale, form.start_availability) || '—'}
        />
        <ReviewRow
          label={tr(locale, 'Créneaux d’appel', 'Call slots')}
          value={
            form.interview_slots.filter(Boolean).length > 0
              ? form.interview_slots
                  .filter(Boolean)
                  .map((slot) => formatSlotLabel(slot, locale))
                  .join(' · ')
              : tr(locale, "Pas précisé. On t'appelle quand on peut.", 'None. We will call when we can.')
          }
        />
        <ReviewRow
          label={tr(locale, 'CV', 'CV')}
          value={
            form.documents.CV?.file_name ||
            (form.documents.CV?.status === 'Reçu' ? tr(locale, 'Reçu', 'Received') : '—')
          }
        />
      </div>

      {!isPosting && (
        <details className="rounded-lg border border-border bg-muted/20 group">
          <summary className="cursor-pointer list-none px-4 py-3 text-[14px] font-medium text-fg flex items-center justify-between">
            <span>{tr(locale, 'Informations supplémentaires (optionnel)', 'Additional info (optional)')}</span>
            <span className="text-fg-subtle text-[12px] group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="grid gap-4 sm:grid-cols-2 px-4 pb-4">
            <Field label={tr(locale, 'Attentes salariales', 'Salary expectations')}>
              <input
                className="input"
                value={form.salary_expectations}
                onChange={(e) => setField(setForm, 'salary_expectations', e.target.value)}
              />
            </Field>
            <Field label={tr(locale, 'Contraintes importantes', 'Important constraints')}>
              <textarea
                className="textarea"
                value={form.constraints}
                onChange={(e) => setField(setForm, 'constraints', e.target.value)}
              />
            </Field>
            <Field label={tr(locale, 'Note pour le recruteur', 'Note to the recruiter')}>
              <textarea
                className="textarea"
                value={form.recruiter_comment}
                onChange={(e) => setField(setForm, 'recruiter_comment', e.target.value)}
              />
            </Field>
          </div>
        </details>
      )}

      <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
        <label
          className="flex items-start gap-3 cursor-pointer"
          data-error={!!errors.consent_data}
        >
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border accent-fg"
            checked={form.consent_data}
            onChange={(e) => setField(setForm, 'consent_data', e.target.checked)}
          />
          <span className="text-[14px] leading-relaxed text-fg">
            {tr(
              locale,
              "J'accepte que Sanitas utilise mes informations pour analyser ma candidature et me contacter.",
              'I agree that Sanitas may use my information to review my application and contact me.'
            )}
            <span className="text-danger"> *</span>
          </span>
        </label>
        {errors.consent_data && (
          <p className="error-text" data-error="true">
            {errors.consent_data}
          </p>
        )}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border accent-fg"
            checked={form.mailing_list_opt_in}
            onChange={(e) => setField(setForm, 'mailing_list_opt_in', e.target.checked)}
          />
          <span className="text-[14px] leading-relaxed text-fg">
            {tr(
              locale,
              isPosting
                ? "Je veux recevoir d'autres mandats compatibles si mon profil correspond."
                : 'Reçois les nouveaux mandats compatibles avec ton profil.',
              isPosting
                ? 'I want to receive other matching assignments if my profile fits.'
                : 'Get new assignments matching your profile.'
            )}
          </span>
        </label>
      </div>

      <p className="text-[12.5px] leading-relaxed text-fg-subtle">
        {en
          ? 'You will be able to update your file later. Sending creates or updates a single application.'
          : 'Tu pourras modifier ton dossier plus tard. L’envoi crée ou met à jour une seule candidature.'}
      </p>
    </div>
  );
}

// =====================================================================
// InterviewSlotsField — créneaux date+heure proposés par le candidat
// pour être rappelé ou rencontré par un recruteur
// =====================================================================

function InterviewSlotsField({
  slots,
  onChange,
  locale,
}: {
  slots: string[];
  onChange: (slots: string[]) => void;
  locale: Locale;
}) {
  const en = locale === 'en';
  const MAX_SLOTS = 3;
  // Garantit toujours au moins une ligne visible.
  const display = slots.length > 0 ? slots : [''];

  function updateAt(idx: number, value: string) {
    const next = display.slice();
    next[idx] = value;
    // On nettoie les vides en fin pour ne pas garder de lignes fantômes.
    while (next.length > 1 && next[next.length - 1] === '') next.pop();
    onChange(next);
  }

  function addSlot() {
    if (display.length >= MAX_SLOTS) return;
    onChange([...display, '']);
  }

  function removeAt(idx: number) {
    const next = display.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : ['']);
  }

  // Date minimum : aujourd'hui (pour éviter de proposer des créneaux passés).
  const todayLocal = new Date();
  // Format YYYY-MM-DDTHH:MM pour <input type="datetime-local">.
  const minStr = `${todayLocal.getFullYear()}-${String(todayLocal.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(todayLocal.getDate()).padStart(2, '0')}T00:00`;

  return (
    <div className="rounded-xl border border-accent/30 bg-accent-soft/30 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-fg">
            {en
              ? 'When can we call you?'
              : 'Quand peut-on t’appeler ?'}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">
            {en
              ? 'Suggest 2 to 3 time slots. The recruiter will pick one that works for them — much faster than email back-and-forth.'
              : 'Propose 2 à 3 créneaux. Le recruteur choisira celui qui lui convient — ça évite les allers-retours par courriel.'}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {display.map((slot, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-semibold text-fg-muted border border-border">
              {idx + 1}
            </span>
            <input
              type="datetime-local"
              className="input flex-1"
              value={slot}
              min={minStr}
              onChange={(e) => updateAt(idx, e.target.value)}
              aria-label={en ? `Time slot ${idx + 1}` : `Créneau ${idx + 1}`}
            />
            {display.length > 1 && (
              <button
                type="button"
                onClick={() => removeAt(idx)}
                aria-label={en ? 'Remove' : 'Retirer'}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg-muted hover:bg-muted"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {display.length < MAX_SLOTS && (
        <button
          type="button"
          onClick={addSlot}
          className="btn-ghost btn-sm mt-3 inline-flex items-center gap-1.5"
        >
          <span aria-hidden>+</span>
          {en ? 'Add another slot' : 'Ajouter un créneau'}
        </button>
      )}

      <p className="mt-3 text-[12px] text-fg-subtle">
        {en
          ? 'Optional but speeds things up. Time zone: America/Montreal.'
          : 'Optionnel mais ça accélère tout. Fuseau : America/Montréal.'}
      </p>
    </div>
  );
}

function formatSlotLabel(isoLocal: string, locale: Locale): string {
  // isoLocal arrive en YYYY-MM-DDTHH:MM (datetime-local). On le parse en
  // composantes pour ne pas dépendre du fuseau utilisateur.
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(isoLocal);
  if (!match) return isoLocal;
  const [, , month, day, hh, mm] = match;
  if (locale === 'en') return `${month}-${day} ${hh}:${mm}`;
  return `${day}/${month} ${hh}h${mm}`;
}

function ApplicationReadinessPanel({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<{ label: string; value: string; ok: boolean }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/25 p-4 sm:p-5">
      <div>
        <h2 className="text-[16px] font-semibold text-fg">{title}</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">{description}</p>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
          >
            <span
              className={
                item.ok
                  ? 'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success'
                  : 'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning'
              }
              aria-hidden
            >
              {item.ok ? '✓' : '!'}
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-fg">{item.label}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-fg-muted">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <dt className="w-32 shrink-0 text-[12.5px] uppercase tracking-wider text-fg-subtle">
        {label}
      </dt>
      <dd className="flex-1 text-[14.5px] text-fg break-words">{value}</dd>
    </div>
  );
}
