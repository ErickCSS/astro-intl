# Candidato npm 2.3.1

El commit de origen del paquete es `3d7c3583a9890a519ff7422668c52e098f4227ce`. El candidato fija el mínimo de `sanitize-html` en 2.18.2. El playground instala el workspace y la web oficial instala `astro-intl@2.3.0` de npm.

| Evidencia del tarball | Valor |
| --- | --- |
| Archivo | `astro-intl-2.3.1.tgz` |
| Inventario | 31 archivos según [el manifiesto del paquete](../../packages/integration/package-files.json) |
| Tamaño comprimido / desempaquetado | 18 674 / 71 134 bytes |
| SHA-1 npm | `3beae811de345c4ede14c90bdc7efd209d8b3ada` |
| Integridad SHA-512 | `sha512-dZlAW9YeAHw+87jQ4Grhx8aVC7M/7enHCpJygcNBmd9F7YDmWWg4u2cwyju8VCO8ph8rOlb03/icKeeF87PwpA==` |
| Resumen SHA-256 de dist | `431fd0662ce62f0fcaf71eeba4abc9dbdfccbe4058998c70ae9410eb6c574a95` |

Se exportaron los archivos del commit con Git y se ejecutaron dos builds limpios con Node 22.23.4 y pnpm 10.28.0. Ambos generaron los mismos 29 archivos de dist y tarballs idénticos. El resumen de dist se calcula sobre el JSON compacto de los pares ordenados de ruta relativa con barras simples y SHA-256 hexadecimal del contenido. Para repetir la comparación, usar los finales de línea LF del commit, incluido el componente AutoRedirect.

`pnpm pack:check` instaló el tarball con esa misma integridad en un consumidor temporal, comprobó los imports públicos y ejecutó la CLI con catálogos válidos e inválidos. La instalación congelada, las 165 pruebas, los dos sitios, el tutorial bilingüe y la matriz Astro 4.16.19, 5.18.2, 6.4.8 y 7.4.13 pasaron. Las auditorías del workspace y del consumidor temporal de producción devolvieron cero vulnerabilidades conocidas. El [inventario de Dependabot](./DEPENDABOT.md) contiene la comprobación de cada alerta.

Tras la fusión, regenerar el tarball desde el commit aprobado y contrastar su identidad antes de autorizar la publicación. La guía describe los pasos de [publicación y lectura de vuelta en npm](../../packages/integration/PUBLICACION_NPM.md).
