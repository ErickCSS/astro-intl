# Explicación Detallada de la Implementación

## Resumen General

Este proyecto implementa un sistema de internacionalización (i18n) para Astro con soporte tanto para componentes estándar como para React. El sistema permite traducciones con namespaces, rutas tipadas, y funcionalidades avanzadas como interpolación de markup.

---

## 📄 `packages/integration/src/core.ts`

Este archivo contiene la lógica principal del sistema de internacionalización.

### 1. **Type Helper: `DotPaths<T>` (líneas 4-8)**

```typescript
export type DotPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}` | `${K}.${DotPaths<T[K]>}` : `${K}`;
    }[keyof T & string]
  : never;
```

**¿Qué hace?**
- Es un tipo recursivo de TypeScript que genera todas las rutas posibles en un objeto usando notación de punto.
- Por ejemplo, si tienes `{ user: { name: "Juan", address: { city: "Madrid" } } }`, genera los tipos:
  - `"user"`
  - `"user.name"`
  - `"user.address"`
  - `"user.address.city"`

**¿Para qué sirve?**
- Proporciona autocompletado y validación de tipos cuando accedes a traducciones anidadas.
- Evita errores de tipeo en las claves de traducción.

---

### 2. **Función: `getNestedValue` (líneas 10-17)**

```typescript
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
```

**¿Qué hace?**
- Accede a valores anidados en un objeto usando una ruta de string con notación de punto.
- Ejemplo: `getNestedValue({ user: { name: "Ana" } }, "user.name")` retorna `"Ana"`

**¿Cómo funciona?**
1. Divide el path por puntos: `"user.name"` → `["user", "name"]`
2. Usa `reduce` para navegar nivel por nivel en el objeto
3. Si encuentra el valor, lo retorna; si no, retorna `undefined`

---

### 3. **Función: `createTranslationGetter` (líneas 19-40)**

```typescript
export function createTranslationGetter<
  UI extends Record<string, Record<string, unknown>>,
  DefaultLocale extends keyof UI,
  N extends keyof UI[DefaultLocale],
>(ui: UI, defaultLocale: DefaultLocale, lang: string | undefined, namespace: N)
```

**¿Qué hace?**
- Crea una función `t()` para obtener traducciones de un namespace específico.
- Implementa un sistema de fallback: si no encuentra la traducción en el idioma solicitado, usa el idioma por defecto.

**Parámetros:**
- `ui`: Objeto con todas las traducciones de todos los idiomas
- `defaultLocale`: Idioma por defecto (ej: `"es"`)
- `lang`: Idioma solicitado (ej: `"en"`)
- `namespace`: Categoría de traducciones (ej: `"common"`, `"auth"`)

**Lógica interna:**
1. **Resolución de idioma (línea 27):** Si el idioma solicitado existe en `ui`, lo usa; si no, usa `defaultLocale`
2. **Carga de mensajes (líneas 28-29):** Obtiene los mensajes del idioma resuelto y del fallback
3. **Función `t()` (líneas 31-37):**
   - Busca la clave primero en `localeMessages`
   - Si no la encuentra, busca en `fallbackMessages`
   - Si no encuentra nada, retorna la clave misma como string

**Retorna:**
- Objeto con `t`, `localeMessages`, y `fallbackMessages`

---

### 4. **Función Principal: `createI18n` (líneas 42-88)**

Esta es la función principal que exporta el sistema completo de i18n.

#### 4.1. **`getLangFromUrl` (líneas 51-55)**

```typescript
function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (lang && lang in ui) return lang as Locale;
  return defaultLocale;
}
```

**¿Qué hace?**
- Extrae el idioma de la URL.
- Ejemplo: `/es/about` → retorna `"es"`
- Si la URL es `/about` o el idioma no existe, retorna el idioma por defecto

**Uso típico:**
```typescript
const lang = getLangFromUrl(Astro.url); // En un componente Astro
```

---

#### 4.2. **`getTranslations` (líneas 57-79)**

```typescript
function getTranslations<N extends Namespace>(lang: string | undefined, namespace: N)
```

**¿Qué hace?**
- Crea una función `t()` con una extensión `.markup()` para manejar HTML/markup en traducciones.

**Función `t.markup()` (líneas 62-74):**
- Permite interpolar tags personalizados en las traducciones.
- Ejemplo de uso:
  ```typescript
  // Traducción: "Acepto los <terms>términos y condiciones</terms>"
  t.markup("accept", {
    terms: (chunks) => `<a href="/terms">${chunks}</a>`
  });
  // Resultado: "Acepto los <a href="/terms">términos y condiciones</a>"
  ```

**¿Cómo funciona `markup`?**
1. Obtiene el string traducido con `t(key)`
2. Para cada tag definido en el objeto `tags`:
   - Crea una regex que busca `<tag>contenido</tag>`
   - Reemplaza cada match con el resultado de ejecutar la función del tag
3. Retorna el string procesado

---

#### 4.3. **`getTranslationsReact` (línea 86)**

```typescript
getTranslationsReact: createGetTranslationsReact(ui, defaultLocale)
```

**¿Qué hace?**
- Crea la versión de React del sistema de traducciones (implementada en `react.ts`)

---

#### 4.4. **Retorno de `createI18n` (líneas 81-87)**

Retorna un objeto con:
- `ui`: Configuración de traducciones
- `defaultLocale`: Idioma por defecto
- `getLangFromUrl`: Función para extraer idioma de URL
- `getTranslations`: Función para obtener traducciones (con `.markup()`)
- `getTranslationsReact`: Función para obtener traducciones en React (con `.rich()`)

---

## ⚛️ `packages/integration/src/react.ts`

Este archivo implementa la funcionalidad específica para React.

### **Función: `createGetTranslationsReact` (líneas 4-45)**

```typescript
export function createGetTranslationsReact<
  UI extends Record<string, Record<string, unknown>>,
  DefaultLocale extends keyof UI,
>(ui: UI, defaultLocale: DefaultLocale)
```

**¿Qué hace?**
- Crea una versión de `getTranslations` específica para React que retorna `ReactNode` en lugar de strings.

---

### **Función `t.rich()` (líneas 16-39)**

Esta es la funcionalidad clave para React.

**¿Qué hace?**
- Similar a `t.markup()`, pero retorna componentes React en lugar de strings HTML.
- Permite usar componentes React dentro de las traducciones.

**Ejemplo de uso:**
```tsx
// Traducción: "Lee nuestros <link>términos</link> y <bold>condiciones</bold>"
t.rich("terms", {
  link: (chunks) => <a href="/terms">{chunks}</a>,
  bold: (chunks) => <strong>{chunks}</strong>
})
// Resultado: Array de ReactNodes que React puede renderizar
```

**¿Cómo funciona? (líneas 20-38)**

1. **Obtiene el string traducido** (línea 20):
   ```typescript
   const str = t(key);
   ```

2. **Crea una regex dinámica** (líneas 21-22):
   ```typescript
   const tagNames = Object.keys(tags);
   const regex = new RegExp(`<(${tagNames.join("|")})>(.*?)<\\/\\1>`, "g");
   ```
   - Genera un patrón que busca cualquiera de los tags definidos
   - Ejemplo: si tags tiene `link` y `bold`, la regex busca `<link>...</link>` o `<bold>...</bold>`

3. **Procesa el string** (líneas 24-35):
   - Usa un bucle `while` con `regex.exec()` para encontrar todos los matches
   - Para cada match:
     - Agrega el texto antes del tag al resultado (líneas 29-31)
     - Ejecuta la función del tag y agrega el ReactNode resultante (líneas 32-33)
     - Actualiza `lastIndex` para continuar desde donde terminó el match (línea 34)

4. **Agrega el texto final** (línea 37):
   - Si queda texto después del último tag, lo agrega al resultado

5. **Retorna un array de ReactNodes** (línea 38):
   - React puede renderizar este array directamente

**Ejemplo paso a paso:**

Input:
```typescript
str = "Hola <bold>mundo</bold> y <link>amigos</link>!"
tags = {
  bold: (c) => <strong>{c}</strong>,
  link: (c) => <a>{c}</a>
}
```

Proceso:
1. Match 1: `<bold>mundo</bold>` en índice 5
   - Agrega `"Hola "` al resultado
   - Agrega `<strong>mundo</strong>` al resultado
2. Match 2: `<link>amigos</link>` en índice 24
   - Agrega `" y "` al resultado
   - Agrega `<a>amigos</a>` al resultado
3. Agrega `"!"` al resultado final

Resultado:
```typescript
["Hola ", <strong>mundo</strong>, " y ", <a>amigos</a>, "!"]
```

---

## 🎯 Flujo de Uso Completo

### En Astro (componentes .astro):
```typescript
const i18n = createI18n({ ui, defaultLocale: "es" });
const lang = i18n.getLangFromUrl(Astro.url);
const t = i18n.getTranslations(lang, "common");

// Uso simple
t("welcome") // "Bienvenido"

// Con markup
t.markup("terms", {
  link: (c) => `<a href="/terms">${c}</a>`
})
```

### En React (componentes .tsx):
```tsx
const i18n = createI18n({ ui, defaultLocale: "es" });
const t = i18n.getTranslationsReact(lang, "common");

// Uso simple
t("welcome") // "Bienvenido"

// Con componentes React
t.rich("terms", {
  link: (c) => <Link to="/terms">{c}</Link>,
  bold: (c) => <strong>{c}</strong>
})
```

---

## 🔑 Características Clave

1. **Type Safety Completo**: Todo está tipado con TypeScript, incluyendo las claves de traducción
2. **Namespaces**: Organiza traducciones por categorías
3. **Fallback Automático**: Si falta una traducción, usa el idioma por defecto
4. **Rutas Anidadas**: Soporta `t("user.profile.name")`
5. **Markup/Rich Text**: Permite interpolar HTML o componentes React en traducciones
6. **Extracción de Idioma de URL**: Detecta automáticamente el idioma desde la ruta

---

## 💡 Ventajas de esta Implementación

- **Sin dependencias externas** para el core de i18n
- **Reutilización de código** entre Astro y React
- **Flexibilidad** para agregar más funcionalidades (como pluralización, variables, etc.)
- **Performance** al no tener overhead de librerías grandes
- **Developer Experience** excelente con autocompletado y validación de tipos
