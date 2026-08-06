# astro-intl

Simple and type-safe internationalization system for Astro, inspired by next-intl.

[![npm version](https://img.shields.io/npm/v/astro-intl.svg)](https://www.npmjs.com/package/astro-intl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/erickcs)

## 📚 Documentation

For complete documentation, examples and guides, visit:

**[astro-intl.dev](https://astro-intl.dev)**

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

## 📦 Installation

```bash
# npm
npm install astro-intl

# pnpm
pnpm add astro-intl

# yarn
yarn add astro-intl
```

## Astro compatibility

`astro-intl@2.3.0` supports Astro 4, 5, 6 and 7 through the peer range
`^4 || ^5 || ^6 || ^7`. Astro 7 itself requires Node.js 22.12.0 or newer;
existing Astro 4–6 consumers do not need to raise their Node.js version because
of `astro-intl`.

## 🚀 Quick start

### 1. Configure the integration

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import astroIntl from 'astro-intl';

export default defineConfig({
  integrations: [
    astroIntl({
      defaultLocale: 'en',
      locales: ['en', 'es', 'fr'],
    }),
  ],
});
```

### 2. Create your translation files

```text
src/
└── i18n/
    ├── en.json
    ├── es.json
    └── fr.json
```

```json
// src/i18n/en.json
{
  "welcome": "Welcome to astro-intl",
  "greeting": "Hello, {name}!"
}
```

### 3. Use translations in your components

```astro
---
import { getTranslations } from 'astro-intl';

const t = getTranslations();
---

<h1>{t('welcome')}</h1>
<p>{t('greeting', { name: 'World' })}</p>
```

### 4. Use in React or Svelte

```tsx
// React — import from astro-intl/react
import { getTranslations } from "astro-intl/react";

export function Greeting() {
  const t = getTranslations();
  return <h1>{t("welcome")}</h1>;
}
```

```svelte
<!-- Svelte — import from astro-intl/svelte -->
<script>
  import { getTranslations } from 'astro-intl/svelte';
  const t = getTranslations();
</script>

<h1>{t('welcome')}</h1>
```

### 5. Validate translation catalogs

Use one locale as the reference and validate every JSON file in the messages directory:

```bash
astro-intl validate --dir ./src/i18n/messages --reference en
```

The command exits with code `1` when catalogs have missing or extra keys,
incompatible value types, or different `{placeholders}`. Configuration and file
errors exit with code `2`.

## 📖 Learn more

- **[Full documentation](https://astro-intl.dev)** - Guides, API and examples
- **[Configuration](https://astro-intl.dev/docs#configuration)** - Configuration options
- **[Routing](https://astro-intl.dev/docs#routing)** - Translated URLs per locale
- **[Examples](https://astro-intl.dev/docs#examples)** - Common use cases

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
