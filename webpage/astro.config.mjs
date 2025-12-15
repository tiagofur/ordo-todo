// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://ordo-todo.com",
  i18n: {
    locales: ["en", "es", "pt-br"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
    },
  },
  output: "static",
});
