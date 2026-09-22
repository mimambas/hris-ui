import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          surface: 'var(--primary-surface)',
        },
        cta: {
          DEFAULT: 'var(--cta)',
          hover: 'var(--cta-hover)',
          surface: 'var(--cta-surface)',
        },
        ink: 'var(--ink)',
        body: 'var(--body-text)',
        muted: {
          DEFAULT: 'var(--muted)',
          soft: 'var(--muted-soft)',
        },
        hairline: {
          DEFAULT: 'var(--hairline)',
          soft: 'var(--hairline-soft)',
        },
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface-soft)',
          soft: 'var(--surface-soft)',
          strong: 'var(--surface-strong)',
          dark: 'var(--surface-dark)',
          card: 'var(--canvas)',
        },
        accent: {
          yellow: '#f59e0b',
        },
        semantic: {
          up: 'var(--semantic-up)',
          down: 'var(--semantic-down)',
        },
        'on-primary': '#ffffff',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
