import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: 'rgb(var(--color-brand-green) / <alpha-value>)',
            dark: 'rgb(var(--color-brand-green-dark) / <alpha-value>)',
            light: 'rgb(var(--color-brand-green-light) / <alpha-value>)',
            soft: 'rgb(var(--color-brand-green-soft) / <alpha-value>)',
          },
          gold: {
            DEFAULT: 'rgb(var(--color-brand-gold) / <alpha-value>)',
            hover: 'rgb(var(--color-brand-gold-hover) / <alpha-value>)',
            light: 'rgb(var(--color-brand-gold-light) / <alpha-value>)',
          },
          cream: {
            DEFAULT: 'rgb(var(--color-brand-cream) / <alpha-value>)',
            card: 'rgb(var(--color-brand-cream-card) / <alpha-value>)',
            subtle: 'rgb(var(--color-brand-cream-subtle) / <alpha-value>)',
          },
          ink: {
            DEFAULT: 'rgb(var(--color-brand-ink) / <alpha-value>)',
            muted: 'rgb(var(--color-brand-ink-muted) / <alpha-value>)',
          },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Helvetica Neue"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Noto Sans CJK SC"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 12px 32px -8px rgba(17, 27, 33, 0.07), 0 4px 12px -2px rgba(17, 27, 33, 0.04)',
        bubble: '0 10px 25px -5px rgba(17, 27, 33, 0.18), 0 4px 10px -2px rgba(17, 27, 33, 0.08)',
        cta: '0 8px 22px -4px rgba(244, 180, 26, 0.5)',
        floating: '0 14px 30px -4px rgba(15, 76, 58, 0.42)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
