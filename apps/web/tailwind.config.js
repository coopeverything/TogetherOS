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
      // Density-scaled spacing (uses --density CSS variable)
      spacing: {
        'd1': 'var(--space-density-1)',
        'd2': 'var(--space-density-2)',
        'd3': 'var(--space-density-3)',
        'd4': 'var(--space-density-4)',
        'd5': 'var(--space-density-5)',
        'd6': 'var(--space-density-6)',
        'd8': 'var(--space-density-8)',
      },
      // Density-scaled font sizes
      fontSize: {
        'dxs': 'var(--fs-density-xs)',
        'dsm': 'var(--fs-density-sm)',
        'dbase': 'var(--fs-density-base)',
        'dlg': 'var(--fs-density-lg)',
        'dxl': 'var(--fs-density-xl)',
        'd2xl': 'var(--fs-density-2xl)',
      },
      // Density-scaled gap
      gap: {
        'd1': 'var(--gap-density-1)',
        'd2': 'var(--gap-density-2)',
        'd3': 'var(--gap-density-3)',
        'd4': 'var(--gap-density-4)',
        'd6': 'var(--gap-density-6)',
      },
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
        // Accent palette (4 levels for decorative differentiation)
        accent: {
          1: 'var(--accent-1)',
          '1-bg': 'var(--accent-1-bg)',
          2: 'var(--accent-2)',
          '2-bg': 'var(--accent-2-bg)',
          3: 'var(--accent-3)',
          '3-bg': 'var(--accent-3-bg)',
          4: 'var(--accent-4)',
          '4-bg': 'var(--accent-4-bg)',
        },
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
      screens: {
        'tablet-lg': '1600px',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
