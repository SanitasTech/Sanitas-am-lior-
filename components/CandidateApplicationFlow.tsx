// =====================================================================
// Agence Sanitas - Point d'entrée du parcours candidat
// =====================================================================
//
// Ce composant est désormais un wrapper mince autour de CandidateWizard.
// Toute la logique vit dans `components/candidate/*` :
//   - form-state.ts     : types FormState + helpers réutilisables
//   - WizardShell.tsx   : Header sticky, Footer sticky, Field, ResumeBanner
//   - WizardSteps.tsx   : les 5 étapes (Identity, Work, Availability,
//                          Documents, Review)
//   - CandidateWizard.tsx : orchestrateur (navigation, validation,
//                            sauvegarde auto, envoi)
//
// L'API publique (props) reste compatible avec `app/postuler/page.tsx`.

'use client';

import CandidateWizard from './candidate/CandidateWizard';
import type { Locale } from '@/lib/i18n';
import type { Candidate, DocumentRecord, Job } from '@/types';

type Mode = 'posting' | 'spontaneous';

interface CandidateApplicationFlowProps {
  mode: Mode;
  job?: Job | null;
  initial: Candidate;
  initialDocuments?: Record<
    string,
    Pick<DocumentRecord, 'id' | 'status' | 'file_name' | 'file_path'>
  >;
  locale?: Locale;
}

export default function CandidateApplicationFlow(props: CandidateApplicationFlowProps) {
  return <CandidateWizard {...props} />;
}
