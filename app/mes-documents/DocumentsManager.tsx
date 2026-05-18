'use client';

import { useState } from 'react';
import DocumentUploadChoice from '@/components/DocumentUploadChoice';
import type { CandidateDocument } from '@/types';
import type { Locale } from '@/lib/i18n';
import { useLocale } from '@/components/I18nProvider';

interface Props {
  requiredDocuments: string[];
  initialDocuments: CandidateDocument[];
  locale?: Locale;
}

export default function DocumentsManager({ requiredDocuments, initialDocuments, locale: localeProp }: Props) {
  const contextLocale = useLocale();
  const locale = localeProp || contextLocale;
  const [documents, setDocuments] = useState<Record<string, CandidateDocument | undefined>>(() => {
    const byType: Record<string, CandidateDocument | undefined> = {};
    for (const doc of initialDocuments) {
      if (!byType[doc.document_type]) byType[doc.document_type] = doc;
    }
    return byType;
  });

  return (
    <div className="space-y-4">
      {requiredDocuments.map((type) => {
        const current = documents[type];
        return (
          <DocumentUploadChoice
            key={type}
            documentType={type}
            required={type === 'CV'}
            locale={locale}
            value={
              current
                ? {
                    document_id: current.id,
                    status: current.status,
                    file_name: current.file_name,
                    file_path: current.file_path,
                  }
                : undefined
            }
            onChange={(next) =>
              setDocuments((docs) => ({
                ...docs,
                [type]: {
                  id: next.document_id || `${type}-${Date.now()}`,
                  candidate_id: '',
                  document_type: type,
                  status: next.status as CandidateDocument['status'],
                  file_name: next.file_name || null,
                  file_path: next.file_path || null,
                  uploaded_at: new Date().toISOString(),
                  expires_at: null,
                  is_current: true,
                  archived_at: null,
                  metadata: {},
                  created_at: new Date().toISOString(),
                },
              }))
            }
          />
        );
      })}
    </div>
  );
}
