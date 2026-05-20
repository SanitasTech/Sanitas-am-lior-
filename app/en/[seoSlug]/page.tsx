import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import SeoLandingPage from '@/components/SeoLandingPage';
import { getLocalSeoPage, getLocalSeoSlugs } from '@/lib/local-seo-pages';
import { breadcrumbJsonLd, publicPageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocalSeoSlugs('en').map((seoSlug) => ({ seoSlug }));
}

export function generateMetadata({ params }: { params: { seoSlug: string } }): Metadata {
  const page = getLocalSeoPage('en', params.seoSlug);
  if (!page) return {};
  const frSlug = getFrenchSlug(params.seoSlug);
  return publicPageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: `/en/${page.slug}`,
    locale: 'en',
    frPath: frSlug ? `/${frSlug}` : '/',
    enPath: `/en/${page.slug}`,
  });
}

export default function EnglishLocalSeoPage({ params }: { params: { seoSlug: string } }) {
  const page = getLocalSeoPage('en', params.seoSlug);
  if (!page) notFound();

  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id={`local-seo-${page.slug}`}
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbJsonLd([
              { name: 'Home', url: '/en' },
              { name: page.title, url: `/en/${page.slug}` },
            ]),
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
        relatedTitle="Useful links"
      />
    </PublicLayout>
  );
}

function getFrenchSlug(enSlug: string) {
  const frSlugs = getLocalSeoSlugs('fr');
  const enSlugs = getLocalSeoSlugs('en');
  const index = enSlugs.indexOf(enSlug);
  return index >= 0 ? frSlugs[index] : null;
}
