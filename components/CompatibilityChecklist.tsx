import { cn } from '@/lib/utils';

export type CheckState = 'ok' | 'warn' | 'block' | 'na';

interface Item {
  label: string;
  state: CheckState;
  hint?: string;
}

const ICONS: Record<CheckState, { sym: string; cls: string; bg: string }> = {
  ok: { sym: '✓', cls: 'text-success', bg: 'bg-success-soft' },
  warn: { sym: '⚠', cls: 'text-warning', bg: 'bg-warning-soft' },
  block: { sym: '✕', cls: 'text-danger', bg: 'bg-danger-soft' },
  na: { sym: '·', cls: 'text-fg-subtle', bg: 'bg-muted' },
};

export default function CompatibilityChecklist({ items }: { items: Item[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const ico = ICONS[item.state];
        return (
          <li key={i} className="flex items-start gap-3 text-[14px]">
            <span
              className={cn(
                'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-medium mt-0.5',
                ico.bg,
                ico.cls
              )}
              aria-hidden
            >
              {ico.sym}
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn('leading-snug', item.state === 'na' ? 'text-fg-muted' : 'text-fg')}>
                {item.label}
              </p>
              {item.hint && <p className="text-[12.5px] text-fg-muted mt-0.5">{item.hint}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
