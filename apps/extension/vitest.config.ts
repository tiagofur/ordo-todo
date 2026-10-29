import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

// Mismos alias que wxt.config.ts: src de los paquetes del workspace (los
// dist pueden estar obsoletos en local y son CJS).
const repo = (p: string) =>
  new URL(`../../packages/${p}`, import.meta.url).pathname;

export default defineConfig({
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      '@ordo-todo/ui': repo('ui/src'),
      '@ordo-todo/api-client': repo('api-client/src'),
      '@ordo-todo/core': repo('core/src'),
      '@ordo-todo/hooks': repo('hooks/src'),
      '@ordo-todo/i18n': repo('i18n/src'),
      '@ordo-todo/stores': repo('stores/src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
