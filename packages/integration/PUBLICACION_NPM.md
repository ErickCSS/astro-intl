# 📦 Guía de Publicación en npm

## Prerrequisitos

1. **Cuenta en npm**: Crea una cuenta en [npmjs.com](https://www.npmjs.com/)
2. **Autenticación**: Inicia sesión en tu terminal:
   ```bash
   npm login
   ```

## Pasos para Publicar

### 1. Actualizar información del package.json

Edita estos campos en `package.json`:

- **author**: Reemplaza `"Tu Nombre <tu@email.com>"` con tu información
- **repository**: Actualiza la URL de tu repositorio de GitHub
- **name**: Verifica que el nombre `"astro-intl"` esté disponible en npm (o cámbialo si ya existe)

### 2. Compilar el paquete

Antes de publicar, asegúrate de compilar:

```bash
cd packages/integration
npm run build
```

Esto generará los archivos en `dist/` que se incluirán en la publicación.

### 3. Verificar qué se publicará

Revisa qué archivos se incluirán:

```bash
npm pack --dry-run
```

Esto mostrará una lista de archivos. Deberías ver:

- `dist/` (archivos compilados)
- `package.json`
- `README.md`

### 4. Publicar en npm

```bash
npm publish
```

Si el nombre ya existe, puedes usar un scope:

```bash
# Cambia el nombre en package.json a "@tu-usuario/astro-intl"
npm publish --access public
```

### 5. Verificar la publicación

Visita: `https://www.npmjs.com/package/astro-intl` (o el nombre que hayas usado)

## Actualizaciones Futuras

Para publicar nuevas versiones:

1. Actualiza la versión en `package.json`:

   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. Compila y publica:
   ```bash
   npm run build
   npm publish
   ```

## Solución de Problemas

### Error: "You do not have permission to publish"

- Asegúrate de estar autenticado: `npm whoami`
- Verifica que `publishConfig.access` esté en `"public"`

### Error: "Package name already exists"

- Cambia el nombre en `package.json` o usa un scope: `@tu-usuario/astro-intl`

### Error: "Missing files"

- Verifica que hayas ejecutado `npm run build`
- Revisa que el campo `files` en `package.json` incluya `"dist"`

---

# 🔧 Configuración en astro.config.mjs

Una vez publicado en npm, los usuarios lo instalarán y configurarán así:

## Instalación

```bash
npm install astro-intl
# o
pnpm add astro-intl
# o
yarn add astro-intl
```

## Configuración

En `astro.config.mjs`:

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

## Uso en componentes Astro

```astro
---
import { setRequestLocale, getTranslations } from 'astro-intl';

// Configurar el locale para esta petición
setRequestLocale({
  locale: 'es',
  messages: {
    welcome: 'Bienvenido',
    greeting: 'Hola {name}'
  }
});

// Obtener función de traducción
const t = getTranslations();
---

<h1>{t('welcome')}</h1>
<p>{t('greeting', { name: 'Usuario' })}</p>
```

## Uso en componentes React

```tsx
import { getTranslationsReact } from "astro-intl/react";

export function MyComponent() {
  const t = getTranslationsReact();

  return (
    <div>
      <h1>{t("welcome")}</h1>
    </div>
  );
}
```

## Estructura de archivos de traducción recomendada

```
src/
├── i18n/
│   ├── es.json
│   ├── en.json
│   └── index.ts
└── pages/
    └── index.astro
```

Ejemplo de `src/i18n/es.json`:

```json
{
  "nav": {
    "home": "Inicio",
    "about": "Acerca de"
  },
  "home": {
    "title": "Bienvenido",
    "description": "Descripción de la página"
  }
}
```

Ejemplo de `src/i18n/index.ts`:

```ts
import es from "./es.json";
import en from "./en.json";

export const messages = {
  es,
  en,
};

export type Messages = typeof es;
```
