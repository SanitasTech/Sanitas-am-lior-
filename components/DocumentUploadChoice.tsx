'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DocumentUploadChoiceProps {
  documentType: string;
  required?: boolean;
  requestedByPosting?: boolean;
  value?: { document_id?: string | null; status: string; file_name?: string | null; file_path?: string | null };
  onChange: (next: { document_id?: string | null; status: string; file_name?: string | null; file_path?: string | null }) => void;
}

/**
 * Mode MVP : on enregistre le statut (Reçu / À recevoir).
 * L'upload effectif passe par /api/documents avec multipart. Pour rester simple
 * et fiable dans la première version, on stocke le nom du fichier choisi côté
 * client ; le file_path est rempli après upload réussi.
 */
export default function DocumentUploadChoice({
  documentType,
  required = false,
  requestedByPosting = false,
  value,
  onChange,
}: DocumentUploadChoiceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = value || { status: 'À recevoir' };

  async function handleFile(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 8 Mo).');
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
        throw new Error(json.error || 'Échec du téléversement.');
      }
      onChange({
        document_id: json.document_id || null,
        status: 'Reçu',
        file_name: file.name,
        file_path: json.file_path || null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur de téléversement.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  function markLater() {
    onChange({ document_id: null, status: 'À recevoir', file_name: null, file_path: null });
  }

  return (
    <div className={cn('rounded-xl border bg-surface p-4', current.status === 'Reçu' ? 'border-success/40' : 'border-border')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14.5px] font-medium text-fg">
            {documentType}
            {required && <span className="ml-1 text-danger">*</span>}
          </p>
          {requestedByPosting && (
            <span className="mt-1 inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] font-medium text-accent">
              Demandé pour ce mandat
            </span>
          )}
        </div>
        {current.status === 'Reçu' && (
          <span className="inline-flex items-center rounded-full bg-success-soft px-2.5 py-0.5 text-[12px] font-medium text-success">
            Reçu
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
          {uploading ? 'Téléversement…' : current.status === 'Reçu' ? 'Remplacer' : 'Glisser-déposer ou cliquer'}
        </button>
        {!required && current.status !== 'Reçu' && (
          <button type="button" onClick={markLater} className="btn-ghost btn-sm">
            Je l'enverrai plus tard
          </button>
        )}
        {current.file_name && (
          <span className="text-[13px] text-fg-muted truncate">{current.file_name}</span>
        )}
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
