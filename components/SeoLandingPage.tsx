import Link from 'next/link';
import { CheckCircleIcon } from '@/components/Icons';

interface SeoLandingPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  highlights: string[];
  sections: Array<{ title: string; body: string }>;
  faq?: Array<{ question: string; answer: string }>;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  relatedLinks?: Array<{ label: string; href: string }>;
  relatedTitle?: string;
}

export default function SeoLandingPage({
  eyebrow,
  title,
  intro,
  highlights,
  sections,
  faq = [],
  primaryCta,
  secondaryCta,
  relatedLinks = [],
  relatedTitle = 'Liens utiles',
}: SeoLandingPageProps) {
  const isEnglish = relatedTitle === 'Useful links';
  return (
    <>
      <section className="section pt-16 pb-12 bg-muted/30 border-b border-border">
        <div className="container-page max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 text-display-lg text-fg">{title}</h1>
          <p className="mt-5 max-w-2xl text-[17.5px] leading-relaxed text-fg-muted">{intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={primaryCta.href} className="btn-primary">
              {primaryCta.label}
            </Link>
            {secondaryCta ? (
              <Link href={secondaryCta.href} className="btn-secondary">
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {highlights.length > 0 && (
        <section className="border-b border-border bg-surface">
          <div className="container-page py-8">
            <ul className="grid gap-5 md:grid-cols-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <p className="text-[15px] font-medium leading-relaxed text-fg">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-page max-w-4xl">
          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
            {sections.map((section) => (
              <section key={section.title} className="border-l-2 border-accent/25 pl-5">
                <h2 className="text-[19px] font-semibold tracking-tight text-fg">{section.title}</h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      {faq.length > 0 ? (
        <section className="section pt-0">
          <div className="container-page max-w-4xl">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-2 text-display-md text-fg">
              {isEnglish ? 'Frequently asked questions' : 'Questions fréquentes'}
            </h2>
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface px-6">
              {faq.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold leading-snug text-fg transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 shrink-0 text-fg-subtle transition-transform group-open:rotate-180"
                      aria-hidden
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-fg-muted">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedLinks.length > 0 ? (
        <section className="pb-14">
          <div className="container-page max-w-4xl">
            <p className="eyebrow-subtle">{relatedTitle}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="chip-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section bg-fg text-bg">
        <div className="container-page max-w-3xl text-center">
          <h2 className="text-display-md">
            {isEnglish ? 'Ready to take the next step?' : 'Prêt à faire le prochain pas ?'}
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-bg/70">
            {isEnglish
              ? 'Our team replies quickly during business hours.'
              : 'Notre équipe vous répond rapidement pendant les heures de bureau.'}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href={primaryCta.href} className="btn-dark">
              {primaryCta.label}
            </Link>
            {secondaryCta ? (
              <Link href={secondaryCta.href} className="btn border border-bg/30 text-bg hover:bg-bg/10">
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
