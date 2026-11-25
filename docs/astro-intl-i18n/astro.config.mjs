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

  devToolbar: { enabled: false },
  vite: {
    server: { allowedHosts: ['redesign-astro-intl-e4b1fc102234e750.v0.build', 'redesign-astro-intl-astro-intl-e4b1fc102234e750.v0.build'] },
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});
