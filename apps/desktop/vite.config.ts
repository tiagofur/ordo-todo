import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
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
            '@': resolve(__dirname, './src'),
            // Workspace aliases for monorepo
            '@ordo-todo/ui': resolve(__dirname, '../../packages/ui/src'),
            '@ordo-todo/hooks': resolve(__dirname, '../../packages/hooks/src'),
            '@ordo-todo/api-client': resolve(__dirname, '../../packages/api-client/src'),
            '@ordo-todo/core': resolve(__dirname, '../../packages/core/src'),
            '@ordo-todo/stores': resolve(__dirname, '../../packages/stores/src'),
            '@ordo-todo/auth-provider': resolve(__dirname, '../../packages/auth-provider/src'),
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
            plugins: process.env.ANALYZE_BUNDLE ? [
                visualizer({
                    filename: 'dist/bundle-analysis.html',
                    open: true,
                    gzipSize: true,
                    brotliSize: true,
                }),
            ] : [],
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
})
