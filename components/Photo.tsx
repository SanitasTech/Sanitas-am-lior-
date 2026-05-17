import { cn } from '@/lib/utils';

interface PhotoProps {
  src: string;
  alt: string;
  className?: string;
  aspect?: 'square' | 'portrait' | 'landscape' | 'wide';
  rounded?: 'lg' | 'xl' | '2xl' | '3xl';
  overlay?: boolean;
}

const ASPECTS: Record<NonNullable<PhotoProps['aspect']>, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
};

const ROUNDED: Record<NonNullable<PhotoProps['rounded']>, string> = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

/**
 * Composant photo avec traitement uniforme.
 * Pour remplacer une photo : modifie l'attribut `src` aux endroits d'utilisation,
 * ou place tes propres photos dans /public/images/ et utilise `/images/nom.jpg`.
 */
export default function Photo({
  src,
  alt,
  className,
  aspect = 'landscape',
  rounded = '2xl',
  overlay = false,
}: PhotoProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        ASPECTS[aspect],
        ROUNDED[rounded],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-fg/30 via-transparent to-transparent" />
      )}
    </div>
  );
}
