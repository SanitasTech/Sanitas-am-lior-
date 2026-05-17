// Layout minimal au niveau /admin pour permettre à /admin/login de ne pas
// hériter du check d'authentification. Les pages protégées sont dans
// app/admin/(panel)/* et utilisent (panel)/layout.tsx pour le check + chrome.

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
