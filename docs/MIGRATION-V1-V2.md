# Migración de astro-intl v1 a v2

Esta guía conserva las firmas históricas únicamente para facilitar la migración. No deben utilizarse como referencia de la API vigente.

## Adaptador React

Antes:

```tsx
import { getTranslationsReact } from "astro-intl";
const t = getTranslationsReact("common");
```

Ahora:

```tsx
import { getTranslations } from "astro-intl/react";
const t = getTranslations("common");
```

El adaptador React y `createGetTranslations` se importan desde `astro-intl/react`. No existe un alias vigente en el export raíz.

## Inicialización por solicitud

Antes de las firmas basadas en URL, algunos ejemplos construían el estado directamente:

```ts
setRequestLocale({ locale, messages });
```

Ahora se pasa la URL y, opcionalmente, un loader:

```ts
const initialized = await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: await loadMessages(locale),
}));

if (!initialized) {
  throw new Error("No fue posible inicializar astro-intl");
}
```

Para SSR se recomienda `createIntlMiddleware()`, que mantiene todo el render dentro de un contexto aislado. Los runtimes SSR sin almacenamiento por solicitud fallan explícitamente; ya no se comparte un fallback global.

## Rich text de Svelte

`renderRichText()` conserva su firma, pero desde 2.2.2 escapa texto y chunks, valida los tags nativos y sanea el HTML final. Si una integración dependía de HTML arbitrario dentro del catálogo, debe sustituirlo por pseudo-tags registrados y callbacks controlados.
