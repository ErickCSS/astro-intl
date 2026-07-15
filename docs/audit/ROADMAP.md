# Roadmap

## Completado para el candidato 2.2.2

- Aislamiento SSR con `AsyncLocalStorage` y fallo explícito fuera de runtimes seguros.
- Sanitización por parser para markup y rich text Svelte.
- Validación uniforme de locales, redirects y rutas.
- Escape seguro de JSON-LD y renderer limitado para changelog.
- Build limpio, tests fuente únicos, inventario de paquete y smoke tests desde `.tgz`.
- Matriz Astro 4, 5, 6 y 7 con estático, SSR, middleware, routing, React y Svelte.
- Astro 7 con Vite 8/Rolldown, compilador Rust, renderizado en cola, Advanced Routing completo/compuesto y cache por locale.
- Playground canary, web oficial exacta y eliminación del mutador de deploy.
- Documentación actual, guía v1→v2, CI de mínimos privilegios y auditoría de dependencias.

## Antes de publicar 2.2.2

1. Revisar el diff completo y el inventario final del tarball.
2. Confirmar hash, integridad y commit de origen en [Candidato 2.2.2](./RELEASE-CANDIDATE-2.2.2.md).
3. Revisar [Seguridad](./SECURITY.md) y el changelog.
4. Crear el commit/tag aprobado.
5. Ejecutar nuevamente `pnpm check`, la matriz y `pnpm audit:prod` desde ese commit.
6. Publicar únicamente con aprobación explícita.

## Después de publicar

1. Verificar la metadata y el contenido de npm contra el candidato aprobado.
2. Cambiar la web oficial de 2.2.1 a 2.2.2 exacta.
3. Crear preview y ejecutar su build.
4. Aprobar el deploy como acción separada.

## Mediano plazo

- Diseñar aislamiento para runtimes edge específicos.
- Añadir provenance y pinning por SHA a la cadena de release.
- Resolver la política de tarballs históricos.
- Validar catálogos y mejorar tipado de rutas sin breaking changes.

## Fuera de esta fase

No se publicará npm, no se desplegará la web, no se eliminan APIs vigentes y no se añaden funcionalidades de producto ajenas al saneamiento.
