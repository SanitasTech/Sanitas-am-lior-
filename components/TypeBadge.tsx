import { cn } from '@/lib/utils';
import type { SubmissionType } from '@/types';

interface TypeBadgeProps {
  type: SubmissionType;
  className?: string;
}

export default function TypeBadge({ type, className }: TypeBadgeProps) {
  if (type === 'posting') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full bg-fg px-2.5 py-1 text-[12px] font-medium text-bg',
          className
        )}
      >
        Mandat précis
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
      Spontanée
    </span>
  );
}
