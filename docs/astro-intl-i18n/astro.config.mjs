// @ts-check
import { defineConfig } from 'astro/config';
import intl from "astro-intl";
import sitemap from "@astrojs/sitemap";
import { routing } from "./src/i18n/routing.ts";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-intl.dev',
  integrations: [
    intl(),
    sitemap({
      i18n: {
        defaultLocale: routing.defaultLocale,
        locales: { ...routing.hreflang },
      },
      filter: (page) => !page.includes('/index'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});