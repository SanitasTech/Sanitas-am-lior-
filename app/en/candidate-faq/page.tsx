import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import FaqLandingPage, { type FaqGroup } from '@/components/FaqLandingPage';
import { breadcrumbJsonLd, faqPageJsonLd, publicPageMetadata } from '@/lib/seo';

const groups: FaqGroup[] = [
  {
    title: 'Applying with Sanitas',
    items: [
      {
        question: 'Do I need an account to apply?',
        answer:
          'Yes. Google sign-in secures your candidate file and lets you reuse your profile, documents and preferences for multiple assignments.',
      },
      {
        question: 'Can I apply without entering the same information several times?',
        answer:
          'Yes. Your Sanitas profile keeps your contact information, profession, availability, regions, shifts, documents and assignment preferences.',
      },
      {
        question: 'What if I do not want to apply online?',
        answer:
          'You can call Sanitas at 450 973-9696. A team member can guide you and confirm the required information by phone.',
      },
    ],
  },
  {
    title: 'Documents and follow-up',
    items: [
      {
        question: 'Is a CV required?',
        answer:
          'Yes. A CV is required to submit an application. Other documents depend on your role and the assignment.',
      },
      {
        question: 'Which documents may be requested?',
        answer:
          'Depending on the assignment, Sanitas may request a professional permit, CPR, PDSB, vaccination record or other facility-required documents.',
      },
      {
        question: 'What happens after I apply?',
        answer:
          'Your file is reviewed, then a recruiter may contact you to validate your availability, documents, preferences and fit with the assignment.',
      },
    ],
  },
];

const allQuestions = groups.flatMap((group) => group.items);

export const metadata = publicPageMetadata({
  title: 'Candidate FAQ | Healthcare jobs in Quebec',
  description:
    'Answers for Sanitas candidates: applying online, Google sign-in, CV, documents, recruiter follow-up and healthcare assignments in Quebec.',
  path: '/en/candidate-faq',
  locale: 'en',
  frPath: '/faq-candidats',
  enPath: '/en/candidate-faq',
});

export default function CandidateFaqPage() {
  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id="candidate-faq-schema-en"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            faqPageJsonLd(allQuestions),
            breadcrumbJsonLd([
              { name: 'Home', url: '/en' },
              { name: 'Candidate FAQ', url: '/en/candidate-faq' },
            ]),
          ],
        }}
      />
      <FaqLandingPage
        eyebrow="Candidate questions"
        title="Candidate FAQ"
        intro="Essential answers about applying with Agence Sanitas, preparing your file and understanding recruiter follow-up."
        groups={groups}
        primaryCta={{ label: 'View jobs', href: '/en/jobs' }}
        secondaryCta={{ label: 'Submit my profile', href: '/en/apply' }}
      />
    </PublicLayout>
  );
}
