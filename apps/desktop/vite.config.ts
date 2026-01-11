import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import renderer from 'vite-plugin-electron-renderer'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                // Shortcut of `build.lib.entry`
                entry: 'electron/main.ts',
                vite: {
                    build: {
                        rollupOptions: {
                            external: ['better-sqlite3'],
                            output: {
                                format: 'cjs',
                                entryFileNames: 'main.js',
                            },
                        },
                    },
                },
            },
            preload: {
                // Shortcut of `build.rollupOptions.input`
                input: 'electron/preload.ts',
            },
        }),
        renderer(),
    ],
    // Polyfill for @electron/remote
    define: {
        'process.env': '{}',
        'global': 'globalThis',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
            // Workspace aliases for monorepo
            '@ordo-todo/ui': resolve(__dirname, '../../packages/ui/src'),
            '@ordo-todo/hooks': resolve(__dirname, '../../packages/hooks/src'),
            '@ordo-todo/api-client': resolve(__dirname, '../../packages/api-client/src'),
            '@ordo-todo/core': resolve(__dirname, '../../packages/core/src'),
            '@ordo-todo/stores': resolve(__dirname, '../../packages/stores/src'),
        },
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        commonjsOptions: {
            // Transform CommonJS modules to ESM
            include: [/packages\/api-client/, /node_modules/],
            transformMixedEsModules: true,
        },
        rollupOptions: {
            // Externalize only non-electron modules that shouldn't be bundled
            external: [],
            plugins: process.env.ANALYZE_BUNDLE ? [
                visualizer({
                    filename: 'dist/bundle-analysis.html',
                    open: true,
                    gzipSize: true,
                    brotliSize: true,
                }),
            ] : [],
            output: {
                manualChunks: (id: string) => {
                    // Node modules in vendor chunks
                    if (id.includes('node_modules')) {
                        // React ecosystem
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'vendor-react';
                        }

                        // Router
                        if (id.includes('react-router')) {
                            return 'vendor-router';
                        }

                        // Query and state management
                        if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
                            return 'vendor-state';
                        }

                        // UI library
                        if (id.includes('@ordo-todo/ui') || id.includes('radix-ui') || id.includes('lucide-react')) {
                            return 'vendor-ui';
                        }

                        // Forms
                        if (id.includes('react-hook-form') || id.includes('zod')) {
                            return 'vendor-forms';
                        }

                        // Charts and analytics
                        if (id.includes('recharts') || id.includes('d3')) {
                            return 'vendor-charts';
                        }

                        // Date utilities
                        if (id.includes('date-fns') || id.includes('dayjs')) {
                            return 'vendor-date';
                        }

                        // Electron-specific
                        if (id.includes('electron')) {
                            return 'vendor-electron';
                        }

                        // Other vendor libraries
                        return 'vendor-other';
                    }

                    // App-specific chunks
                    if (id.includes('/pages/')) {
                        const pageName = id.split('/pages/')[1]?.split('.')[0];
                        return `page-${pageName}`;
                    }

                    if (id.includes('/components/')) {
                        // Group components by feature
                        if (id.includes('/components/task/')) return 'feature-tasks';
                        if (id.includes('/components/timer/')) return 'feature-timer';
                        if (id.includes('/components/analytics/')) return 'feature-analytics';
                        if (id.includes('/components/settings/')) return 'feature-settings';
                        if (id.includes('/components/auth/')) return 'feature-auth';

                        return 'components-shared';
                    }

                    // Utilities and hooks
                    if (id.includes('/lib/') || id.includes('/hooks/')) {
                        return 'utils';
                    }

                    // Stores
                    if (id.includes('/stores/')) {
                        return 'stores';
                    }
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: (assetInfo: any) => {
                    const extType = assetInfo.name?.split('.').pop();
                    if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
                        return 'assets/fonts/[name]-[hash][extname]';
                    }
                    if (/\.png$/.test(assetInfo.name || '')) {
                        return 'assets/images/[name]-[hash][extname]';
                    }
                    if (/\.svg$/.test(assetInfo.name || '')) {
                        return 'assets/icons/[name]-[hash][extname]';
                    }
                    return `assets/${extType}/[name]-[hash][extname]`;
                }
            }
        },
        chunkSizeWarningLimit: 1000, // 1MB warning
    },
    optimizeDeps: {
        include: [
            '@ordo-todo/api-client',
            '@ordo-todo/ui',
            '@ordo-todo/hooks',
            '@ordo-todo/core',
            '@ordo-todo/stores',
        ],
    },
    base: './',
})
