import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic', 'normal'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const socialImage = '/opengraph-image';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Agence Sanitas | Placement en sant\u00e9 au Qu\u00e9bec',
    template: '%s | Agence Sanitas',
  },
  description:
    'Agence de placement en sant\u00e9 bas\u00e9e \u00e0 Laval. Mandats adapt\u00e9s pour les professionnels de la sant\u00e9 et soutien aux \u00e9tablissements partout au Qu\u00e9bec.',
  openGraph: {
    title: 'Agence Sanitas',
    description:
      'Mandats en sant\u00e9 au Qu\u00e9bec. Choisissez vos r\u00e9gions, vos quarts et le type de mandat qui vous convient.',
    url: siteUrl,
    locale: 'fr_CA',
    type: 'website',
    siteName: 'Agence Sanitas',
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'Agence Sanitas - Mandats en sant\u00e9 au Qu\u00e9bec',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agence Sanitas',
    description: 'Mandats en sant\u00e9 au Qu\u00e9bec pour les professionnels de la sant\u00e9.',
    images: [socialImage],
  },
  facebook: facebookAppId ? { appId: facebookAppId } : undefined,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={playfair.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
