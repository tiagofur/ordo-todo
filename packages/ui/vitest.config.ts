import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        '**/*.config.*',
        '**/types/**',
        '**/*.d.ts',
        'src/components/ui', // Base UI components tested separately
      ],
    },
  },
  resolve: {
    alias: {
      '@ordo-todo/core': path.resolve(import.meta.dirname, '../core/src'),
      '@ordo-todo/hooks': path.resolve(import.meta.dirname, '../hooks/src'),
      '@ordo-todo/stores': path.resolve(import.meta.dirname, '../stores/src'),
      '@ordo-todo/api-client': path.resolve(import.meta.dirname, '../api-client/src'),
      '@ordo-todo/i18n': path.resolve(import.meta.dirname, '../i18n/src'),
    },
  },
});
