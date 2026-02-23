# Guía de Uso - Nueva API Simplificada

## 📁 Estructura de Carpetas

```
src/
├── i18n/
│   ├── request.ts          # Configuración de i18n
│   └── messages/
│       ├── en.json         # Traducciones en inglés
│       ├── es.json         # Traducciones en español
│       └── fr.json         # Traducciones en francés
├── layouts/
│   └── Layout.astro        # Layout principal
└── pages/
    └── [lang]/
        └── index.astro     # Página de ejemplo
```

## 📝 Paso 1: Crear Archivos de Traducciones

### `src/i18n/messages/en.json`

```json
{
  "common": {
    "welcome": "Welcome to Astro",
    "description": "This is a <bold>simple</bold> example"
  },
  "home": {
    "title": "Home Page",
    "subtitle": "Learn more about <link>Astro</link>"
  }
}
```

### `src/i18n/messages/es.json`

```json
{
  "common": {
    "welcome": "Bienvenido a Astro",
    "description": "Este es un ejemplo <bold>simple</bold>"
  },
  "home": {
    "title": "Página de Inicio",
    "subtitle": "Aprende más sobre <link>Astro</link>"
  }
}
```

## 🔧 Paso 2: Configurar i18n

### `src/i18n/request.ts`

```typescript
import type { RequestConfig } from "astro-intl";

export default async function getRequestConfig(
  locale: string,
): Promise<RequestConfig> {
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
}
```

## 🎨 Paso 3: Configurar Layout Principal

### `src/layouts/Layout.astro`

```astro
---
import { setRequestLocale } from "astro-intl";
import getRequestConfig from "../i18n/request";

// Configurar el locale para todo el request
await setRequestLocale(Astro.url, getRequestConfig);
---

<!DOCTYPE html>
<html lang={Astro.url.pathname.split('/')[1] || 'en'}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Astro i18n</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

## 🚀 Paso 4: Usar Traducciones en Componentes

### `src/pages/[lang]/index.astro`

```astro
---
import Layout from "../../layouts/Layout.astro";
import { getLocale, getTranslations } from "astro-intl";

// Obtener el locale actual (opcional)
const locale = getLocale();

// Obtener traducciones del namespace "common"
const t = getTranslations("common");

// Obtener traducciones del namespace "home"
const tHome = getTranslations("home");
---

<Layout>
  <main>
    <h1>{locale}</h1>

    <!-- Traducción simple -->
    <p>{t("welcome")}</p>

    <!-- Traducción con markup -->
    <p set:html={t.markup("description", {
      bold: (chunks) => `<strong>${chunks}</strong>`
    })} />

    <!-- Namespace diferente -->
    <h2>{tHome("title")}</h2>
    <p set:html={tHome.markup("subtitle", {
      link: (chunks) => `<a href="/docs">${chunks}</a>`
    })} />
  </main>
</Layout>
```

## ⚛️ Paso 5: Usar con React

### `src/components/ReactExample.tsx`

```tsx
import { getLocale, getTranslationsReact } from "astro-intl";

export default function ReactExample() {
  const locale = getLocale();
  const t = getTranslationsReact("common");

  return (
    <div>
      <h1>Current locale: {locale}</h1>

      {/* Traducción simple */}
      <p>{t("welcome")}</p>

      {/* Traducción con componentes React */}
      <p>
        {t.rich("description", {
          bold: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
    </div>
  );
}
```

## 🔄 Características

- ✅ **Sin props drilling**: No necesitas pasar el locale entre componentes
- ✅ **Carga dinámica**: Los mensajes se cargan solo cuando se necesitan
- ✅ **Type-safe**: Autocompletado completo con TypeScript
- ✅ **Namespaces**: Organiza traducciones por categorías
- ✅ **Markup/Rich**: Interpola HTML o componentes React

## 📚 API Reference

### `setRequestLocale(url: URL, getConfig: Function)`

Configura el locale para el request actual. Debe llamarse una vez en el layout principal.

### `getLocale(): string`

Retorna el locale actual del request.

### `getTranslations(namespace?: string)`

Retorna la función `t()` para obtener traducciones. Si se pasa un namespace, solo retorna las traducciones de ese namespace.

### `getTranslationsReact(namespace?: string)`

Versión de `getTranslations` para React con soporte para `.rich()`.

### `t(key: string): string`

Obtiene una traducción por su clave.

### `t.markup(key: string, tags: Record<string, Function>): string`

Obtiene una traducción e interpola tags HTML.

### `t.rich(key: string, tags: Record<string, Function>): ReactNode[]`

Obtiene una traducción e interpola componentes React.
