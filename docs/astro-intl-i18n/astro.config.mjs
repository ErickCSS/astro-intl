// @ts-check
import { defineConfig } from 'astro/config';
import intl from "astro-intl";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [intl()],

  vite: {
    plugins: [tailwindcss()],
  },
});