import { COMPANY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n';

interface ContactInfoProps {
  variant?: 'compact' | 'full';
  className?: string;
  locale?: Locale;
}

export default function ContactInfo({ variant = 'full', className, locale = 'fr' }: ContactInfoProps) {
  return (
    <address className={cn('not-italic text-[15px] text-fg leading-relaxed', className)}>
      <p className="font-medium">{COMPANY.name}</p>
      {variant === 'full' && (
        <p className="text-fg-muted">
          {locale === 'en' ? 'Healthcare staffing agency' : COMPANY.tagline}
        </p>
      )}
      <p className="mt-2">
        <a href={COMPANY.phoneHref} className="hover:underline">
          {COMPANY.phone}
        </a>
      </p>
      <p>
        <a href={COMPANY.emailHref} className="hover:underline">
          {COMPANY.email}
        </a>
      </p>
      <p className="mt-2 text-fg-muted">
        {COMPANY.address.line1}, {COMPANY.address.line2}
        <br />
        {COMPANY.address.city}, {COMPANY.address.province}, {COMPANY.address.postal}
      </p>
      <p className="mt-3 text-[13.5px] text-fg-subtle">
        {locale === 'en' ? 'CNESST permit' : 'Permis CNESST'} ·{' '}
        <span className="font-medium text-fg-muted">{COMPANY.cnesstPermit}</span>
      </p>
    </address>
  );
}
