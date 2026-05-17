import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'oklch(var(--bg) / <alpha-value>)',
        surface: 'oklch(var(--surface) / <alpha-value>)',
        muted: 'oklch(var(--muted) / <alpha-value>)',
        border: 'oklch(var(--border) / <alpha-value>)',
        fg: 'oklch(var(--fg) / <alpha-value>)',
        'fg-muted': 'oklch(var(--fg-muted) / <alpha-value>)',
        'fg-subtle': 'oklch(var(--fg-subtle) / <alpha-value>)',
        accent: 'oklch(var(--accent) / <alpha-value>)',
        'accent-fg': 'oklch(var(--accent-fg) / <alpha-value>)',
        'accent-soft': 'oklch(var(--accent-soft) / <alpha-value>)',
        'accent-bright': 'oklch(var(--accent-bright) / <alpha-value>)',
        success: 'oklch(var(--success) / <alpha-value>)',
        'success-soft': 'oklch(var(--success-soft) / <alpha-value>)',
        warning: 'oklch(var(--warning) / <alpha-value>)',
        'warning-soft': 'oklch(var(--warning-soft) / <alpha-value>)',
        danger: 'oklch(var(--danger) / <alpha-value>)',
        'danger-soft': 'oklch(var(--danger-soft) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        // Police serif pour accents typographiques (hero, citations).
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 5vw, 4.25rem)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-lg': ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.125rem)', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
      },
      maxWidth: {
        prose: '65ch',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px 0 oklch(0.2 0.01 240 / 0.04), 0 1px 3px 0 oklch(0.2 0.01 240 / 0.05)',
        card: '0 1px 2px oklch(0.2 0.01 240 / 0.04), 0 4px 12px oklch(0.2 0.01 240 / 0.04)',
        ring: '0 0 0 1px oklch(var(--border))',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
