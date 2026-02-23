// @ts-check
import { defineConfig } from 'astro/config';
import intl from "astro-intl";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-intl.vercel.app',
  integrations: [
    intl(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          es: 'es-ES',
        },
      },
      filter: (page) => !page.includes('/index'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});