import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  publicPageMetadata,
  serviceJsonLd,
  webPageJsonLd,
} from '@/lib/seo';

const nurseJobsHref = `/en/jobs?profession=${encodeURIComponent('Infirmier(ère)')}`;
const clinicianJobsHref = `/en/jobs?profession=${encodeURIComponent('Infirmier(ère) clinicien(ne)')}`;

const REGIONS = [
  'Laval',
  'Montreal',
  'Monteregie',
  'Outaouais',
  'Gaspesie',
  'Magdalen Islands',
  'Bas-Saint-Laurent',
  'Abitibi',
  'Cote-Nord',
  'Baie-James',
  'Northern Quebec',
];

const DEPARTMENTS = [
  'Emergency',
  'Intensive care',
  'Operating room',
  'Obstetrics',
  'Surgical nursing',
  'Internal medicine',
  'Long-term care',
  'Home care',
  'Mental health',
];

const FAQ = [
  {
    question: 'What is a nursing agency in Quebec?',
    answer:
      'A nursing agency in Quebec connects qualified nurses with assignments and helps healthcare facilities find nursing staff based on title, region, department, shift, availability and required documents.',
  },
  {
    question: 'Does Agence Sanitas recruit nurses in Quebec?',
    answer:
      'Yes. Agence Sanitas supports registered, technical and clinical nurses looking for nursing assignments in Quebec.',
  },
  {
    question: 'Which nursing profiles does Sanitas work with?',
    answer:
      'Depending on active assignments, Sanitas may work with registered nurses, technical nurses and clinical nurses.',
  },
  {
    question: 'Which Quebec regions does Agence Sanitas cover?',
    answer:
      'Agence Sanitas is based in Laval and supports nursing assignments across Quebec, including Montreal, Monteregie, Outaouais, Gaspesie, Magdalen Islands, Bas-Saint-Laurent, Abitibi, Cote-Nord, Baie-James and Northern Quebec.',
  },
  {
    question: 'Can healthcare facilities request nursing staff?',
    answer:
      'Yes. Facilities can share their nursing staffing needs with Agence Sanitas, including title, region, department, shift, start date, duration, urgency and required documents.',
  },
];

export const metadata = publicPageMetadata({
  title: 'Nursing agency Quebec | Agence Sanitas',
  description:
    'Agence Sanitas is a nursing agency in Quebec based in Laval. Assignments for registered, technical and clinical nurses by region, department and shift.',
  path: '/en/nursing-agency-quebec',
  locale: 'en',
  frPath: '/agence-infirmiere-quebec',
  enPath: '/en/nursing-agency-quebec',
});

export default function NursingAgencyQuebecEnglishPage() {
  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id="nursing-agency-quebec-en-jsonld"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbJsonLd([
              { name: 'Home', url: '/en' },
              { name: 'Nursing agency Quebec', url: '/en/nursing-agency-quebec' },
            ]),
            webPageJsonLd({
              name: 'Nursing agency in Quebec',
              description:
                'Agence Sanitas reference page for nurses and healthcare facilities looking for a nursing agency in Quebec.',
              url: '/en/nursing-agency-quebec',
              locale: 'en',
            }),
            serviceJsonLd({
              name: 'Nursing agency Quebec',
              description:
                'Nursing staffing and assignment support for registered, technical and clinical nurses in Quebec.',
              url: '/en/nursing-agency-quebec',
              locale: 'en',
              serviceType: 'Nursing agency in Quebec',
              audience: 'both',
              areaServed: ['Quebec', 'Laval', 'Montreal', 'Monteregie', 'Outaouais', 'Gaspesie', 'Abitibi', 'Cote-Nord'],
            }),
            faqPageJsonLd(FAQ),
          ],
        }}
      />

      <section className="section border-b border-border bg-muted/30 pt-16 pb-12">
        <div className="container-page max-w-5xl">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            Nursing staffing agency in Quebec
          </p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-fg">Nursing agency in Quebec</h1>
          <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-fg-muted">
            Agence Sanitas is a Laval-based nursing agency supporting registered, technical and
            clinical nurses who are looking for assignments in Quebec.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={nurseJobsHref} className="btn-primary">
              View nursing assignments
            </Link>
            <Link href="/en/apply" className="btn-secondary">
              Apply as a nurse
            </Link>
            <a href="tel:+14509739696" className="btn-secondary">
              Call Sanitas
            </a>
          </div>
        </div>
      </section>

      <section className="section py-10">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Nursing assignments by region, department, shift and availability.',
              'Nursing profiles: registered, technical and clinical nurses.',
              'Support for candidates and healthcare facilities in Quebec.',
            ].map((item) => (
              <div key={item} className="card p-5">
                <p className="text-[15.5px] font-medium leading-relaxed text-fg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-10">
        <div className="container-page grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">For nurses</p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-fg">
              Find compatible nursing assignments
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">
              Sanitas structures candidate profiles around the criteria that matter: nursing title,
              preferred regions, departments, shifts, availability, mobility, experience, CV and
              documents. The goal is to avoid proposals that do not match your choices.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Registered nurse', 'Technical nurse', 'Clinical nurse', 'Quebec assignments', 'OIIQ'].map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-[18px] font-semibold text-fg">Matching criteria used by Sanitas</h3>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-fg-muted">
              <li>Nursing title and eligibility for the assignment.</li>
              <li>Preferred region, city or territory.</li>
              <li>Department such as emergency, long-term care, surgery or obstetrics.</li>
              <li>Shift, availability, mobility and important constraints.</li>
              <li>Documents received or still required before presentation.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-muted/25 py-12">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              For healthcare facilities
            </p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-tight text-fg">
              Nursing staffing support in Quebec
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-fg-muted">
              Facilities can share a specific nursing need: title, number of resources, region,
              city, department, shift, start date, duration, required documents and urgency.
              Sanitas can then orient compatible profiles.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { title: 'Urgent assignments', body: 'Identify active and available nursing profiles quickly.' },
              { title: 'Planned assignments', body: 'Prepare availability and documents ahead of the start date.' },
              { title: 'Remote regions', body: 'Support needs in Baie-James, Northern Quebec, Gaspesie, Abitibi and Cote-Nord.' },
            ].map((item) => (
              <article key={item.title} className="card p-5">
                <h3 className="text-[18px] font-semibold text-fg">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section py-12">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-[26px] font-semibold tracking-tight text-fg">Regions covered</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
              Needs vary by active jobs and assignments. Sanitas highlights Quebec regions where
              nursing needs are frequent or difficult to fill.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <span key={region} className="chip">
                  {region}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[26px] font-semibold tracking-tight text-fg">Common departments</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
              Sanitas matching takes the assignment department into account to avoid presenting a
              candidate whose stated preferences do not cover the requested need.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {DEPARTMENTS.map((department) => (
                <span key={department} className="chip">
                  {department}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section py-12">
        <div className="container-page max-w-4xl">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-[24px] font-semibold tracking-tight text-fg">Frequently asked questions</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {FAQ.map((item) => (
                <article key={item.question}>
                  <h3 className="text-[16px] font-semibold text-fg">{item.question}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-fg-muted">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page max-w-4xl">
          <div className="rounded-2xl border border-border bg-fg p-6 text-bg sm:p-8">
            <h2 className="text-[24px] font-semibold tracking-tight">Ready to move forward?</h2>
            <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-bg/75">
              Browse active nursing assignments or create your candidate profile so Sanitas can
              orient you toward roles that match your choices.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={nurseJobsHref} className="btn-primary bg-bg text-fg hover:bg-bg/90">
                View nursing assignments
              </Link>
              <Link href={clinicianJobsHref} className="btn-secondary border-bg/25 text-bg hover:bg-bg/10">
                Clinical nurse assignments
              </Link>
              <Link href="/en/facilities" className="btn-secondary border-bg/25 text-bg hover:bg-bg/10">
                Request staff
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
