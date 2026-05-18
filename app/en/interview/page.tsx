import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Apply online',
  description: 'Complete your Agence Sanitas candidate file.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { mandat_id?: string };
}

export default function EnglishInterviewPage({ searchParams }: Props) {
  const params = new URLSearchParams();
  if (searchParams.mandat_id) params.set('mandat_id', searchParams.mandat_id);
  redirect(`/en/apply${params.toString() ? `?${params.toString()}` : ''}`);
}
