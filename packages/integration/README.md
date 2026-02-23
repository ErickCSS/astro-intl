# astro-intl

Sistema de internacionalización simple y type-safe para Astro, inspirado en next-intl.

## ✨ Características

- 🔒 **Type-safe**: Autocompletado y validación de claves de traducción con TypeScript
- 🎯 **API simple**: Inspirada en next-intl, fácil de usar
- ⚛️ **Soporte React**: Funciones específicas para componentes React con `t.rich()`
- 🎨 **Markup en traducciones**: Inserta HTML en strings con `t.markup()`
- 📁 **Namespaces**: Organiza traducciones por secciones
- 🌐 **Detección automática de locale**: Extrae el idioma desde la URL

## 📦 Instalación

```bash
npm install astro-intl
# o
pnpm add astro-intl
# o
yarn add astro-intl
```

## ⚙️ Configuración

Agrega la integración en tu `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import astroIntl from "astro-intl";

export default defineConfig({
  integrations: [
    astroIntl({
      enabled: true, // opcional, por defecto es true
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

### `setRequestLocale(url, getConfig)`

Configura el locale para la petición actual.

**Parámetros:**

- `url: URL` - El objeto URL de Astro (`Astro.url`)
- `getConfig: (locale: string) => RequestConfig | Promise<RequestConfig>` - Función que retorna la configuración

**Ejemplo:**

```ts
await setRequestLocale(Astro.url, async (locale) => ({
  locale,
  messages: ui[locale],
}));
```

### `getTranslations<T>(namespace?)`

Obtiene la función de traducción para componentes Astro.

**Parámetros:**

- `namespace?: string` - Namespace opcional para obtener solo un subconjunto de traducciones

**Retorna:** Función `t(key)` con método `t.markup(key, tags)`

### `getTranslationsReact<T>(namespace?)`

Obtiene la función de traducción para componentes React.

**Parámetros:**

- `namespace?: string` - Namespace opcional

**Retorna:** Función `t(key)` con método `t.rich(key, tags)`

### `getLocale()`

Obtiene el locale actual configurado.

**Retorna:** `string` - El código del locale (ej: 'es', 'en')

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

```
packages/integration/
├── src/
│   ├── core.ts          # Lógica principal
│   ├── react.ts         # Integración con React
│   ├── index.ts         # Exports públicos
│   └── types/
│       └── index.ts     # Tipos TypeScript
├── dist/                # Archivos compilados (generados)
│   ├── *.js            # JavaScript compilado
│   └── *.d.ts          # Declaraciones de tipos
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
