// =====================================================================
// Agence Sanitas - Coquille du wizard candidat (sticky header + footer)
// =====================================================================

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n';
import type { StepId } from './form-state';

// ---------------------------------------------------------------------
// SavedIndicator — petit témoin « Brouillon enregistré il y a X »
// ---------------------------------------------------------------------

function SavedIndicator({ savedAt, locale }: { savedAt: number; locale: Locale }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000); // tick toutes les 15s
    return () => clearInterval(t);
  }, []);
  const diffSec = Math.max(0, Math.floor((now - savedAt) / 1000));
  const en = locale === 'en';
  let label: string;
  if (diffSec < 5) label = en ? 'Saved just now' : 'Enregistré à l’instant';
  else if (diffSec < 60) label = en ? `Saved ${diffSec}s ago` : `Enregistré il y a ${diffSec}s`;
  else {
    const min = Math.floor(diffSec / 60);
    label = en ? `Saved ${min} min ago` : `Enregistré il y a ${min} min`;
  }
  return (
    <p className="mt-1 inline-flex items-center justify-center gap-1 text-center w-full text-[11.5px] text-success/80">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </p>
  );
}

// ---------------------------------------------------------------------
// Header sticky avec progress bar + numéro d'étape
// ---------------------------------------------------------------------

const STEP_LABELS: Record<StepId, { fr: string; en: string }> = {
  identity: { fr: 'Toi', en: 'You' },
  work: { fr: 'Ton métier', en: 'Your work' },
  availability: { fr: 'Tes disponibilités', en: 'Your availability' },
  documents: { fr: 'CV requis', en: 'Resume required' },
  review: { fr: 'Confirmer', en: 'Confirm' },
};

export function WizardHeader({
  currentStep,
  totalSteps,
  stepTitle,
  jobLabel,
  onBack,
  canGoBack,
  locale,
  savedAt,
  stepOrder,
}: {
  currentStep: StepId;
  totalSteps: number;
  stepTitle: string;
  jobLabel?: string | null;
  onBack: () => void;
  canGoBack: boolean;
  locale: Locale;
  savedAt?: number | null;
  stepOrder: StepId[];
}) {
  const index = stepOrder.indexOf(currentStep);
  const percent = Math.round(((index + 1) / totalSteps) * 100);
  const en = locale === 'en';

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:mx-0 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label={en ? 'Previous step' : 'Étape précédente'}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors',
              canGoBack ? 'text-fg hover:bg-muted' : 'text-fg-subtle opacity-40 cursor-not-allowed'
            )}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-1 min-w-0 text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle">
              {en ? `Step ${index + 1} of ${totalSteps}` : `Étape ${index + 1} sur ${totalSteps}`}
            </p>
            <h2 className="text-[15px] font-semibold text-fg truncate" title={stepTitle}>
              {stepTitle}
            </h2>
          </div>

          <div className="w-9 shrink-0 text-right text-[12px] font-semibold tabular-nums text-fg-muted">
            {percent}%
          </div>
        </div>

        {jobLabel && (
          <p className="mt-1.5 truncate text-center text-[12px] text-fg-muted" title={jobLabel}>
            {jobLabel}
          </p>
        )}

        {savedAt ? <SavedIndicator savedAt={savedAt} locale={locale} /> : null}

        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={STEP_LABELS[currentStep][locale]}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Footer sticky avec Précédent / Suivant
// ---------------------------------------------------------------------

export function WizardFooter({
  onPrev,
  onNext,
  canPrev,
  nextLabel,
  nextDisabled,
  loading,
  isLastStep,
  locale,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  isLastStep?: boolean;
  locale: Locale;
}) {
  const en = locale === 'en';
  return (
    <div
      className="sticky bottom-0 z-30 -mx-4 sm:mx-0 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85 pb-[max(env(safe-area-inset-bottom),0px)]"
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev || loading}
          className={cn(
            'btn-ghost btn-sm',
            (!canPrev || loading) && 'opacity-40 cursor-not-allowed'
          )}
        >
          {en ? 'Previous' : 'Précédent'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || loading}
          className={cn(
            'btn-primary',
            isLastStep ? 'min-w-[180px]' : 'min-w-[140px]'
          )}
        >
          {loading
            ? en
              ? 'Sending…'
              : 'Envoi…'
            : nextLabel ||
              (isLastStep
                ? en
                  ? 'Send my application'
                  : 'Envoyer'
                : en
                  ? 'Next'
                  : 'Suivant')}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Field — wrapper label + helper + erreur
// ---------------------------------------------------------------------

export function Field({
  label,
  required,
  helper,
  error,
  children,
  htmlFor,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {helper && !error && <p className="helper mt-1.5">{helper}</p>}
      {error && (
        <p className="error-text mt-1.5" data-error="true">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// ResumeDraftBanner — proposé au chargement si un brouillon récent existe
// ---------------------------------------------------------------------

export function ResumeDraftBanner({
  ageLabel,
  onResume,
  onDiscard,
  locale,
}: {
  ageLabel: string;
  onResume: () => void;
  onDiscard: () => void;
  locale: Locale;
}) {
  const en = locale === 'en';
  return (
    <div className="rounded-xl border border-accent/40 bg-accent-soft/50 px-4 py-3.5 mb-5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[14.5px] font-medium text-fg">
            {en ? 'Resume where you left off?' : 'Reprendre où tu t’étais arrêté(e) ?'}
          </p>
          <p className="text-[12.5px] text-fg-muted">
            {en ? `Saved ${ageLabel}` : `Enregistré ${ageLabel}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onResume} className="btn-primary btn-sm">
            {en ? 'Resume' : 'Reprendre'}
          </button>
          <button type="button" onClick={onDiscard} className="btn-ghost btn-sm">
            {en ? 'Start over' : 'Recommencer'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// StepIntro — petit chapeau réutilisable au début de chaque étape
// ---------------------------------------------------------------------

export function StepIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && (
        <p className="text-[12.5px] font-semibold uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-[22px] sm:text-[26px] font-semibold tracking-tight text-fg">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted max-w-prose">
          {description}
        </p>
      )}
    </div>
  );
}
