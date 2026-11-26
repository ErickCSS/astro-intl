# Publicación de astro-intl y de la documentación

## Versión 2.4.0

La web oficial fija `astro-intl@2.4.0` por versión e integridad. El playground usa `workspace:*`. La publicación del paquete precede al despliegue de la web para que los comandos de las guías funcionen al abrirlas.

El paquete mantiene su compatibilidad con Astro 4–7 e incluye cinco adaptadores opcionales para componentes dentro de Astro. La guía de SolidJS 1.9.13 incluye la configuración del serializador en el proyecto consumidor. Consulta el [registro del candidato](../../docs/audit/RELEASE-CANDIDATE-2.4.0.md) para identificar el archivo aprobado.

## Preparar y validar

Desde la raíz del repositorio, con Node.js 22.23.4 o posterior y pnpm 10.28.0, ejecuta los mismos controles que CI.

```sh
node scripts/prepare-release-install.mjs
pnpm install --frozen-lockfile
pnpm check
pnpm compat:check
pnpm audit
pnpm audit:prod
```

Si la versión exacta de la web todavía no existe en npm, el primer comando compila la integración desde el checkout y contrasta el SHA-512 del tarball con el lockfile. Después carga ese archivo en la caché de pnpm. Cuando la versión ya está en npm, la instalación congelada la obtiene del registro.

`pnpm check` verifica el inventario de distribución y ejecuta los ejemplos bilingües desde una instalación del tarball. La matriz prueba Astro 4.16.19, 5.18.2, 6.4.8 y 7.4.13. En Astro 7 también comprueba las islas con JavaScript desactivado y después de la hidratación.

## Guardar el archivo de distribución

```sh
node -e "require('node:fs').mkdirSync('dist/npm', {recursive:true})"
npm pack ./packages/integration --pack-destination dist/npm
npm publish ./dist/npm/astro-intl-2.4.0.tgz --dry-run --ignore-scripts --access public
```

Compara la integridad de la simulación con el lockfile y el registro del candidato. Después de fusionar los cambios, repite la comprobación desde el commit de entrega. Si cambian los bytes, vuelve a validar el candidato y actualiza su integridad antes de publicarlo.

## Publicar y desplegar

1. Con la aprobación de publicación, ejecuta `npm publish ./dist/npm/astro-intl-2.4.0.tgz --ignore-scripts --access public` desde la raíz.
2. Comprueba `npm view astro-intl@2.4.0 dist.integrity` y contrasta el resultado con el SHA-512 registrado.
3. Compila la web con `pnpm install --frozen-lockfile` y `pnpm --dir docs/astro-intl-i18n build`. Revisa el changelog en español e inglés, las cinco guías y la página de pruebas en el preview. Despliega el sitio con la aprobación de producción.
