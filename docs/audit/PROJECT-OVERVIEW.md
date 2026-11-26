# Visión general del proyecto

## Producto

`astro-intl` es una librería de internacionalización tipada para Astro. La versión 2.4.0 conserva la compatibilidad pública de la serie 2.x y el peer de Astro `^4 || ^5 || ^6 || ^7`. Ofrece adaptadores opcionales de React, Preact, Svelte, Vue y SolidJS para componentes dentro de sitios Astro multilingües.

Las capacidades vigentes incluyen carga de mensajes, namespaces, interpolación, `t.raw()`, `t.markup()`, texto enriquecido en los cinco adaptadores, middleware localizado, rutas traducidas, cambio de locale y `AutoRedirect`.

Las exportaciones de `packages/integration/package.json` son `.`, `/middleware`, `/routing`, `/react`, `/preact`, `/svelte`, `/vue`, `/solid`, `/validate` y `/components`.

## Arquitectura

- `src/index.ts` registra la integración y evita preempaquetar como código de navegador el estado SSR (`src/index.ts:74`).
- `src/store.ts` separa configuración global de estado por solicitud y usa `AsyncLocalStorage` real de Node (`src/store.ts:18-24`).
- `src/translations.ts`, `src/interpolation.ts` y `src/sanitize.ts` resuelven mensajes, interpolan y sanitizan HTML con parser y allowlist.
- `src/routing.ts` construye rutas y valida siempre los locales (`src/routing.ts:112,140`).
- `src/middleware.ts` mantiene todo el render dentro de `runWithLocale()` (`src/middleware.ts:96`).
- `src/adapters` y `src/framework-base.ts` producen rich text por framework.

Astro 7 no requiere una API nueva de la librería. El pipeline completo de `astro/fetch` ejecuta el `src/middleware.ts` existente; en una composición manual el consumidor debe incluir `middleware()` para inicializar `astro-intl`. La matriz valida Vite 8/Rolldown, el compilador Rust, renderizado en cola, cache por locale y las dos formas de Advanced Routing. Astro 7 requiere Node.js 22.23.4 o superior, pero el paquete no eleva su requisito propio para no excluir consumidores Astro 4–6.

## Estado y límites por runtime

En Node SSR, cada callback de middleware se ejecuta en un contexto `AsyncLocalStorage`; las solicitudes intercaladas no comparten locale ni mensajes. En navegador se conserva un estado cliente acotado. Un runtime SSR sin `AsyncLocalStorage` falla explícitamente en vez de reutilizar un fallback global (`src/store.ts:249,325`).

La librería no promete SSR aislado en runtimes edge no compatibles. El render estático sí funciona porque Astro ejecuta la generación en Node. Esta distinción es una garantía documentada, no un fallback silencioso.

## Fortalezas

- TypeScript estricto y declaraciones publicables.
- Tipos `DotPaths`, `ExtractParams` y `ParamsForRoute`.
- Bloqueo de `__proto__`, `constructor` y `prototype` al resolver claves.
- Routing localizado con parámetros codificados y pruebas de query/hash.
- React, Preact, Svelte, Vue y SolidJS como peers opcionales.
- Sanitización basada en parser, escape por contexto y regresiones XSS.
- Suite unitaria estable y consumidores reales desde tarball.

## Consumidores y promoción

`docs/playground` consume `workspace:*`. La web oficial de `docs/astro-intl-i18n` fija `astro-intl@2.4.0` sobre Astro 7.4.13. Su middleware usa el contexto aislado por petición.

La librería ya fue probada, empacada y publicada. La web se actualizó a la versión exacta; los pasos restantes son crear/revisar el preview y aprobar el deploy. No existe un script que reescriba destructivamente el manifiesto.

## Build y paquete

`tsconfig.build.json` excluye `src/__tests__`; Vitest solo incluye tests fuente (`vitest.config.ts:7-8`). El build limpia `dist`, copia `AutoRedirect.astro` y valida todos los exports y binarios. `pack:check` compara un inventario de 31 archivos, rechaza tests y tarballs anidados, importa cada subpath y ejecuta el validador desde una instalación temporal.
