'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/candidats', label: 'Candidats' },
  { href: '/admin/applications', label: 'Pipeline' },
  { href: '/admin/recherche-mandat', label: 'Recherche mandat' },
  { href: '/admin/postes', label: 'Postes' },
  { href: '/admin/taches', label: 'Tâches' },
  { href: '/admin/demandes', label: 'Demandes' },
];

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(href + '/');
}

export default function AdminLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden lg:flex min-h-screen flex-col border-r border-border bg-surface">
        <div className="px-5 py-5 border-b border-border">
          <Link href="/admin" className="text-[16px] font-semibold tracking-tight text-fg">
            Sanitas <span className="text-fg-subtle">ATS</span>
          </Link>
          <p className="mt-1 text-[12.5px] text-fg-muted">Recrutement opérationnel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-[14px] transition-colors',
                  active ? 'bg-fg text-bg' : 'text-fg-muted hover:bg-muted hover:text-fg'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          {userEmail && <p className="truncate text-[12.5px] text-fg-muted">{userEmail}</p>}
          <a href="/auth/signout?redirect=/admin/login" className="btn-secondary btn-sm mt-3 w-full">
            Déconnexion
          </a>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/admin" className="lg:hidden text-[15px] font-semibold text-fg">
              Sanitas ATS
            </Link>
            <nav className="hidden md:flex lg:hidden items-center gap-1 overflow-x-auto">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'whitespace-nowrap rounded-full px-3 py-1.5 text-[13px]',
                      active ? 'bg-fg text-bg' : 'text-fg-muted hover:bg-muted'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              {userEmail && <span className="hidden sm:block text-[13px] text-fg-muted">{userEmail}</span>}
              <a href="/auth/signout?redirect=/admin/login" className="btn-secondary btn-sm">
                Déconnexion
              </a>
            </div>
          </div>
          <div className="md:hidden border-t border-border px-3 py-2 flex gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-[13px]',
                    active ? 'bg-fg text-bg' : 'text-fg-muted'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
