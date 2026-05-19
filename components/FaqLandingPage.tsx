import Link from 'next/link';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

interface FaqLandingPageProps {
  eyebrow: string;
  title: string;
  intro: string;
  groups: FaqGroup[];
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export default function FaqLandingPage({
  eyebrow,
  title,
  intro,
  groups,
  primaryCta,
  secondaryCta,
}: FaqLandingPageProps) {
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

      <section className="section">
        <div className="container-page max-w-4xl">
          <div className="space-y-10">
            {groups.map((group) => (
              <section key={group.title}>
                <h2 className="text-[22px] font-semibold text-fg">{group.title}</h2>
                <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
                  {group.items.map((item) => (
                    <details key={item.question} className="group p-5 open:bg-muted/30">
                      <summary className="cursor-pointer list-none text-[16px] font-medium text-fg">
                        <span className="inline-flex w-full items-start justify-between gap-4">
                          {item.question}
                          <span className="mt-1 text-accent transition-transform group-open:rotate-45" aria-hidden>
                            +
                          </span>
                        </span>
                      </summary>
                      <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
