import { cn } from '@/lib/utils';
import type { SubmissionType } from '@/types';
import type { Locale } from '@/lib/i18n';

interface TypeBadgeProps {
  type: SubmissionType;
  className?: string;
  locale?: Locale;
}

export default function TypeBadge({ type, className, locale = 'fr' }: TypeBadgeProps) {
  if (type === 'posting') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-fg px-2.5 py-1 text-[12px] font-medium text-bg',
          className
        )}
      >
        {locale === 'en' ? 'Specific assignment' : 'Mandat precis'}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-medium text-accent',
        className
      )}
    >
      {locale === 'en' ? 'Spontaneous' : 'Spontanee'}
    </span>
  );
}
