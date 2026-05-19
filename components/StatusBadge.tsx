import { cn } from '@/lib/utils';
import { displayValue, type Locale } from '@/lib/i18n';

interface StatusBadgeProps {
  status: string;
  className?: string;
  locale?: Locale;
}

const STYLES: Record<string, string> = {
  'Nouveau': 'bg-accent-soft text-accent',
  'À appeler': 'bg-warning-soft text-warning',
  'Qualifié': 'bg-muted text-fg',
  'Documents manquants': 'bg-warning-soft text-warning',
  'Prêt à présenter': 'bg-success-soft text-success',
  'Présenté': 'bg-accent-soft text-accent',
  'Placé': 'bg-success-soft text-success',
  'Refusé': 'bg-danger-soft text-danger',
  'Inactif': 'bg-muted text-fg-muted',
  'À rappeler': 'bg-warning-soft text-warning',
  'Contacté': 'bg-muted text-fg',
  'Non disponible': 'bg-muted text-fg-muted',
  // Establishment request
  'Nouvelle': 'bg-accent-soft text-accent',
  'À analyser': 'bg-warning-soft text-warning',
  'En traitement': 'bg-muted text-fg',
  'Poste créé': 'bg-success-soft text-success',
  'Fermée': 'bg-muted text-fg-muted',
};

export default function StatusBadge({ status, className, locale = 'fr' }: StatusBadgeProps) {
  const style = STYLES[status] || 'bg-muted text-fg-muted';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[12.5px] font-medium',
        style,
        className
      )}
    >
      {displayValue(locale, status)}
    </span>
  );
}
