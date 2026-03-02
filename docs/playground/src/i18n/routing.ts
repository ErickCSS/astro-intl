export const routing = {
  locales: ["en", "es"],
  defaultLocale: "en",
  labels: {
    en: "English",
    es: "Español",
  },
  hreflang: {
    en: "en-US",
    es: "es-ES",
  },
  routes: {
    home: { en: "/", es: "/" },
    about: { en: "/about", es: "/sobre-nosotros" },
    docs: { en: "/docs", es: "/docs" },
    changelog: { en: "/changelog", es: "/changelog" },
    blog: { en: "/blog/[slug]", es: "/blog/[slug]" },
    shop: { en: "/shop/[category]/[id]", es: "/tienda/[category]/[id]" },
  },
} as const;

export type Locale = (typeof routing.locales)[number];
