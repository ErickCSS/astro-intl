# Roadmap

## Completado para 2.2.2

- Aislamiento SSR con `AsyncLocalStorage` y fallo explícito fuera de runtimes seguros.
- Sanitización por parser para markup y rich text Svelte.
- Validación uniforme de locales, redirects y rutas.
- Escape seguro de JSON-LD y renderer limitado para changelog.
- Build limpio, tests fuente únicos, inventario de paquete y smoke tests desde `.tgz`.
- Matriz Astro 4, 5, 6 y 7 con estático, SSR, middleware, routing, React y Svelte.
- Astro 7 con Vite 8/Rolldown, compilador Rust, renderizado en cola, Advanced Routing completo/compuesto y cache por locale.
- Playground canary, web oficial exacta y eliminación del mutador de deploy.
- Documentación actual, guía v1→v2, CI de mínimos privilegios y auditoría de dependencias.

## Publicación completada

- npm expone `astro-intl@2.2.2` desde el commit aprobado `b3d036a454b516300ba7e4e31d034c21cc89290d`.
- La metadata, integridad y contenido del paquete se leen de vuelta desde npm.
- La web oficial consume 2.2.2 exacta sobre Astro 7.0.9.
- El changelog y las guías públicas documentan compatibilidad, requisitos y hardening de 2.2.2.

## Despliegue de documentación

1. Crear un preview desde los cambios aprobados.
2. Revisar rutas, idioma, changelog, consola y presentación responsive.
3. Aprobar el deploy de producción como acción separada.

## Mediano plazo

- Diseñar aislamiento para runtimes edge específicos.
- Añadir provenance y pinning por SHA a la cadena de release.
- Resolver la política de tarballs históricos.
- Validar catálogos y mejorar tipado de rutas sin breaking changes.

## Fuera de este cambio

No se despliega la web de producción sin la aprobación correspondiente, no se eliminan APIs vigentes y no se añaden funcionalidades de producto ajenas al saneamiento.
