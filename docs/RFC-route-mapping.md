# RFC: Route Mapping & Locale Switching for astro-intl

> **Status:** ✅ Implemented  
> **Author:** Erick Cruz  
> **Date:** 2026-03-01 (implemented 2026-03-02)  

---

## 1. Motivación

Actualmente `astro-intl` resuelve dos problemas:

1. **Detección de locale** — extrae el locale del primer segmento de la URL (`/es/about` → `"es"`).
2. **Traducciones** — provee `getTranslations()` para acceder a mensajes localizados con interpolación y markup.

Lo que **no** resuelve es:

- **Rutas traducidas** — no hay forma de definir que `/about` en inglés sea `/sobre-nosotros` en español.
- **Locale switcher** — no hay utilidad para generar el equivalente de la página actual en otro idioma.
- **Links tipados** — no hay forma de generar paths localizados de forma segura (e.g. `path("about", { locale: "es" })`).

Estas son necesidades comunes en cualquier sitio multi-idioma. Librerías como `next-intl` (routing) y `astro-i18n-aut` ya las resuelven. Este RFC propone agregarlas a `astro-intl`.

---

## 2. Objetivos

| # | Objetivo | Prioridad |
|---|----------|-----------|
| 1 | Definir un mapa de rutas traducidas en la config | Alta |
| 2 | `path()` — generar paths localizados con sustitución de params | Alta |
| 3 | `switchLocalePath()` — obtener el path equivalente en otro locale | Alta |
| 4 | Fallback cuando no hay match de ruta | Alta |
| 5 | No romper nada existente (routes es opcional) | Alta |
| 6 | Cero dependencias en internals de Astro | Alta |

### No-objetivos (fuera de scope inicial)

- Catch-all routes (`[...slug]`)
- Redirecciones automáticas entre rutas traducidas
- Default locale sin prefijo (e.g. `/about` en vez de `/en/about`)
- Generación automática de rutas desde el filesystem de Astro

---

## 3. Diseño de la API

### 3.1 Configuración: `routes`

Se agrega un campo opcional `routes` al config de la integración:

```ts
// astro.config.mjs
import astroIntl from "astro-intl";

export default defineConfig({
  integrations: [
    astroIntl({
      defaultLocale: "en",
      locales: ["en", "es"],
      messages: { /* ... */ },

      // NUEVO: mapa de rutas traducidas
      routes: {
        home:  { en: "/",               es: "/"                  },
        about: { en: "/about",          es: "/sobre-nosotros"    },
        post:  { en: "/blog/[slug]",    es: "/blog/[slug]"       },
        shop:  { en: "/shop/[category]/[id]", es: "/tienda/[category]/[id]" },
      },
    }),
  ],
});
```

**Reglas del mapa:**

| Regla | Detalle |
|-------|---------|
| Las keys son identificadores libres | `"about"`, `"post"`, `"shop-item"`, etc. |
| Los values son templates de path | Sin prefijo de locale (se agrega automáticamente) |
| Placeholders usan `[param]` | Igual que las rutas de Astro: `[slug]`, `[id]`, etc. |
| Cada routeKey debe tener un entry por locale | Si falta un locale, `path()` lanza error en dev |

### 3.2 Tipo TypeScript

```ts
// types/index.ts

export type RoutesMap = {
  [routeKey: string]: {
    [locale: string]: string; // template path sin prefijo de locale
  };
};

// ─── Type-level param extraction from route templates ────────────────

export type ExtractParams<T extends string> =
  T extends `${string}[${infer P}]${infer Rest}` ? P | ExtractParams<Rest> : never;

export type ParamsForRoute<Template extends string> =
  [ExtractParams<Template>] extends [never]
    ? Record<string, never>
    : Record<ExtractParams<Template>, string>;

export type IntlConfig = {
  defaultLocale: string;
  locales: string[];
  routes?: RoutesMap;  // NUEVO
};
```

> **Tipado fuerte de params:** `ExtractParams` y `ParamsForRoute` permiten inferir
> automáticamente qué parámetros requiere cada template a nivel de tipos.
> Por ejemplo, `ParamsForRoute<"/blog/[slug]">` resulta en `Record<"slug", string>`.

### 3.3 Helper: `path()`

Genera un path localizado a partir de un routeKey.

```ts
function path(
  routeKey: string,
  options: {
    locale?: string;          // default: locale actual (getLocale())
    params?: Record<string, string>;  // valores para placeholders
    encode?: boolean;         // default: true — encodeURIComponent en params
  }
): string;
```

**Ejemplos:**

```ts
import { path } from "astro-intl";

// Asumiendo locale actual = "en"
path("about", {});
// → "/en/about"

path("about", { locale: "es" });
// → "/es/sobre-nosotros"

path("post", { locale: "en", params: { slug: "hello-world" } });
// → "/en/blog/hello-world"

path("shop", { locale: "es", params: { category: "ropa", id: "42" } });
// → "/es/tienda/ropa/42"
```

**Algoritmo:**

```
1. Buscar routeKey en routes map
2. Si no existe → throw Error("[astro-intl] Unknown route key: ...")
3. Obtener template para el locale indicado (o locale actual)
4. Si no hay template para ese locale → throw Error
5. Validar template (brackets balanceados, param names válidos)
6. Sustituir cada [param] con el valor de params (con encodeURIComponent si encode !== false)
7. Si quedan [param] sin sustituir → throw Error
8. Validar locale contra locales configurados
9. Anteponer /{locale} al path
10. Retornar path normalizado
```

**Encoding automático:**

```ts
path("post", { locale: "en", params: { slug: "hello world" } });
// → "/en/blog/hello%20world"

path("post", { locale: "en", params: { slug: "hello world" }, encode: false });
// → "/en/blog/hello world"
```

### 3.4 Helper: `switchLocalePath()`

Dado un path actual (o URL), devuelve el path equivalente en otro locale.

```ts
function switchLocalePath(
  currentPath: string | URL,
  nextLocale: string
): string;
```

**Ejemplos:**

```ts
import { switchLocalePath } from "astro-intl";

switchLocalePath("/en/about", "es");
// → "/es/sobre-nosotros"

switchLocalePath("/en/blog/hello-world", "es");
// → "/es/blog/hello-world"

switchLocalePath("/en/unknown/page", "es");
// → "/es/unknown/page"  (fallback: solo cambia prefijo)

switchLocalePath("https://example.com/en/about", "es");
// → "/es/sobre-nosotros"  (acepta URL completa, retorna solo path)
```

**Algoritmo detallado:**

```
1. Extraer pathname del input
   - Si es URL/string con scheme → parsear y tomar pathname
   - Si es string sin scheme → usar directamente

2. Detectar locale actual del path
   - Extraer primer segmento: pathname.split("/")[1]
   - Validar contra locales configurados
   - Si no es locale válido → retornar /{nextLocale}{pathname} (prepend)

3. Separar: localePrefix + restPath
   - "/en/about" → locale="en", restPath="/about"
   - "/en/blog/hello" → locale="en", restPath="/blog/hello"

4. Intentar match contra route templates
   Para cada routeKey en routes:
     a. Obtener template del locale actual
     b. Convertir template a regex:
        "/blog/[slug]" → /^\/blog\/([^\/]+)$/
        (cada [param] → grupo capturador nombrado)
     c. Intentar match de restPath contra regex
     d. Si match:
        - Extraer params del match
        - Obtener template del nextLocale
        - Sustituir params en template del nextLocale
        - Retornar /{nextLocale}{newPath}

5. Si ningún routeKey matcheó (fallback):
   - Retornar /{nextLocale}{restPath}
   (Solo reemplaza el segmento de locale, mantiene el resto igual)
```

### 3.5 Conversión de template a regex

Este es el corazón de `switchLocalePath`. La función interna:

```ts
// Ejemplo:
templateToRegex("/blog/[slug]")
// → { regex: /^\/blog\/([^\/]+)$/, paramNames: ["slug"] }

templateToRegex("/shop/[category]/[id]")
// → { regex: /^\/shop\/([^\/]+)\/([^\/]+)$/, paramNames: ["category", "id"] }
```

**Implementación:**

```ts
function templateToRegex(template: string): {
  regex: RegExp;
  paramNames: string[];
} {
  const paramNames: string[] = [];
  // Escapar caracteres especiales de regex, luego reemplazar [param]
  const pattern = template
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")  // escape regex chars
    .replace(/\\\[(\w+)\\\]/g, (_match, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
  return {
    regex: new RegExp(`^${pattern}$`),
    paramNames,
  };
}
```

**Nota:** El `escapeRegExp` ya existe en `sanitize.ts`, pero aquí necesitamos un escape que no interfiera con los placeholders, por lo que se escapa primero y luego se procesan los `[param]` ya escapados (`\[param\]` → grupo capturador).

---

## 4. Cambios por archivo

### 4.1 `packages/integration/src/types/index.ts`

```diff
+ export type RoutesMap = {
+   [routeKey: string]: {
+     [locale: string]: string;
+   };
+ };

  export type IntlConfig = {
    defaultLocale: string;
    locales: string[];
+   routes?: RoutesMap;
  };
```

### 4.2 `packages/integration/src/store.ts`

Extender `__setIntlConfig` para aceptar `routes`:

```diff
  export function __setIntlConfig(config: Partial<IntlConfig>) {
    if (config.defaultLocale) {
      intlConfig = { ...intlConfig, defaultLocale: config.defaultLocale };
    }
    if (config.locales) {
      intlConfig = { ...intlConfig, locales: config.locales };
    }
+   if (config.routes) {
+     intlConfig = { ...intlConfig, routes: config.routes };
+   }
  }
```

Agregar getter:

```diff
+ export function getRoutes(): RoutesMap | undefined {
+   return intlConfig.routes;
+ }
```

Actualizar `__resetRequestConfig`:

```diff
  export function __resetRequestConfig() {
    registeredGetRequestConfig = null;
    configMessages = null;
    fallbackState = null;
-   intlConfig = { defaultLocale: "en", locales: [] };
+   intlConfig = { defaultLocale: "en", locales: [], routes: undefined };
  }
```

### 4.3 `packages/integration/src/routing.ts` (NUEVO)

Archivo nuevo con ~100-120 líneas:

- `templateToRegex(template)` — convierte template a regex + extrae param names
- `substituteParams(template, params)` — reemplaza `[param]` con valores
- `path(routeKey, options)` — genera path localizado
- `switchLocalePath(currentPath, nextLocale)` — cambia locale de un path

### 4.4 `packages/integration/src/core.ts`

```diff
+ // ─── Routing utilities ──────────────────────────────────────────────
+ export { path, switchLocalePath } from "./routing.js";
```

### 4.5 `packages/integration/src/index.ts`

Extender `AstroIntlOptions`:

```diff
+ import type { RoutesMap } from "./types/index.js";

  export type AstroIntlOptions = {
    enabled?: boolean;
    defaultLocale?: string;
    locales?: string[];
    messages?: MessagesConfig;
+   routes?: RoutesMap;
  };
```

Pasar routes al config:

```diff
  if (defaultLocale || locales) {
    __setIntlConfig({
      ...(defaultLocale && { defaultLocale }),
      ...(locales && { locales }),
+     ...(routes && { routes }),
    });
  }
```

Re-exportar:

```diff
+ export const path = _path;
+ export const switchLocalePath = _switchLocalePath;
```

Agregar tipo:

```diff
  export type {
    RequestConfig,
    Primitive,
    GetRequestConfigFn,
    MessagesConfig,
    IntlConfig,
+   RoutesMap,
  } from "./types/index.js";
```

### 4.6 `packages/integration/src/__tests__/routing.test.ts` (NUEVO)

Tests exhaustivos (ver sección 5).

---

## 5. Plan de tests

### 5.1 `path()` tests

```ts
describe("path()", () => {
  // Setup: configurar routes + locale

  it("genera path simple sin params", () => {
    // path("about", { locale: "es" }) → "/es/sobre-nosotros"
  });

  it("genera path con params", () => {
    // path("post", { locale: "en", params: { slug: "hello" } }) → "/en/blog/hello"
  });

  it("genera path con múltiples params", () => {
    // path("shop", { locale: "es", params: { category: "ropa", id: "42" } })
    // → "/es/tienda/ropa/42"
  });

  it("usa locale actual si no se especifica", () => {
    // Configurar locale="en" con setRequestLocale
    // path("about", {}) → "/en/about"
  });

  it("lanza error si routeKey no existe", () => {
    // path("nonexistent", { locale: "en" }) → throw
  });

  it("lanza error si locale no tiene template", () => {
    // path("about", { locale: "fr" }) → throw (si fr no está en routes.about)
  });

  it("lanza error si faltan params", () => {
    // path("post", { locale: "en" }) → throw (falta slug)
  });

  it("maneja path raíz '/'", () => {
    // path("home", { locale: "en" }) → "/en/"  o  "/en"
  });
});
```

### 5.2 `switchLocalePath()` tests

```ts
describe("switchLocalePath()", () => {
  it("cambia locale en ruta simple", () => {
    // switchLocalePath("/en/about", "es") → "/es/sobre-nosotros"
  });

  it("cambia locale en ruta con params", () => {
    // switchLocalePath("/en/blog/my-post", "es") → "/es/blog/my-post"
  });

  it("fallback: cambia solo prefijo si no hay match", () => {
    // switchLocalePath("/en/unknown/page", "es") → "/es/unknown/page"
  });

  it("maneja URL completa", () => {
    // switchLocalePath("https://example.com/en/about", "es") → "/es/sobre-nosotros"
  });

  it("maneja path raíz", () => {
    // switchLocalePath("/en/", "es") → "/es/"
    // switchLocalePath("/en", "es") → "/es"
  });

  it("maneja múltiples params correctamente", () => {
    // switchLocalePath("/en/shop/clothing/42", "es") → "/es/tienda/clothing/42"
  });

  it("no falla si routes no está configurado", () => {
    // Sin routes → solo cambia prefijo
    // switchLocalePath("/en/about", "es") → "/es/about"
  });
});
```

### 5.3 `templateToRegex()` tests (interno)

```ts
describe("templateToRegex()", () => {
  it("convierte template sin params", () => {
    // "/about" → regex que matchea exactamente "/about"
  });

  it("convierte template con un param", () => {
    // "/blog/[slug]" → regex que matchea "/blog/anything"
    // paramNames → ["slug"]
  });

  it("convierte template con múltiples params", () => {
    // "/shop/[category]/[id]" → regex correcta
    // paramNames → ["category", "id"]
  });

  it("escapa caracteres especiales en el template", () => {
    // "/file.html" → no confunde el punto con regex wildcard
  });
});
```

---

## 6. Casos edge y decisiones

### 6.1 ¿Qué pasa si `routes` no se configura?

- `path()` lanza error: `"[astro-intl] No routes configured. Add routes to your astro-intl config."`
- `switchLocalePath()` **no lanza error** — simplemente usa el fallback (cambiar prefijo de locale).

> Esto es intencional: `switchLocalePath` es útil incluso sin rutas traducidas (solo para cambiar el idioma en el prefix), mientras que `path()` sin routes no tiene sentido.

### 6.2 ¿Trailing slashes?

Respetamos el input tal cual. Si el template tiene trailing slash, se preserva. No normalizamos.

```ts
routes: {
  about: { en: "/about/", es: "/sobre-nosotros/" }
}
// path("about", { locale: "en" }) → "/en/about/"
```

### 6.3 ¿Query params y hash?

- `switchLocalePath` preserva query params y hash del input.
- `path()` no maneja query params (el usuario los puede agregar después).

```ts
switchLocalePath("/en/about?ref=nav#section", "es");
// → "/es/sobre-nosotros?ref=nav#section"
```

### 6.4 ¿Default locale sin prefijo?

**Fuera de scope inicial.** Actualmente todo path tiene prefijo de locale. Si en el futuro se quiere soportar que el default locale no tenga prefijo (`/about` en vez de `/en/about`), se puede agregar un flag `prefixDefaultLocale: false` sin romper esta API.

### 6.5 Rendimiento

Los regex compilados se cachean en un `Map<string, CompiledTemplate>` para evitar recompilación. Cada template se compila una sola vez y se reutiliza en llamadas posteriores.

### 6.6 Conflicto entre templates

Se implementó detección de conflictos en `__setIntlConfig()` al recibir routes:

- **Templates idénticos** (mismo string literal para el mismo locale en dos routeKeys) → **`throw Error`**
- **Templates estructuralmente equivalentes** (e.g. `/blog/[slug]` vs `/blog/[article]`) → **`console.warn`**
- Si ninguna detección aplica → el primero que matchee gana (orden de iteración del objeto)

```
[astro-intl] ⚠️  Route conflict detected for locale "en":
  "blog" (/blog/[slug])
  "news" (/blog/[article])
  Both templates match the same pattern. "blog" will take priority.
```

> ⚠️ **Importante:** Asegúrate de que cada template sea único por locale para evitar
> resultados inesperados en `switchLocalePath()`.

### 6.7 Validación temprana de templates

`path()` valida el template antes de sustituir params:

- Brackets desbalanceados (`/blog/[slug`) → **`throw Error`**
- Param names inválidos (`/blog/[slug-name]`) → **`throw Error`** (solo `\w+` permitido)

### 6.8 Validación de locale

- `path()` valida que el locale exista en `locales` configurados → **`throw Error`** si es inválido
- `switchLocalePath()` valida `nextLocale` contra `locales` configurados → **`throw Error`** si es inválido

---

## 7. Uso en componentes Astro

### Language switcher

```astro
---
// src/components/LanguageSwitcher.astro
import { switchLocalePath, getLocale, getLocales } from "astro-intl";

const currentLocale = getLocale();
const currentPath = Astro.url.pathname;
---

<nav>
  {getLocales().map((locale) => (
    <a
      href={switchLocalePath(currentPath, locale)}
      class:list={[{ active: locale === currentLocale }]}
    >
      {locale.toUpperCase()}
    </a>
  ))}
</nav>
```

### Navegación localizada

```astro
---
import { path } from "astro-intl";
---

<nav>
  <a href={path("home", {})}>Home</a>
  <a href={path("about", {})}>About</a>
  <a href={path("post", { params: { slug: "hello-world" } })}>Post</a>
</nav>
```

### En un layout (head - hreflang)

```astro
---
import { switchLocalePath, getLocales } from "astro-intl";

const currentPath = Astro.url.pathname;
---

<head>
  {getLocales().map((locale) => (
    <link
      rel="alternate"
      hreflang={locale}
      href={switchLocalePath(currentPath, locale)}
    />
  ))}
</head>
```

---

## 8. Orden de implementación

| Paso | Descripción | Archivos |
|------|-------------|----------|
| 1 | Extender tipos | `types/index.ts` |
| 2 | Extender store (almacenar + exponer routes) | `store.ts` |
| 3 | Crear módulo de routing | `routing.ts` (nuevo) |
| 4 | Re-exportar en core e index | `core.ts`, `index.ts` |
| 5 | Tests | `__tests__/routing.test.ts` (nuevo) |
| 6 | Documentación en docs site | `docs/` |

---

## 9. Mejoras consolidadas (implementadas)

Estas mejoras fueron identificadas en revisión colaborativa y se implementaron en una sola vuelta:

| Área | Mejora | Estado |
|------|--------|--------|
| **DX** | Tipado fuerte de params (`ExtractParams`, `ParamsForRoute`) | ✅ |
| **Seguridad** | Encoding automático (`encodeURIComponent` por defecto) | ✅ |
| **Estabilidad** | Comportamiento definido para root `/` | ✅ |
| **Debug** | Warning por templates ambiguos + error por duplicados exactos | ✅ |
| **Performance** | Cache de regex (`Map<string, CompiledTemplate>`) | ✅ |
| **Robustez** | Validaciones tempranas (brackets, param names, locale) | ✅ |
| **Tolerancia** | `switchLocalePath()` preserva query params y hash | ✅ |

---

## 10. Resumen

Este feature agrega **route mapping** a `astro-intl` de forma no-invasiva:

- **~200 líneas de código nuevo** (`routing.ts` + cambios en tipos/store/exports)
- **~250 líneas de tests** (40 test cases)
- **Cero dependencias nuevas**
- **100% backward compatible** (routes es opcional)
- **Puro string manipulation** — no depende de internals de Astro
- **174 tests totales** pasando (0 regresiones)

Las dos funciones (`path()` y `switchLocalePath()`) cubren los dos casos de uso principales: generar links localizados y construir locale switchers.
