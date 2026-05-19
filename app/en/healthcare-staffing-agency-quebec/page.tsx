import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Healthcare staffing agency in Quebec | Agence Sanitas',
  description:
    'Agence Sanitas is a Laval-based healthcare staffing agency supporting candidates and healthcare facilities across Quebec.',
  path: '/en/healthcare-staffing-agency-quebec',
  locale: 'en',
  frPath: '/recrutement-personnel-sante-quebec',
  enPath: '/en/healthcare-staffing-agency-quebec',
});

export default function HealthcareStaffingAgencyQuebecPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="Facilities and candidates"
        title="Healthcare staffing agency in Quebec"
        intro="Agence Sanitas connects healthcare professionals with assignments and helps facilities structure urgent, temporary, recurring or planned staffing needs."
        highlights={[
          'Based in Laval, serving healthcare staffing needs across Quebec.',
          'Candidate profiles include profession, availability, documents, regions, shifts and constraints.',
          'Facilities can submit staffing requests with profession, region, department, shift and start date.',
        ]}
        sections={[
          {
            title: 'For healthcare professionals',
            body:
              'Candidates can create a reusable profile, upload documents and apply to assignments without repeating the same information each time.',
          },
          {
            title: 'For healthcare facilities',
            body:
              'Facilities can request healthcare staff and receive structured follow-up from the Sanitas team.',
          },
          {
            title: 'Quebec healthcare focus',
            body:
              'Sanitas is built around Quebec healthcare staffing realities: regions, departments, shifts, documents and compliance expectations.',
          },
          {
            title: 'Actionable matching',
            body:
              'Recruiters can search by mandate criteria and identify candidates to call, validate, request documents from or present.',
          },
        ]}
        primaryCta={{ label: 'Request staff', href: '/en/facilities' }}
        secondaryCta={{ label: 'View jobs', href: '/en/jobs' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Nursing agency jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
          { label: 'Contact', href: '/en/contact' },
        ]}
      />
    </PublicLayout>
  );
}
