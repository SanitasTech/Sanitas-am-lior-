import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

const asssJobsHref = `/en/jobs?profession=${encodeURIComponent('Auxiliaire aux services de santé et sociaux (ASSS)')}`;

export const metadata = publicPageMetadata({
  title: 'ASSS jobs in Quebec | Agence Sanitas',
  description:
    'Find ASSS assignments in Quebec with Agence Sanitas. Share your regions, shifts, availability, mobility and required documents.',
  path: '/en/asss-jobs-quebec',
  locale: 'en',
  frPath: '/emplois-asss-quebec',
  enPath: '/en/asss-jobs-quebec',
});

export default function AsssJobsQuebecPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="ASSS"
        title="ASSS jobs in Quebec"
        intro="Agence Sanitas supports ASSS candidates looking for assignments that match their availability, mobility and preferred care settings."
        highlights={[
          'Assignments can be filtered by region, city, shift, assignment type, start date and constraints.',
          'A reusable candidate profile avoids repeating the same information for every application.',
          'Required documents are tracked according to the role and assignment.',
        ]}
        sections={[
          {
            title: 'Your constraints matter',
            body:
              'The Sanitas profile lets you indicate preferences, constraints, mobility, transportation and availability so assignments can be targeted more accurately.',
          },
          {
            title: 'More precise search',
            body:
              'Recruiters can combine region, shift, department, documents and history to identify which profiles should be called first.',
          },
          {
            title: 'Apply with less friction',
            body:
              'Once your file is ready, compatible applications require less repeated information and can move to follow-up faster.',
          },
          {
            title: 'Direct support',
            body:
              'You can apply online or call Sanitas to discuss available assignments and your preferences.',
          },
        ]}
        primaryCta={{ label: 'View ASSS jobs', href: asssJobsHref }}
        secondaryCta={{ label: 'Submit my profile', href: '/en/apply' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Candidate FAQ', href: '/en/candidate-faq' },
          { label: 'PAB jobs Quebec', href: '/en/pab-jobs-quebec' },
          { label: 'All jobs', href: '/en/jobs' },
        ]}
      />
    </PublicLayout>
  );
}
