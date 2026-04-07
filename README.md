# astro-intl

Sistema de internacionalización simple y type-safe para Astro, inspirado en next-intl.

[![npm version](https://img.shields.io/npm/v/astro-intl.svg)](https://www.npmjs.com/package/astro-intl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg?style=flat&logo=buy-me-a-coffee)](https://buymeacoffee.com/erickcs)

## 📚 Documentación

Para documentación completa, ejemplos y guías, visita:

**[astro-intl.dev](https://astro-intl.dev)**

## ✨ Características

- 🔒 **Type-safe** - Autocompletado y validación de tipos para tus traducciones
- 🚀 **Simple** - API intuitiva inspirada en next-intl
- 🎯 **Integración nativa** - Diseñado específicamente para Astro
- ⚛️ **Soporte React** - Adapter dedicado con `t.rich()` para rich text. Importa desde `astro-intl/react`
- 🧡 **Soporte Svelte** - Adapter dedicado con `t.rich()` y `renderRichText()`. Importa desde `astro-intl/svelte`
- 🌍 **Flexible** - Soporta múltiples idiomas y estructuras de traducción
- ⚡ **Rendimiento** - Carga solo las traducciones necesarias
- 🛠️ **TypeScript first** - Escrito completamente en TypeScript
- 🛡️ **Concurrency-safe** - `AsyncLocalStorage` en SSR para aislar requests concurrentes
- 🌐 **Multi-runtime** - Compatible con Node.js, Cloudflare Workers y Deno
- 🗺️ **Routing localizado** - URLs traducidas por locale con rewrites automáticos via middleware
- 🔗 **Generación de URLs** - `path()` y `switchLocalePath()` para construir URLs localizadas
- 📦 **Sub-path imports** - `astro-intl/react`, `astro-intl/svelte`, `astro-intl/routing`, `astro-intl/middleware`, `astro-intl/components`

## 🆕 Nuevas Features (v2.2.0)

### `t.raw()` - Acceso a valores sin coerción

Accede a arrays, objetos y números sin que se conviertan a string:

```astro
---
const t = getTranslations('about');
const intro = t.raw('intro') as string[]; // ['Line 1', 'Line 2']
const stats = t.raw('stats') as { count: number };
---

<ul>
  {intro.map(line => <li>{line}</li>)}
</ul>
<p>Count: {stats.count}</p>
```

### `messagesDir` - Configuración simplificada

Carga automática de archivos JSON con el import attribute correcto:

```js
// astro.config.mjs
import astroIntl from 'astro-intl';

export default defineConfig({
  integrations: [
    astroIntl({
      defaultLocale: 'en',
      locales: ['en', 'es'],
      messagesDir: './src/i18n/messages', // Carga {locale}.json automáticamente
    }),
  ],
});
```

### `<AutoRedirect />` - Redirección automática

Detecta el idioma del navegador y redirige sin página en blanco:

```astro
---
// src/pages/index.astro
import { AutoRedirect } from 'astro-intl/components';
---

<AutoRedirect locales={['en', 'es']} defaultLocale="en" />
```

## 📦 Instalación

```bash
# npm
npm install astro-intl

# pnpm
pnpm add astro-intl

# yarn
yarn add astro-intl
```

## 🚀 Inicio rápido

### 1. Configura la integración

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

### 2. Crea tus archivos de traducción

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

### 3. Usa las traducciones en tus componentes

```astro
---
import { getTranslations } from 'astro-intl';

const t = getTranslations();
---

<h1>{t('welcome')}</h1>
<p>{t('greeting', { name: 'World' })}</p>
```

### 4. Usa en React o Svelte

```tsx
// React — importa desde astro-intl/react
import { getTranslations } from "astro-intl/react";

export function Greeting() {
  const t = getTranslations();
  return <h1>{t("welcome")}</h1>;
}
```

```svelte
<!-- Svelte — importa desde astro-intl/svelte -->
<script>
  import { getTranslations } from 'astro-intl/svelte';
  const t = getTranslations();
</script>

<h1>{t('welcome')}</h1>
```

## 📖 Aprende más

- **[Documentación completa](https://astro-intl.dev)** - Guías, API y ejemplos
- **[Configuración](https://astro-intl.dev/docs#configuration)** - Opciones de configuración
- **[Routing](https://astro-intl.dev/docs#routing)** - URLs traducidas por locale
- **[Ejemplos](https://astro-intl.dev/docs#examples)** - Casos de uso comunes

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

MIT © [Erick Cruz](https://github.com/ErickCSS)

## 🔗 Links

- [Documentación](https://astro-intl.dev)
- [npm](https://www.npmjs.com/package/astro-intl)
- [GitHub](https://github.com/ErickCSS/astro-intl)
- [Issues](https://github.com/ErickCSS/astro-intl/issues)
- [Buy Me a Coffee](https://buymeacoffee.com/erickcs) ☕

---

Hecho con ❤️ para la comunidad de Astro
