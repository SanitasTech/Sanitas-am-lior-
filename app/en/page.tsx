import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import PublicLayout from '@/components/PublicLayout';
import SeoJsonLd from '@/components/SeoJsonLd';
import HomeSearch from '@/components/HomeSearch';
import JobCard from '@/components/JobCard';
import Photo from '@/components/Photo';
import {
  TargetIcon,
  HandshakeIcon,
  BoltIcon,
  SearchIcon,
  SendIcon,
  ChecklistIcon,
  ChatIcon,
  ClipboardIcon,
  AnalyzeIcon,
  PeopleIcon,
  CheckCircleIcon,
} from '@/components/Icons';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { localizedPath } from '@/lib/i18n';
import { publicPageMetadata, webPageJsonLd } from '@/lib/seo';
import type { Job } from '@/types';
import { urgencyOrder } from '@/lib/utils';

export const metadata = publicPageMetadata({
  title: 'Healthcare staffing agency in Quebec | Nursing and PAB assignments',
  description:
    'Agence Sanitas connects nurses, PABs, ASSS and healthcare professionals with assignments in Quebec, and supports facilities with staffing needs.',
  path: '/en',
  locale: 'en',
  frPath: '/',
  enPath: '/en',
});

export const revalidate = 60;

const HERO_BG = '/images/sanitas-hero.png';
const PHOTOS = {
  candidates: '/images/sanitas-candidats.png',
  establishments: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&q=80&auto=format&fit=crop',
} as const;

const QUICK_PROFESSIONS = [
  { label: 'Registered nurse', filter: 'Infirmier(ère)' },
  { label: 'Clinical nurse', filter: 'Infirmier(ère) clinicien(ne)' },
  { label: 'Licensed practical nurse', filter: 'Infirmier(ère) auxiliaire' },
  { label: 'Beneficiary attendant', filter: 'Préposé(e) aux bénéficiaires' },
  { label: 'ASSS', filter: 'Auxiliaire aux services de santé et sociaux (ASSS)' },
  { label: 'All jobs', filter: null },
];

const PARTNERS = [
  { name: 'McKesson', logo: '/logos/mckesson.svg' },
  { name: 'LGI Healthcare Solutions', logo: '/logos/lgi.png' },
  { name: 'Santé Québec', logo: '/logos/sante-quebec.svg' },
  { name: 'AmerisourceBergen', logo: '/logos/amerisourcebergen.svg' },
  { name: 'Groupe Santé Arbec', logo: '/logos/arbec.png' },
  { name: 'Groupe Champlain', logo: '/logos/champlain.png' },
  { name: 'CHSLD Saint-Lambert sur le Golf', logo: '/logos/chsld-saint-lambert.svg' },
  { name: 'Résidence Soleil', logo: '/logos/residence-soleil.png' },
];

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  rating?: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'I am satisfied with the services of Agence Sanitas. The agents are welcoming, helpful and professional. They respond to my needs quickly and listen before proposing assignments.',
    author: 'Souad N.',
    role: 'Clinical nurse',
    rating: 5,
  },
  {
    quote:
      'Professional, flexible and human, with excellent ethical values. They listen to employees and respect availability. You really feel considered and respected.',
    author: 'Sisi D.',
    role: 'Beneficiary attendant',
    rating: 5,
  },
  {
    quote:
      'Very good agency. The supervisors handling schedules are polite, courteous, understanding and patient. I recommend them.',
    author: 'Charlotte M.',
    role: 'Nurse',
    rating: 5,
  },
  {
    quote:
      'It is the first agency where I feel they truly listen before offering me an assignment. The options match my availability.',
    author: 'Tamara F.',
    role: 'Clinical nurse',
    rating: 5,
  },
];

async function fetchUrgentJobs(): Promise<Job[]> {
  noStore();
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .in('urgency', ['urgent', 'high'])
      .order('created_at', { ascending: false })
      .limit(6);
    const jobs = (data || []) as Job[];
    return jobs.sort((a, b) => urgencyOrder(a.urgency) - urgencyOrder(b.urgency));
  } catch {
    return [];
  }
}

export default async function EnglishHomePage() {
  const urgentJobs = await fetchUrgentJobs();

  return (
    <PublicLayout locale="en">
      <SeoJsonLd
        id="home-page-schema-en"
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            webPageJsonLd({
              name: 'Healthcare staffing agency in Quebec',
              description:
                'Agence Sanitas connects healthcare professionals with assignments in Quebec and supports facilities with staffing needs.',
              url: '/en',
              locale: 'en',
            }),
          ],
        }}
      />
      <section className="relative isolate overflow-hidden bg-fg">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_BG} alt="" className="h-full w-full object-cover" aria-hidden />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-fg/80 via-fg/55 to-fg/15" aria-hidden />

        <div className="container-page relative pt-20 pb-20 sm:pt-24 sm:pb-24 lg:pt-28 lg:pb-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-bg/10 backdrop-blur px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-bg ring-1 ring-bg/25">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-bright" aria-hidden />
              Healthcare staffing agency · Laval, Quebec
            </p>
            <h1 className="mt-6 text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[1.06] tracking-[-0.025em] font-semibold text-bg">
              Healthcare assignments{' '}
              <span className="font-serif italic font-medium tracking-[-0.01em] text-[oklch(0.85_0.09_220)]">
                built around your reality.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-[17.5px] sm:text-[19px] leading-relaxed text-bg/85">
              Choose your regions, facilities, departments and preferred shifts. Sanitas helps you
              find opportunities that truly match what you are looking for.
            </p>
            <div className="mt-10 grid gap-6 sm:gap-10 sm:grid-cols-[auto_1px_auto] sm:items-start">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-bg/70 mb-3">
                  Healthcare professionals
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Link href={localizedPath('en', 'jobs')} className="inline-flex items-center justify-center rounded-full bg-bg px-6 py-3 text-[15.5px] font-semibold text-fg shadow-soft transition-all hover:bg-bg/90">
                    View open jobs
                  </Link>
                  <Link href={localizedPath('en', 'apply')} className="inline-flex items-center justify-center rounded-full border border-bg/40 bg-bg/10 backdrop-blur px-6 py-3 text-[15.5px] font-medium text-bg transition-colors hover:bg-bg/20">
                    Submit my profile
                  </Link>
                </div>
              </div>
              <div className="hidden sm:block w-px self-stretch bg-bg/25" aria-hidden />
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-bg/70 mb-3">
                  Healthcare facilities
                </p>
                <Link href={localizedPath('en', 'facilities')} className="inline-flex items-center justify-center rounded-full border border-bg/40 bg-bg/10 backdrop-blur px-6 py-3 text-[15.5px] font-medium text-bg transition-colors hover:bg-bg/20">
                  Request staff
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.18em] text-bg/65 mb-3">
              Quick search
            </p>
            <HomeSearch locale="en" />
          </div>
        </div>
      </section>

      {/* Reassurance band: structured stats + CNESST permit */}
      <section className="border-b border-border bg-surface">
        <div className="container-page py-6">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
            <EnHeroStat value="17" label="regions covered in Quebec" />
            <EnHeroStat value="14+" label="healthcare professions" />
            <EnHeroStat value="24h" label="average response time" />
            <div className="flex flex-col justify-center">
              <dt className="text-[12.5px] text-fg-subtle">CNESST permit</dt>
              <dd className="mt-0.5 text-[17px] font-semibold tracking-tight text-fg tabular-nums">
                AP-2000952
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">Urgent assignments</p>
              <h2 className="mt-2 text-display-lg text-fg">Roles to fill quickly</h2>
            </div>
            <Link href={localizedPath('en', 'jobs')} className="btn-secondary btn-sm self-start">
              All jobs
            </Link>
          </div>
          {urgentJobs.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-fg-muted leading-relaxed max-w-prose mx-auto">
                No urgent assignment is open right now. You can still send us your profile.
              </p>
              <Link href={localizedPath('en', 'apply')} className="btn-primary mt-5 inline-flex">
                Submit my profile
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {urgentJobs.map((job) => (
                <JobCard key={job.id} job={job} locale="en" />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section pt-6 sm:pt-8">
        <div className="container-page">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-end">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-fg-subtle">Our approach</p>
              <h2 className="mt-2 text-display-lg text-fg max-w-2xl">
                A healthcare staffing agency based in Laval.
              </h2>
            </div>
            <p className="text-[17.5px] leading-relaxed text-fg-muted max-w-prose">
              We combine human proximity, qualification discipline and responsive follow-up to
              connect healthcare professionals with the right assignments.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <Pillar icon={<TargetIcon className="h-7 w-7" />} title="Targeted assignments" body="Opportunities that match your profession, availability and preferences." />
            <Pillar icon={<HandshakeIcon className="h-7 w-7" />} title="Human follow-up" body="A reachable team, clear communication and no automated recruiting black box." />
            <Pillar icon={<BoltIcon className="h-7 w-7" />} title="Fast response" body="Quick file review and efficient connection with facilities." />
          </div>
        </div>
      </section>

      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Photo src={PHOTOS.candidates} alt="Healthcare professionals at work" aspect="landscape" rounded="3xl" className="w-full" />
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">For candidates</p>
              <h2 className="mt-2 text-display-lg text-fg">Healthcare professionals</h2>
              <p className="mt-4 text-[17.5px] leading-relaxed text-fg-muted max-w-prose">
                Find assignments compatible with your profession, availability, regions and goals.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {QUICK_PROFESSIONS.map((p) => (
                  <li key={p.label}>
                    <Link href={p.filter ? `${localizedPath('en', 'jobs')}?profession=${encodeURIComponent(p.filter)}` : localizedPath('en', 'jobs')} className="chip-link">
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={localizedPath('en', 'jobs')} className="btn-primary">View jobs</Link>
                <Link href={localizedPath('en', 'apply')} className="btn-secondary">Create my profile</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">For facilities</p>
              <h2 className="mt-2 text-display-lg text-fg">Need healthcare staff?</h2>
              <p className="mt-4 text-[17.5px] leading-relaxed text-fg-muted max-w-prose">
                Submit your staffing need and the Sanitas team will respond quickly. One-time,
                urgent, recurring or planned needs are handled in a structured way.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={localizedPath('en', 'facilities')} className="btn-primary">Request staff</Link>
                <Link href={localizedPath('en', 'contact')} className="btn-secondary">Contact us</Link>
              </div>
            </div>
            <Photo src={PHOTOS.establishments} alt="Medical team in a hospital environment" aspect="landscape" rounded="3xl" className="w-full lg:ml-auto" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">How it works</p>
            <h2 className="mt-2 text-display-lg text-fg">A simple process.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <ProcessColumn
              title="For candidates"
              tone="neutral"
              steps={[
                { icon: <SearchIcon className="h-5 w-5" />, label: 'Find an assignment' },
                { icon: <SendIcon className="h-5 w-5" />, label: 'Send your profile' },
                { icon: <ChecklistIcon className="h-5 w-5" />, label: 'Confirm details' },
                { icon: <ChatIcon className="h-5 w-5" />, label: 'Our team contacts you' },
              ]}
            />
            <ProcessColumn
              title="For facilities"
              tone="accent"
              steps={[
                { icon: <ClipboardIcon className="h-5 w-5" />, label: 'Submit a need' },
                { icon: <AnalyzeIcon className="h-5 w-5" />, label: 'We review it' },
                { icon: <PeopleIcon className="h-5 w-5" />, label: 'We suggest profiles' },
                { icon: <CheckCircleIcon className="h-5 w-5" />, label: 'You validate candidates' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="section bg-muted/40">
        <div className="container-page">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
                Testimonials
              </p>
              <h2 className="mt-2 text-display-lg text-fg">What candidates say about us.</h2>
            </div>
            <p className="text-[13.5px] text-fg-muted">
              Reviews available from our Google Business profile.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard key={testimonial.author} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 border-y border-border bg-surface">
        <div className="container-page">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.2em] text-fg-subtle text-center">
            Trusted by healthcare organizations
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-8 items-center justify-items-center max-w-5xl mx-auto">
            {PARTNERS.map((p) => (
              <PartnerLogo key={p.name} name={p.name} logo={p.logo} />
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-fg text-bg">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-display-lg">Questions? We will help.</h2>
          <p className="mt-5 text-[18px] leading-relaxed text-bg/70 max-w-prose mx-auto">
            Our team is available Monday to Friday to discuss your profile or staffing need.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={localizedPath('en', 'contact')} className="rounded-full bg-bg text-fg px-6 py-3 text-[15px] font-medium hover:opacity-90">
              Write to us
            </Link>
            <a href="tel:+14509739696" className="rounded-full border border-bg/30 px-6 py-3 text-[15px] font-medium hover:bg-bg/10">
              450 973-9696
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function EnHeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col justify-center">
      <dt className="order-2 mt-0.5 text-[13px] leading-snug text-fg-muted">{label}</dt>
      <dd className="order-1 text-[24px] font-semibold tracking-tight text-fg tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-card">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </div>
      <h3 className="mt-5 text-[19px] font-semibold text-fg">{title}</h3>
      <p className="mt-2 text-[16px] text-fg-muted leading-relaxed">{body}</p>
    </div>
  );
}

function ProcessColumn({
  title,
  steps,
  tone,
}: {
  title: string;
  steps: Array<{ icon: React.ReactNode; label: string }>;
  tone: 'neutral' | 'accent';
}) {
  const iconBg = tone === 'accent' ? 'bg-surface text-accent' : 'bg-surface text-fg';
  const wrapper = tone === 'accent' ? 'rounded-3xl bg-accent-soft p-6 sm:p-10' : 'rounded-3xl bg-muted/60 p-6 sm:p-10';
  return (
    <div className={wrapper}>
      <div className="text-center">
        <h3 className="text-[19px] font-semibold text-fg">{title}</h3>
        <ol className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={i} className="flex flex-col items-center">
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full shadow-soft ${iconBg}`}>
                {s.icon}
              </span>
              <span className="mt-3 text-[11.5px] font-semibold uppercase tracking-wider text-fg-subtle tabular-nums">
                Step {i + 1}
              </span>
              <p className="mt-1 text-[14.5px] text-fg leading-snug max-w-[14ch]">{s.label}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function PartnerLogo({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="flex h-14 w-full items-center justify-center px-3">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={name} loading="lazy" className="max-h-full max-w-full object-contain opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" />
      ) : (
        <span className="text-center text-[13px] font-semibold uppercase tracking-[0.15em] text-fg-subtle leading-tight">
          {name}
        </span>
      )}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const rating = testimonial.rating ?? 5;
  return (
    <figure className="card p-5 flex flex-col h-full">
      <div className="flex items-center gap-0.5 text-accent" aria-label={`${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} filled={index < rating} />
        ))}
      </div>
      <blockquote className="mt-4 text-[14.5px] leading-relaxed text-fg flex-1">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-5 pt-4 border-t border-border">
        <p className="text-[14px] font-medium text-fg">{testimonial.author}</p>
        <p className="text-[12.5px] text-fg-muted">{testimonial.role}</p>
      </figcaption>
    </figure>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9L10 15l-5.3 2.8 1-5.9L1.5 7.7l5.9-.9z" />
    </svg>
  );
}
