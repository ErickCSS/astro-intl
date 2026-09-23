# astro-intl

Simple and type-safe internationalization system for Astro, inspired by next-intl.

[![npm version](https://img.shields.io/npm/v/astro-intl.svg)](https://www.npmjs.com/package/astro-intl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/erickcs)

## Quick start

Start with an existing, working static Astro project. You will display **Hola** at `/es/` and **Hello** at `/en/`.
The complete example is verified with Astro 7 and Node.js 22.12 or newer. You do not need middleware, a shared layout or Astro’s built-in i18n configuration.

### 1. Install

Run in your project directory. The Astro wizard asks you to confirm installation and adding the integration to astro.config.mjs:

**npm**

```sh
npx astro add astro-intl
```

**pnpm**

```sh
pnpm astro add astro-intl
```

**yarn**

```sh
yarn astro add astro-intl
```

### 2. Create both message files

Use the same key in each language; only the value changes.

**src/i18n/messages/en.json**

```json
{
  "greeting": "Hello"
}
```

**src/i18n/messages/es.json**

```json
{
  "greeting": "Hola"
}
```

### 3. Connect the integration

Add the message imports and complete the integration created by the wizard with the options below. Keep your other integrations; do not add a second astroIntl entry.
`locales` lists the languages, `messages` maps each to its JSON, and `defaultLocale` defines the default language. It does not create pages or redirect `/`.
The `with` attribute allows Node to load JSON in this configuration file.

**astro.config.mjs**

```js
import { defineConfig } from "astro/config";
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
});
```

### 4. Create the page

Name the folder literally `[lang]`. `getStaticPaths` generates both URLs.
Await `setRequestLocale` before `getTranslations` so the page loads the correct messages before reading them.

**src/pages/[lang]/index.astro**

```astro
---
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
</html>
```

### 5. Check both languages

**npm**

```sh
npm run dev
```

**pnpm**

```sh
pnpm dev
```

**yarn**

```sh
yarn dev
```

Open the address printed in your terminal with `/es/` and `/en/`. Check the greetings and language links.
Your existing root page stays unchanged. Restart the server after editing `astro.config.mjs`.

### 6. Add another translation

Add `"farewell": "Goodbye"` to the English JSON and `"farewell": "Adiós"` to the Spanish JSON, keeping `greeting`.
Then add `<p>{t("farewell")}</p>` below the page heading.

A 404 usually means the localized page or `getStaticPaths` is missing. A visible key means its message is missing. A missing request context means initialization did not run before translation.

## Continue learning

- [Translations, variables and namespaces](https://astro-intl.dev/en/docs/usage)
- [File structure](https://astro-intl.dev/en/docs/file-structure)
- [Examples](https://astro-intl.dev/en/docs/examples)
- [Custom message loading](https://astro-intl.dev/en/docs/message-loading)
- [Middleware and Node SSR](https://astro-intl.dev/en/docs/middleware)
- [Translated routes](https://astro-intl.dev/en/docs/routing)
- [Rich text](https://astro-intl.dev/en/docs/rich-text)
- [React](https://astro-intl.dev/en/docs/react) and [Svelte](https://astro-intl.dev/en/docs/svelte)
- [Configuration reference](https://astro-intl.dev/en/docs/configuration) and [API](https://astro-intl.dev/en/docs/api)
- [Guía completa en español](https://astro-intl.dev/es/docs/quick-start)

## ✨ Features

- 🔒 **Type-safe** - Autocompletion and type validation for your translations
- 🚀 **Simple** - Intuitive API inspired by next-intl
- 🎯 **Native integration** - Designed specifically for Astro
- ⚛️ **React support** - Dedicated adapter with `t.rich()` for rich text. Import from `astro-intl/react`
- 🧡 **Svelte support** - Dedicated adapter with `t.rich()` and `renderRichText()`. Import from `astro-intl/svelte`
- 🌍 **Flexible** - Supports multiple languages and translation structures
- ⚡ **Performance** - Loads only the necessary translations
- 🛠️ **TypeScript first** - Written entirely in TypeScript
- 🛡️ **Concurrency-safe** - Uses `AsyncLocalStorage` in Node SSR to isolate concurrent requests
- 🌍 **Explicit runtime guarantees** - Static and client usage remain available; unsupported SSR runtimes fail explicitly instead of sharing request state
- 🗺️ **Localized routing** - Translated URLs per locale with automatic rewrites via middleware
- 🔗 **URL generation** - `path()` and `switchLocalePath()` to build localized URLs
- ✅ **Catalog validation** - Detect missing keys, extra keys, type differences and incompatible placeholders before deployment
- 📦 **Sub-path imports** - `astro-intl/react`, `astro-intl/svelte`, `astro-intl/routing`, `astro-intl/middleware`, `astro-intl/validate`

## Catalog validation (2.3.0+)

This optional advanced check requires astro-intl 2.3.0 or newer; it is not required for the tutorial.

**npm**

```sh
npm exec -- astro-intl validate --dir ./src/i18n/messages --reference en
```

**pnpm**

```sh
pnpm exec astro-intl validate --dir ./src/i18n/messages --reference en
```

**yarn**

```sh
yarn exec astro-intl validate --dir ./src/i18n/messages --reference en
```

Exit codes: 0 for matching catalogs, 1 for missing or extra keys, type differences or incompatible placeholders, and 2 for configuration, file or JSON errors.

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [Erick Cruz](https://github.com/ErickCSS)

## 🔗 Links

- [Documentation](https://astro-intl.dev)
- [npm](https://www.npmjs.com/package/astro-intl)
- [GitHub](https://github.com/ErickCSS/astro-intl)
- [Issues](https://github.com/ErickCSS/astro-intl/issues)
- [Buy Me a Coffee](https://buymeacoffee.com/erickcs) ☕

---

Made with ❤️ for the Astro community
