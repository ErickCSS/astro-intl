# Visión general del proyecto

## Producto

`astro-intl` es una librería de internacionalización tipada para Astro. La versión candidata es 2.2.2 y conserva la compatibilidad pública de la serie 2.x. Soporta Astro 4, 5, 6 y 7 mediante el peer `^4 || ^5 || ^6 || ^7`. Sus consumidores principales son sitios Astro multilingües; React y Svelte se soportan mediante subpaths opcionales.

Las capacidades vigentes incluyen carga de mensajes, namespaces, interpolación, `t.raw()`, `t.markup()`, rich text para React y Svelte, middleware localizado, rutas traducidas, cambio de locale y `AutoRedirect`.

La superficie publicada está declarada en `packages/integration/package.json`: `.`, `/middleware`, `/routing`, `/react`, `/svelte` y `/components`.

## Arquitectura

- `src/index.ts` registra la integración y evita preempaquetar como código de navegador el estado SSR (`src/index.ts:74`).
- `src/store.ts` separa configuración global de estado por solicitud y usa `AsyncLocalStorage` real de Node (`src/store.ts:18-24`).
- `src/translations.ts`, `src/interpolation.ts` y `src/sanitize.ts` resuelven mensajes, interpolan y sanitizan HTML con parser y allowlist.
- `src/routing.ts` construye rutas y valida siempre los locales (`src/routing.ts:112,140`).
- `src/middleware.ts` mantiene todo el render dentro de `runWithLocale()` (`src/middleware.ts:96`).
- `src/adapters` y `src/framework-base.ts` producen rich text por framework.

Astro 7 no requiere una API nueva de la librería. El pipeline completo de `astro/fetch` ejecuta el `src/middleware.ts` existente; en una composición manual el consumidor debe incluir `middleware()` para inicializar `astro-intl`. La matriz valida Vite 8/Rolldown, el compilador Rust, renderizado en cola, cache por locale y las dos formas de Advanced Routing. Astro 7 requiere Node.js 22.12.0 o superior, pero el paquete no eleva su requisito propio para no excluir consumidores Astro 4–6.

## Estado y límites por runtime

En Node SSR, cada callback de middleware se ejecuta en un contexto `AsyncLocalStorage`; las solicitudes intercaladas no comparten locale ni mensajes. En navegador se conserva un estado cliente acotado. Un runtime SSR sin `AsyncLocalStorage` falla explícitamente en vez de reutilizar un fallback global (`src/store.ts:249,325`).

La librería no promete SSR aislado en runtimes edge no compatibles. El render estático sí funciona porque Astro ejecuta la generación en Node. Esta distinción es una garantía documentada, no un fallback silencioso.

## Fortalezas

- TypeScript estricto y declaraciones publicables.
- Tipos `DotPaths`, `ExtractParams` y `ParamsForRoute`.
- Bloqueo de `__proto__`, `constructor` y `prototype` al resolver claves.
- Routing localizado con parámetros codificados y pruebas de query/hash.
- React y Svelte como peers opcionales reales.
- Sanitización basada en parser, escape por contexto y regresiones XSS.
- Suite unitaria estable y consumidores reales desde tarball.

## Consumidores y promoción

`docs/playground` es deliberadamente un canary de `workspace:*`. `docs/astro-intl-i18n` es la web oficial y usa exactamente 2.2.1 (`docs/astro-intl-i18n/package.json:17`). Su middleware envuelve el render con la API pública de contexto de 2.2.1 para que el prerender sea reproducible (`docs/astro-intl-i18n/src/middleware.ts:15`).

La promoción correcta es: implementar, probar playground, empacar, ejecutar smoke/matriz, aprobar, publicar 2.2.2, actualizar la web a la versión exacta, crear preview y aprobar deploy. No existe ya un script que reescriba destructivamente el manifiesto.

## Build y paquete

`tsconfig.build.json` excluye `src/__tests__`; Vitest solo incluye tests fuente (`vitest.config.ts:7-8`). El build limpia `dist`, copia `AutoRedirect.astro` y valida todos los exports. `pack:check` compara un inventario de 27 archivos, rechaza tests y tarballs anidados e importa cada subpath desde una instalación temporal.
