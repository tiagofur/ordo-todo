import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// La app móvil renderiza el MISMO frontend que apps/desktop (ODD 020 P4):
// `@/*` apunta a la fuente de desktop y este proyecto solo aporta la
// configuración Tauri móvil y los adaptadores de plataforma (src/).
const desktopSrc = resolve(__dirname, "../desktop/src");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 1421,
    strictPort: true,
    fs: { allow: [resolve(__dirname, "../..")] },
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  define: {
    // Gate de plataforma leído por desktopBridge.isMobile(); constante de
    // compilación para que el código solo-desktop se elimine del bundle.
    "import.meta.env.VITE_ORDO_PLATFORM": JSON.stringify("mobile"),
  },
  resolve: {
    alias: {
      "@": desktopSrc,
      "@ordo-todo/ui": resolve(__dirname, "../../packages/ui/src"),
      "@ordo-todo/api-client": resolve(
        __dirname,
        "../../packages/api-client/src",
      ),
      "@ordo-todo/core": resolve(__dirname, "../../packages/core/src"),
      "@ordo-todo/hooks": resolve(__dirname, "../../packages/hooks/src"),
      "@ordo-todo/i18n": resolve(__dirname, "../../packages/i18n/src"),
      "@ordo-todo/stores": resolve(__dirname, "../../packages/stores/src"),
      "@ordo-todo/auth-provider": resolve(
        __dirname,
        "../../packages/auth-provider/src",
      ),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    // WebViews modernos de iOS/Android: no hace falta bajar el target
    target: "esnext",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    commonjsOptions: {
      include: [/packages\/api-client/, /node_modules/],
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      "@ordo-todo/api-client",
      "@ordo-todo/hooks",
      "@ordo-todo/core",
      "@ordo-todo/stores",
      "@ordo-todo/auth-provider",
    ],
    exclude: ["@ordo-todo/ui"],
  },
  base: "./",
});
