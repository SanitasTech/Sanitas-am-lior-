import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

const lpnJobsHref = `/en/jobs?profession=${encodeURIComponent('Infirmier(ère) auxiliaire')}`;

export const metadata = publicPageMetadata({
  title: 'Licensed practical nurse jobs in Quebec | Agence Sanitas',
  description:
    'Find licensed practical nurse assignments in Quebec with Agence Sanitas. Filter by region, shift, department, availability and documents.',
  path: '/en/licensed-practical-nurse-jobs-quebec',
  locale: 'en',
  frPath: '/emplois-infirmieres-auxiliaires-quebec',
  enPath: '/en/licensed-practical-nurse-jobs-quebec',
});

export default function LicensedPracticalNurseJobsQuebecPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="Licensed practical nurses"
        title="Licensed practical nurse jobs in Quebec"
        intro="Agence Sanitas recruits licensed practical nurses for assignments aligned with preferred regions, shifts and care settings."
        highlights={[
          'Search assignments by region, city, department, shift, assignment type and start date.',
          'One candidate profile keeps your CV, permit, availability, preferences and required documents.',
          'Apply online or call Sanitas at 450 973-9696 if you prefer to speak with someone first.',
        ]}
        sections={[
          {
            title: 'More relevant assignments',
            body:
              'Your preferences help distinguish the regions, departments and shifts you truly accept, reducing generic or incompatible suggestions.',
          },
          {
            title: 'Documents in one place',
            body:
              'The candidate portal centralizes your CV, permit and required documents to support qualification before presentation.',
          },
          {
            title: 'Human follow-up',
            body:
              'A recruiter can validate important details before presenting your profile to a facility.',
          },
          {
            title: 'Apply faster',
            body:
              'Once your file is complete, compatible applications can be sent faster without repeating the same information.',
          },
        ]}
        primaryCta={{ label: 'View LPN jobs', href: lpnJobsHref }}
        secondaryCta={{ label: 'Submit my profile', href: '/en/apply' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Candidate FAQ', href: '/en/candidate-faq' },
          { label: 'Nursing jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
          { label: 'All jobs', href: '/en/jobs' },
        ]}
      />
    </PublicLayout>
  );
}
