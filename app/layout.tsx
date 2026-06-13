import type { Metadata } from 'next';
import AnalyticsClickTracker from '@/components/AnalyticsClickTracker';
import GoogleAdsTag from '@/components/GoogleAdsTag';
import { Playfair_Display } from 'next/font/google';
import SeoJsonLd from '@/components/SeoJsonLd';
import { SITE_URL, organizationJsonLd, websiteJsonLd } from '@/lib/seo';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['italic', 'normal'],
  weight: ['400', '500', '600'],
  variable: '--font-serif',
  display: 'swap',
});

const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const socialImage = '/opengraph-image';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Agence Sanitas',
  category: 'Healthcare recruitment',
  title: {
    default: 'Agence Sanitas | Placement en sant\u00e9 au Qu\u00e9bec',
    template: '%s | Agence Sanitas',
  },
  description:
    'Agence infirmi\u00e8re bas\u00e9e \u00e0 Laval. Mandats infirmiers au Qu\u00e9bec pour infirmi\u00e8res autoris\u00e9es, infirmiers autoris\u00e9s, techniciennes et cliniciennes.',
  keywords: [
    'agence infirmi\u00e8re Qu\u00e9bec',
    'agence infirmiere quebec',
    'agence de placement infirmier Qu\u00e9bec',
    'placement infirmier Qu\u00e9bec',
    'agence de placement sant\u00e9 Qu\u00e9bec',
    'mandats infirmiers Qu\u00e9bec',
    'emploi infirmi\u00e8re Qu\u00e9bec',
    'emploi infirmier Qu\u00e9bec',
    'infirmi\u00e8re autoris\u00e9e Qu\u00e9bec',
    'infirmi\u00e8re clinicienne Qu\u00e9bec',
    'infirmi\u00e8re OIIQ emploi',
    'mandat infirmi\u00e8re Baie-James',
    'mandat infirmi\u00e8re Grand Nord',
    'mandat infirmi\u00e8re Outaouais',
    'mandat infirmi\u00e8re Gasp\u00e9sie',
    'mandat infirmi\u00e8re Abitibi',
    'mandat infirmi\u00e8re C\u00f4te-Nord',
    'mandat infirmi\u00e8re Bas-Saint-Laurent',
    'mandat infirmi\u00e8re \u00celes-de-la-Madeleine',
    'emplois infirmi\u00e8res Qu\u00e9bec',
    'recrutement personnel sant\u00e9 Qu\u00e9bec',
    'healthcare staffing Quebec',
    'nursing agency jobs Quebec',
    'Agence Sanitas',
  ],
  openGraph: {
    title: 'Agence Sanitas',
    description:
      'Mandats infirmiers au Qu\u00e9bec pour infirmi\u00e8res autoris\u00e9es, techniciennes et cliniciennes. Choisissez vos r\u00e9gions, vos quarts et vos disponibilit\u00e9s.',
    url: SITE_URL,
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
    description: 'Mandats infirmiers au Qu\u00e9bec pour infirmi\u00e8res autoris\u00e9es, techniciennes et cliniciennes.',
    images: [socialImage],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/images/sanitas-favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/images/sanitas-apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  facebook: facebookAppId ? { appId: facebookAppId } : undefined,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-CA" className={playfair.variable}>
      <body className="min-h-screen antialiased">
        <GoogleAdsTag tagId={googleAdsId} analyticsId={googleAnalyticsId} />
        <AnalyticsClickTracker />
        <SeoJsonLd
          id="sanitas-global-schema"
          data={{
            '@context': 'https://schema.org',
            '@graph': [organizationJsonLd(), websiteJsonLd()],
          }}
        />
        {children}
      </body>
    </html>
  );
}
