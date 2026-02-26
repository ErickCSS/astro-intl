# astro-intl

Sistema de internacionalización simple y type-safe para Astro, inspirado en next-intl.

## ✨ Características

- 🔒 **Type-safe**: Autocompletado y validación de claves de traducción con TypeScript
- 🎯 **API simple**: Inspirada en next-intl, fácil de usar
- ⚛️ **Soporte React**: Funciones específicas para componentes React con `t.rich()`
- 🎨 **Markup en traducciones**: Inserta HTML en strings con `t.markup()`
- 📁 **Namespaces**: Organiza traducciones por secciones
- 🌐 **Detección automática de locale**: Extrae el idioma desde la URL
- 🛡️ **Concurrency-safe**: Usa `AsyncLocalStorage` en SSR para aislar requests concurrentes
- 🌍 **Multi-runtime**: Compatible con Node.js, Cloudflare Workers y Deno
- ⚙️ **Default locale configurable**: Define tu locale por defecto desde las opciones

## 📦 Instalación

### Instalación automática (Recomendado)

Usa el CLI de Astro para instalar y configurar automáticamente:

```bash
npx astro add astro-intl
```

Este comando:

- ✅ Instala el paquete
- ✅ Agrega la integración a tu `astro.config.mjs`
- ✅ Configura las dependencias necesarias

### Instalación manual

Si prefieres instalar manualmente:

```bash
npm install astro-intl
# o
pnpm add astro-intl
# o
yarn add astro-intl
```

Luego agrega la integración en tu `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import astroIntl from "astro-intl";

export default defineConfig({
  integrations: [
    astroIntl({
      defaultLocale: "en", // opcional, por defecto es "en"
    }),
  ],
});
```

## 🎯 Uso

### Estructura de archivos de traducción

Primero, crea tus archivos de traducción:

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

### En componentes Astro

```astro
---
import { setRequestLocale, getTranslations } from 'astro-intl';
import { ui } from '../i18n';

// Configurar el locale para esta petición
await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: ui[locale as keyof typeof ui]
}));

// Obtener función de traducción
const t = getTranslations();
---

<h1>{t('welcome')}</h1>
<nav>
  <a href="/">{t('nav.home')}</a>
  <a href="/about">{t('nav.about')}</a>
</nav>
```

### Interpolación de variables

Usa `{varName}` en tus strings de traducción y pasa un objeto de valores:

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
<p>{t('greeting')}</p>                       <!-- "Hello, {name}!" (sin valores, placeholder se mantiene) -->
```

Los valores aceptados son `string | number | boolean`. Si una variable no se pasa o es `null`/`undefined`, el placeholder `{varName}` se mantiene sin cambios.

### Traducciones con markup (HTML en strings)

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

### Markup con interpolación

Puedes combinar variables e interpolación de tags usando el formato `{ values, tags }`:

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

### En componentes React

```tsx
import { getTranslationsReact } from "astro-intl";

export function MyComponent() {
  const t = getTranslationsReact();

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

### Traducciones con componentes React (rich text)

```tsx
import { getTranslationsReact } from "astro-intl";

export function MyComponent() {
  const t = getTranslationsReact();

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

### Type-safety con TypeScript

```astro
---
import { setRequestLocale, getTranslations } from 'astro-intl';
import { ui, type Messages } from '../i18n';

await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: ui[locale as keyof typeof ui]
}));

// Tipado fuerte con autocompletado
const t = getTranslations<Messages>();

// TypeScript autocompletará las rutas válidas:
// t('nav.home')     ✓
// t('nav.invalid')  ✗ Error de TypeScript
---
```

### Usar namespaces

```astro
---
// Obtener solo un namespace específico
const t = getTranslations<Messages>('nav');
---

<nav>
  <a href="/">{t('home')}</a>  <!-- En lugar de t('nav.home') -->
  <a href="/about">{t('about')}</a>
</nav>
```

## 📚 API Reference

### `astroIntl(options?)`

Configura la integración en `astro.config.mjs`.

**Opciones:**

- `defaultLocale?: string` - Locale por defecto cuando la URL no tiene prefijo de idioma (default: `"en"`)
- `enabled?: boolean` - Habilitar/deshabilitar la integración (default: `true`)
- `messages?: MessagesConfig` - Mensajes de traducción estáticos o dinámicos

### `setRequestLocale(url, getConfig?)`

Configura el locale para la petición actual.

**Parámetros:**

- `url: URL` - El objeto URL de Astro (`Astro.url`)
- `getConfig?: (locale: string) => RequestConfig | Promise<RequestConfig>` - Función que retorna la configuración

**Ejemplo:**

```ts
await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: ui[locale],
}));
```

### `runWithLocale(url, fn, getConfig?)`

Ejecuta una función dentro de un contexto aislado por request. Usa `AsyncLocalStorage` cuando está disponible (Node.js) para evitar race conditions en SSR con requests concurrentes.

**Parámetros:**

- `url: URL` - El objeto URL de Astro (`Astro.url`)
- `fn: () => R | Promise<R>` - Función a ejecutar dentro del contexto aislado
- `getConfig?: GetRequestConfigFn` - Función de configuración opcional

**Ejemplo en middleware:**

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

Obtiene la función de traducción para componentes Astro.

**Parámetros:**

- `namespace?: string` - Namespace opcional para obtener solo un subconjunto de traducciones

**Retorna:** Función `t(key, values?)` con método `t.markup(key, tags | { values?, tags })`

#### `t(key, values?)`

- `key: string` - Clave de traducción (soporta dot notation)
- `values?: Record<string, Primitive>` - Valores para interpolación `{varName}` (opcional)

#### `t.markup(key, options)`

- `key: string` - Clave de traducción
- `options` - Puede ser:
  - `Record<string, (chunks: string) => string>` - Solo tags (backward compatible)
  - `{ values?: Record<string, Primitive>, tags: Record<string, (chunks: string) => string> }` - Tags con interpolación

### `getTranslationsReact<T>(namespace?)`

Obtiene la función de traducción para componentes React.

**Parámetros:**

- `namespace?: string` - Namespace opcional

**Retorna:** Función `t(key)` con método `t.rich(key, tags)`

### `getLocale()`

Obtiene el locale actual configurado.

**Retorna:** `string` - El código del locale (ej: `'es'`, `'en'`)

---

## 🚀 Desarrollo (para contribuidores)

### Compilar el paquete

Antes de usar el paquete en el playground o en cualquier proyecto, debes compilarlo:

```bash
npm run build
```

Esto generará los archivos JavaScript y las declaraciones de tipos (`.d.ts`) en la carpeta `dist/`.

### Modo desarrollo

Para compilar automáticamente cuando hagas cambios:

```bash
npm run dev
```

### Después de compilar

Si estás trabajando en un monorepo con pnpm workspaces, después de compilar ejecuta:

```bash
pnpm install
```

Esto actualizará los enlaces simbólicos y los tipos estarán disponibles en los proyectos que usen el paquete.

## 📦 Estructura del Paquete

```text
packages/integration/
├── src/
│   ├── core.ts            # Barrel — re-exporta todo desde los módulos
│   ├── sanitize.ts        # Validación de locale, sanitización HTML, escape regex
│   ├── interpolation.ts   # Interpolación {variables}, acceso a valores anidados
│   ├── store.ts           # Estado por request (AsyncLocalStorage + fallback)
│   ├── translations.ts    # getTranslations y getTranslationsReact
│   ├── react.ts           # Factory de t.rich() para React
│   ├── index.ts           # Entry point público + integración de Astro
│   └── types/
│       └── index.ts       # Tipos TypeScript
├── dist/                  # Archivos compilados (generados)
│   ├── *.js               # JavaScript compilado
│   └── *.d.ts             # Declaraciones de tipos
├── package.json
└── tsconfig.json
```

## 🔧 Configuración TypeScript

El paquete usa:

- `module: "Node16"` para soporte ESM completo
- `declaration: true` para generar archivos `.d.ts`
- Imports con extensión `.js` para compatibilidad ESM

## 📝 Notas Importantes

1. **Siempre compila antes de probar**: Los cambios en `src/` no se reflejan hasta que ejecutes `npm run build`
2. **Archivos dist/ en .gitignore**: Los archivos compilados no se suben a git, se generan en cada instalación
3. **Extensiones .js en imports**: Aunque el código fuente es TypeScript, los imports deben usar `.js` para compatibilidad con Node16/ESM
