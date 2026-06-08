import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

const nurseJobsHref = `/en/jobs?profession=${encodeURIComponent('Infirmier(ère)')}`;
const clinicianJobsHref = `/en/jobs?profession=${encodeURIComponent('Infirmier(ère) clinicien(ne)')}`;

export const metadata = publicPageMetadata({
  title: 'Nursing agency jobs in Quebec | Registered and clinical nurses',
  description:
    'Find nursing assignments in Quebec with Agence Sanitas. Registered, technical and clinical nurses can search by region, department, shift and availability.',
  path: '/en/nursing-agency-jobs-quebec',
  locale: 'en',
  frPath: '/emplois-infirmieres-quebec',
  enPath: '/en/nursing-agency-jobs-quebec',
});

export default function NursingAgencyJobsQuebecPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="Nursing jobs Quebec"
        title="Nursing agency jobs in Quebec"
        intro="Agence Sanitas helps nurses find assignments that match their title, regions, departments, shifts and availability."
        highlights={[
          'Profiles sought: registered nurses, technical nurses and clinical nurses.',
          'Priority remote regions include Baie-James, Northern Quebec, Outaouais, Gaspesie, Magdalen Islands, Bas-Saint-Laurent, Abitibi and Cote-Nord.',
          'Common departments include emergency, intensive care, operating room, obstetrics, surgical nursing and long-term care.',
        ]}
        sections={[
          {
            title: 'Assignments that match your preferences',
            body:
              'Sanitas uses your profile, documents and preference groups to identify assignments that fit your actual availability and constraints.',
          },
          {
            title: 'Regions and departments without false matches',
            body:
              'Your profile can connect the regions, departments and shifts that truly go together, which helps recruiters avoid irrelevant proposals.',
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
        ]}
        primaryCta={{ label: 'View nursing jobs', href: nurseJobsHref }}
        secondaryCta={{ label: 'Submit my profile', href: '/en/apply' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Clinical nurse jobs', href: clinicianJobsHref },
          { label: 'Remote nursing assignments', href: '/en/remote-region-nursing-assignments-quebec' },
          { label: 'Baie-James assignments', href: '/en/nursing-assignments-baie-james' },
          { label: 'Northern Quebec assignments', href: '/en/nursing-assignments-northern-quebec' },
          { label: 'Gaspesie assignments', href: '/en/nursing-assignments-gaspesie' },
          { label: 'Emergency nursing assignments', href: '/en/emergency-nursing-assignments-quebec' },
          { label: 'All jobs', href: '/en/jobs' },
        ]}
      />
    </PublicLayout>
  );
}
