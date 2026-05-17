import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';

// Police serif italique pour les accents typographiques du hero.
const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic', 'normal'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Agence Sanitas | Placement en santé au Québec',
    template: '%s | Agence Sanitas',
  },
  description:
    'Agence de placement en santé basée à Laval. Mandats adaptés pour les professionnels de la santé et soutien aux établissements partout au Québec.',
  openGraph: {
    title: 'Agence Sanitas',
    description:
      'Agence de placement en santé. Des mandats adaptés aux professionnels, un soutien fiable aux établissements.',
    locale: 'fr_CA',
    type: 'website',
    siteName: 'Agence Sanitas',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={playfair.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
