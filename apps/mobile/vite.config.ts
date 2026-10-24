import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 1421,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
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
  },
  base: "./",
});
