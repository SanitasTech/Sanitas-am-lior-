import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import EstablishmentRequestForm from '@/components/EstablishmentRequestForm';
import ContactInfo from '@/components/ContactInfo';
import Photo from '@/components/Photo';
import { DecorativeBlob } from '@/components/Icons';
import { breadcrumbJsonLd, publicPageMetadata, webPageJsonLd } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Healthcare staffing agency in Quebec for facilities',
  description:
    'Healthcare facilities can request qualified staff from Agence Sanitas for urgent, temporary, recurring or planned needs across Quebec.',
  path: '/en/facilities',
  locale: 'en',
  frPath: '/etablissements',
  enPath: '/en/facilities',
});

const NEEDS = ['Replacement', 'Urgent need', 'Short term', 'Long term', 'Temporary support', 'By department', 'By shift'];
const PROFESSIONS = [
  'Registered nurses',
  'Licensed practical nurses',
  'Beneficiary attendants',
  'ASSS',
  'Respiratory therapists',
  'Rehabilitation professionals',
  'Clinical and support staff',
];
const HERO_PHOTO = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80&auto=format&fit=crop';

export default function EnglishFacilitiesPage() {
  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id="facilities-schema-en"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            webPageJsonLd({
              name: 'Request healthcare staff',
              description:
                'Page for healthcare facilities in Quebec that want to request qualified staff from Agence Sanitas.',
              url: '/en/facilities',
              locale: 'en',
            }),
            breadcrumbJsonLd([
              { name: 'Home', url: '/en' },
              { name: 'Facilities', url: '/en/facilities' },
            ]),
          ],
        }}
      />
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -left-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page relative">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Facilities</p>
              <h1 className="mt-2 text-display-lg text-fg">Request healthcare staff</h1>
              <p className="mt-5 text-[17px] leading-relaxed text-fg-muted max-w-prose">
                Present your need to the Sanitas team. We respond quickly with a clear, structured approach.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-fg-muted max-w-prose">
                Agence Sanitas supports healthcare facilities with one-time, urgent, recurring or planned staffing needs.
              </p>
            </div>
            <Photo src={HERO_PHOTO} alt="Bright hospital hallway" aspect="landscape" rounded="3xl" className="shadow-card" />
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container-page">
          <div className="grid gap-6 md:grid-cols-2">
            <ListCard title="Needs covered" items={NEEDS} />
            <ListCard title="Possible professions" items={PROFESSIONS} />
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-display-md text-fg">Your request</h2>
          <p className="mt-2 text-fg-muted">The more precise the request, the faster our response.</p>
          <div className="mt-8">
            <EstablishmentRequestForm locale="en" />
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-page max-w-3xl">
          <div className="card p-6 bg-muted/40">
            <p className="text-[12.5px] font-semibold uppercase tracking-wider text-fg-subtle mb-3">Direct contact</p>
            <ContactInfo locale="en" />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card p-6">
      <h2 className="text-[18px] font-semibold text-fg">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((n) => (
          <li key={n} className="flex items-start gap-2.5 text-[14.5px] text-fg">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
            <span>{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
