import type { Locale } from '@/lib/i18n';

const COPY = {
  fr: {
    badge: 'Signal Sanitas',
    title: 'Mandat compatible',
    center: 'Aligné',
    subtitle: 'Même groupe: région, département, quart.',
    presentable: 'Présentable',
    chips: ['Gaspésie', 'Urgence', 'Jour'],
    checks: ['Profession', 'Région', 'Département', 'Quart'],
    pulse: 'Matching actif',
    proof: [
      { value: '17', label: 'régions' },
      { value: '14+', label: 'professions' },
      { value: '24 h', label: 'réponse' },
    ],
  },
  en: {
    badge: 'Sanitas signal',
    title: 'Compatible assignment',
    center: 'Aligned',
    subtitle: 'Same group: region, department, shift.',
    presentable: 'Presentable',
    chips: ['Gaspesie', 'Emergency', 'Day'],
    checks: ['Profession', 'Region', 'Department', 'Shift'],
    pulse: 'Active matching',
    proof: [
      { value: '17', label: 'regions' },
      { value: '14+', label: 'professions' },
      { value: '24h', label: 'response' },
    ],
  },
} satisfies Record<Locale, unknown>;

export function HeroProofStrip({ locale = 'fr' }: { locale?: Locale }) {
  const copy = COPY[locale];

  return (
    <dl className="mt-12 grid max-w-full grid-cols-3 overflow-hidden rounded-2xl border border-bg/20 bg-bg/10 text-bg shadow-[0_24px_80px_oklch(0.1_0.02_240_/_0.22)] sm:max-w-2xl">
      {copy.proof.map((item) => (
        <div key={item.label} className="min-w-0 px-3 py-4 sm:px-5 sm:py-5 [&+&]:border-l [&+&]:border-bg/15">
          <dt className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-bg/58 sm:text-[11px] sm:tracking-[0.16em]">
            {item.label}
          </dt>
          <dd className="mt-1 font-serif text-[clamp(1.35rem,6vw,2.35rem)] italic leading-none tracking-[-0.06em] text-[oklch(var(--accent-bright))]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SanitasSignal({ locale = 'fr' }: { locale?: Locale }) {
  const copy = COPY[locale];

  return (
    <aside className="sanitas-signal-panel hidden lg:block" aria-label={copy.title}>
      <div className="sanitas-signal-grid" aria-hidden />
      <div className="sanitas-signal-scan" aria-hidden />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            {copy.badge}
          </p>
          <h2 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-fg">
            {copy.title}
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1.5 text-[12px] font-medium text-fg">
          <span className="sanitas-pulse-dot" aria-hidden />
          {copy.presentable}
        </span>
      </div>

      <div className="relative z-10 mt-9 aspect-square rounded-[2rem] border border-border/70 bg-muted/55 p-8">
        <div className="sanitas-orbit sanitas-orbit-one" aria-hidden />
        <div className="sanitas-orbit sanitas-orbit-two" aria-hidden />
        <div className="absolute inset-[31%] rounded-full border border-accent/35 bg-surface/80 shadow-soft" aria-hidden />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-[30px] font-semibold leading-none tracking-[-0.05em] text-accent">{copy.center}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-fg-subtle">
              {copy.pulse}
            </p>
          </div>
        </div>
        <SignalNode className="left-[11%] top-[22%]" label={copy.checks[0]} />
        <SignalNode className="right-[8%] top-[35%]" label={copy.checks[1]} />
        <SignalNode className="bottom-[18%] left-[18%]" label={copy.checks[2]} />
        <SignalNode className="bottom-[13%] right-[18%]" label={copy.checks[3]} />
      </div>

      <div className="relative z-10 mt-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <p className="text-[14px] leading-relaxed text-fg-muted">{copy.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {copy.chips.map((chip) => (
            <span key={chip} className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1.5 text-[13px] font-medium text-fg">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function SignalNode({ className, label }: { className: string; label: string }) {
  return (
    <div className={`absolute ${className} sanitas-node`}>
      <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_6px_oklch(var(--accent)_/_0.13)]" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
