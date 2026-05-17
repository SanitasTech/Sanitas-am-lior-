import type { Metadata } from 'next';
import LoginForm from './LoginForm';
import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Connexion recruteur',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  // Ne rediriger que si la personne est déjà reconnue comme admin
  // (sinon, on évite une boucle pour un user connecté sans profil admin).
  const session = await requireAdmin();
  if (session) redirect('/admin/candidats');

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-[15px] font-semibold tracking-tight text-fg">
            Agence Sanitas
          </a>
          <h1 className="mt-4 text-display-md text-fg">Espace recruteur</h1>
          <p className="mt-2 text-fg-muted">Connectez-vous pour accéder au tableau de bord.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
