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
import SegmentedChoices from '@/components/SegmentedChoices';
import {
  CONTACT_PREFS,
  LANGUAGES,
  PERMIT_STATUSES,
  PROFESSIONS,
  QUEBEC_REGIONS,
  SHIFTS,
  START_AVAILABILITY,
  WORK_AUTH,
  YEARS_EXPERIENCE,
  YES_NO_DISCUSS,
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
  locale,
  canJumpToReview,
  onJumpToReview,
}: StepProps) {
  const en = locale === 'en';
  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={tr(locale, 'Étape 1', 'Step 1')}
        title={tr(locale, 'Parlons de toi', 'Tell us about you')}
        description={tr(
          locale,
          'Ces infos servent à te recontacter rapidement. Téléphone ou courriel suffit, choisis ce que tu préfères.',
          'These details let us reach you quickly. Phone or email — pick what works.'
        )}
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
        <Field label={tr(locale, 'Région', 'Region')} required error={errors.region_residence}>
          <select
            className="input"
            value={form.region_residence}
            onChange={(e) => setField(setForm, 'region_residence', e.target.value)}
          >
            <option value="">{tr(locale, 'Choisir', 'Select')}</option>
            {QUEBEC_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
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
  const needsPermitField =
    form.qualified_professions.some((p) => professionRequiresPermit(p)) ||
    professionRequiresPermit(form.profession);

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={tr(locale, 'Étape 2', 'Step 2')}
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
        </div>
      )}

      <Field
        label={tr(locale, 'Titres pour lesquels tu es qualifié(e)', 'Titles you are qualified for')}
        required
        error={errors.qualified_professions}
        helper={tr(
          locale,
          'Sélectionne uniquement les titres pour lesquels tu as les qualifications réelles.',
          'Select only the titles where you actually have the qualifications.'
        )}
      >
        <SegmentedChoices
          options={PROFESSIONS}
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
        {isPosting && job?.profession && !form.qualified_professions.includes(job.profession) && (
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
        label={tr(locale, 'Autorisation de travailler au Canada', 'Authorization to work in Canada')}
        required
        error={errors.work_authorization}
      >
        <SegmentedChoices
          options={WORK_AUTH}
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
  const needsWeekendCheck = isPosting && mandateRequiresWeekendCheck(job?.mandate_type);

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
        eyebrow={tr(locale, 'Étape 3', 'Step 3')}
        title={tr(locale, 'Tes disponibilités', 'Your availability')}
        description={
          isPosting
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

      <InterviewSlotsField
        slots={form.interview_slots}
        onChange={(slots) => setField(setForm, 'interview_slots', slots)}
        locale={locale}
      />

      <Field
        label={tr(locale, 'Quarts que tu acceptes', 'Shifts you accept')}
        required
        error={errors.shifts_accepted}
      >
        <SegmentedChoices
          options={SHIFTS}
          value={form.shifts_accepted}
          onChange={(v) => setField(setForm, 'shifts_accepted', v as string[])}
          multi
        />
      </Field>

      {needsWeekendCheck && (
        <Field label={tr(locale, 'Fin de semaine sur deux acceptable ?', 'Every second weekend acceptable?')}>
          <SegmentedChoices
            options={YES_NO_DISCUSS}
            value={form.weekend_two_in_one}
            onChange={(v) => setField(setForm, 'weekend_two_in_one', v as string)}
          />
        </Field>
      )}

      <div data-error={!!errors.region_choices} className="space-y-3">
        <p className="label">
          {isPosting
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
                    ? tr(locale, 'Région du mandat', 'Assignment region')
                    : `${tr(locale, 'Région', 'Region')} ${idx + 1}`
                }
              >
                <select
                  className="input"
                  value={regionChoice.region}
                  onChange={(e) => updateRegionChoice(idx, { region: e.target.value })}
                >
                  <option value="">{tr(locale, 'Choisir', 'Select')}</option>
                  {QUEBEC_REGIONS.map((region) => (
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
                {tr(locale, 'Toute la région me convient', 'Whole region works for me')}
              </span>
            </label>
            {!regionChoice.all_region && (
              <div className="mt-3">
                <Field
                  label={tr(locale, 'Villes ou villages acceptés', 'Accepted cities or towns')}
                  helper={tr(
                    locale,
                    'Sépare par des virgules. Beaucoup de mandats sont en région — pense aussi aux villages.',
                    'Comma separated. Many assignments are in small towns — include those too.'
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

      <DepartmentGroups
        value={form.preferred_departments}
        onChange={(value) => setField(setForm, 'preferred_departments', value)}
        label={
          isPosting
            ? tr(locale, 'Départements similaires acceptés', 'Similar departments accepted')
            : tr(locale, 'Départements souhaités', 'Preferred departments')
        }
      />

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
  const hasReused = (reusedDocTypes?.size ?? 0) > 0;

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={tr(locale, 'Étape 4', 'Step 4')}
        title={tr(locale, 'Tes documents', 'Your documents')}
        description={tr(
          locale,
          "Le CV est nécessaire. Les autres documents peuvent suivre plus tard — bouton « Envoyer plus tard » et notre équipe te relancera.",
          'CV is required. Other documents can come later — tap "Send later" and our team will follow up.'
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
        {documentList.map((doc) => (
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
  const en = locale === 'en';

  return (
    <div className="space-y-6">
      <StepIntro
        eyebrow={tr(locale, 'Dernière étape', 'Last step')}
        title={tr(locale, 'Prêt(e) à envoyer', 'Ready to send')}
        description={tr(
          locale,
          'Vérifie le résumé ci-dessous. Si tout est bon, clique sur Envoyer.',
          'Check the summary below. If everything looks good, click Send.'
        )}
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
          label={tr(locale, 'Résidence', 'Residence')}
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
          label={tr(locale, 'Quarts', 'Shifts')}
          value={
            form.shifts_accepted.length > 0
              ? form.shifts_accepted.map((s) => displayValue(locale, s)).join(', ')
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
              : tr(locale, 'Pas précisé — on t’appelle quand on peut', 'None — we will call when we can')
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

      {isPosting ? (
        <Field
          label={tr(
            locale,
            "Si ce mandat n'est plus disponible, veux-tu recevoir des mandats similaires ?",
            'If this assignment is no longer available, want to receive similar ones?'
          )}
        >
          <SegmentedChoices
            options={YES_NO_DISCUSS}
            value={form.similar_mandates}
            onChange={(v) => setField(setForm, 'similar_mandates', v as string)}
          />
        </Field>
      ) : (
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
              'Reçois les nouveaux mandats compatibles avec ton profil.',
              'Get new assignments matching your profile.'
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
