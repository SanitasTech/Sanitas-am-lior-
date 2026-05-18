import Header from './Header';
import Footer from './Footer';
import { I18nProvider } from './I18nProvider';
import { getCurrentCandidate, getCurrentUser } from '@/lib/auth';
import type { Locale } from '@/lib/i18n';

export default async function PublicLayout({
  children,
  locale = 'fr',
}: {
  children: React.ReactNode;
  locale?: Locale;
}) {
  const user = await getCurrentUser();
  const candidate = user ? await getCurrentCandidate() : null;
  const initialUser = user
    ? {
        id: user.id,
        email: user.email || null,
        firstName: candidate?.first_name,
        lastName: candidate?.last_name,
      }
    : null;

  return (
    <I18nProvider locale={locale}>
      <div className="flex min-h-screen flex-col">
        <Header initialUser={initialUser} locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
      </div>
    </I18nProvider>
  );
}
