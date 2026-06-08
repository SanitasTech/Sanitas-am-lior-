import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';
import { DecorativeBlob, PeopleIcon, ClipboardIcon, ChatIcon } from '@/components/Icons';
import { breadcrumbJsonLd, contactPageJsonLd, publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata({
  title: 'Contact healthcare recruitment | Candidates and facilities',
  description:
    'Contact Agence Sanitas in Laval to apply, ask a question or request healthcare staffing support in Quebec.',
  path: '/en/contact',
  locale: 'en',
  frPath: '/contact',
  enPath: '/en/contact',
});

export default function EnglishContactPage() {
  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id="contact-schema-en"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            contactPageJsonLd({
              name: 'Contact Agence Sanitas',
              description:
                'Contact details and form for candidates, healthcare professionals and facilities in Quebec.',
              url: '/en/contact',
              locale: 'en',
            }),
            breadcrumbJsonLd([
              { name: 'Home', url: '/en' },
              { name: 'Contact', url: '/en/contact' },
            ]),
          ],
        }}
      />
      <section className="relative section pt-16 overflow-hidden">
        <DecorativeBlob className="absolute -top-32 -right-40 h-[500px] w-[500px] text-accent pointer-events-none" />
        <div className="container-page max-w-4xl relative">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Contact</p>
          <h1 className="mt-2 text-display-lg text-fg">Contact Agence Sanitas</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-fg-muted max-w-prose">
            Whether you are a candidate, a healthcare professional or a facility representative, our team can guide you to the right next step.
          </p>
        </div>
      </section>

      <section className="pb-8">
        <div className="container-page max-w-4xl">
          <div className="grid gap-4 md:grid-cols-3">
            <Card icon={<PeopleIcon className="h-6 w-6" />} title="I am a candidate" body="Send your profile and confirm a few details." cta="Submit my profile" href="/en/apply" />
            <Card icon={<ClipboardIcon className="h-6 w-6" />} title="I represent a facility" body="Present your staffing need to the Sanitas team." cta="Request staff" href="/en/facilities" />
            <Card icon={<ChatIcon className="h-6 w-6" />} title="Other request" body="A question that does not fit the two options above." cta="Send a message" href="#form" />
          </div>
        </div>
      </section>

      <section id="form" className="section pt-8 pb-20">
        <div className="container-page max-w-3xl">
          <h2 className="text-display-md text-fg">Write to us</h2>
          <p className="mt-2 text-fg-muted">We respond quickly during business hours.</p>
          <div className="mt-8">
            <ContactForm locale="en" />
          </div>
        </div>
      </section>

      <section className="pb-24">
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

function Card({ icon, title, body, cta, href }: { icon: React.ReactNode; title: string; body: string; cta: string; href: string }) {
  return (
    <div className="card p-5 flex flex-col">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">{icon}</div>
      <h3 className="mt-4 text-[16px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 text-[14px] text-fg-muted leading-relaxed flex-1">{body}</p>
      <Link href={href} className="btn-secondary btn-sm mt-4 self-start">{cta}</Link>
    </div>
  );
}
