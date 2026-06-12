import Badge from '@/components/Badge';
import { URGENCY_DISPLAY, type Locale } from '@/lib/i18n';

interface UrgencyBadgeProps {
  urgency?: string | null;
  className?: string;
  locale?: Locale;
}

export default function UrgencyBadge({ urgency, className, locale = 'fr' }: UrgencyBadgeProps) {
  if (!urgency || urgency === 'normal') return null;
  const isUrgent = urgency === 'urgent';
  const label = URGENCY_DISPLAY[urgency]?.[locale] || (isUrgent ? 'Urgent' : 'Prioritaire');
  return (
    <Badge variant={isUrgent ? 'urgent' : 'priority'} dot className={className}>
      {label}
    </Badge>
  );
}
