import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: [
            'node_modules/',
            '.next/',
            'out/',
            'src/test/',
            '**/*.d.ts',
            '**/*.config.*',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: 'coverage',
            exclude: [
                'node_modules/',
                '.next/',
                'out/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/stories/**',
                '**/__mocks__/**',
            ],
            thresholds: {
                global: {
                    branches: 70,
                    functions: 70,
                    lines: 70,
                    statements: 70,
                },
            },
        },
        ui: true,
        open: false,
        bail: 0,
        logHeapUsage: true,
        isolate: true,
        testTimeout: 10000,
        hookTimeout: 10000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@/components': path.resolve(__dirname, './src/components'),
            '@/hooks': path.resolve(__dirname, './src/hooks'),
            '@/stores': path.resolve(__dirname, './src/stores'),
            '@/lib': path.resolve(__dirname, './src/lib'),
            '@/pages': path.resolve(__dirname, './src/pages'),
            '@/app': path.resolve(__dirname, './src/app'),
        },
    },
});