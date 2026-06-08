/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'agencesanitas.com' }],
        destination: 'https://www.agencesanitas.com/:path*',
        permanent: true,
      },
      { source: '/home', destination: '/', permanent: true },
      { source: '/accueil', destination: '/', permanent: true },
      { source: '/jobs', destination: '/postes', permanent: true },
      { source: '/job-opportunities', destination: '/postes', permanent: true },
      { source: '/careers', destination: '/postes', permanent: true },
      { source: '/emplois', destination: '/postes', permanent: true },
      { source: '/emploi', destination: '/postes', permanent: true },
      { source: '/apply', destination: '/postuler', permanent: true },
      { source: '/about', destination: '/a-propos', permanent: true },
      { source: '/agence-sanitas', destination: '/a-propos', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/nous-contacter', destination: '/contact', permanent: true },
      { source: '/facilities', destination: '/etablissements', permanent: true },
      { source: '/employeurs', destination: '/etablissements', permanent: true },
      { source: '/services', destination: '/recrutement-personnel-sante-quebec', permanent: true },
      { source: '/prime-de-reference', destination: '/emplois-infirmieres-quebec', permanent: true },
      { source: '/agence-infirmiere', destination: '/agence-infirmiere-quebec', permanent: true },
      { source: '/agence-placement-infirmier-quebec', destination: '/agence-infirmiere-quebec', permanent: true },
      { source: '/agence-placement-infirmiere-quebec', destination: '/agence-infirmiere-quebec', permanent: true },
      { source: '/placement-infirmier-quebec', destination: '/agence-infirmiere-quebec', permanent: true },
      { source: '/mandats-infirmiers-regions-eloignees', destination: '/mandats-infirmiers-region-eloignee', permanent: true },
      { source: '/regions-eloignees', destination: '/mandats-infirmiers-region-eloignee', permanent: true },
      { source: '/privacy-policy', destination: '/politique-confidentialite', permanent: true },
    ];
  },
  async headers() {
    const privateSources = [
      '/admin/:path*',
      '/api/:path*',
      '/auth/:path*',
    ];
    const flowSources = [
      '/connexion',
      '/en/login',
      '/mon-profil',
      '/mes-documents',
      '/mes-candidatures',
      '/en/my-profile',
      '/en/my-documents',
      '/en/my-applications',
      '/postuler',
      '/en/apply',
      '/merci',
      '/en/thank-you',
    ];

    return [
      ...privateSources.map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }],
      })),
      ...flowSources.map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      })),
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    staleTimes: {
      dynamic: 0,
      static: 300,
    },
  },
};

module.exports = nextConfig;
