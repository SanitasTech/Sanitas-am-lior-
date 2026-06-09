// =====================================================================
// Agence Sanitas - Orchestrateur du wizard candidat
// =====================================================================
//
// Gère l'état, la navigation entre étapes, la validation locale,
// la sauvegarde automatique du brouillon et l'envoi final.

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { localizedPath, type Locale } from '@/lib/i18n';
import {
  DEFAULT_JOB_COUNTRY,
  INTERNATIONAL_WORK_AUTH,
  isInternationalCountry,
} from '@/lib/constants';
import {
  validateAvailabilityStep,
  validateDocumentsStep,
  validateIdentityStep,
  validateReviewStep,
  validateWorkStep,
} from '@/lib/validation';
import {
  clearDraft,
  draftKey,
  formatDraftAge,
  loadDraft,
  useDraftAutosave,
} from '@/lib/candidate-draft';
import type { Candidate, DocumentRecord, ExtraQuestion, Job } from '@/types';
import {
  buildDocumentList,
  formToCandidate,
  getStepOrder,
  makeInitialFormState,
  stepIndex,
  type FormState,
  type Mode,
  type StepId,
} from './form-state';
import {
  ResumeDraftBanner,
  WizardFooter,
  WizardHeader,
} from './WizardShell';
import {
  StepAvailability,
  StepDocuments,
  StepIdentity,
  StepReview,
  StepWork,
  type StepProps,
} from './WizardSteps';

interface CandidateWizardProps {
  mode: Mode;
  job?: Job | null;
  initial: Candidate;
  initialDocuments?: Record<
    string,
    Pick<DocumentRecord, 'id' | 'status' | 'file_name' | 'file_path'>
  >;
  locale?: Locale;
}

const STEP_TITLES_FR: Record<StepId, string> = {
  identity: 'Toi',
  work: 'Ton métier',
  availability: 'Tes disponibilités',
  documents: 'CV et documents',
  review: 'Confirmer & envoyer',
};

const STEP_TITLES_EN: Record<StepId, string> = {
  identity: 'You',
  work: 'Your work',
  availability: 'Your availability',
  documents: 'Resume and documents',
  review: 'Confirm & send',
};

export default function CandidateWizard({
  mode,
  job,
  initial,
  initialDocuments,
  locale = 'fr',
}: CandidateWizardProps) {
  const router = useRouter();
  const isPosting = mode === 'posting';
  const isInternationalPosting =
    isPosting && isInternationalCountry(job?.country || DEFAULT_JOB_COUNTRY);
  const stepOrder = useMemo(() => getStepOrder(mode), [mode]);

  const initialForm = useMemo(
    () => makeInitialFormState(mode, initial, job, initialDocuments),
    [mode, initial, job, initialDocuments]
  );
  const reusedDocTypes = useMemo(
    () => new Set(Object.keys(initialDocuments || {})),
    [initialDocuments]
  );
  const [form, setForm] = useState<FormState>(initialForm);
  const [step, setStep] = useState<StepId>('identity');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // -----------------------------------------------------------------
  // Source tracking (UTM + referrer + landing URL)
  // Capturé une seule fois au montage, persistant pour toute la session.
  // -----------------------------------------------------------------
  const trackingRef = useRef<Record<string, string | null> | null>(null);
  useEffect(() => {
    if (trackingRef.current !== null) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const pick = (k: string) => params.get(k) || null;
    trackingRef.current = {
      utm_source: pick('utm_source'),
      utm_medium: pick('utm_medium'),
      utm_campaign: pick('utm_campaign'),
      utm_term: pick('utm_term'),
      utm_content: pick('utm_content'),
      referrer: document.referrer || null,
      landing_url: window.location.href,
    };
  }, []);

  // -----------------------------------------------------------------
  // Sauvegarde automatique (localStorage, debounced)
  // -----------------------------------------------------------------
  const storageKey = useMemo(
    () => draftKey({ candidateId: initial.id, mode, jobId: job?.id }),
    [initial.id, mode, job?.id]
  );

  // Bandeau « Reprendre où tu t'étais arrêté » : on cherche un brouillon
  // au montage. On ne restaure pas automatiquement pour ne pas écraser
  // les infos déjà persistées en base si elles sont plus récentes.
  const [draftPrompt, setDraftPrompt] = useState<{ data: FormState; ageLabel: string } | null>(
    null
  );
  const checkedDraftRef = useRef(false);
  useEffect(() => {
    if (checkedDraftRef.current) return;
    checkedDraftRef.current = true;
    const draft = loadDraft<FormState>(storageKey);
    if (!draft) return;
    // Heuristique simple : on propose la reprise seulement si le draft
    // contient plus de champs remplis que l'état initial chargé du serveur.
    if (draftFillScore(draft.data) > draftFillScore(initialForm) + 1) {
      setDraftPrompt({ data: draft.data, ageLabel: formatDraftAge(draft.savedAt, locale) });
    }
  }, [storageKey, initialForm, locale]);

  useDraftAutosave(storageKey, form, {
    enabled: !submitting,
    onSaved: (t) => setLastSavedAt(t),
  });

  function applyDraft() {
    if (!draftPrompt) return;
    setForm(draftPrompt.data);
    setDraftPrompt(null);
  }

  function discardDraft() {
    clearDraft(storageKey);
    setDraftPrompt(null);
  }

  // -----------------------------------------------------------------
  // Validation par étape
  // -----------------------------------------------------------------
  function runStepValidation(currentStep: StepId): Record<string, string> {
    const cvReady =
      form.documents.CV?.status === 'Reçu' && !!form.documents.CV?.file_path;
    const requiredExtraIds = (isPosting && job?.extra_questions ? job.extra_questions : [])
      .filter((q: ExtraQuestion) => q.required)
      .map((q) => q.id);

    const validInternationalWorkAuthorization =
      !isInternationalPosting ||
      INTERNATIONAL_WORK_AUTH.includes(
        form.work_authorization as (typeof INTERNATIONAL_WORK_AUTH)[number]
      );
    const stepInput = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      email: form.email,
      city_residence: form.city_residence,
      region_residence: form.region_residence,
      qualified_professions: form.qualified_professions,
      years_experience: form.years_experience,
      languages: form.languages,
      work_authorization: validInternationalWorkAuthorization ? form.work_authorization : '',
      start_availability: form.start_availability,
      shifts_accepted: form.shifts_accepted,
      region_choices: form.region_choices,
      cvReady,
      consent_data: form.consent_data,
      extra_answers: form.extra_answers,
      required_extra_question_ids: requiredExtraIds,
    };

    switch (currentStep) {
      case 'identity':
        return validateIdentityStep(stepInput, {
          locale,
          residenceKind: isInternationalPosting ? 'country' : 'region',
        });
      case 'work':
        return validateWorkStep(stepInput, mode, {
          locale,
          internationalWorkAuthorization: isInternationalPosting,
        });
      case 'availability':
        return validateAvailabilityStep(stepInput, mode, {
          locale,
          requireShifts: isPosting ? !isInternationalPosting && !job?.shift : true,
        });
      case 'documents':
        return validateDocumentsStep(stepInput, { locale });
      case 'review':
        return validateReviewStep(stepInput, { locale });
      default:
        return {};
    }
  }

  // -----------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------
  function goPrev() {
    const idx = stepIndex(step, stepOrder);
    if (idx <= 0) return;
    setSubmitError(null);
    setErrors({});
    setStep(stepOrder[idx - 1]);
    scrollToTop();
  }

  function goNext() {
    const idx = stepIndex(step, stepOrder);
    const stepErrors = runStepValidation(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      // focus sur le premier champ en erreur
      requestAnimationFrame(() => {
        const el = document.querySelector('[data-error="true"]') as HTMLElement | null;
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    if (step === 'review') {
      void handleSubmit();
      return;
    }
    if (idx < stepOrder.length - 1) {
      setStep(stepOrder[idx + 1]);
      scrollToTop();
    }
  }

  function scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // -----------------------------------------------------------------
  // Envoi final
  // -----------------------------------------------------------------
  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const documentList = buildDocumentList(form, job);
      const documentsForSubmission = isPosting
        ? documentList.filter((document) => document.type === 'CV')
        : documentList;
      const candidate = formToCandidate(initial, form);
      const syncedPreferenceSets = form.preference_sets.length > 0
        ? form.preference_sets.map((set, index) =>
            index === 0
              ? {
                  ...set,
                  professions: form.qualified_professions,
                  regions: form.region_choices,
                  departments: form.preferred_departments,
                  shifts: form.shifts_accepted,
                  start_date: form.start_availability || set.start_date || null,
                }
              : set
          )
        : [];

      const payload = {
        submission_type: mode,
        job_id: isPosting ? job?.id : null,
        candidate: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          preferred_contact: form.preferred_contact || null,
          best_contact_time: form.best_contact_time || null,
          city_residence: form.city_residence.trim() || null,
          region_residence: form.region_residence || null,
          postal_code: form.postal_code.trim() || null,
          profession: form.profession || null,
          qualified_professions: form.qualified_professions,
          work_authorization: form.work_authorization || null,
          languages: form.languages,
          consent_data: form.consent_data,
          mailing_list_opt_in: form.mailing_list_opt_in,
        },
        answers: {
          preferred_contact: form.preferred_contact,
          best_contact_time: form.best_contact_time,
          languages: form.languages,
          work_authorization: form.work_authorization,
          city_residence: form.city_residence,
          region_residence: form.region_residence,
          postal_code: form.postal_code,
          profession: form.profession,
          qualified_professions: form.qualified_professions,
          years_experience: form.years_experience,
          permit_status: form.permit_status,
          permit_number: form.permit_number,
          mobility: form.mobility,
          start_availability: form.start_availability,
          preferred_hours: form.preferred_hours,
          exact_start_date: form.exact_start_date,
          shifts_accepted: form.shifts_accepted,
          weekend_two_in_one: form.weekend_two_in_one,
          region_choices: form.region_choices,
          preferred_establishments: form.preferred_establishments,
          avoided_establishments: form.avoided_establishments,
          preferred_departments: form.preferred_departments,
          preference_sets: syncedPreferenceSets,
          preference_set_id: syncedPreferenceSets[0]?.id || null,
          housing_required: form.housing_required,
          transport_available: form.transport_available,
          similar_mandates: form.similar_mandates,
          salary_expectations: form.salary_expectations,
          constraints: form.constraints,
          recruiter_comment: form.recruiter_comment,
          extra_answers: form.extra_answers,
          tracking: trackingRef.current || undefined,
          interview_slots: form.interview_slots.filter((s) => !!s),
        },
        completion_score: computeQuickCompletionScore(form),
        source: 'web',
        documents: documentsForSubmission.map((document) => ({
          document_id: form.documents[document.type]?.document_id || null,
          document_type: document.type,
          status: form.documents[document.type]?.status || 'À recevoir',
          file_path: form.documents[document.type]?.file_path || null,
          file_name: form.documents[document.type]?.file_name || null,
        })),
      };

      // anti-warning : `candidate` est calculé pour cohérence d'audit ATS interne.
      void candidate;

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(
          json.error ||
            (locale === 'en'
              ? 'Unable to save the application.'
              : "Impossible d'enregistrer la candidature.")
        );
      }
      clearDraft(storageKey);
      const thanksParams = new URLSearchParams({ type: mode });
      if (json.application_id) thanksParams.set('application_id', String(json.application_id));
      router.push(`${localizedPath(locale, 'thanks')}?${thanksParams.toString()}`);
    } catch (e: unknown) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : locale === 'en'
            ? 'Unknown error.'
            : 'Erreur inconnue.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  // -----------------------------------------------------------------
  // Raccourci : profil entièrement complet en mode posting → jump direct
  // -----------------------------------------------------------------
  const canJumpToReview = useMemo(() => {
    if (!isPosting) return false;
    if (step !== 'identity') return false;
    const steps = stepOrder.filter((s) => s !== 'review');
    for (const s of steps) {
      if (Object.keys(runStepValidation(s)).length > 0) return false;
    }
    return true;
    // runStepValidation dépend de form, donc on observe form indirectement
    // via la closure ; ESLint exhaustive-deps n'aime pas, on l'ignore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isPosting, step, job, stepOrder]);

  function jumpToReview() {
    setErrors({});
    setStep('review');
    scrollToTop();
  }

  // -----------------------------------------------------------------
  // Rendu
  // -----------------------------------------------------------------
  const stepProps: StepProps = {
    form,
    setForm,
    errors,
    mode,
    job,
    locale,
    reusedDocTypes,
    canJumpToReview,
    onJumpToReview: jumpToReview,
  };
  const titles = useMemo(() => {
    const base = locale === 'en' ? STEP_TITLES_EN : STEP_TITLES_FR;
    if (isPosting) {
      return locale === 'en'
        ? {
            identity: 'Contact',
            documents: 'Resume required',
            work: 'Eligibility',
            availability: 'Availability',
            review: 'Send',
          }
        : {
            identity: 'Contact',
            documents: 'CV requis',
            work: 'Admissibilité',
            availability: 'Disponibilité',
            review: 'Envoyer',
          };
    }
    return {
      ...base,
      documents: base.documents,
    };
  }, [isPosting, locale]);
  const isLastStep = step === 'review';
  const jobLabel = isPosting && job ? job.title : null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <WizardHeader
        currentStep={step}
        totalSteps={stepOrder.length}
        stepTitle={titles[step]}
        jobLabel={jobLabel}
        onBack={goPrev}
        canGoBack={stepIndex(step, stepOrder) > 0}
        locale={locale}
        savedAt={lastSavedAt}
        stepOrder={stepOrder}
      />

      <div className="flex-1 px-4 sm:px-6 py-6">
        <div className="mx-auto max-w-2xl">
          {draftPrompt && (
            <ResumeDraftBanner
              ageLabel={draftPrompt.ageLabel}
              onResume={applyDraft}
              onDiscard={discardDraft}
              locale={locale}
            />
          )}

          {step === 'identity' && <StepIdentity {...stepProps} />}
          {step === 'work' && <StepWork {...stepProps} />}
          {step === 'availability' && <StepAvailability {...stepProps} />}
          {step === 'documents' && <StepDocuments {...stepProps} />}
          {step === 'review' && <StepReview {...stepProps} />}

          {submitError && (
            <div className="mt-5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-[14px] text-danger">
              {submitError}
            </div>
          )}
        </div>
      </div>

      <WizardFooter
        onPrev={goPrev}
        onNext={goNext}
        canPrev={stepIndex(step, stepOrder) > 0}
        nextLabel={getWizardNextLabel(step, isPosting, locale)}
        loading={submitting}
        isLastStep={isLastStep}
        locale={locale}
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// Helpers locaux
// ---------------------------------------------------------------------

function draftFillScore(form: FormState): number {
  let score = 0;
  if (form.first_name) score++;
  if (form.last_name) score++;
  if (form.phone || form.email) score++;
  if (form.city_residence) score++;
  if (form.region_residence) score++;
  if (form.qualified_professions.length > 0) score++;
  if (form.years_experience) score++;
  if (form.languages.length > 0) score++;
  if (form.work_authorization) score++;
  if (form.start_availability) score++;
  if (form.shifts_accepted.length > 0) score++;
  if (form.region_choices.some((r) => r.region)) score++;
  if (form.documents.CV?.status === 'Reçu') score++;
  if (form.consent_data) score++;
  if (form.interview_slots.filter(Boolean).length > 0) score++;
  return score;
}

function computeQuickCompletionScore(form: FormState): number {
  // Pondération simple pour `completion_score` côté DB (0-100).
  const checks: Array<[boolean, number]> = [
    [!!(form.first_name && form.last_name && (form.phone || form.email)), 15],
    [!!(form.city_residence && form.region_residence), 10],
    [form.qualified_professions.length > 0 || !!form.profession, 10],
    [!!form.start_availability && form.shifts_accepted.length > 0, 15],
    [form.region_choices.some((r) => r.region) || !!form.region_residence, 10],
    [!!form.years_experience, 10],
    [form.documents.CV?.status === 'Reçu' && !!form.documents.CV?.file_path, 15],
    [form.consent_data, 10],
    [!!form.work_authorization, 5],
  ];
  let total = 0;
  for (const [ok, weight] of checks) if (ok) total += weight;
  return Math.min(100, total);
}

function getWizardNextLabel(step: StepId, isPosting: boolean, locale: Locale): string {
  const en = locale === 'en';
  if (step === 'review') return en ? 'Send my application' : 'Envoyer ma candidature';

  if (isPosting) {
    switch (step) {
      case 'identity':
        return en ? 'Add my resume' : 'Ajouter mon CV';
      case 'documents':
        return en ? 'Confirm eligibility' : 'Valider mon admissibilité';
      case 'work':
        return en ? 'Share availability' : 'Indiquer mes disponibilités';
      case 'availability':
        return en ? 'Review and send' : 'Vérifier et envoyer';
      default:
        return en ? 'Next' : 'Suivant';
    }
  }

  switch (step) {
    case 'identity':
      return en ? 'Describe my work' : 'Décrire mon métier';
    case 'work':
      return en ? 'Add my resume' : 'Ajouter mon CV';
    case 'documents':
      return en ? 'Set preferences' : 'Choisir mes préférences';
    case 'availability':
      return en ? 'Review and send' : 'Vérifier et envoyer';
    default:
      return en ? 'Next' : 'Suivant';
  }
}
