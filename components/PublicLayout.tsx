import Header from './Header';
import Footer from './Footer';
import { getCurrentCandidate } from '@/lib/auth';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const candidate = await getCurrentCandidate();
  const initialUser = candidate?.auth_user_id
    ? {
        id: candidate.auth_user_id,
        email: candidate.email,
        firstName: candidate.first_name,
        lastName: candidate.last_name,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header initialUser={initialUser} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
