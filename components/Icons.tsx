// =====================================================================
// Bibliothèque d'icônes SVG sur mesure - style line, traits constants
// =====================================================================
// Chaque icône utilise currentColor pour s'adapter à la couleur du parent.
// Taille par défaut 24, modifiable via className (h-X w-X).

interface IconProps {
  className?: string;
}

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

// Piliers de la page d'accueil

export function TargetIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function HandshakeIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="M3 12h3l3-3 3 3 3-3 3 3h3" />
      <path d="M9 15c0 1.5 1 2.5 2.5 2.5S14 16.5 14 15" />
      <path d="M6 9V6h4" />
      <path d="M18 9V6h-4" />
    </svg>
  );
}

export function BoltIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7z" />
    </svg>
  );
}

// Étapes du processus

export function SearchIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.5-4.5" />
    </svg>
  );
}

export function SendIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="m4 12 17-8-6 17-3-7z" />
      <path d="m11 13 4-5" />
    </svg>
  );
}

export function ChecklistIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="m8 11 2 2 4-4" />
      <path d="M8 17h8" />
    </svg>
  );
}

export function ChatIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" />
    </svg>
  );
}

export function ClipboardIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

export function AnalyzeIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="M4 20V8M10 20V4M16 20v-9M22 20V13" />
    </svg>
  );
}

export function PeopleIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <circle cx="9" cy="9" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5" />
      <path d="M14 20c0-2 1.5-3.5 3.5-3.5S21 18 21 20" />
    </svg>
  );
}

export function CheckCircleIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-5" />
    </svg>
  );
}

export function MapPinIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function ArrowRightIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg {...baseProps} className={className} aria-hidden>
      <path d="M4 12h16" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

// Éléments décoratifs

export function DecorativeWave({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 1200 80"
      fill="none"
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <path
        d="M0 40 C 200 80, 400 0, 600 40 S 1000 80, 1200 40 L1200 80 L0 80 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function DecorativeBlob({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 400 400" fill="none" className={className} aria-hidden>
      <defs>
        <radialGradient id="blob-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M200 30 C 320 30 380 110 370 200 C 360 290 290 360 200 370 C 110 380 30 310 30 200 C 30 90 80 30 200 30 Z"
        fill="url(#blob-grad)"
      />
    </svg>
  );
}

export function DotPattern({ className = '' }: IconProps) {
  return (
    <svg className={className} aria-hidden>
      <defs>
        <pattern id="dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

