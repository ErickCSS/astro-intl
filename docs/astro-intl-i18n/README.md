# Web oficial de astro-intl

Este proyecto genera la documentación publicada de `astro-intl`. Debe depender de una versión npm exacta y estable; nunca de `workspace:*` ni de un rango con `^`.

Estado actual: la web consume `astro-intl@2.2.2`, Astro 7.2.8 y los adaptadores de Astro 7 con versiones exactas. El despliegue sigue siendo una acción separada del build y de la publicación npm.

## Flujo de promoción

1. Implementar y validar la librería en `docs/playground`.
2. Generar el tarball candidato y ejecutar smoke tests y la matriz de compatibilidad.
3. Aprobar y publicar manualmente la nueva versión.
4. Actualizar aquí la dependencia exacta.
5. Crear un preview y aprobar el deploy por separado.

La publicación npm y el despliegue de esta web no forman parte del build normal y nunca deben modificar el `package.json` de forma temporal.

## Comandos

```sh
pnpm --filter astro-intl-i18n dev
pnpm --filter astro-intl-i18n build
pnpm --filter astro-intl-i18n preview
```
