import type { Metadata } from 'next';
import MandateSearchConsole from '@/components/admin/MandateSearchConsole';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Job, JobTitle } from '@/types';

export const metadata: Metadata = { title: 'Recherche mandat', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
}

function param(sp: Props['searchParams'], key: string) {
  const value = sp[key];
  return Array.isArray(value) ? value[0] || '' : value || '';
}

async function loadInitial(searchParams: Props['searchParams']) {
  const supabase = createSupabaseAdminClient();
  const jobId = param(searchParams, 'job_id');
  const [{ data: job }, { data: jobTitles }] = await Promise.all([
    jobId ? supabase.from('jobs').select('*').eq('id', jobId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from('job_titles').select('*').eq('active', true).order('title', { ascending: true }),
  ]);

  const queryInitial: Partial<Job> = {
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

  return {
    initial: (job as Job | null) || queryInitial,
    jobTitles: (jobTitles || []) as JobTitle[],
  };
}

export default async function MandateSearchPage({ searchParams }: Props) {
  const { initial, jobTitles } = await loadInitial(searchParams);
  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Recherche operationnelle</p>
          <h1 className="mt-1 text-display-md text-fg">Recherche mandat 360</h1>
          <p className="mt-2 max-w-prose text-fg-muted">
            Saisissez les criteres d un mandat recu par courriel et obtenez une liste actionnable: presenter, appeler, debloquer les documents ou ecarter.
          </p>
        </div>
      </header>
      <MandateSearchConsole initial={initial} jobTitles={jobTitles} />
    </div>
  );
}
