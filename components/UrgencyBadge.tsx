import { cn } from '@/lib/utils';

interface UrgencyBadgeProps {
  urgency?: string | null;
  className?: string;
}

export default function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  if (!urgency || urgency === 'normal') return null;
  const isUrgent = urgency === 'urgent';
  const label = isUrgent ? 'Urgent' : 'Prioritaire';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium',
        isUrgent ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isUrgent ? 'bg-danger' : 'bg-warning'
        )}
      />
      {label}
    </span>
  );
}
