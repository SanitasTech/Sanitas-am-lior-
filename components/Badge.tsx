import { cn } from '@/lib/utils';

const VARIANTS = {
  urgent: 'badge-urgent',
  priority: 'badge-priority',
  accent: 'badge-accent',
  success: 'badge-success',
  neutral: 'badge-neutral',
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Pastille informative harmonisée (urgence, international, région éloignée,
// quart…). Purement visuelle, jamais cliquable.
export default function Badge({ variant = 'neutral', dot = false, className, children }: BadgeProps) {
  return (
    <span className={cn('badge', VARIANTS[variant], className)}>
      {dot && <span className="badge-dot" aria-hidden />}
      {children}
    </span>
  );
}
