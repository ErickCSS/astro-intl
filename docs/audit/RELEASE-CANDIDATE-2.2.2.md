# Candidato de release 2.2.2

Estado: preparado localmente, no publicado y no desplegado.

## Proveniencia

- Versión candidata: `2.2.2`
- Versión npm estable durante la preparación: `2.2.1`
- Commit base de la auditoría: `bd99cf27d8b8a5ae13ea7e3a6304bb98aa370650`
- Commit de origen final: pendiente hasta crear el commit aprobado
- Tarball versionado: no; se genera y elimina en una carpeta temporal

## Inventario esperado

El manifiesto `packages/integration/package-files.json` contiene los 27 archivos permitidos. `pack:check` rechaza cualquier test, declaración de test, fuente interna, tarball anidado, export inexistente o cambio no aprobado del inventario.

## Resultado provisional

- 158 pruebas fuente aprobadas.
- Lint y build aprobados.
- Dos builds limpios: 25 archivos idénticos por ruta y SHA-256; digest agregado `9c129c9f39cbd346117b690a17dc79c238bc24f8603b27dca89ec80fa32286e0`.
- Astro 4.16.19, 5.18.2, 6.4.8 y 7.0.9 aprobados desde el `.tgz`.
- Astro 7 aprobado con Vite 8/Rolldown, compilador Rust, Advanced Routing completo y compuesto, cache por locale y renderizado concurrente en cola. Los assets cliente no contienen `AsyncLocalStorage` ni `node:async_hooks`.
- Playground y web oficial aprobados.
- Auditoría de producción del consumidor Astro 7 sin vulnerabilidades.

## Identidad del tarball

Última ejecución local aprobada de `pack:check` después de cerrar la documentación incluida en el paquete:

- Nombre: `astro-intl-2.2.2.tgz`
- SHA-1 npm: `12c0c8753e1648cc93956c51511fdb9aa571c727`
- Integridad SHA-512: `sha512-byQScP9MBE94F1agZn7v7dUC93vFOZDEho+qaWvA42moAoT4XE1xIYQpR0YUdL8E2Z7y8ZOTqzX+Dki2JrNXAg==`
- Tamaño: 18 985 bytes
- Tamaño desempaquetado: 73 427 bytes
- Archivos: 27

El hash de un tarball generado antes del commit final sirve para revisar contenido, pero no sustituye registrar el commit/tag aprobado antes de publicar.
