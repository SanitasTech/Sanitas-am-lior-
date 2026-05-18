// =====================================================================
// Agence Sanitas - Sauvegarde automatique du brouillon candidat
// =====================================================================
//
// Persiste l'état du formulaire candidat dans localStorage, avec debounce.
// Permet au candidat de quitter et reprendre sans perdre ses réponses.
// Les documents uploadés sont déjà persistés en base ; seul l'état des
// champs texte / sélections est concerné ici.

'use client';

import { useEffect, useRef } from 'react';

const PREFIX = 'sanitas:draft:';
const VERSION = 1;
// Au-delà de cette durée, on ignore le brouillon (jugé périmé).
const MAX_DRAFT_AGE_MS = 1000 * 60 * 60 * 24 * 14; // 14 jours

export type DraftMode = 'posting' | 'spontaneous';

export interface DraftKeyParams {
  candidateId: string;
  mode: DraftMode;
  jobId?: string | null;
}

export interface CandidateDraft<T> {
  data: T;
  savedAt: number;
  version: number;
}

export function draftKey({ candidateId, mode, jobId }: DraftKeyParams): string {
  const suffix = mode === 'posting' ? (jobId || 'unknown') : 'spontaneous';
  return `${PREFIX}${candidateId}:${mode}:${suffix}`;
}

export function loadDraft<T>(key: string): CandidateDraft<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CandidateDraft<T>;
    if (parsed.version !== VERSION) return null;
    if (typeof parsed.savedAt !== 'number') return null;
    if (Date.now() - parsed.savedAt > MAX_DRAFT_AGE_MS) {
      clearDraft(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CandidateDraft<T> = { data, savedAt: Date.now(), version: VERSION };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Quota dépassé ou stockage indisponible : on ignore silencieusement.
  }
}

export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Hook qui sauvegarde automatiquement `data` dans localStorage à chaque
 * modification, avec debounce. Skip la première frame (pour ne pas écrire
 * l'état initial chargé depuis le serveur).
 *
 * Le callback `onSaved` reçoit le timestamp à chaque écriture effective
 * (utile pour afficher « Brouillon enregistré il y a X sec » au candidat).
 */
export function useDraftAutosave<T>(
  key: string,
  data: T,
  options: { delayMs?: number; enabled?: boolean; onSaved?: (savedAt: number) => void } = {}
): void {
  const { delayMs = 800, enabled = true, onSaved } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRef = useRef(true);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    if (!enabled) return;
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveDraft(key, data);
      onSavedRef.current?.(Date.now());
    }, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, data, delayMs, enabled]);
}

/**
 * Formate l'horodatage du brouillon en libellé court relatif (pour le
 * bandeau « Reprendre où tu t'étais arrêté »).
 */
export function formatDraftAge(savedAt: number, locale: 'fr' | 'en' = 'fr'): string {
  const diffMs = Date.now() - savedAt;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (locale === 'en') {
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} h ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${days} jour${days > 1 ? 's' : ''}`;
}
