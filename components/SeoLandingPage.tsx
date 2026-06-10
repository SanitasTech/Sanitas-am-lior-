import Link from 'next/link';

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
  return (
    <>
      <section className="section pt-16 pb-10 bg-muted/30 border-b border-border">
        <div className="container-page max-w-4xl">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-display-lg text-fg">{title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-fg-muted">{intro}</p>
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

      <section className="section pt-10 pb-8">
        <div className="container-page">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="card p-5">
                <p className="text-[15px] font-medium leading-relaxed text-fg">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-6 pb-10">
        <div className="container-page max-w-4xl">
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section) => (
              <section key={section.title} className="card p-6">
                <h2 className="text-[20px] font-semibold text-fg">{section.title}</h2>
                <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      {faq.length > 0 ? (
        <section className="section pt-2 pb-10">
          <div className="container-page max-w-4xl">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-[20px] font-semibold text-fg">
                {relatedTitle === 'Useful links' ? 'Frequently asked questions' : 'Questions fréquentes'}
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {faq.map((item) => (
                  <article key={item.question}>
                    <h3 className="text-[15.5px] font-semibold leading-snug text-fg">{item.question}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {relatedLinks.length > 0 ? (
        <section className="pb-20">
          <div className="container-page max-w-4xl">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-[18px] font-semibold text-fg">{relatedTitle}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="chip-link">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
