import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        // Fix double-free error by limiting threads and pool options
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: true,
            },
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'vitest.setup.ts',
                '**/*.config.*',
                '**/types/**',
                '**/*.d.ts',
                '**/__tests__/**',
            ],
        },
    },
    resolve: {
        alias: {
            '@ordo-todo/core': path.resolve(__dirname, '../core/src'),
            '@ordo-todo/api-client': path.resolve(__dirname, '../api-client/src'),
        },
    },
});
