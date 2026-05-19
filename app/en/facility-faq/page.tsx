import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import FaqLandingPage, { type FaqGroup } from '@/components/FaqLandingPage';
import { breadcrumbJsonLd, faqPageJsonLd, publicPageMetadata } from '@/lib/seo';

const groups: FaqGroup[] = [
  {
    title: 'Requesting staff',
    items: [
      {
        question: 'What types of staffing needs can Sanitas receive?',
        answer:
          'Sanitas can receive urgent, occasional, recurring or planned staffing needs for healthcare professionals in Quebec.',
      },
      {
        question: 'What information should be provided for a mandate?',
        answer:
          'The most useful information includes profession, region, city, facility, department, shift, start date, duration, required documents and urgency level.',
      },
      {
        question: 'Does Sanitas cover multiple Quebec regions?',
        answer:
          'Yes. Sanitas is based in Laval and can process needs across several Quebec regions depending on active mandates and available profiles.',
      },
    ],
  },
  {
    title: 'Qualification and presentation',
    items: [
      {
        question: 'How are profiles prioritized?',
        answer:
          'Recruiters review profession, region, department, shift, availability, documents and candidate constraints before presenting a profile.',
      },
      {
        question: 'Are documents tracked?',
        answer:
          'Yes. Candidate files can track CVs, professional permits, CPR, PDSB, vaccination records and other documents required for a mandate.',
      },
      {
        question: 'How should an urgent need be communicated?',
        answer:
          'The facility form can be used to submit the need online. You can also call Sanitas at 450 973-9696 for a pressing need.',
      },
    ],
  },
];

const allQuestions = groups.flatMap((group) => group.items);

export const metadata = publicPageMetadata({
  title: 'Facility FAQ | Healthcare staffing in Quebec',
  description:
    'Frequently asked questions for healthcare facilities: staffing requests, mandate criteria, documents, qualification and Sanitas follow-up.',
  path: '/en/facility-faq',
  locale: 'en',
  frPath: '/faq-etablissements',
  enPath: '/en/facility-faq',
});

export default function FacilityFaqPage() {
  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id="facility-faq-schema-en"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            faqPageJsonLd(allQuestions),
            breadcrumbJsonLd([
              { name: 'Home', url: '/en' },
              { name: 'Facility FAQ', url: '/en/facility-faq' },
            ]),
          ],
        }}
      />
      <FaqLandingPage
        eyebrow="Facility questions"
        title="Facility FAQ"
        intro="Useful answers for submitting a healthcare staffing need and understanding how Sanitas qualifies candidate profiles."
        groups={groups}
        primaryCta={{ label: 'Request staff', href: '/en/facilities' }}
        secondaryCta={{ label: 'Contact us', href: '/en/contact' }}
      />
    </PublicLayout>
  );
}
