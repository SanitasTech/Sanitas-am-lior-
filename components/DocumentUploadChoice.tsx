'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { displayValue, type Locale } from '@/lib/i18n';
import { useLocale } from './I18nProvider';

interface DocumentUploadChoiceProps {
  documentType: string;
  required?: boolean;
  requestedByPosting?: boolean;
  /** Vrai si ce document provient d'une candidature précédente. */
  reused?: boolean;
  value?: { document_id?: string | null; status: string; file_name?: string | null; file_path?: string | null };
  onChange: (next: { document_id?: string | null; status: string; file_name?: string | null; file_path?: string | null }) => void;
  locale?: Locale;
}

export default function DocumentUploadChoice({
  documentType,
  required = false,
  requestedByPosting = false,
  reused = false,
  value,
  onChange,
  locale: localeProp,
}: DocumentUploadChoiceProps) {
  const contextLocale = useLocale();
  const locale = localeProp || contextLocale;
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracé localement : vrai si l'utilisateur a téléversé un nouveau fichier
  // pendant cette session (pour différencier d'un doc réutilisé du dossier).
  const [replacedThisSession, setReplacedThisSession] = useState(false);

  const current = value || { status: 'À recevoir' };
  const received = ['Reçu', 'Recu', 'ReÃ§u', 'ReÃƒÂ§u'].includes(current.status);
  const fromExistingFile = reused && received && !replacedThisSession;

  async function handleFile(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      setError(locale === 'en' ? 'File is too large (max 8 MB).' : 'Fichier trop volumineux (max 8 Mo).');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('document_type', documentType);
      const res = await fetch('/api/documents', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || (locale === 'en' ? 'Upload failed.' : 'Echec du televersement.'));
      }
      setReplacedThisSession(true);
      onChange({
        document_id: json.document_id || null,
        status: 'Reçu',
        file_name: file.name,
        file_path: json.file_path || null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : locale === 'en' ? 'Upload error.' : 'Erreur de televersement.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function markLater() {
    onChange({ document_id: null, status: 'À recevoir', file_name: null, file_path: null });
  }

  return (
    <div className={cn('rounded-xl border bg-surface p-4', received ? 'border-success/40' : 'border-border')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14.5px] font-medium text-fg">
            {displayValue(locale, documentType)}
            {required && <span className="ml-1 text-danger">*</span>}
          </p>
          {requestedByPosting && (
            <span className="mt-1 inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] font-medium text-accent">
              {locale === 'en' ? 'Requested for this assignment' : 'Demande pour ce mandat'}
            </span>
          )}
        </div>
        {received && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[12px] font-medium text-success">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m5 12 5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {fromExistingFile
              ? locale === 'en'
                ? 'From your file'
                : 'Déjà dans ton dossier'
              : locale === 'en'
                ? 'Received'
                : 'Reçu'}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary btn-sm"
        >
          {uploading
            ? locale === 'en'
              ? 'Uploading…'
              : 'Téléversement…'
            : received
              ? locale === 'en'
                ? 'Replace'
                : 'Remplacer'
              : locale === 'en'
                ? 'Choose file'
                : 'Choisir un fichier'}
        </button>
        {!required && !received && (
          <button
            type="button"
            onClick={markLater}
            className="btn-secondary btn-sm inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {locale === 'en' ? 'Send later' : 'Envoyer plus tard'}
          </button>
        )}
        {current.file_name && <span className="text-[13px] text-fg-muted truncate">{current.file_name}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
