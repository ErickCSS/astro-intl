# astro-intl

Sistema de internacionalización simple y type-safe para Astro, inspirado en next-intl.

## ✨ Características

- 🔒 **Type-safe**: Autocompletado y validación de claves de traducción con TypeScript
- 🎯 **API simple**: Inspirada en next-intl, fácil de usar
- ⚛️ **Soporte React**: Adapter dedicado con `t.rich()` para rich text con componentes React. Importa desde `astro-intl/react`
- 🧡 **Soporte Svelte**: Adapter dedicado con `t.rich()` que retorna segmentos y componente `RichText`. Importa desde `astro-intl/svelte`
- 🎨 **Markup en traducciones**: Inserta HTML en strings con `t.markup()`
- 📁 **Namespaces**: Organiza traducciones por secciones
- 🌐 **Detección automática de locale**: Extrae el idioma desde la URL
- 🛡️ **Concurrency-safe**: Usa `AsyncLocalStorage` en SSR para aislar requests concurrentes
- 🌍 **Multi-runtime**: Compatible con Node.js, Cloudflare Workers y Deno
- ⚙️ **Default locale configurable**: Define tu locale por defecto desde las opciones
- 🗺️ **Routing localizado**: Define URLs traducidas por locale (`/es/sobre-nosotros` en vez de `/es/about`)
- 🔄 **Rewrites automáticos**: El middleware reescribe URLs traducidas a rutas canónicas del filesystem
- 🔗 **Generación de URLs**: `path()` y `switchLocalePath()` para construir y transformar URLs localizadas
- 📦 **Sub-path imports**: `astro-intl/react`, `astro-intl/svelte`, `astro-intl/routing`, `astro-intl/middleware`

## � Migración desde v1 a v2

### Breaking changes

1. **`getTranslationsReact` ya no se exporta desde `astro-intl`**. Usa `getTranslations` desde `astro-intl/react`:

```diff
- import { getTranslationsReact } from "astro-intl";
+ import { getTranslations } from "astro-intl/react";

- const t = getTranslationsReact();
+ const t = getTranslations();
```

2. **Sub-path imports obligatorios para adapters de framework**:
   - React: `astro-intl/react`
   - Svelte: `astro-intl/svelte`

3. Las funciones base de Astro (`getTranslations`, `setRequestLocale`, `getLocale`, etc.) siguen exportándose desde `astro-intl` sin cambios.

### Nuevas funcionalidades

- **Adapter Svelte** con `t.rich()` y `renderRichText()`
- **`createGetTranslations` factory** en ambos adapters (React y Svelte) para uso standalone sin store global
- **`parseRichSegments()`** base agnóstica compartida

## �📦 Instalación

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

> **v2**: Importa desde `astro-intl/react` en lugar de `astro-intl`.

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

#### Factory standalone (sin store)

Si prefieres pasar los mensajes directamente sin depender del store global:

```tsx
import { createGetTranslations } from "astro-intl/react";
import { ui } from "../i18n";

const getT = createGetTranslations(ui, "en");

export function MyComponent({ lang }: { lang: string }) {
  const t = getT(lang, "nav");
  return <a href="/">{t("home")}</a>;
}
```

### Traducciones con componentes React (rich text)

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

### En componentes Svelte

> **v2**: Nuevo adapter. Importa desde `astro-intl/svelte`.

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

#### Rich text en Svelte

`t.rich()` retorna un array de `RichSegment[]` que puedes renderizar con `renderRichText()`:

```svelte
<script>
  import { getTranslations, renderRichText } from 'astro-intl/svelte';

  // { "terms": "Acepto los <link>términos y condiciones</link>" }
  const t = getTranslations();
  const segments = t.rich('terms', ['link']);

  const html = renderRichText(segments, {
    tags: { link: 'a' },       // renderiza como <a>...</a>
  });
</script>

<p>{@html html}</p>
```

También puedes usar funciones personalizadas con `components`:

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

#### Factory standalone en Svelte (sin store)

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

## �️ Routing Localizado

### Definir rutas traducidas

Crea un mapa de rutas con URLs traducidas por locale:

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

### Con Middleware (recomendado)

Pasa las rutas al middleware. Este reescribe automáticamente URLs traducidas a las rutas canónicas del filesystem:

```ts
// src/middleware.ts
import "@/i18n/request";
import { createIntlMiddleware } from "astro-intl/middleware";
import { routing } from "@/i18n/routing";

export const onRequest = createIntlMiddleware(routing);
```

Cuando un usuario visita `/es/sobre-nosotros`, el middleware lo reescribe a `/es/about` — que mapea a tu archivo `[lang]/about.astro`. Sin páginas duplicadas.

### Sin Middleware

Configura las rutas via las opciones de la integración:

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

Sin middleware no hay rewrites automáticos. Crea wrappers ligeros para cada ruta traducida:

```astro
---
// src/pages/[lang]/sobre-nosotros.astro
export { default } from "./about.astro";
export { getStaticPaths } from "./about.astro";
---
```

### Generar URLs con `path()`

```astro
---
import { path } from "astro-intl/routing";
---

<a href={path("about")}>About</a>
<!-- locale "en" → /en/about -->
<!-- locale "es" → /es/sobre-nosotros -->

<a href={path("shop", { locale: "es", params: { category: "ropa", id: "42" } })}>
  Ver producto
</a>
<!-- → /es/tienda/ropa/42 -->
```

### Cambiar locale con `switchLocalePath()`

```astro
---
import { switchLocalePath } from "astro-intl/routing";
---

<a href={switchLocalePath(Astro.url.pathname, "en")}>English</a>
<a href={switchLocalePath(Astro.url.pathname, "es")}>Español</a>
<!-- En /en/about → /es/sobre-nosotros -->
<!-- En /es/tienda/ropa/42 → /en/shop/ropa/42 -->
```

## � API Reference

### `astroIntl(options?)`

Configura la integración en `astro.config.mjs`.

**Opciones:**

- `defaultLocale?: string` - Locale por defecto cuando la URL no tiene prefijo de idioma (default: `"en"`)
- `enabled?: boolean` - Habilitar/deshabilitar la integración (default: `true`)
- `messages?: MessagesConfig` - Mensajes de traducción estáticos o dinámicos
- `locales?: string[]` - Lista de locales soportados
- `routes?: RoutesMap` - Mapa de rutas traducidas por locale

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

### `getTranslations()` — `astro-intl/react`

Obtiene la función de traducción para componentes React (usa el store global).

**Retorna:** Función `t(key)` con método `t.rich(key, tags)` que retorna `ReactNode[]`

### `createGetTranslations(ui, defaultLocale)` — `astro-intl/react`

Factory standalone que no depende del store global. Útil para pasar mensajes directamente.

**Parámetros:**

- `ui: Record<string, Record<string, unknown>>` - Objeto con todos los mensajes por locale
- `defaultLocale: string` - Locale por defecto

**Retorna:** `(lang, namespace) => t` — función que retorna `t(key)` con `t.rich(key, tags)`

### `getTranslations()` — `astro-intl/svelte`

Obtiene la función de traducción para componentes Svelte (usa el store global).

**Retorna:** Función `t(key)` con método `t.rich(key, tagNames?)` que retorna `RichSegment[]`

### `createGetTranslations(ui, defaultLocale)` — `astro-intl/svelte`

Factory standalone para Svelte. Misma firma que el de React pero `t.rich()` retorna `RichSegment[]`.

### `renderRichText(segments, options?)` — `astro-intl/svelte`

Resuelve un array de `RichSegment[]` en un string HTML.

**Parámetros:**

- `segments: RichSegment[]` - Segmentos retornados por `t.rich()`
- `options.tags?: Record<string, string>` - Mapea nombre de tag a elemento HTML (ej: `{ link: 'a' }`)
- `options.components?: Record<string, (chunks: string) => string>` - Funciones personalizadas por tag

**Retorna:** `string` - HTML listo para renderizar con `{@html}`

### `getLocale()`

Obtiene el locale actual configurado.

**Retorna:** `string` - El código del locale (ej: `'es'`, `'en'`)

### `createIntlMiddleware(options)`

Crea un middleware de Astro que llama automáticamente a `setRequestLocale` en cada request. Importar desde `astro-intl/middleware`.

**Opciones:**

- `locales: string[]` - Lista de locales soportados
- `defaultLocale?: string` - Locale por defecto (default: `"en"`)
- `routes?: RoutesMap` - Mapa de rutas traducidas. Cuando se proporciona, el middleware reescribe URLs traducidas a sus rutas canónicas del filesystem

### `path(routeKey, options?)`

Genera una URL localizada para una ruta nombrada. Importar desde `astro-intl/routing`.

**Parámetros:**

- `routeKey: string` - Nombre de la ruta (clave del mapa de `routes`)
- `options?.locale` - Locale destino (default: locale actual)
- `options?.params` - `Record<string, string>` para sustituir `[param]` en el template
- `options?.encode` - Codificar params con `encodeURIComponent` (default: `true`)

**Retorna:** `string` - URL localizada (ej: `"/es/sobre-nosotros"`)

### `switchLocalePath(currentPath, nextLocale)`

Convierte la URL actual a su equivalente en otro locale. Importar desde `astro-intl/routing`.

**Parámetros:**

- `currentPath: string | URL` - Ruta actual (pathname, URL string o URL object)
- `nextLocale: string` - Locale destino

**Retorna:** `string` - URL equivalente en el nuevo locale. Preserva query strings y hashes. Si no matchea ningún template, hace fallback a intercambiar el prefijo del locale.

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
│   ├── adapters/
│   │   ├── react.ts       # Adapter React — getTranslations, createGetTranslations, t.rich() → ReactNode[]
│   │   └── svelte.ts      # Adapter Svelte — getTranslations, createGetTranslations, t.rich() → RichSegment[], renderRichText()
│   ├── core.ts            # Barrel — re-exporta todo desde los módulos
│   ├── framework-base.ts  # parseRichSegments() — base agnóstica compartida por React y Svelte
│   ├── sanitize.ts        # Validación de locale, sanitización HTML, escape regex
│   ├── interpolation.ts   # Interpolación {variables}, acceso a valores anidados
│   ├── store.ts           # Estado por request (AsyncLocalStorage + fallback)
│   ├── translations.ts    # getTranslations para componentes Astro
│   ├── routing.ts         # path(), switchLocalePath() — generación de URLs localizadas
│   ├── middleware.ts       # createIntlMiddleware() con rewrites de rutas traducidas
│   ├── index.ts           # Entry point público + integración de Astro
│   └── types/
│       └── index.ts       # Tipos TypeScript (incluye RoutesMap)
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
