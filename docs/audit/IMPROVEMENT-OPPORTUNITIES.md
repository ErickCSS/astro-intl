# Oportunidades de mejora

## Hallazgos cerrados en 2.2.2

| Área | Estado | Evidencia principal |
| --- | --- | --- |
| Estado SSR global | Corregido | `store.ts:18-24`, `middleware.ts:96`, `request-isolation.test.ts` |
| XSS en `t.markup()` | Corregido | `sanitize.ts:64`, `translations.ts:85`, regresiones en `core.test.ts` |
| XSS en rich text Svelte | Corregido | `adapters/svelte.ts:53-73`, regresiones en `svelte.test.ts` |
| Locales usados como segmentos | Corregido | `routing.ts:112,140`, `AutoRedirect.astro:28-37` |
| JSON-LD y changelog de docs | Hardening aplicado | `docs/shared/security.mjs:12,35`, `scripts/docs-check.mjs:68-71` |
| Tests compilados/publicados | Corregido | `tsconfig.build.json:4`, `vitest.config.ts:7-8`, `pack-check.mjs:42-57` |
| Artefactos `dist` obsoletos | Corregido | `package-build.mjs`, inventario y dos builds reproducibles |
| CI sin permisos explícitos | Corregido | `.github/workflows/ci.yml:3,22,42,58` |
| Documentación de APIs retiradas | Corregido | `docs:check` y `docs/MIGRATION-V1-V2.md` |
| Compatibilidad Astro 7 | Validada | peer 4–7, `compat-check.mjs`, Advanced Routing, cache y renderizado anidado |

## Riesgos descartados o acotados

### Imports dinámicos

`messagesDir` y el listado de locales son configuración de build controlada por el desarrollador, no entrada remota. No se confirmó una ruta desde URL de visitante hacia un import arbitrario. Se mantiene como límite de confianza: un consumidor no debe derivar `messagesDir` de datos remotos.

### Prototype pollution

La resolución de claves rechaza los tres segmentos peligrosos antes de acceder a objetos. Las pruebas existentes cubren el control. No se encontró escritura de propiedades controladas por claves de traducción.

### Open redirect

No se confirmó una redirección externa bajo configuración normal. Aun así, 2.2.2 valida siempre locale y `nextLocale`, incluso con una allowlist vacía, y `AutoRedirect` codifica el segmento antes de asignar `location.href`.

### Callbacks de markup

Los callbacks son código del consumidor y siguen siendo una frontera confiable. La salida final se sanitiza, pero un callback no debe usarse para ejecutar lógica privilegiada ni como sustituto de validación de URLs de negocio.

## Oportunidades posteriores a 2.2.2

### P1 — Edge SSR con aislamiento explícito

Definir adaptadores por runtime o una API para inyectar almacenamiento por solicitud. Hoy el comportamiento seguro es fallar cuando no existe `AsyncLocalStorage`; añadir soporte edge exige pruebas reales por plataforma.

### P1 — Proveniencia de release

Automatizar firma/provenance de npm y pinning por SHA de GitHub Actions después de acordar el flujo de credenciales. La publicación debe continuar separada de CI hasta esa revisión.

### P2 — Política para tarballs históricos

Los `.tgz` antiguos ya no pueden entrar al nuevo tarball por el inventario, pero siguen en Git. Decidir en una tarea separada si se eliminan o se convierten en fixtures documentados.

### P2 — Tipado de rutas y `t.raw()`

Inferir route keys, parámetros obligatorios y valores raw desde tipos literales reforzaría la propuesta type-safe. Debe diseñarse sin romper inferencia de la API 2.x.

### P2 — Validación de catálogos

Agregar una herramienta que detecte claves faltantes, sobrantes y placeholders incompatibles entre locales.

### P3 — Observabilidad

Ofrecer callbacks para claves faltantes, locales inválidos y fallback, sin imponer un proveedor de logs.
