/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // TogetherOS Design System - Warm Minimalism
        border: 'var(--border)',
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
        },
        ink: {
          900: 'var(--ink-900)',
          700: 'var(--ink-700)',
          400: 'var(--ink-400)',
        },
        brand: {
          100: 'var(--brand-100)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
        },
        joy: {
          100: 'var(--joy-100)',
          500: 'var(--joy-500)',
          600: 'var(--joy-600)',
        },
        success: 'var(--success)',
        'success-bg': 'var(--success-bg)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',
        warn: 'var(--warn)',
        'warn-bg': 'var(--warn-bg)',
        danger: 'var(--danger)',
        'danger-bg': 'var(--danger-bg)',
      },
      borderRadius: {
        lg: '1rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
