import PublicLayout from '@/components/PublicLayout';
import SeoLandingPage from '@/components/SeoLandingPage';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Remote-region nursing assignments in Quebec | Agence Sanitas',
  description:
    'Explore nursing assignments in Quebec regions such as Gaspesie, Abitibi, Cote-Nord, Baie-James and other remote or regional areas.',
  path: '/en/remote-region-nursing-assignments-quebec',
  locale: 'en',
  frPath: '/mandats-infirmiers-region-eloignee',
  enPath: '/en/remote-region-nursing-assignments-quebec',
});

export default function RemoteRegionNursingAssignmentsPage() {
  return (
    <PublicLayout locale="en">
      <SeoLandingPage
        eyebrow="Regional assignments"
        title="Remote-region nursing assignments in Quebec"
        intro="For nurses open to regional assignments, Sanitas lets you specify exactly which regions, departments and shifts you accept."
        highlights={[
          'Active needs may include Gaspesie, Abitibi, Cote-Nord, Baie-James, Outaouais and other Quebec regions.',
          'Search by department: emergency, operating room, intensive care, CHSLD, mental health, home care and medicine/surgery.',
          'Preference-group matching helps avoid false matches between a region you accept and a department you do not.',
        ]}
        sections={[
          {
            title: 'Preferences that belong together',
            body:
              'You can indicate that a region is acceptable only with certain departments, shifts or assignment types. This keeps matching practical and recruiter-ready.',
          },
          {
            title: 'Fast validation with a recruiter',
            body:
              'When an urgent mandate arrives, recruiters can search by region, department, shift, mobility and documents to know who should be called first.',
          },
          {
            title: 'Documents ready before presentation',
            body:
              'Required documents are tracked in your candidate profile so presentation to a facility can move faster when an assignment is a fit.',
          },
          {
            title: 'Apply online or call',
            body:
              'You can apply online with Google sign-in or call Sanitas if you prefer to speak with someone before confirming your interest.',
          },
        ]}
        primaryCta={{ label: 'View active assignments', href: '/en/jobs' }}
        secondaryCta={{ label: 'Submit my profile', href: '/en/apply' }}
        relatedTitle="Useful links"
        relatedLinks={[
          { label: 'Nursing jobs Quebec', href: '/en/nursing-agency-jobs-quebec' },
          { label: 'Healthcare staffing Laval', href: '/en/healthcare-staffing-laval' },
        ]}
      />
    </PublicLayout>
  );
}
