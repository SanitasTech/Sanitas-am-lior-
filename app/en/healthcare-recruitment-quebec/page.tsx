import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Healthcare recruitment in Quebec | Agence Sanitas',
  description:
    'Agence Sanitas helps Quebec healthcare facilities structure staffing needs and find qualified healthcare professionals.',
  path: '/en/healthcare-recruitment-quebec',
  locale: 'en',
  frPath: '/recrutement-personnel-sante-quebec',
  enPath: '/en/healthcare-recruitment-quebec',
});

export default function HealthcareRecruitmentQuebecPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="Facilities"
        title="Healthcare recruitment in Quebec"
        intro="Agence Sanitas supports healthcare facilities that need qualified professionals for urgent, occasional, recurring or planned staffing needs."
        highlights={[
          'Roles may include nurses, licensed practical nurses, PABs, ASSS and other healthcare professionals.',
          'Mandates can be structured by profession, region, department, shift, start date, required documents and urgency.',
          'A structured process helps qualify profiles before presentation to facilities.',
        ]}
        sections={[
          {
            title: 'Clarify the need quickly',
            body:
              'The facility request flow collects the useful details: profession, region, city, department, number of resources, shift, start date and duration.',
          },
          {
            title: 'Present aligned profiles',
            body:
              'Sanitas uses candidate preferences and mandate criteria to avoid presenting profiles that do not match the actual need.',
          },
          {
            title: 'Document follow-up',
            body:
              'CVs, permits, CPR, PDSB and vaccination records can be tracked in the candidate file according to the role and mandate.',
          },
          {
            title: 'Structured response',
            body:
              'The Sanitas team can respond to urgent staffing needs while preserving qualification, follow-up and compliance discipline.',
          },
        ]}
        primaryCta={{ label: 'Request staff', href: '/en/facilities' }}
        secondaryCta={{ label: 'Contact us', href: '/en/contact' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Nursing agency Quebec', href: '/en/nursing-agency-quebec' },
          { label: 'Healthcare staffing Laval', href: '/en/healthcare-staffing-laval' },
          { label: 'About Sanitas', href: '/en/about' },
          { label: 'Jobs for candidates', href: '/en/jobs' },
        ]}
      />
    </PublicLayout>
  );
}
