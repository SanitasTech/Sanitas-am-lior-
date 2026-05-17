import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
  step?: number | string;
}

export default function SectionCard({ title, helper, children, className, step }: SectionCardProps) {
  return (
    <section className={cn('card p-6 sm:p-8 shadow-soft', className)}>
      {(title || helper) && (
        <header className="mb-6">
          {step != null && (
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent">
              Étape {step}
            </p>
          )}
          {title && (
            <h2 className="mt-1 text-[24px] sm:text-[28px] font-semibold tracking-tight text-fg">
              {title}
            </h2>
          )}
          {helper && <p className="mt-2 text-[15.5px] text-fg-muted leading-relaxed max-w-prose">{helper}</p>}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}
