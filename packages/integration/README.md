# astro-intl

Simple and type-safe internationalization system for Astro.

## ✨ Features

- 🔒 **Type-safe**: Autocompletion and validation of translation keys with TypeScript
- 🎯 **Simple API**: Inspired by next-intl, easy to use
- ⚛️ **React support**: Dedicated adapter with `t.rich()` for rich text with React components. Import from `astro-intl/react`
- 🧡 **Svelte support**: Dedicated adapter with `t.rich()` that returns segments and `RichText` component. Import from `astro-intl/svelte`
- 🎨 **Markup in translations**: Insert HTML in strings with `t.markup()`
- 📁 **Namespaces**: Organize translations by sections
- 🌐 **Automatic locale detection**: Extracts the language from the URL
- 🛡️ **Concurrency-safe**: Uses `AsyncLocalStorage` in SSR to isolate concurrent requests
- 🌍 **Multi-runtime**: Compatible with Node.js, Cloudflare Workers and Deno
- ⚙️ **Configurable default locale**: Define your default locale from options
- 🗺️ **Localized routing**: Define translated URLs per locale (`/es/sobre-nosotros` instead of `/es/about`)
- 🔄 **Automatic rewrites**: Middleware rewrites translated URLs to canonical filesystem routes
- 🔗 **URL generation**: `path()` and `switchLocalePath()` to build and transform localized URLs
- 📦 **Sub-path imports**: `astro-intl/react`, `astro-intl/svelte`, `astro-intl/routing`, `astro-intl/middleware`

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

## 📦 Installation

### Automatic installation (Recommended)

Use the Astro CLI to install and configure automatically:

```bash
npx astro add astro-intl
```

This command:

- ✅ Installs the package
- ✅ Adds the integration to your `astro.config.mjs`
- ✅ Configures necessary dependencies

### Manual installation

If you prefer to install manually:

```bash
npm install astro-intl
# o
pnpm add astro-intl
# o
yarn add astro-intl
```

Then add the integration in your `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import astroIntl from "astro-intl";

export default defineConfig({
  integrations: [
    astroIntl({
      defaultLocale: "en", // optional, defaults to "en"
    }),
  ],
});
```

## 🎯 Usage

### Translation file structure

First, create your translation files:

```ts
// src/i18n/es.json
{
  "welcome": "Bienvenido",
  "nav": {
    "home": "Inicio",
    "about": "Acerca de"
  }
}

// src/i18n/en.json
{
  "welcome": "Welcome",
  "nav": {
    "home": "Home",
    "about": "About"
  }
}

// src/i18n/index.ts
import es from './es.json';
import en from './en.json';

export const ui = { es, en };
export type Messages = typeof es;
```

### In Astro components

```astro
---
import { setRequestLocale, getTranslations } from 'astro-intl';
import { ui } from '../i18n';

// Configure the locale for this request
await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: ui[locale as keyof typeof ui]
}));

// Get translation function
const t = getTranslations();
---

<h1>{t('welcome')}</h1>
<nav>
  <a href="/">{t('nav.home')}</a>
  <a href="/about">{t('nav.about')}</a>
</nav>
```

### Variable interpolation

Use `{varName}` in your translation strings and pass an object of values:

```json
// src/i18n/en.json
{
  "greeting": "Hello, {name}!",
  "info": "You have {count} items"
}
```

```astro
---
const t = getTranslations();
---

<p>{t('greeting', { name: 'John' })}</p>   <!-- "Hello, John!" -->
<p>{t('info', { count: 5 })}</p>             <!-- "You have 5 items" -->
<p>{t('greeting')}</p>                       <!-- "Hello, {name}!" (without values, placeholder remains) -->
```

Accepted values are `string | number | boolean`. If a variable is not passed or is `null`/`undefined`, the placeholder `{varName}` remains unchanged.

### Translations with markup (HTML in strings)

```astro
---
// src/i18n/es.json
// { "terms": "Acepto los <link>términos y condiciones</link>" }

const t = getTranslations();
---

<p set:html={t.markup('terms', {
  link: (chunks) => `<a href="/terms">${chunks}</a>`
})} />
```

### Markup with interpolation

You can combine variables and tag interpolation using the `{ values, tags }` format:

```astro
---
// src/i18n/en.json
// { "welcome": "Hello {name}, click <link>here</link> to continue" }

const t = getTranslations();
---

<p set:html={t.markup('welcome', {
  values: { name: 'John' },
  tags: {
    link: (chunks) => `<a href="/home">${chunks}</a>`
  }
})} />
<!-- "Hello John, click <a href="/home">here</a> to continue" -->
```

### In React components

> **v2**: Import from `astro-intl/react` instead of `astro-intl`.

```tsx
import { getTranslations } from "astro-intl/react";

export function MyComponent() {
  const t = getTranslations();

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <nav>
        <a href="/">{t("nav.home")}</a>
      </nav>
    </div>
  );
}
```

#### Standalone factory (without store)

If you prefer to pass messages directly without depending on the global store:

```tsx
import { createGetTranslations } from "astro-intl/react";
import { ui } from "../i18n";

const getT = createGetTranslations(ui, "en");

export function MyComponent({ lang }: { lang: string }) {
  const t = getT(lang, "nav");
  return <a href="/">{t("home")}</a>;
}
```

### Translations with React components (rich text)

```tsx
import { getTranslations } from "astro-intl/react";

export function MyComponent() {
  const t = getTranslations();

  // src/i18n/es.json
  // { "terms": "Acepto los <link>términos y condiciones</link>" }

  return (
    <p>
      {t.rich("terms", {
        link: (chunks) => <a href="/terms">{chunks}</a>,
      })}
    </p>
  );
}
```

### In Svelte components

> **v2**: New adapter. Import from `astro-intl/svelte`.

```svelte
<script>
  import { getTranslations } from 'astro-intl/svelte';

  const t = getTranslations();
</script>

<h1>{t('welcome')}</h1>
<nav>
  <a href="/">{t('nav.home')}</a>
</nav>
```

#### Rich text in Svelte

`t.rich()` returns an array of `RichSegment[]` that you can render with `renderRichText()`:

```svelte
<script>
  import { getTranslations, renderRichText } from 'astro-intl/svelte';

  // { "terms": "Acepto los <link>términos y condiciones</link>" }
  const t = getTranslations();
  const segments = t.rich('terms', ['link']);

  const html = renderRichText(segments, {
    tags: { link: 'a' },       // renders as <a>...</a>
  });
</script>

<p>{@html html}</p>
```

You can also use custom functions with `components`:

```svelte
<script>
  import { getTranslations, renderRichText } from 'astro-intl/svelte';

  const t = getTranslations();
  const segments = t.rich('terms', ['link']);

  const html = renderRichText(segments, {
    components: {
      link: (chunks) => `<a href="/terms" class="underline">${chunks}</a>`,
    },
  });
</script>

<p>{@html html}</p>
```

#### Standalone factory in Svelte (without store)

```svelte
<script>
  import { createGetTranslations } from 'astro-intl/svelte';
  import { ui } from '../i18n';

  const getT = createGetTranslations(ui, 'en');

  export let lang;
  const t = getT(lang, 'nav');
</script>

<a href="/">{t('home')}</a>
```

### Type-safety with TypeScript

```astro
---
import { setRequestLocale, getTranslations } from 'astro-intl';
import { ui, type Messages } from '../i18n';

await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: ui[locale as keyof typeof ui]
}));

// Strong typing with autocompletion
const t = getTranslations<Messages>();

// TypeScript will autocomplete valid paths:
// t('nav.home')     ✓
// t('nav.invalid')  ✗ TypeScript error
---
```

### Using namespaces

```astro
---
// Get only a specific namespace
const t = getTranslations<Messages>('nav');
---

<nav>
  <a href="/">{t('home')}</a>  <!-- Instead of t('nav.home') -->
  <a href="/about">{t('about')}</a>
</nav>
```

## 🗺️ Localized Routing

### Define translated routes

Create a route map with translated URLs per locale:

```ts
// src/i18n/routing.ts
export const routing = {
  locales: ["en", "es"],
  defaultLocale: "en",
  routes: {
    home: { en: "/", es: "/" },
    about: { en: "/about", es: "/sobre-nosotros" },
    blog: { en: "/blog/[slug]", es: "/blog/[slug]" },
    shop: { en: "/shop/[category]/[id]", es: "/tienda/[category]/[id]" },
  },
} as const;
```

### With Middleware (recommended)

Pass the routes to the middleware. It automatically rewrites translated URLs to canonical filesystem routes:

```ts
// src/middleware.ts
import "@/i18n/request";
import { createIntlMiddleware } from "astro-intl/middleware";
import { routing } from "@/i18n/routing";

export const onRequest = createIntlMiddleware(routing);
```

When a user visits `/es/sobre-nosotros`, the middleware rewrites it to `/es/about` — which maps to your `[lang]/about.astro` file. No duplicate pages.

### Without Middleware

Configure routes via integration options:

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import astroIntl from "astro-intl";

export default defineConfig({
  integrations: [
    astroIntl({
      defaultLocale: "en",
      locales: ["en", "es"],
      routes: {
        about: { en: "/about", es: "/sobre-nosotros" },
      },
    }),
  ],
});
```

Without middleware there are no automatic rewrites. Create lightweight wrappers for each translated route:

```astro
---
// src/pages/[lang]/sobre-nosotros.astro
export { default } from "./about.astro";
export { getStaticPaths } from "./about.astro";
---
```

### Generate URLs with `path()`

```astro
---
import { path } from "astro-intl/routing";
---

<a href={path("about")}>About</a>
<!-- locale "en" → /en/about -->
<!-- locale "es" → /es/sobre-nosotros -->

<a href={path("shop", { locale: "es", params: { category: "ropa", id: "42" } })}>
  View product
</a>
<!-- → /es/tienda/ropa/42 -->
```

### Switch locale with `switchLocalePath()`

```astro
---
import { switchLocalePath } from "astro-intl/routing";
---

<a href={switchLocalePath(Astro.url.pathname, "en")}>English</a>
<a href={switchLocalePath(Astro.url.pathname, "es")}>Español</a>
<!-- On /en/about → /es/sobre-nosotros -->
<!-- On /es/tienda/ropa/42 → /en/shop/ropa/42 -->
```

## 📚 API Reference

### `astroIntl(options?)`

Configures the integration in `astro.config.mjs`.

**Options:**

- `defaultLocale?: string` - Default locale when the URL has no language prefix (default: `"en"`)
- `enabled?: boolean` - Enable/disable the integration (default: `true`)
- `messages?: MessagesConfig` - Static or dynamic translation messages
- `locales?: string[]` - List of supported locales
- `routes?: RoutesMap` - Map of translated routes per locale

### `setRequestLocale(url, getConfig?)`

Configures the locale for the current request.

**Parameters:**

- `url: URL` - The Astro URL object (`Astro.url`)
- `getConfig?: (locale: string) => RequestConfig | Promise<RequestConfig>` - Function that returns the configuration

**Example:**

```ts
await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: ui[locale],
}));
```

### `runWithLocale(url, fn, getConfig?)`

Executes a function within a request-isolated context. Uses `AsyncLocalStorage` when available (Node.js) to avoid race conditions in SSR with concurrent requests.

**Parameters:**

- `url: URL` - The Astro URL object (`Astro.url`)
- `fn: () => R | Promise<R>` - Function to execute within the isolated context
- `getConfig?: GetRequestConfigFn` - Optional configuration function

**Example in middleware:**

```ts
// src/middleware.ts
import { runWithLocale } from "astro-intl";

export const onRequest = async (context, next) => {
  return runWithLocale(
    context.url,
    () => next(),
    (locale) => ({
      locale,
      messages: ui[locale],
    })
  );
};
```

### `getTranslations<T>(namespace?)`

Gets the translation function for Astro components.

**Parameters:**

- `namespace?: string` - Optional namespace to get only a subset of translations

**Returns:** Function `t(key, values?)` with method `t.markup(key, tags | { values?, tags })`

#### `t(key, values?)`

- `key: string` - Translation key (supports dot notation)
- `values?: Record<string, Primitive>` - Values for `{varName}` interpolation (optional)

#### `t.markup(key, options)`

- `key: string` - Translation key
- `options` - Can be:
  - `Record<string, (chunks: string) => string>` - Tags only (backward compatible)
  - `{ values?: Record<string, Primitive>, tags: Record<string, (chunks: string) => string> }` - Tags with interpolation

### `getTranslations()` — `astro-intl/react`

Gets the translation function for React components (uses the global store).

**Returns:** Function `t(key)` with method `t.rich(key, tags)` that returns `ReactNode[]`

### `createGetTranslations(ui, defaultLocale)` — `astro-intl/react`

Standalone factory that doesn't depend on the global store. Useful for passing messages directly.

**Parameters:**

- `ui: Record<string, Record<string, unknown>>` - Object with all messages per locale
- `defaultLocale: string` - Default locale

**Returns:** `(lang, namespace) => t` — function that returns `t(key)` with `t.rich(key, tags)`

### `getTranslations()` — `astro-intl/svelte`

Gets the translation function for Svelte components (uses the global store).

**Returns:** Function `t(key)` with method `t.rich(key, tagNames?)` that returns `RichSegment[]`

### `createGetTranslations(ui, defaultLocale)` — `astro-intl/svelte`

Standalone factory for Svelte. Same signature as React but `t.rich()` returns `RichSegment[]`.

### `renderRichText(segments, options?)` — `astro-intl/svelte`

Resolves an array of `RichSegment[]` into an HTML string.

**Parameters:**

- `segments: RichSegment[]` - Segments returned by `t.rich()`
- `options.tags?: Record<string, string>` - Maps tag name to HTML element (e.g., `{ link: 'a' }`)
- `options.components?: Record<string, (chunks: string) => string>` - Custom functions per tag

**Returns:** `string` - HTML ready to render with `{@html}`

### `getLocale()`

Gets the currently configured locale.

**Returns:** `string` - The locale code (e.g., `'es'`, `'en'`)

### `createIntlMiddleware(options)`

Creates an Astro middleware that automatically calls `setRequestLocale` on each request. Import from `astro-intl/middleware`.

**Options:**

- `locales: string[]` - List of supported locales
- `defaultLocale?: string` - Default locale (default: `"en"`)
- `routes?: RoutesMap` - Map of translated routes. When provided, the middleware rewrites translated URLs to their canonical filesystem routes

### `path(routeKey, options?)`

Generates a localized URL for a named route. Import from `astro-intl/routing`.

**Parameters:**

- `routeKey: string` - Route name (key from the `routes` map)
- `options?.locale` - Target locale (default: current locale)
- `options?.params` - `Record<string, string>` to substitute `[param]` in the template
- `options?.encode` - Encode params with `encodeURIComponent` (default: `true`)

**Returns:** `string` - Localized URL (e.g., `"/es/sobre-nosotros"`)

### `switchLocalePath(currentPath, nextLocale)`

Converts the current URL to its equivalent in another locale. Import from `astro-intl/routing`.

**Parameters:**

- `currentPath: string | URL` - Current path (pathname, URL string or URL object)
- `nextLocale: string` - Target locale

**Returns:** `string` - Equivalent URL in the new locale. Preserves query strings and hashes. If no template matches, falls back to swapping the locale prefix.

---

## 🚀 Development (for contributors)

### Build the package

Before using the package in the playground or any project, you must build it:

```bash
npm run build
```

This will generate the JavaScript files and type declarations (`.d.ts`) in the `dist/` folder.

### Development mode

To automatically compile when you make changes:

```bash
npm run dev
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
│   ├── store.ts           # Per-request state (AsyncLocalStorage + fallback)
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

## 🔧 TypeScript Configuration

The package uses:

- `module: "Node16"` for full ESM support
- `declaration: true` to generate `.d.ts` files
- Imports with `.js` extension for ESM compatibility

## 📝 Important Notes

1. **Always build before testing**: Changes in `src/` are not reflected until you run `npm run build`
2. **dist/ files in .gitignore**: Compiled files are not uploaded to git, they are generated on each installation
3. **.js extensions in imports**: Although the source code is TypeScript, imports must use `.js` for Node16/ESM compatibility
