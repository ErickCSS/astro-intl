# Playground de astro-intl

Este proyecto es el consumidor canary de la librería. Usa `astro-intl: workspace:*` para validar cambios del workspace antes de preparar un tarball o actualizar la web oficial. Actualmente corre sobre Astro 7.2.8, `@astrojs/vercel` 11.0.3 y `@astrojs/sitemap` 3.7.3.

## Uso

Desde la raíz del monorepo:

```sh
pnpm --dir docs/playground dev
pnpm --dir docs/playground build
```

El playground debe cubrir traducciones básicas, carga de mensajes, middleware, routing localizado, parámetros dinámicos, query strings, hashes, rich text y escenarios todavía no promovidos a producción. Su build valida además el compilador Rust de componentes `.astro` y Vite 8/Rolldown.

Los escenarios aislados de compatibilidad que necesitan cambiar adaptador o `src/fetch.ts` viven en `scripts/compat-check.mjs`. Ese consumidor temporal instala el `.tgz` y prueba:

- pipeline predeterminado de Astro 7;
- Advanced Routing completo con `astro(new FetchState(request))`;
- composición explícita `middleware(state, pages)`;
- caché en memoria separada para rutas inglesas y españolas;
- renderizado anidado y solicitudes SSR concurrentes por locale.

No es una copia contractual de la web pública. Puede incluir páginas y pruebas experimentales. La documentación oficial vive en `docs/astro-intl-i18n`, consume una versión npm estable exacta y solo se actualiza después de publicar y validar esa versión.
