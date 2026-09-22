import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
          muted: '#A5B4FC',
          surface: '#EEF2FF',
        },
        cta: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#34D399',
          surface: '#ECFDF5',
        },
        ink: '#1E1B4B',
        body: '#475569',
        'body-strong': '#1E1B4B',
        muted: '#64748B',
        'muted-soft': '#94A3B8',
        hairline: '#E2E8F0',
        'hairline-soft': '#F1F5F9',
        canvas: '#FFFFFF',
        'surface-soft': '#F5F3FF',
        'surface-card': '#FFFFFF',
        'surface-strong': '#F1F5F9',
        'surface-dark': '#1E1B4B',
        'surface-dark-elevated': '#312E81',
        'on-primary': '#FFFFFF',
        'on-dark': '#FFFFFF',
        'on-dark-soft': '#A5B4FC',
        'semantic-up': '#10B981',
        'semantic-down': '#EF4444',
        'accent-yellow': '#F59E0B',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '-apple-system', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'monospace'],
      },
      borderRadius: {
        pill: '100px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(99,102,241,0.06)',
        'card-hover': '0 8px 24px rgba(99,102,241,0.10)',
        'modal': '0 20px 60px rgba(0,0,0,0.12)',
      },
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
