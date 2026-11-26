# astro-intl

Simple and type-safe internationalization for Astro.

## Quick start

Start with an existing, working static Astro project. You will display **Hola** at `/es/` and **Hello** at `/en/`.
The complete example is verified with Astro 7 and Node.js 22.23.4 or newer. You do not need middleware, a shared layout or Astro’s built-in i18n configuration.

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
- [Testing translations](https://astro-intl.dev/en/docs/testing) · [Pruebas de traducciones](https://astro-intl.dev/es/docs/testing)
- [React](https://astro-intl.dev/en/docs/react), [Preact](https://astro-intl.dev/en/docs/preact), [Svelte](https://astro-intl.dev/en/docs/svelte), [Vue](https://astro-intl.dev/en/docs/vue) and [SolidJS](https://astro-intl.dev/en/docs/solid)
- [Configuration reference](https://astro-intl.dev/en/docs/configuration) and [API](https://astro-intl.dev/en/docs/api)
- [Guía completa en español](https://astro-intl.dev/es/docs/quick-start)

## React, Preact, Svelte, Vue and SolidJS inside Astro

Install the integrations for your framework in your Astro project. For Preact 10 or 11, run `npx astro add astro-intl preact`. For Vue 3, run `npx astro add astro-intl vue`. For SolidJS 1.9.13, first pin its seroval dependency to 1.8.2 in the consuming project as shown in the SolidJS guide. Then run `npx astro add astro-intl solid-js`. For React or Svelte 5, use `react` or `svelte` in place of `vue`. Import `getTranslations` from `astro-intl/react`, `astro-intl/preact`, `astro-intl/svelte`, `astro-intl/vue` or `astro-intl/solid` to read translations during server rendering. Pass translated labels to interactive islands as props, or use `createGetTranslations` with an explicit catalog. See [React in Astro](https://astro-intl.dev/en/docs/react), [Preact in Astro](https://astro-intl.dev/en/docs/preact), [Svelte in Astro](https://astro-intl.dev/en/docs/svelte), [Vue in Astro](https://astro-intl.dev/en/docs/vue) and [SolidJS in Astro](https://astro-intl.dev/en/docs/solid).

**En español.** Instala las integraciones desde tu proyecto Astro. Para Preact 10 u 11, ejecuta `npx astro add astro-intl preact`. Para Vue 3, ejecuta `npx astro add astro-intl vue`. Para SolidJS 1.9.13, fija primero su dependencia seroval en 1.8.2 en el proyecto consumidor como indica la guía de SolidJS. Después ejecuta `npx astro add astro-intl solid-js`. Para React o Svelte 5, sustituye `vue` por `react` o `svelte`. Importa `getTranslations` desde el adaptador de tu framework para leer las traducciones durante el renderizado en el servidor. Pasa las etiquetas traducidas a las islas interactivas como props o usa `createGetTranslations` con un catálogo explícito. Consulta [React en Astro](https://astro-intl.dev/es/docs/react), [Preact en Astro](https://astro-intl.dev/es/docs/preact), [Svelte en Astro](https://astro-intl.dev/es/docs/svelte), [Vue en Astro](https://astro-intl.dev/es/docs/vue) y [SolidJS en Astro](https://astro-intl.dev/es/docs/solid).

## ✨ Features

- 🔒 **Type-safe** - Autocompletion and type validation for your translations
- 🚀 **Simple** - Intuitive API inspired by next-intl
- 🎯 **Native integration** - Designed specifically for Astro
- ⚛️ **React components in Astro** - Dedicated adapter with `t.rich()` for rich text. Import from `astro-intl/react`
- **Preact components in Astro** - Render rich text with native Preact children using `astro-intl/preact`
- **SolidJS components in Astro** - Render translated messages and JSX elements with `astro-intl/solid`
- **Vue components in Astro** - Render translated messages and native Vue nodes with `astro-intl/vue`
- 🧡 **Svelte components in Astro** - Dedicated adapter with `t.rich()` and `renderRichText()`. Import from `astro-intl/svelte`
- 🌍 **Flexible** - Supports multiple languages and translation structures
- ⚡ **Performance** - Loads only the necessary translations
- 🛠️ **TypeScript first** - Written entirely in TypeScript
- 🛡️ **Concurrency-safe** - Uses `AsyncLocalStorage` in Node SSR to isolate concurrent requests
- 🌍 **Explicit runtime guarantees** - Static and client usage remain available; unsupported SSR runtimes fail explicitly instead of sharing request state
- 🗺️ **Localized routing** - Translated URLs per locale with automatic rewrites via middleware
- 🔗 **URL generation** - `path()` and `switchLocalePath()` to build localized URLs
- ✅ **Catalog validation** - Detect missing keys, extra keys, type differences and incompatible placeholders before deployment
- 📦 **Sub-path imports** - `astro-intl/react`, `astro-intl/preact`, `astro-intl/svelte`, `astro-intl/vue`, `astro-intl/solid`, `astro-intl/routing`, `astro-intl/middleware`, `astro-intl/validate`

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

### Features introduced in v2.0

- **Svelte adapter** with `t.rich()` and `renderRichText()`
- **`createGetTranslations` factory** in both adapters (React and Svelte) for explicit catalogs in Astro islands and tests
- **`parseRichSegments()`** shared framework-agnostic base

## Maintainer documentation

Contributors can find the release steps in the [publication guide](https://github.com/ErickCSS/astro-intl/blob/main/packages/integration/PUBLICACION_NPM.md).

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
│   │   ├── jsx.ts         # Shared translator for framework-native children
│   │   ├── preact.ts      # Preact children
│   │   ├── react.ts       # React Adapter — getTranslations, createGetTranslations, t.rich() → ReactNode[]
│   │   ├── solid.ts       # SolidJS JSX elements
│   │   ├── svelte.ts      # Rich segments and renderRichText()
│   │   └── vue.ts         # Vue VNode children
│   ├── core.ts            # Barrel — re-exports everything from modules
│   ├── framework-base.ts  # Rich-message parsing shared by all five adapters
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
