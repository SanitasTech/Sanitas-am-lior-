import { redirect } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (!session) {
    redirect('/admin/login');
  }
  return <AdminLayout userEmail={session.user.email || null}>{children}</AdminLayout>;
}
