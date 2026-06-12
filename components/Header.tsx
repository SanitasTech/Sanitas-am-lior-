'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn, initials } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { PUBLIC_COPY, ROUTES, alternateLocaleHref, localizeHref, type Locale } from '@/lib/i18n';

interface UserState {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

interface HeaderProps {
  initialUser?: UserState | null;
  locale?: Locale;
}

export default function Header({ initialUser = null, locale = 'fr' }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserState | null>(initialUser);
  const [userMenu, setUserMenu] = useState(false);
  const copy = PUBLIC_COPY[locale];
  const nav = [
    { href: '/postes', label: copy.nav.jobs },
    { href: '/etablissements', label: copy.nav.facilities },
    { href: '/a-propos', label: copy.nav.about },
    { href: '/contact', label: copy.nav.contact },
  ];
  const query = searchParams.toString();
  const currentHref = `${pathname}${query ? `?${query}` : ''}`;
  const signOutHref = `/auth/signout?redirect=${encodeURIComponent(ROUTES.home[locale])}`;

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
          href={ROUTES.home[locale]}
          className="inline-flex h-9 shrink-0 items-center text-[20px] font-bold uppercase leading-none tracking-[0.11em] text-fg transition-opacity hover:opacity-80 sm:text-[21px]"
          style={{
            fontFamily:
              'Gotham, "Gotham SSm", "Avenir Next", Montserrat, "SF Pro Display", "Segoe UI", sans-serif',
          }}
          aria-label={copy.nav.homeAria}
        >
          SANITAS
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={copy.nav.primary}>
          {nav.map((item) => {
            const href = localizeHref(locale, item.href);
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-[14.5px] transition-colors',
                  active ? 'bg-muted font-medium text-fg' : 'text-fg-muted hover:bg-muted/60 hover:text-fg'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitch currentHref={currentHref} locale={locale} />
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
                  {user.firstName || copy.nav.candidateSpace}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-fg-muted">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface shadow-card p-1.5">
                  <Link href={ROUTES.profile[locale]} onClick={() => setUserMenu(false)} className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    {copy.nav.profile}
                  </Link>
                  <Link href={ROUTES.applications[locale]} onClick={() => setUserMenu(false)} className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    {copy.nav.applications}
                  </Link>
                  <Link href={ROUTES.documents[locale]} onClick={() => setUserMenu(false)} className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    {copy.nav.documents}
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <a href={signOutHref} className="block rounded-lg px-3 py-2 text-[14px] text-fg hover:bg-muted">
                    {copy.nav.signOut}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Link href={ROUTES.login[locale]} className="btn-ghost btn-sm">
              {copy.nav.login}
            </Link>
          )}
          <Link href={ROUTES.facilities[locale]} className="btn-secondary btn-sm">
            {copy.nav.staffing}
          </Link>
          <Link href={ROUTES.jobs[locale]} className="btn-primary btn-sm">
            {copy.nav.viewJobs}
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? copy.nav.closeMenu : copy.nav.openMenu}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="lg:hidden rounded-full border border-border bg-surface p-2 text-fg"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6 L18 18 M6 18 L18 6" /> : <path d="M4 7 H20 M4 12 H20 M4 17 H20" />}
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-bg">
          <div className="container-page py-3 flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={localizeHref(locale, item.href)}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] text-fg hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-border">
              <div className="flex">
                <LanguageSwitch currentHref={currentHref} locale={locale} />
              </div>
              {user ? (
                <>
                  <Link href={ROUTES.profile[locale]} onClick={() => setOpen(false)} className="btn-secondary">{copy.nav.profile}</Link>
                  <Link href={ROUTES.applications[locale]} onClick={() => setOpen(false)} className="btn-ghost">{copy.nav.applications}</Link>
                  <Link href={ROUTES.documents[locale]} onClick={() => setOpen(false)} className="btn-ghost">{copy.nav.documents}</Link>
                  <a href={signOutHref} className="btn-ghost">{copy.nav.signOut}</a>
                </>
              ) : (
                <Link href={ROUTES.login[locale]} onClick={() => setOpen(false)} className="btn-secondary">{copy.nav.login}</Link>
              )}
              <Link href={ROUTES.jobs[locale]} className="btn-primary" onClick={() => setOpen(false)}>
                {copy.nav.viewJobs}
              </Link>
              <Link href={ROUTES.facilities[locale]} className="btn-secondary" onClick={() => setOpen(false)}>
                {copy.nav.staffing}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageSwitch({ currentHref, locale }: { currentHref: string; locale: Locale }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-surface p-0.5 text-[12.5px] font-medium">
      {(['fr', 'en'] as Locale[]).map((target) => (
        <Link
          key={target}
          href={alternateLocaleHref(currentHref, target)}
          className={cn(
            'rounded-full px-2.5 py-1 transition-colors',
            locale === target ? 'bg-fg text-bg' : 'text-fg-muted hover:text-fg'
          )}
          aria-current={locale === target ? 'page' : undefined}
        >
          {target.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
