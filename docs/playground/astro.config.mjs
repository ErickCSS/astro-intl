// @ts-check
import { defineConfig } from 'astro/config';
import intl from "astro-intl";
import sitemap from "@astrojs/sitemap";
import { routing } from "./src/i18n/routing.ts";

import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-intl.vercel.app',
  integrations: [
    intl({
      routes: {
        home:      { en: "/",                          es: "/"                          },
        about:     { en: "/about",                     es: "/sobre-nosotros"            },
        docs:      { en: "/docs",                      es: "/docs"                      },
        changelog: { en: "/changelog",                 es: "/changelog"                 },
        blog:      { en: "/blog/[slug]",               es: "/blog/[slug]"               },
        shop:      { en: "/shop/[category]/[id]",      es: "/tienda/[category]/[id]"    },
      },
    }),
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