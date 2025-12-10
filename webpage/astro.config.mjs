// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
  site: "https://ordo-todo.com",
  i18n: {
    locales: ["en", "es", "pt-br"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
      fallbackType: "rewrite",
    },
    fallback: {
      "pt-br": "en",
      es: "en",
    },
  },
  output: "static",
});
