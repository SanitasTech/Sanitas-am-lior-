import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Nursing agency jobs in Quebec | Agence Sanitas',
  description:
    'Find nursing agency assignments in Quebec with Agence Sanitas. Choose your regions, shifts, departments and availability.',
  path: '/en/nursing-agency-jobs-quebec',
  locale: 'en',
  frPath: '/emplois-infirmieres-quebec',
  enPath: '/en/nursing-agency-jobs-quebec',
});

export default function NursingAgencyJobsQuebecPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="Nursing jobs"
        title="Nursing agency jobs in Quebec"
        intro="Agence Sanitas helps nurses find assignments that match their preferred regions, departments, shifts and availability."
        highlights={[
          'Assignments can be filtered by region, department, shift, assignment type and urgency.',
          'A reusable candidate profile helps avoid entering the same information multiple times.',
          'Candidates can apply online or call Sanitas if they prefer to speak with someone.',
        ]}
        sections={[
          {
            title: 'Assignments that match your preferences',
            body:
              'Sanitas uses your profile, documents and preference groups to identify assignments that fit your actual availability and constraints.',
          },
          {
            title: 'A clearer application experience',
            body:
              'Once your profile and CV are ready, applying to compatible assignments becomes faster and simpler.',
          },
          {
            title: 'Quebec-focused recruitment',
            body:
              'The agency is based in Laval and supports healthcare staffing needs across multiple regions of Quebec.',
          },
          {
            title: 'Human follow-up',
            body:
              'A recruiter can contact you to validate details before presenting your profile to a facility.',
          },
        ]}
        primaryCta={{ label: 'View nursing jobs', href: '/en/jobs' }}
        secondaryCta={{ label: 'Submit my profile', href: '/en/apply' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'All jobs', href: '/en/jobs' },
          { label: 'Request staff', href: '/en/facilities' },
        ]}
      />
    </PublicLayout>
  );
}
