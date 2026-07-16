# Release 2.2.2

Estado: publicado en npm; promoción local de la web oficial completada; despliegue web pendiente.

## Proveniencia

- Versión publicada: `2.2.2`
- Versión npm estable anterior: `2.2.1`
- Commit base de la auditoría: `bd99cf27d8b8a5ae13ea7e3a6304bb98aa370650`
- Commit de origen final: `b3d036a454b516300ba7e4e31d034c21cc89290d`
- Tarball versionado: no; se genera y elimina en una carpeta temporal

## Inventario esperado

El manifiesto `packages/integration/package-files.json` contiene los 27 archivos permitidos. `pack:check` rechaza cualquier test, declaración de test, fuente interna, tarball anidado, export inexistente o cambio no aprobado del inventario.

## Resultado final

- 158 pruebas fuente aprobadas.
- Lint y build aprobados.
- Dos builds limpios: 25 archivos idénticos por ruta y SHA-256; digest agregado `9c129c9f39cbd346117b690a17dc79c238bc24f8603b27dca89ec80fa32286e0`.
- Astro 4.16.19, 5.18.2, 6.4.8 y 7.0.9 aprobados desde el `.tgz`.
- Astro 7 aprobado con Vite 8/Rolldown, compilador Rust, Advanced Routing completo y compuesto, cache por locale y renderizado concurrente en cola. Los assets cliente no contienen `AsyncLocalStorage` ni `node:async_hooks`.
- Playground y web oficial aprobados.
- Auditoría de producción del consumidor Astro 7 sin vulnerabilidades.

## Identidad final verificada

La ejecución final de `pack:check` reproduce exactamente la identidad publicada en npm:

- Nombre: `astro-intl-2.2.2.tgz`
- SHA-1 npm: `e90812560b6c2dfcb2fc7969f171323fb32236bd`
- Integridad SHA-512: `sha512-Ykr+2ydLNfbLXApln0T9h7ABCtMUjNU75xVS5w+jMNQ7OsnpBYkpyUdXB+wQsI/IRfJ6XYDzpT17mtnhwy47Jg==`
- Tamaño: 18 951 bytes
- Tamaño desempaquetado: 73 621 bytes
- Archivos: 27
- Fecha: `2026-07-16T00:06:43.197Z` (`2026-07-15` en America/La_Paz)
- `gitHead`: `b3d036a454b516300ba7e4e31d034c21cc89290d`
