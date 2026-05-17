import type { Metadata } from 'next';
import JobForm from '@/components/JobForm';

export const metadata: Metadata = { title: 'Nouveau poste', robots: { index: false, follow: false } };

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-md text-fg">Créer un poste</h1>
        <p className="mt-2 text-fg-muted">
          Renseignez les informations principales. Vous pouvez sauvegarder en brouillon avant de publier.
        </p>
      </header>
      <JobForm mode="create" />
    </div>
  );
}
