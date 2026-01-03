import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
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
