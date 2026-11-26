# Web oficial de astro-intl

Este proyecto genera la documentación publicada de `astro-intl`. Debe depender de una versión npm exacta y estable; nunca de `workspace:*` ni de un rango con `^`.

La web de la versión 2.4.0 usa `astro-intl@2.4.0` y Astro 7.4.13. El lockfile fija la integridad del mismo tarball que se publica en npm.

## Flujo de promoción

1. Implementar y validar la librería en `docs/playground`.
2. Generar el tarball candidato y ejecutar smoke tests y la matriz de compatibilidad.
3. Fijar la versión exacta en este sitio y compilarlo con el tarball de esa versión.
4. Publicar el tarball aprobado y comprobar que `dist.integrity` en npm coincide con el lockfile.
5. Instalar con `pnpm install --frozen-lockfile`, revisar el preview y desplegar la documentación.

La publicación npm y el despliegue de esta web no forman parte del build normal y nunca deben modificar el `package.json` de forma temporal.

## Comandos

```sh
pnpm --dir docs/astro-intl-i18n dev
pnpm --dir docs/astro-intl-i18n build
pnpm --dir docs/astro-intl-i18n preview
```
