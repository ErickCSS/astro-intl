# Candidato npm 2.4.0

La entrega reúne tres adaptadores nuevos (Preact, Vue y SolidJS) con los de React y Svelte. La web oficial fija `astro-intl@2.4.0` y el playground consume el workspace. Las novedades figuran en el [changelog](../../CHANGELOG.md).

## Identidad del archivo

| Dato | Valor |
| --- | --- |
| Tarball local | `dist/npm/astro-intl-2.4.0.tgz` |
| Inventario | 39 archivos según [package-files.json](../../packages/integration/package-files.json) |
| Tamaño comprimido / desempaquetado | 20 186 / 76 785 bytes |
| SHA-1 de npm | `a5892d33f71b17fe76819282f36bf5720317c2f9` |
| SHA-256 del tarball | `27456116bd70de256a2a2ea9c536563be4c09a3ce10f25a4f4cb133b8150a8d0` |
| Integridad de npm y del lockfile | `sha512-5yOwGJsxxuwH7R0AQ70jJMJkEIxJJRQk9IpL+GddZD0JhLjnQPQkTUZwlcwuRkgXw18vkyMTXCjkdSVvFdMmQA==` |

El candidato se preparó en la rama `release/2.4.0`, sobre el commit base `a3e47f4fe1847eb88df65df9ed50bc9487c2b708`. La simulación de publicación de npm usa el archivo de la tabla con acceso público.

## Comprobaciones

- Dos empaquetados limpios reprodujeron la integridad fijada. La comparación local con Node 22.23.4 y npm 10.9.9, las versiones de CI, produjo el mismo SHA-256. El flujo previo a npm también se probó con una copia independiente y una caché de pnpm vacía.
- La instalación de la web con el lockfile congelado contiene los mismos 39 archivos, byte por byte, que el tarball. El changelog de ambos sitios muestra 2.4.0 en español e inglés.
- Pasan las 171 pruebas unitarias y los 12 ejemplos de la guía de pruebas instalados desde el tarball. Ambos sitios compilan, incluidos la portada y los cinco adaptadores.
- La matriz cubre el núcleo en Astro 4.16.19, 5.18.2, 6.4.8 y 7.4.13. Las islas se prueban en Astro 7.4.13 con HTML estático, peticiones SSR concurrentes e interacción después de hidratar en español e inglés.

## Dependencia de SolidJS

SolidJS 1.9.13 pide `seroval@~1.5.0`. La instalación inicial resolvía 1.5.6 y la auditoría del workspace identificó seis avisos.

| Severidad | Avisos en seroval |
| --- | --- |
| Crítica | `GHSA-p6vx-979v-rg4c` |
| Alta | `GHSA-jp82-f5mq-hwhp`, `GHSA-97r2-qh9m-474h`, `GHSA-wp97-x4hv-qvhp`, `GHSA-7rv5-mrxv-xcr9` |
| Moderada | `GHSA-9wx9-5pv9-3349` |

El workspace, el consumidor npm de producción y los ejemplos de SolidJS fijan el serializador en 1.8.2. Las auditorías de ambos árboles registran cero vulnerabilidades conocidas. Los proyectos que instalen SolidJS 1.9.13 deben aplicar el ajuste en su propia raíz, como indica la guía pública. Se verificó la resolución con npm, pnpm 10.28.0 y Yarn Classic 1.22.22.

El orden de promoción y la comprobación de integridad posterior a npm figuran en la [guía de publicación](../../packages/integration/PUBLICACION_NPM.md).
