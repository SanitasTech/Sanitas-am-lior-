import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import SeoLandingPage from '@/components/SeoLandingPage';
import { getLocalSeoPage, getLocalSeoSlugs } from '@/lib/local-seo-pages';
import { breadcrumbJsonLd, itemListJsonLd, publicPageMetadata, serviceJsonLd, webPageJsonLd } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocalSeoSlugs('fr').map((seoSlug) => ({ seoSlug }));
}

export function generateMetadata({ params }: { params: { seoSlug: string } }): Metadata {
  const page = getLocalSeoPage('fr', params.seoSlug);
  if (!page) return {};
  const enSlug = getEnglishSlug(params.seoSlug);
  return publicPageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/${page.slug}`,
    frPath: `/${page.slug}`,
    enPath: enSlug ? `/en/${enSlug}` : '/en',
  });
}

export default function LocalSeoPage({ params }: { params: { seoSlug: string } }) {
  const page = getLocalSeoPage('fr', params.seoSlug);
  if (!page) notFound();

  return (
    <PublicLayout>
      <SeoJsonLd
        id={`local-seo-${page.slug}`}
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            webPageJsonLd({
              name: page.title,
              description: page.metaDescription,
              url: `/${page.slug}`,
            }),
            serviceJsonLd({
              name: page.title,
              description: page.intro,
              url: `/${page.slug}`,
              serviceType: page.title.toLowerCase().includes('emploi') ? 'Healthcare job matching' : 'Healthcare staffing',
              audience: page.title.toLowerCase().includes('emploi') ? 'candidates' : 'facilities',
            }),
            breadcrumbJsonLd([
              { name: 'Accueil', url: '/' },
              { name: page.title, url: `/${page.slug}` },
            ]),
            itemListJsonLd(
              page.relatedLinks.map((link) => ({
                name: link.label,
                url: link.href,
              })),
            ),
          ],
        }}
      />
      <SeoLandingPage
        eyebrow={page.eyebrow}
        title={page.title}
        intro={page.intro}
        highlights={page.highlights}
        sections={page.sections}
        primaryCta={page.primaryCta}
        secondaryCta={page.secondaryCta}
        relatedLinks={page.relatedLinks}
      />
    </PublicLayout>
  );
}

function getEnglishSlug(frSlug: string) {
  const frSlugs = getLocalSeoSlugs('fr');
  const enSlugs = getLocalSeoSlugs('en');
  const index = frSlugs.indexOf(frSlug);
  return index >= 0 ? enSlugs[index] : null;
}
