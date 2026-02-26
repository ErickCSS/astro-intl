# astro-intl

Sistema de internacionalización simple y type-safe para Astro, inspirado en next-intl.

[![npm version](https://img.shields.io/npm/v/astro-intl.svg)](https://www.npmjs.com/package/astro-intl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Documentación

Para documentación completa, ejemplos y guías, visita:

**[astro-intl.dev](https://astro-intl.dev)**

## ✨ Características

- 🔒 **Type-safe** - Autocompletado y validación de tipos para tus traducciones
- 🚀 **Simple** - API intuitiva inspirada en next-intl
- 🎯 **Integración nativa** - Diseñado específicamente para Astro
- 🌍 **Flexible** - Soporta múltiples idiomas y estructuras de traducción
- ⚡ **Rendimiento** - Carga solo las traducciones necesarias
- 🛠️ **TypeScript first** - Escrito completamente en TypeScript
- 🛡️ **Concurrency-safe** - `AsyncLocalStorage` en SSR para aislar requests concurrentes
- 🌐 **Multi-runtime** - Compatible con Node.js, Cloudflare Workers y Deno

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
import { useTranslations } from 'astro-intl';

const t = useTranslations();
---

<h1>{t('welcome')}</h1>
<p>{t('greeting', { name: 'World' })}</p>
```

## 📖 Aprende más

- **[Documentación completa](https://astro-intl.dev)** - Guías, API y ejemplos
- **[Configuración](https://astro-intl.dev/docs#configuration)** - Opciones de configuración
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

---

Hecho con ❤️ para la comunidad de Astro
