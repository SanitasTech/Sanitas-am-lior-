import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

const pabJobsHref = `/en/jobs?profession=${encodeURIComponent('Préposé(e) aux bénéficiaires')}`;

export const metadata = publicPageMetadata({
  title: 'PAB jobs in Quebec | Agence Sanitas',
  description:
    'Find PAB and beneficiary attendant assignments in Quebec with Agence Sanitas. Choose your regions, shifts, availability and care settings.',
  path: '/en/pab-jobs-quebec',
  locale: 'en',
  frPath: '/emplois-pab-quebec',
  enPath: '/en/pab-jobs-quebec',
});

export default function PabJobsQuebecPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="PAB jobs"
        title="PAB jobs in Quebec"
        intro="Agence Sanitas recruits beneficiary attendants for assignments that match their availability, preferred regions, shifts and care environments."
        highlights={[
          'Assignments may include CHSLD, private seniors residences, long-term care and clinical support settings.',
          'Your profile helps recruiters filter by region, shift, availability, mobility and required documents.',
          'You can apply online or call Sanitas at 450 973-9696 if you prefer to speak with someone first.',
        ]}
        sections={[
          {
            title: 'One reusable candidate profile',
            body:
              'Your contact information, documents, availability and preferences are kept in one profile so future applications are faster.',
          },
          {
            title: 'Assignments based on your availability',
            body:
              'Day, evening, night, short-term or replacement assignments can be matched to your stated preferences instead of generic job alerts.',
          },
          {
            title: 'Documents and follow-up',
            body:
              'A CV is required to submit an application. Other documents are tracked according to your role and the assignment.',
          },
          {
            title: 'Human support',
            body:
              'The Sanitas team can call you to validate your availability, preferences and the assignments that best fit your situation.',
          },
        ]}
        primaryCta={{ label: 'View PAB jobs', href: pabJobsHref }}
        secondaryCta={{ label: 'Submit my profile', href: '/en/apply' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Nursing jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
          { label: 'All jobs', href: '/en/jobs' },
          { label: 'Contact', href: '/en/contact' },
        ]}
      />
    </PublicLayout>
  );
}
