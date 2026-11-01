import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
// NOTE: rollup-plugin-visualizer v7 is ESM-only and the Vite config is loaded
// through require(), so it is imported lazily only when bundle analysis runs.
export default defineConfig(async () => {
    const rollupPlugins = [];
    if (process.env.ANALYZE_BUNDLE) {
        const { visualizer } = await import('rollup-plugin-visualizer');
        rollupPlugins.push(
            visualizer({
                filename: 'dist/bundle-analysis.html',
                open: true,
                gzipSize: true,
                brotliSize: true,
            }),
        );
    }
    return {
    plugins: [
        react(),
    ],
    server: {
        port: 1420,
        strictPort: true,
        watch: {
            // Tell Vite to ignore watching `src-tauri`
            ignored: ['**/src-tauri/**'],
        },
    },
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    resolve: {
        alias: {
            '@': resolve(import.meta.dirname, './src'),
            // Workspace aliases for monorepo
            '@ordo-todo/ui': resolve(import.meta.dirname, '../../packages/ui/src'),
            '@ordo-todo/hooks': resolve(import.meta.dirname, '../../packages/hooks/src'),
            '@ordo-todo/api-client': resolve(import.meta.dirname, '../../packages/api-client/src'),
            '@ordo-todo/core': resolve(import.meta.dirname, '../../packages/core/src'),
            '@ordo-todo/stores': resolve(import.meta.dirname, '../../packages/stores/src'),
            '@ordo-todo/auth-provider': resolve(import.meta.dirname, '../../packages/auth-provider/src'),
        },
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        // Tauri supports modern browsers (Safari 13+ on macOS, WebView2 on Windows)
        target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
        minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
        commonjsOptions: {
            include: [/packages\/api-client/, /node_modules/],
            transformMixedEsModules: true,
        },
        rollupOptions: {
            plugins: rollupPlugins,
            output: {
                // SIN manualChunks manual: el resolve manual histórico generaba ciclos entre chunks (TDZ en producción: "Cannot access before initialization", PR #437)

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
        chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
        include: [
            '@ordo-todo/api-client',
            '@ordo-todo/hooks',
            '@ordo-todo/core',
            '@ordo-todo/stores',
            '@ordo-todo/auth-provider',
        ],
        exclude: [
            '@ordo-todo/ui',
        ],
    },
    base: './',
    };
})
