import PublicLayout from '@/components/PublicLayout';
import { publicPageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = publicPageMetadata({
  title: 'Remote-region nursing assignments in Quebec | Agence Sanitas',
  description:
    'Explore nursing assignments in Quebec regions such as Baie-James, Northern Quebec, Outaouais, Gaspesie, Magdalen Islands, Bas-Saint-Laurent, Abitibi and Cote-Nord.',
  path: '/en/remote-region-nursing-assignments-quebec',
  locale: 'en',
  frPath: '/mandats-infirmiers-region-eloignee',
  enPath: '/en/remote-region-nursing-assignments-quebec',
});

const remoteRegions = [
  {
    name: 'Baie-James',
    href: '/en/nursing-assignments-baie-james',
    focus: 'Emergency, home care, intensive care and regional needs depending on active assignments.',
    fit: 'For nurses open to regional healthcare settings, with mobility and availability to confirm.',
  },
  {
    name: 'Northern Quebec',
    href: '/en/nursing-assignments-northern-quebec',
    focus: 'Northern assignments where travel, housing and assignment duration must be confirmed case by case.',
    fit: 'For profiles comfortable with remote environments and more autonomous clinical organization.',
  },
  {
    name: 'Outaouais',
    href: '/en/nursing-assignments-outaouais',
    focus: 'Operating room, home care, medicine/surgery and regional facility needs.',
    fit: 'For nurses who want region, department and shift preferences clarified before being proposed.',
  },
  {
    name: 'Gaspesie',
    href: '/en/nursing-assignments-gaspesie',
    focus: 'Emergency, operating room, obstetrics, intensive care and other regional nursing needs.',
    fit: 'For candidates who accept Gaspesie only with specific departments, shifts or conditions.',
  },
  {
    name: 'Magdalen Islands',
    href: '/en/nursing-assignments-magdalen-islands',
    focus: 'Island-based assignments and specialized needs that may include intensive care or medicine/surgery.',
    fit: 'For profiles who want to clearly state openness to the Islands and related constraints.',
  },
  {
    name: 'Bas-Saint-Laurent',
    href: '/en/nursing-assignments-bas-saint-laurent',
    focus: 'Home care, medicine/surgery, CHSLD and regional nursing assignments.',
    fit: 'For candidates looking for regional mandates with documented shift and mobility preferences.',
  },
  {
    name: 'Abitibi',
    href: '/en/nursing-assignments-abitibi',
    focus: 'Emergency, CHSLD, medicine/surgery and priority needs depending on open assignments.',
    fit: 'For nurses who accept Abitibi only with certain departments or assignment conditions.',
  },
  {
    name: 'Cote-Nord',
    href: '/en/nursing-assignments-cote-nord',
    focus: 'Medicine/surgery, intensive care, emergency and regional facility needs.',
    fit: 'For profiles ready to validate travel, housing, availability and documents before presentation.',
  },
];

const departmentLinks = [
  { label: 'Emergency', href: '/en/emergency-nursing-assignments-quebec' },
  { label: 'Intensive care', href: '/en/intensive-care-nursing-assignments-quebec' },
  { label: 'Operating room', href: '/en/operating-room-nursing-assignments-quebec' },
  { label: 'Obstetrics', href: '/en/obstetrics-nursing-assignments-quebec' },
  { label: 'Surgical nursing', href: '/en/surgical-nursing-assignments-quebec' },
  { label: 'Long-term care', href: '/en/chsld-nursing-assignments-quebec' },
];

export default function RemoteRegionNursingAssignmentsPage() {
  return (
    <PublicLayout locale="en">
      <section className="section pt-16 pb-12 bg-muted/30 border-b border-border">
        <div className="container-page max-w-5xl">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Remote-region assignments
          </p>
          <h1 className="mt-2 text-display-lg text-fg">
            Remote-region nursing assignments in Quebec
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-fg-muted">
            Agence Sanitas recruits nurses for assignments in Baie-James, Northern Quebec,
            Outaouais, Gaspesie, the Magdalen Islands, Bas-Saint-Laurent, Abitibi and Cote-Nord.
            Your Sanitas profile helps clarify which regions, departments, shifts and constraints
            belong together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/en/jobs?profession=Infirmier%28%C3%A8re%29" className="btn-primary">
              View nursing assignments
            </Link>
            <Link href="/en/apply" className="btn-secondary">
              Submit my profile
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-10 pb-8">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Priority regions: Baie-James, Northern Quebec, Outaouais, Gaspesie, Magdalen Islands, Bas-Saint-Laurent, Abitibi and Cote-Nord.',
              'Possible departments: emergency, operating room, intensive care, CHSLD, obstetrics, home care, mental health and medicine/surgery.',
              'Preference-group matching helps avoid false matches between a region you accept and a department or shift you do not.',
            ].map((item) => (
              <div key={item} className="card p-5">
                <p className="text-[15px] font-medium leading-relaxed text-fg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-6 pb-10">
        <div className="container-page">
          <div className="mb-6 max-w-3xl">
            <h2 className="text-[28px] font-semibold tracking-tight text-fg">
              Choose the right region, not only a job title
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
              Healthcare needs change quickly. This page groups the main regions to watch and helps
              nurses create a useful profile: region, department, shift, mobility, start date and
              ready documents.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {remoteRegions.map((region) => (
              <article key={region.name} className="card flex flex-col p-5">
                <h3 className="text-[19px] font-semibold text-fg">{region.name}</h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">{region.focus}</p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">{region.fit}</p>
                <Link href={region.href} className="mt-5 text-[14px] font-medium text-accent hover:text-fg">
                  View {region.name} page
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-4 pb-20">
        <div className="container-page grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-[22px] font-semibold text-fg">How Sanitas avoids false matches</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: 'Linked preferences',
                  body:
                    'You can indicate that a region is acceptable only with certain departments, shifts or assignment types.',
                },
                {
                  title: 'Recruiter validation',
                  body:
                    'When an urgent assignment comes in, recruiters search by region, department, shift, mobility, availability and documents.',
                },
                {
                  title: 'One candidate file',
                  body:
                    'Resume, documents, work authorization, experience and preferences remain in one Sanitas candidate file.',
                },
                {
                  title: 'Fast action',
                  body:
                    'A complete profile helps Sanitas process compatible assignments faster and contact you with precise details.',
                },
              ].map((item) => (
                <section key={item.title} className="rounded-xl border border-border bg-bg p-4">
                  <h3 className="text-[17px] font-semibold text-fg">{item.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">{item.body}</p>
                </section>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-[18px] font-semibold text-fg">Explore by department</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {departmentLinks.map((link) => (
                <Link key={link.href} href={link.href} className="chip-link">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <h2 className="text-[18px] font-semibold text-fg">Prefer to speak first?</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">
                If you want to validate regions or conditions before applying, contact Sanitas.
              </p>
              <Link href="/en/contact" className="mt-4 inline-flex text-[14px] font-medium text-accent hover:text-fg">
                Contact Sanitas
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
