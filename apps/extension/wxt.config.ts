import { defineConfig } from 'wxt';

// ID estable de la extensión (derivada de la clave pública del manifest).
// Redirect OAuth: https://kljihfnniklhlmkpamdibbbjghinooaf.chromiumapp.org/
// Clave privada: deploy/secrets/chrome-extension-key.pem (gitignored).
const EXTENSION_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvphPlQtVEMhD3OYol48FgpdBsXgoKMyTvbgtAq70E3D5CisMEzKEsSNRBOiNeUsHWuZ1Np9wiuoIOgNQYLuapchy0nPuy3QHhHAtYII+TMQsd3oCRPY+cVCm4uXWYiWYE8uvLJD2YAr80olnd/knaPmeWeXsaZoqjQXGVsEuTFI1mWI1kiZk0tQph11Zoh/Pi7aoPOciAMDoMJkZfsrYnTl3xMnGEiHwo1DvMiejqmHqlwgx0lcAHWJyaaTLOJuZ9OzNk0BwUhihPR18996wwI+3ZaX63QKrzMuHjxAlt3Bz01ImQotCG46xjJgZ025++ZcIMmI75QY6oidJ6YorXwIDAQAB';

const isDev = process.env.NODE_ENV === 'development';
const apiOrigin = isDev ? 'http://localhost:3101/*' : 'https://api.ordotodo.app/*';

// Igual que apps/desktop: los paquetes del workspace se bundlean desde src
// (los dist son CJS y rompen el análisis de exports de rollup).
const repo = (p: string) =>
  new URL(`../../packages/${p}`, import.meta.url).pathname;

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    resolve: {
      alias: {
        '@ordo-todo/ui': repo('ui/src'),
        '@ordo-todo/api-client': repo('api-client/src'),
        '@ordo-todo/core': repo('core/src'),
        '@ordo-todo/hooks': repo('hooks/src'),
        '@ordo-todo/stores': repo('stores/src'),
      },
    },
  }),
  manifest: {
    name: 'Ordo Todo',
    description: 'Captura tareas de Ordo desde cualquier página: popup de captura rápida, menú contextual y tareas de hoy.',
    key: EXTENSION_KEY,
    permissions: ['storage', 'alarms', 'contextMenus', 'activeTab', 'scripting', 'identity'],
    host_permissions: [apiOrigin],
    options_ui: { open_in_tab: true },
  },
  manifestVersion: 3,
});
