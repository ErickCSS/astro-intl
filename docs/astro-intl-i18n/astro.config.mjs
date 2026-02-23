// @ts-check
import { defineConfig } from 'astro/config';
import myIntegration from "astro-intl";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [myIntegration({ enabled: true })],

  vite: {
    plugins: [tailwindcss()],
  },
});