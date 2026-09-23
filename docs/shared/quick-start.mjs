// The tutorial and its smoke check use these exact files.
export const quickStartFiles = {
  "src/i18n/messages/en.json": JSON.stringify({ greeting: "Hello" }, null, 2),
  "src/i18n/messages/es.json": JSON.stringify({ greeting: "Hola" }, null, 2),
  "astro.config.mjs": `import { defineConfig } from "astro/config";
import astroIntl from "astro-intl";
import en from "./src/i18n/messages/en.json" with { type: "json" };
import es from "./src/i18n/messages/es.json" with { type: "json" };

export default defineConfig({
  integrations: [
    astroIntl({
      defaultLocale: "en",
      locales: ["en", "es"],
      messages: { en, es },
    }),
  ],
});`,
  "src/pages/[lang]/index.astro": `---
import { setRequestLocale, getTranslations } from "astro-intl";

export function getStaticPaths() {
  return [{ params: { lang: "en" } }, { params: { lang: "es" } }];
}

await setRequestLocale(Astro.url);
const t = getTranslations();
---

<!doctype html>
<html lang={Astro.params.lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{t("greeting")}</title>
  </head>
  <body>
    <h1>{t("greeting")}</h1>
    <nav aria-label="Language">
      <a href="/es/" lang="es">Español</a>
      <a href="/en/" lang="en">English</a>
    </nav>
  </body>
</html>`,
};
