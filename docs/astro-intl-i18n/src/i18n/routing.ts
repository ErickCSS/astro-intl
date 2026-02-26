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
} as const;

export type Locale = (typeof routing.locales)[number];
