'use client';

import { cn } from '@/lib/utils';

interface SegmentedChoicesProps {
  options: readonly string[] | string[];
  value?: string | string[];
  onChange: (next: string | string[]) => void;
  multi?: boolean;
  ariaLabel?: string;
}

export default function SegmentedChoices({
  options,
  value,
  onChange,
  multi = false,
  ariaLabel,
}: SegmentedChoicesProps) {
  const selected = multi
    ? new Set<string>(Array.isArray(value) ? value : value ? [value] : [])
    : new Set<string>(typeof value === 'string' ? [value] : []);

  function toggle(opt: string) {
    if (multi) {
      const next = new Set(selected);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      onChange(Array.from(next));
    } else {
      onChange(opt);
    }
  }

  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.has(opt);
        return (
          <button
            type="button"
            key={opt}
            aria-pressed={active}
            onClick={() => toggle(opt)}
            className={cn('chip', active && 'chip-active')}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
