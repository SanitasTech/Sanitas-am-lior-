import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Postuler en ligne',
  description: 'Complétez votre dossier candidat Agence Sanitas.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { mandat_id?: string };
}

export default function EntrevuePage({ searchParams }: Props) {
  const params = new URLSearchParams();
  if (searchParams.mandat_id) params.set('mandat_id', searchParams.mandat_id);
  redirect(`/postuler${params.toString() ? `?${params.toString()}` : ''}`);
}
