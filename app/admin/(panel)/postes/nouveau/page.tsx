import type { Metadata } from 'next';
import JobForm from '@/components/JobForm';
import type { Job } from '@/types';

export const metadata: Metadata = { title: 'Nouveau poste', robots: { index: false, follow: false } };

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(sp: Props['searchParams'], key: string) {
  const value = sp[key];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default function NewJobPage({ searchParams }: Props) {
  const initial: Partial<Job> = {
    title: param(searchParams, 'title'),
    profession: param(searchParams, 'profession'),
    job_title_id: param(searchParams, 'job_title_id') || null,
    region: param(searchParams, 'region'),
    city: param(searchParams, 'city') || null,
    establishment: param(searchParams, 'establishment') || null,
    department: param(searchParams, 'department') || null,
    shift: param(searchParams, 'shift') || null,
    schedule: param(searchParams, 'schedule') || null,
    mandate_type: param(searchParams, 'mandate_type') || null,
    start_date: param(searchParams, 'start_date') || null,
    duration: param(searchParams, 'duration') || null,
    salary: param(searchParams, 'salary') || null,
    urgency: (param(searchParams, 'urgency') as Job['urgency']) || 'normal',
    required_documents: Array.isArray(searchParams.required_documents)
      ? searchParams.required_documents
      : searchParams.required_documents
        ? [searchParams.required_documents]
        : [],
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-md text-fg">Creer un poste</h1>
        <p className="mt-2 text-fg-muted">
          Renseignez les informations principales. Vous pouvez sauvegarder en brouillon avant de publier.
        </p>
      </header>
      <JobForm mode="create" initial={initial} />
    </div>
  );
}
