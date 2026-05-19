import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Healthcare staffing agency in Laval | Agence Sanitas',
  description:
    'Agence Sanitas is a healthcare staffing agency based in Laval, serving healthcare professionals and facilities across Quebec.',
  path: '/en/healthcare-staffing-laval',
  locale: 'en',
  frPath: '/agence-placement-sante-laval',
  enPath: '/en/healthcare-staffing-laval',
});

export default function HealthcareStaffingLavalPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="Laval and Quebec"
        title="Healthcare staffing agency in Laval"
        intro="Based in Laval, Agence Sanitas supports healthcare professionals and facilities looking for a clear, human and structured staffing process."
        highlights={[
          'Address: 4 Place Laval, Suite 570, Laval, QC H7N 5Y3.',
          'CNESST permit AP-2000952.',
          'Assignments and staffing needs are handled across multiple Quebec regions.',
        ]}
        sections={[
          {
            title: 'For candidates',
            body:
              'Sanitas helps healthcare professionals find assignments that match their profession, availability, regions and required documents.',
          },
          {
            title: 'For facilities',
            body:
              'Facilities can submit occasional, urgent, recurring or planned needs and receive structured follow-up from the Sanitas team.',
          },
          {
            title: 'Local presence, provincial coverage',
            body:
              'Sanitas is based in Laval while supporting staffing needs and healthcare assignments across Quebec.',
          },
          {
            title: 'A single candidate profile',
            body:
              'The candidate portal centralizes profile information, preferences, CVs and documents to reduce friction and accelerate matching.',
          },
        ]}
        primaryCta={{ label: 'View jobs', href: '/en/jobs' }}
        secondaryCta={{ label: 'Request staff', href: '/en/facilities' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Nursing jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
          { label: 'Healthcare recruitment Quebec', href: '/en/healthcare-recruitment-quebec' },
          { label: 'Contact', href: '/en/contact' },
        ]}
      />
    </PublicLayout>
  );
}
