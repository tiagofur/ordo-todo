import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.tsx'],
        exclude: ['e2e/**', 'node_modules/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'vitest.setup.ts',
                '**/*.config.*',
                '**/types/**',
                '**/*.d.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
            '@ordo-todo/api-client': path.resolve(import.meta.dirname, '../../packages/api-client/src/index.ts'),
            '@ordo-todo/online-status': path.resolve(import.meta.dirname, '../../packages/online-status/src/index.ts'),
            // Web runtime-imports the sync engine now: test the source, not a
            // possibly stale dist (same pattern as api-client/online-status).
            '@ordo-todo/stores': path.resolve(import.meta.dirname, '../../packages/stores/src/index.ts'),
        },
    },
});
