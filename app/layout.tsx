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
const socialImage = '/opengraph-image';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Agence Sanitas | Placement en sante au Quebec',
    template: '%s | Agence Sanitas',
  },
  description:
    'Agence de placement en sante basee a Laval. Mandats adaptes pour les professionnels de la sante et soutien aux etablissements partout au Quebec.',
  openGraph: {
    title: 'Agence Sanitas',
    description:
      'Mandats en sante au Quebec. Choisissez vos regions, vos quarts et le type de mandat qui vous convient.',
    locale: 'fr_CA',
    type: 'website',
    siteName: 'Agence Sanitas',
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: 'Agence Sanitas - Mandats en sante au Quebec',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agence Sanitas',
    description: 'Mandats en sante au Quebec pour les professionnels de la sante.',
    images: [socialImage],
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
