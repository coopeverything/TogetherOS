import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/.next/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@togetheros/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@togetheros/types': path.resolve(__dirname, '../../packages/types/src'),
      '@togetheros/validators': path.resolve(__dirname, '../../packages/validators/src'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, '../../lib'),
      '@': path.resolve(__dirname, './'),
    },
  },
})
