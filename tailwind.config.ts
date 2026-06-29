import type { Config } from 'tailwindcss';

/**
 * Tailwind maps utilities onto the semantic CSS-variable design tokens defined
 * in src/styles/tokens.css. Components reference these semantic utilities only —
 * never raw hex/spacing — per the Design System and Architectural Invariants.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': 'var(--color-bg-base)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-strong': 'var(--color-border-strong)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        highlight: 'var(--color-highlight)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'focus-ring': 'var(--color-focus-ring)',
        'status-want': 'var(--status-want)',
        'status-watching': 'var(--status-watching)',
        'status-completed': 'var(--status-completed)',
        'status-onhold': 'var(--status-onhold)',
        'status-dropped': 'var(--status-dropped)',
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '200ms',
        slow: '320ms',
        cinematic: '600ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
