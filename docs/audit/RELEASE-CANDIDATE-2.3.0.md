# Candidato 2.3.0

Estado: preparado localmente; pendiente de revisión, commit, CI, aprobación y publicación.

## Proveniencia

- Versión candidata: `2.3.0`
- Versión npm estable anterior: `2.2.2`
- Commit base de la preparación: `3708098ef539830e6f35b3e3985dbe1e2a1acec9`
- Commit de origen final: pendiente
- Tarball versionado: no; se genera y elimina en una carpeta temporal

## Superficie pública añadida

- Comando `astro-intl validate --dir <directorio> --reference <locale>`.
- Subpath `astro-intl/validate`.
- Función `validateCatalogs()` y tipos de resultados y diagnósticos.

La interfaz informa claves faltantes o sobrantes, tipos incompatibles y placeholders diferentes. No modifica los catálogos.

## Inventario esperado

El manifiesto `packages/integration/package-files.json` contiene los 31 archivos permitidos. `pack:check` rechaza cualquier test, declaración de test, fuente interna, tarball anidado, export inexistente o cambio no aprobado del inventario. También instala el tarball y ejecuta el comando de catálogos.

## Verificación del candidato

- 10 archivos y 165 pruebas fuente aprobados.
- Lint, formato, build, documentación y consumidores aprobados.
- Astro 4.16.19, 5.18.2, 6.4.8 y 7.1.4 aprobados desde el `.tgz`.
- Auditoría de producción desde severidad moderada: cero vulnerabilidades.
- Dos builds limpios reproducibles: 29 archivos idénticos por ruta y SHA-256; digest agregado `175a53764fd73e8f11be51537187ccd707197df13233f5d5514aad5fcc8bf5cf`.

## Identidad del tarball candidato

- Nombre: `astro-intl-2.3.0.tgz`
- SHA-1 npm: `e00c0b8d07da82cabe581087070425ace4f23ccd`
- Integridad SHA-512: `sha512-WE6uWldG/tRbmslx7vou5/kvu9XfV8fJAshd6gOcaopCytphPzVasytiSBvi8SEcFf62ic8sA4r9MKLTLWLYfQ==`
- Tamaño: 21 790 bytes
- Tamaño desempaquetado: 83 625 bytes
- Archivos: 31

La identidad se volverá a calcular desde el commit aprobado antes de publicar. Preparar este documento no autoriza `npm publish` ni el despliegue de la web.
