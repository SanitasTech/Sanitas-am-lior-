'use client';

import { createContext, useContext } from 'react';
import type { Locale } from '@/lib/i18n';

const I18nContext = createContext<Locale>('fr');

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={locale}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(I18nContext);
}
