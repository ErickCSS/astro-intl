# astro-intl

Simple and type-safe internationalization for Astro.

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

## 🔄 Migration from v1 to v2

### Breaking changes

1. **`getTranslationsReact` is no longer exported from `astro-intl`**. Use `getTranslations` from `astro-intl/react`:

```diff
- import { getTranslationsReact } from "astro-intl";
+ import { getTranslations } from "astro-intl/react";

- const t = getTranslationsReact();
+ const t = getTranslations();
```

2. **Sub-path imports required for framework adapters**:
   - React: `astro-intl/react`
   - Svelte: `astro-intl/svelte`

3. Base Astro functions (`getTranslations`, `setRequestLocale`, `getLocale`, etc.) continue to be exported from `astro-intl` without changes.

### New features

- **Svelte adapter** with `t.rich()` and `renderRichText()`
- **`createGetTranslations` factory** in both adapters (React and Svelte) for standalone use without global store
- **`parseRichSegments()`** shared framework-agnostic base

## Maintainer documentation

The following sections are for contributors, not application setup. See [manual publication](./PUBLICACION_NPM.md) for release steps.

## 🚀 Development (for contributors)

### Build the package

Before using the package in the playground or any project, you must build it:

**npm**

```sh
npm run build
```

**pnpm**

```sh
pnpm build
```

**yarn**

```sh
yarn build
```

This will generate the JavaScript files and type declarations (`.d.ts`) in the `dist/` folder.

### Development mode

To automatically compile when you make changes:

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

### After building

If you're working in a monorepo with pnpm workspaces, after building run:

```bash
pnpm install
```

This will update the symbolic links and types will be available in projects that use the package.

## 📦 Package Structure

```text
packages/integration/
├── src/
│   ├── adapters/
│   │   ├── react.ts       # React Adapter — getTranslations, createGetTranslations, t.rich() → ReactNode[]
│   │   └── svelte.ts      # Svelte Adapter — getTranslations, createGetTranslations, t.rich() → RichSegment[], renderRichText()
│   ├── core.ts            # Barrel — re-exports everything from modules
│   ├── framework-base.ts  # parseRichSegments() — framework-agnostic base shared by React and Svelte
│   ├── sanitize.ts        # Locale validation, HTML sanitization, regex escape
│   ├── interpolation.ts   # {variable} interpolation, nested value access
│   ├── store.ts           # Per-request Node SSR state with AsyncLocalStorage
│   ├── translations.ts    # getTranslations for Astro components
│   ├── routing.ts         # path(), switchLocalePath() — localized URL generation
│   ├── middleware.ts       # createIntlMiddleware() with translated route rewrites
│   ├── index.ts           # Public entry point + Astro integration
│   └── types/
│       └── index.ts       # TypeScript types (includes RoutesMap)
├── dist/                  # Compiled files (generated)
│   ├── *.js               # Compiled JavaScript
│   └── *.d.ts             # Type declarations
├── package.json
└── tsconfig.json
```
