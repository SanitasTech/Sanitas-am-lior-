'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn, initials } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/postes', label: 'Postes' },
  { href: '/etablissements', label: 'Établissements' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];

interface UserState {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface HeaderProps {
  initialUser?: UserState | null;
}

export default function Header({ initialUser = null }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserState | null>(initialUser);
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let ignore = false;

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (ignore || !user) {
        if (!ignore) setUser(null);
        return;
      }
      // Récupérer first_name/last_name depuis candidates
      const { data: c } = await supabase
        .from('candidates')
        .select('first_name, last_name')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (ignore) return;
      setUser({
        id: user.id,
        email: user.email || null,
        firstName: c?.first_name || null,
        lastName: c?.last_name || null,
      });
    }

    loadUser();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadUser());
    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-tight text-fg hover:opacity-80"
          aria-label="Accueil Agence Sanitas"
        >
          Agence Sanitas
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-[14.5px] transition-colors',
                  active ? 'text-fg' : 'text-fg-muted hover:text-fg'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 hover:bg-muted"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-fg text-bg text-[12px] font-semibold">
                  {initials(user.firstName, user.lastName) || (user.email?.[0] || '?').toUpperCase()}
                </span>
                <span className="text-[14px] text-fg">
                  {user.firstName || 'Mon espace'}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-muted">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface shadow-card p-1.5">
                  <Link href="/mon-profil" onClick={() => setUserMenu(false)} className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    Mon profil
                  </Link>
                  <Link href="/mes-candidatures" onClick={() => setUserMenu(false)} className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    Mes candidatures
                  </Link>
                  <Link href="/mes-documents" onClick={() => setUserMenu(false)} className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    Mes documents
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <a href="/auth/signout" className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    Se déconnecter
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Link href="/connexion" className="btn-secondary btn-sm">
              Se connecter
            </Link>
          )}
          <Link href="/etablissements" className="btn-primary btn-sm">
            Demander du personnel
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="md:hidden rounded-full border border-border bg-surface p-2 text-fg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6 L18 18 M6 18 L18 6" /> : <path d="M4 7 H20 M4 12 H20 M4 17 H20" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-bg">
          <div className="container-page py-3 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] text-fg hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-border">
              {user ? (
                <>
                  <Link href="/mon-profil" onClick={() => setOpen(false)} className="btn-secondary">Mon profil</Link>
                  <Link href="/mes-candidatures" onClick={() => setOpen(false)} className="btn-ghost">Mes candidatures</Link>
                  <Link href="/mes-documents" onClick={() => setOpen(false)} className="btn-ghost">Mes documents</Link>
                  <a href="/auth/signout" className="btn-ghost">Se déconnecter</a>
                </>
              ) : (
                <Link href="/connexion" onClick={() => setOpen(false)} className="btn-secondary">Se connecter</Link>
              )}
              <Link href="/etablissements" className="btn-primary" onClick={() => setOpen(false)}>
                Demander du personnel
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
