import type { Metadata } from 'next';
import PublicLayout from '@/components/PublicLayout';
import ContactInfo from '@/components/ContactInfo';
import Photo from '@/components/Photo';
import { DecorativeBlob } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Agence Sanitas, a healthcare staffing agency based in Laval.',
  alternates: { canonical: '/en/about', languages: { fr: '/a-propos', en: '/en/about' } },
};

const HERO_PHOTO = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80&auto=format&fit=crop';
const MISSION_PHOTO = 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200&q=80&auto=format&fit=crop';

export default function EnglishAboutPage() {
  return (
    <PublicLayout locale="en">
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-40 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">About</p>
              <h1 className="mt-2 text-display-lg text-fg">About Agence Sanitas</h1>
              <p className="mt-5 text-[17px] leading-relaxed text-fg-muted">
                Agence Sanitas is a healthcare staffing agency based in Laval. We support healthcare professionals in finding assignments aligned with their reality, while helping facilities meet staffing needs.
              </p>
            </div>
            <Photo src={HERO_PHOTO} alt="Professional meeting" aspect="landscape" rounded="3xl" className="shadow-card" />
          </div>
        </div>
      </section>

      <section className="section pt-8 bg-muted/40">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Photo src={MISSION_PHOTO} alt="Person in a care environment" aspect="portrait" rounded="3xl" className="max-w-md" />
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Our mission</p>
              <h2 className="mt-2 text-display-md text-fg">Build durable links between professionals and facilities.</h2>
              <p className="mt-4 max-w-prose text-[15.5px] leading-relaxed text-fg-muted">
                We create efficient, human and durable connections between healthcare professionals and the facilities that need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Our approach</p>
          <h2 className="mt-2 text-display-md text-fg">Six principles guide our work.</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Candidate listening', 'We take time to understand your experience and preferences before suggesting roles.'],
              ['Availability first', 'Your schedule constraints matter as much as your skills.'],
              ['Respect for preferences', 'Region, department, shift and assignment type are considered before each proposal.'],
              ['Human follow-up', 'A reachable team, clear updates and no silence.'],
              ['Qualification discipline', 'Documents and requirements are checked before each facility presentation.'],
              ['Fast processing', 'Urgent needs are handled first without sacrificing quality.'],
            ].map(([title, body]) => (
              <div key={title} className="card p-6">
                <h3 className="text-[16px] font-semibold text-fg">{title}</h3>
                <p className="mt-2 text-[14.5px] text-fg-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-display-md text-fg">For candidates</h2>
              <p className="mt-4 max-w-prose text-[15.5px] leading-relaxed text-fg-muted">
                We help healthcare professionals find assignments compatible with their skills, regions, availability and goals.
              </p>
            </div>
            <div>
              <h2 className="text-display-md text-fg">For facilities</h2>
              <p className="mt-4 max-w-prose text-[15.5px] leading-relaxed text-fg-muted">
                We help facilities structure staffing needs and access qualified, available profiles aligned with field realities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page max-w-3xl">
          <div className="card p-6 bg-muted/40">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle mb-3">Contact details</p>
            <ContactInfo locale="en" />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
