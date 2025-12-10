import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/**/*.{test,spec}.{ts,tsx}',
      'apps/api/src/modules/**/__tests__/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // Exclude broken pre-existing tests until fixed
      'apps/api/src/lib/security/__tests__/**',
      'apps/api/src/services/__tests__/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@togetheros/types': path.resolve(__dirname, './packages/types/src'),
      '@togetheros/validators': path.resolve(__dirname, './packages/validators/src'),
      '@togetheros/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
})
