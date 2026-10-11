import type { Config } from 'tailwindcss';
import {
  LAYOUT_TOKENS,
  SYSTEM_FONT_STACK,
  TYPOGRAPHY_TOKENS,
} from './src/styles/theme';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/styles/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          header: 'rgb(var(--wa-header-bg) / <alpha-value>)',
          accent: 'rgb(var(--wa-accent-green) / <alpha-value>)',
          'dark-green': 'rgb(var(--wa-dark-green) / <alpha-value>)',
          'chat-bg': 'rgb(var(--wa-chat-bg) / <alpha-value>)',
          'bubble-out': 'rgb(var(--wa-bubble-out) / <alpha-value>)',
          'bubble-in': 'rgb(var(--wa-bubble-in) / <alpha-value>)',
          'text-primary': 'rgb(var(--wa-text-primary) / <alpha-value>)',
          'text-secondary': 'rgb(var(--wa-text-secondary) / <alpha-value>)',
          'read-tick': 'rgb(var(--wa-read-tick) / <alpha-value>)',
          panel: 'rgb(var(--wa-panel-bg) / <alpha-value>)',
          'app-bg': 'rgb(var(--wa-app-bg) / <alpha-value>)',
          border: 'rgb(var(--wa-border) / <alpha-value>)',
          composer: 'rgb(var(--wa-composer-bg) / <alpha-value>)',
          'system-bg': 'rgb(var(--wa-system-bg) / <alpha-value>)',
          'system-text': 'rgb(var(--wa-system-text) / <alpha-value>)',
          'nav-pill': 'rgb(var(--wa-nav-pill-bg) / <alpha-value>)',
          commerce: {
            DEFAULT: 'rgb(var(--wa-commerce-gold) / <alpha-value>)',
            hover: 'rgb(var(--wa-commerce-gold-hover) / <alpha-value>)',
            text: 'rgb(var(--wa-commerce-gold-text) / <alpha-value>)',
          },
        },
      },
      fontFamily: {
        sans: [SYSTEM_FONT_STACK],
      },
      fontSize: {
        'wa-msg': [
          TYPOGRAPHY_TOKENS.message.fontSize,
          {
            lineHeight: TYPOGRAPHY_TOKENS.message.lineHeight,
            fontWeight: TYPOGRAPHY_TOKENS.message.fontWeight,
          },
        ],
        'wa-meta': [
          TYPOGRAPHY_TOKENS.meta.fontSize,
          {
            lineHeight: TYPOGRAPHY_TOKENS.meta.lineHeight,
            fontWeight: TYPOGRAPHY_TOKENS.meta.fontWeight,
          },
        ],
        'wa-contact': [
          TYPOGRAPHY_TOKENS.contactName.fontSize,
          {
            lineHeight: TYPOGRAPHY_TOKENS.contactName.lineHeight,
            fontWeight: TYPOGRAPHY_TOKENS.contactName.fontWeight,
          },
        ],
        'wa-preview': [
          TYPOGRAPHY_TOKENS.preview.fontSize,
          {
            lineHeight: TYPOGRAPHY_TOKENS.preview.lineHeight,
            fontWeight: TYPOGRAPHY_TOKENS.preview.fontWeight,
          },
        ],
        'wa-title': [
          TYPOGRAPHY_TOKENS.screenTitle.fontSize,
          {
            lineHeight: TYPOGRAPHY_TOKENS.screenTitle.lineHeight,
            fontWeight: TYPOGRAPHY_TOKENS.screenTitle.fontWeight,
          },
        ],
        'wa-body': [
          TYPOGRAPHY_TOKENS.body.fontSize,
          {
            lineHeight: TYPOGRAPHY_TOKENS.body.lineHeight,
            fontWeight: TYPOGRAPHY_TOKENS.body.fontWeight,
          },
        ],
      },
      boxShadow: {
        'wa-bubble': '0 1px 0.5px rgba(11, 20, 26, 0.13)',
        'wa-panel': '0 2px 6px rgba(11, 20, 26, 0.12)',
        cta: '0 4px 12px rgba(242, 183, 5, 0.35)',
      },
      borderRadius: {
        'wa-bubble': LAYOUT_TOKENS.bubbleRadius,
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        fast: LAYOUT_TOKENS.transitionDuration,
        normal: '200ms',
      },
    },
  },
  plugins: [],
};

export default config;
