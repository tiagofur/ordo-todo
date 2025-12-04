import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                // Shortcut of `build.lib.entry`
                entry: 'electron/main.ts',
            },
            preload: {
                // Shortcut of `build.rollupOptions.input`
                input: 'electron/preload.ts',
            },
            // Optional: Use Node.js API in the Renderer process
            renderer: {},
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
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
    },
    optimizeDeps: {
        include: ['@ordo-todo/api-client'],
    },
    base: './',
})