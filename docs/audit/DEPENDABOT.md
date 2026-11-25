# Alertas de Dependabot · 24 de noviembre de 2026

GitHub devolvió 85 alertas abiertas de npm para `ErickCSS/astro-intl`: 1 crítica, 37 altas, 37 medias y 10 bajas. Corresponden a 67 avisos GHSA y 21 paquetes. Un mismo aviso puede aparecer en varios manifiestos o ramas de versiones. [Panel de Dependabot](https://github.com/ErickCSS/astro-intl/security/dependabot)

## Evidencia del inventario

| Estado | Objeto Git de `pnpm-lock.yaml` | Alertas con al menos una versión afectada |
| --- | --- | ---: |
| `main` en `a2ca42b96f2d9b01c886519c6c878269b8009de7` | `b4957c71c3e1dd4d4e3298a911d3993094cce82f` | 85 |
| Copia local con la web en 2.3.0 antes del lote | `4cc854cf47c1a8b3dc79c98ee930b3a0b1acfc2b` | 85 |
| Copia local tras el primer lote | `b9b3dd32bb81f54e99e6f7bbf1736b62fdb7a9f4` | 71 |
| Candidato 2.3.1 | `6d517be8ec8688788ff56705388cc52c1613ecf8` | 0 |

Se compararon los rangos semánticos de GitHub con todas las versiones resueltas en los snapshots de pnpm. Para atribuir el uso se siguieron las dependencias y los enlaces opcionales desde los importadores del workspace. Los contextos indican dónde se instala la dependencia. La exposición efectiva puede depender de la configuración, la plataforma o las entradas procesadas. El consumidor temporal de `pnpm audit:prod` resuelve su propio árbol con npm y tiene un alcance distinto.

## Primer lote y prioridades iniciales

- **tar**. El adaptador de Vercel usa `@vercel/nft → @mapbox/node-pre-gyp → tar` para herramientas de compilación y empaquetado. El rango del padre admite `7.5.21`. El lockfile pasa de `7.5.13` a `7.5.21` y elimina seis coincidencias, incluida la crítica #97.
- **sanitize-html**. La integración importa el sanitizador para el HTML de traducciones. El mínimo declarado sube a `^2.18.0`. Tanto el workspace como la web que instala `astro-intl@2.3.0` resuelven `2.18.0`, fuera de los tres rangos. Los consumidores externos con lockfiles anteriores pueden conservar la versión vulnerable. Una futura publicación de astro-intl distribuiría el nuevo mínimo.
- **Efecto transitivo**. El sanitizador incorpora `postcss@8.5.33` con `nanoid@3.3.20`. Desaparecen las coincidencias #84, #102, #106, #113 y #119. Vite conserva `postcss@8.5.19` con `nanoid@3.3.16`, por lo que #111 y #115 siguen pendientes.
- Después de integrar el cambio en la rama predeterminada, consultar otra vez los números originales en Dependabot. La columna local refleja el árbol de este checkout. La publicación npm y el despliegue de la documentación son hitos separados.

| Siguiente lote propuesto | Paquetes | Alertas aún aplicables | Verificación prioritaria |
| --- | --- | ---: | --- |
| 1 · Astro y datos | `astro`, `zod`, `devalue`, `undici`, `smol-toml`, `svgo`, `defu` | 37 | Actualizar primero el conjunto de Astro y sus adaptadores. Comprobar serialización, SSR, procesamiento de contenido y las rutas de la web. |
| 2 · Compilación y CSS | `vite`, `source-map-js`, `postcss`, `nanoid`, `js-yaml`, `brace-expansion` | 23 | Revisar las copias que conservan Vite, Tailwind, los analizadores y minimatch. Para brace-expansion elegir el parche de cada rama mayor. |
| 3 · Pruebas y lint | `happy-dom`, `ws`, `vitest`, `@vitest/mocker`, `fflate`, `@humanfs/node` | 11 | Actualizar Vitest con sus paquetes internos y revisar el salto mayor de happy-dom. Comprobar el entorno DOM y las herramientas que ejecuta CI. |

## Verificación del primer lote

- `pnpm install --frozen-lockfile` completó la instalación. El paquete publicado de la web y la integración del workspace cargaron `sanitize-html@2.18.0`. El playground resolvió el workspace. La copia de `tar@7.5.21` que carga `@mapbox/node-pre-gyp` creó y enumeró un archivo de prueba.
- `pnpm check` pasó con 165 pruebas, incluidas las de saneamiento de HTML, un tarball de 31 archivos, los builds de la web y el playground, el tutorial en desarrollo y estático, y 2 040 enlaces internos y anclas.
- `pnpm compat:check` pasó con Astro 4.16.19, 5.18.2, 6.4.8 y 7.2.8 en consumidores temporales del tarball local. Cubrió renderizado estático y SSR, rutas, middleware y adaptadores de React y Svelte.
- `pnpm audit:prod` devolvió código 1. npm agrupó cuatro avisos en un resultado de gravedad moderada para el consumidor de prueba que fija Astro 7.2.8. Son los mismos cuatro GHSA de las filas de Astro. El primer parche que cubre los cuatro rangos registrados es 7.4.7. Este control sigue pendiente del siguiente lote.
- De las 85 alertas originales, el árbol local conserva 31 altas, 30 medias y 10 bajas. Las 14 sin coincidencia incluyen la única crítica.

## Rutas y consumidores antes del lote

**Web** instala el paquete publicado. **Playground** usa la integración local. **Librería** indica dependencias declaradas por la integración que también recibe el playground mediante `workspace:*`. **Desarrollo** incluye desarrollo de la integración, pruebas y lint. La tabla incluye dependencias directas y padres inmediatos de cada copia afectada, incluidos los pares resueltos por pnpm.

Vitest usa `happy-dom` como entorno DOM de pruebas, que a su vez instala `ws`. `@vitest/mocker` y `@vitest/ui → fflate` pertenecen al mismo entorno de pruebas. ESLint usa `@humanfs/node` durante el lint. En la web y el playground, Vite y PostCSS participan en la compilación. La otra ruta a PostCSS pasa por el sanitizador de la librería y también puede ejecutarse al renderizar traducciones.

| Paquete y versión | Consumidores | Padres inmediatos o declaración directa |
| --- | --- | --- |
| `@humanfs/node@0.16.7` | Desarrollo | `eslint@9.39.4` |
| `@vitest/mocker@4.1.2` | Desarrollo | `vitest@4.1.2` |
| `astro@7.2.8` | Web, Playground, Desarrollo | Directa en web, playground y desarrollo, `@astrojs/vercel@11.0.3`, `astro-intl@2.3.0` |
| `brace-expansion@1.1.13` | Desarrollo | `minimatch@3.1.5` |
| `brace-expansion@5.0.5` | Web, Playground, Desarrollo | `minimatch@10.2.5` |
| `defu@6.1.4` | Web, Playground, Desarrollo | `h3@1.15.10` |
| `devalue@5.8.1` | Web, Playground, Desarrollo | `astro@7.2.8`, `svelte@5.56.5` |
| `fflate@0.8.2` | Desarrollo | `@vitest/ui@4.1.2` |
| `happy-dom@20.8.9` | Desarrollo | Directa en las pruebas, `vitest@4.1.2` |
| `js-yaml@4.1.1` | Web, Playground, Desarrollo | `@astrojs/internal-helpers@0.10.1`, `@eslint/eslintrc@3.3.5` |
| `nanoid@3.3.11` | Web, Librería, Playground | `postcss@8.5.8` |
| `nanoid@3.3.16` | Web, Playground, Desarrollo | `postcss@8.5.19` |
| `postcss@8.5.19` | Web, Playground, Desarrollo | `vite@8.1.4` |
| `postcss@8.5.8` | Web, Librería, Playground | `sanitize-html@2.17.6` |
| `sanitize-html@2.17.6` | Web, Librería, Playground | Directa en la librería, `astro-intl@2.3.0` |
| `smol-toml@1.6.1` | Web, Playground, Desarrollo | `@astrojs/internal-helpers@0.10.1`, `@astrojs/internal-helpers@0.10.4`, `astro@7.2.8` |
| `source-map-js@1.2.1` | Web, Playground, Librería, Desarrollo | `@tailwindcss/node@4.2.2`, `css-tree@2.2.1`, `css-tree@3.2.1`, `magicast@0.5.2`, `postcss@8.5.19`, `postcss@8.5.8` |
| `svgo@4.0.1` | Web, Playground, Desarrollo | `astro@7.2.8` |
| `tar@7.5.13` | Web, Playground | `@mapbox/node-pre-gyp@2.0.3` |
| `undici@8.11.0` | Web, Playground, Desarrollo | `unifont@0.7.5` |
| `vite@8.1.4` | Web, Playground, Desarrollo | `@tailwindcss/vite@4.2.2`, `@vitest/mocker@4.1.2`, `astro@7.2.8`, `vitefu@1.1.2`, `vitest@4.1.2` |
| `vitest@4.1.2` | Desarrollo | Directa en las pruebas, `@vitest/ui@4.1.2` |
| `ws@8.20.0` | Desarrollo | `happy-dom@20.8.9` |
| `zod@4.3.6` | Web, Playground, Desarrollo | `@astrojs/sitemap@3.7.3`, `astro@7.2.8` |

## Resultado del candidato 2.3.1

Los 85 números consultados en GitHub coincidieron con el inventario original. La comparación semántica con todas las versiones del lockfile encontró cero coincidencias tras los tres grupos de cambios. La columna del primer lote conserva el historial. El cierre en GitHub se comprueba después de integrar en main.

La auditoría completa de pnpm detectó también cuatro avisos adicionales durante la actualización. Se corrigieron dentro de esta rama y la auditoría del workspace terminó con cero vulnerabilidades conocidas.

| Aviso adicional | Paquete | Resolución del candidato |
| --- | --- | --- |
| [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) | sharp | 0.35.5 en Astro |
| [GHSA-c9rx-x947-fp3h](https://github.com/advisories/GHSA-c9rx-x947-fp3h) | sanitize-html | 2.18.2 en la integración y en la web |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | glob | 14.0.6 mediante el adaptador de Vercel |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | minimatch | 11.0.9 para las rutas afectadas; 3.1.5 queda fuera del rango |

## Detalle por alerta

**Manifiesto** identifica el archivo señalado por GitHub: **Lock** = `pnpm-lock.yaml`, **Web** = `docs/astro-intl-i18n/package.json`, **Playground** = `docs/playground/package.json`, **Integración** = `packages/integration/package.json`. Las versiones de la columna «Antes» aplican tanto a la base como al checkout previo. La tabla anterior relaciona cada versión con sus padres y consumidores. «Sin coincidencia» indica que ninguna copia del paquete cae ya en ese rango. El primer parche es el que declara el aviso para el rango de esa fila.

| Alerta | Paquete | Aviso GHSA / CVE | Gravedad | Manifiesto | Antes | Rango afectado | Primer parche | Tras el primer lote | En 2.3.1 |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [#184](https://github.com/ErickCSS/astro-intl/security/dependabot/184) | `astro` | [GHSA-mh32-jxcr-mh9f](https://github.com/advisories/GHSA-mh32-jxcr-mh9f) / CVE-2026-126361 | Baja | Playground | 7.2.8 | `<= 7.4.4` | 7.4.5 | 7.2.8 | Sin coincidencia |
| [#183](https://github.com/ErickCSS/astro-intl/security/dependabot/183) | `astro` | [GHSA-mh32-jxcr-mh9f](https://github.com/advisories/GHSA-mh32-jxcr-mh9f) / CVE-2026-126361 | Baja | Lock | 7.2.8 | `<= 7.4.4` | 7.4.5 | 7.2.8 | Sin coincidencia |
| [#182](https://github.com/ErickCSS/astro-intl/security/dependabot/182) | `astro` | [GHSA-mh32-jxcr-mh9f](https://github.com/advisories/GHSA-mh32-jxcr-mh9f) / CVE-2026-126361 | Baja | Integración | 7.2.8 | `<= 7.4.4` | 7.4.5 | 7.2.8 | Sin coincidencia |
| [#181](https://github.com/ErickCSS/astro-intl/security/dependabot/181) | `astro` | [GHSA-mh32-jxcr-mh9f](https://github.com/advisories/GHSA-mh32-jxcr-mh9f) / CVE-2026-126361 | Baja | Web | 7.2.8 | `<= 7.4.4` | 7.4.5 | 7.2.8 | Sin coincidencia |
| [#180](https://github.com/ErickCSS/astro-intl/security/dependabot/180) | `astro` | [GHSA-r3h5-4585-7x3w](https://github.com/advisories/GHSA-r3h5-4585-7x3w) / CVE-2026-126364 | Media | Playground | 7.2.8 | `>= 5.14.3, <= 7.4.6` | 7.4.7 | 7.2.8 | Sin coincidencia |
| [#179](https://github.com/ErickCSS/astro-intl/security/dependabot/179) | `astro` | [GHSA-r3h5-4585-7x3w](https://github.com/advisories/GHSA-r3h5-4585-7x3w) / CVE-2026-126364 | Media | Lock | 7.2.8 | `>= 5.14.3, <= 7.4.6` | 7.4.7 | 7.2.8 | Sin coincidencia |
| [#178](https://github.com/ErickCSS/astro-intl/security/dependabot/178) | `astro` | [GHSA-r3h5-4585-7x3w](https://github.com/advisories/GHSA-r3h5-4585-7x3w) / CVE-2026-126364 | Media | Integración | 7.2.8 | `>= 5.14.3, <= 7.4.6` | 7.4.7 | 7.2.8 | Sin coincidencia |
| [#177](https://github.com/ErickCSS/astro-intl/security/dependabot/177) | `astro` | [GHSA-r3h5-4585-7x3w](https://github.com/advisories/GHSA-r3h5-4585-7x3w) / CVE-2026-126364 | Media | Web | 7.2.8 | `>= 5.14.3, <= 7.4.6` | 7.4.7 | 7.2.8 | Sin coincidencia |
| [#175](https://github.com/ErickCSS/astro-intl/security/dependabot/175) | `happy-dom` | [GHSA-5fpq-26gf-qwcr](https://github.com/advisories/GHSA-5fpq-26gf-qwcr) / CVE-2026-118661 | Media | Lock | 20.8.9 | `<= 20.14.5` | 20.14.6 | 20.8.9 | Sin coincidencia |
| [#174](https://github.com/ErickCSS/astro-intl/security/dependabot/174) | `happy-dom` | [GHSA-c8p4-j97h-3vg8](https://github.com/advisories/GHSA-c8p4-j97h-3vg8) / CVE-2026-118660 | Alta | Lock | 20.8.9 | `<= 20.14.6` | 21.0.0 | 20.8.9 | Sin coincidencia |
| [#173](https://github.com/ErickCSS/astro-intl/security/dependabot/173) | `zod` | [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) / CVE-2023-54404 | Alta | Lock | 4.3.6 | `< 4.6.6` | 4.6.6 | 4.3.6 | Sin coincidencia |
| [#172](https://github.com/ErickCSS/astro-intl/security/dependabot/172) | `undici` | [GHSA-qrxm-fqhp-jwvm](https://github.com/advisories/GHSA-qrxm-fqhp-jwvm) / CVE-2026-87018 | Alta | Lock | 8.11.0 | `>= 8.0.0, < 8.12.2` | 8.12.2 | 8.11.0 | Sin coincidencia |
| [#171](https://github.com/ErickCSS/astro-intl/security/dependabot/171) | `undici` | [GHSA-9fm3-97px-rjf6](https://github.com/advisories/GHSA-9fm3-97px-rjf6) / CVE-2026-109932 | Media | Lock | 8.11.0 | `>= 8.0.0, < 8.12.2` | 8.12.2 | 8.11.0 | Sin coincidencia |
| [#170](https://github.com/ErickCSS/astro-intl/security/dependabot/170) | `undici` | [GHSA-55wc-3pg8-jfw6](https://github.com/advisories/GHSA-55wc-3pg8-jfw6) / CVE-2026-87029 | Media | Lock | 8.11.0 | `>= 8.0.0, < 8.12.2` | 8.12.2 | 8.11.0 | Sin coincidencia |
| [#169](https://github.com/ErickCSS/astro-intl/security/dependabot/169) | `undici` | [GHSA-2m5v-pch6-74hx](https://github.com/advisories/GHSA-2m5v-pch6-74hx) / CVE-2026-109383 | Alta | Lock | 8.11.0 | `>= 8.0.0, < 8.12.2` | 8.12.2 | 8.11.0 | Sin coincidencia |
| [#168](https://github.com/ErickCSS/astro-intl/security/dependabot/168) | `undici` | [GHSA-qq8j-7v2v-3rwp](https://github.com/advisories/GHSA-qq8j-7v2v-3rwp) / CVE-2026-109855 | Alta | Lock | 8.11.0 | `>= 8.11.0, < 8.11.2` | 8.11.2 | 8.11.0 | Sin coincidencia |
| [#167](https://github.com/ErickCSS/astro-intl/security/dependabot/167) | `undici` | [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) / CVE-2026-109869 | Alta | Lock | 8.11.0 | `>= 8.0.0, < 8.12.2` | 8.12.2 | 8.11.0 | Sin coincidencia |
| [#166](https://github.com/ErickCSS/astro-intl/security/dependabot/166) | `undici` | [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) / CVE-2026-109924 | Media | Lock | 8.11.0 | `>= 8.0.0, < 8.12.2` | 8.12.2 | 8.11.0 | Sin coincidencia |
| [#165](https://github.com/ErickCSS/astro-intl/security/dependabot/165) | `happy-dom` | [GHSA-834v-8h66-3h79](https://github.com/advisories/GHSA-834v-8h66-3h79) / CVE-2026-115895 | Alta | Lock | 20.8.9 | `>= 17.0.0, <= 21.0.3` | 21.0.4 | 20.8.9 | Sin coincidencia |
| [#164](https://github.com/ErickCSS/astro-intl/security/dependabot/164) | `happy-dom` | [GHSA-834v-8h66-3h79](https://github.com/advisories/GHSA-834v-8h66-3h79) / CVE-2026-115895 | Alta | Integración | 20.8.9 | `>= 17.0.0, <= 21.0.3` | 21.0.4 | 20.8.9 | Sin coincidencia |
| [#163](https://github.com/ErickCSS/astro-intl/security/dependabot/163) | `astro` | [GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8) / CVE-2026-114128 | Media | Playground | 7.2.8 | `< 7.3.2` | 7.3.2 | 7.2.8 | Sin coincidencia |
| [#162](https://github.com/ErickCSS/astro-intl/security/dependabot/162) | `astro` | [GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8) / CVE-2026-114128 | Media | Lock | 7.2.8 | `< 7.3.2` | 7.3.2 | 7.2.8 | Sin coincidencia |
| [#161](https://github.com/ErickCSS/astro-intl/security/dependabot/161) | `astro` | [GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8) / CVE-2026-114128 | Media | Integración | 7.2.8 | `< 7.3.2` | 7.3.2 | 7.2.8 | Sin coincidencia |
| [#160](https://github.com/ErickCSS/astro-intl/security/dependabot/160) | `astro` | [GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8) / CVE-2026-114128 | Media | Web | 7.2.8 | `< 7.3.2` | 7.3.2 | 7.2.8 | Sin coincidencia |
| [#159](https://github.com/ErickCSS/astro-intl/security/dependabot/159) | `astro` | [GHSA-mpr7-6m5w-76rw](https://github.com/advisories/GHSA-mpr7-6m5w-76rw) / CVE-2026-114127 | Baja | Playground | 7.2.8 | `>= 7.1.0, <= 7.3.2` | 7.3.3 | 7.2.8 | Sin coincidencia |
| [#158](https://github.com/ErickCSS/astro-intl/security/dependabot/158) | `astro` | [GHSA-mpr7-6m5w-76rw](https://github.com/advisories/GHSA-mpr7-6m5w-76rw) / CVE-2026-114127 | Baja | Lock | 7.2.8 | `>= 7.1.0, <= 7.3.2` | 7.3.3 | 7.2.8 | Sin coincidencia |
| [#157](https://github.com/ErickCSS/astro-intl/security/dependabot/157) | `astro` | [GHSA-mpr7-6m5w-76rw](https://github.com/advisories/GHSA-mpr7-6m5w-76rw) / CVE-2026-114127 | Baja | Integración | 7.2.8 | `>= 7.1.0, <= 7.3.2` | 7.3.3 | 7.2.8 | Sin coincidencia |
| [#156](https://github.com/ErickCSS/astro-intl/security/dependabot/156) | `astro` | [GHSA-mpr7-6m5w-76rw](https://github.com/advisories/GHSA-mpr7-6m5w-76rw) / CVE-2026-114127 | Baja | Web | 7.2.8 | `>= 7.1.0, <= 7.3.2` | 7.3.3 | 7.2.8 | Sin coincidencia |
| [#155](https://github.com/ErickCSS/astro-intl/security/dependabot/155) | `@vitest/mocker` | [GHSA-qxg6-89mg-rqv8](https://github.com/advisories/GHSA-qxg6-89mg-rqv8) / CVE-2026-112949 | Media | Lock | 4.1.2 | `>= 2.1.0-beta.7, < 4.1.12` | 4.1.12 | 4.1.2 | Sin coincidencia |
| [#154](https://github.com/ErickCSS/astro-intl/security/dependabot/154) | `vite` | [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) / CVE-2026-112945 | Baja | Lock | 8.1.4 | `>= 8.0.0, <= 8.1.5` | 8.1.6 | 8.1.4 | Sin coincidencia |
| [#153](https://github.com/ErickCSS/astro-intl/security/dependabot/153) | `vite` | [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) / CVE-2026-112946 | Media | Lock | 8.1.4 | `>= 8.0.0, <= 8.1.5` | 8.1.6 | 8.1.4 | Sin coincidencia |
| [#152](https://github.com/ErickCSS/astro-intl/security/dependabot/152) | `vite` | [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) / CVE-2026-112944 | Media | Lock | 8.1.4 | `>= 8.0.0, <= 8.1.5` | 8.1.6 | 8.1.4 | Sin coincidencia |
| [#151](https://github.com/ErickCSS/astro-intl/security/dependabot/151) | `vite` | [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) / CVE-2026-112942 | Alta | Lock | 8.1.4 | `>= 8.0.0, <= 8.1.5` | 8.1.6 | 8.1.4 | Sin coincidencia |
| [#150](https://github.com/ErickCSS/astro-intl/security/dependabot/150) | `vite` | [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) / CVE-2026-112943 | Media | Lock | 8.1.4 | `>= 8.0.0, <= 8.1.5` | 8.1.6 | 8.1.4 | Sin coincidencia |
| [#149](https://github.com/ErickCSS/astro-intl/security/dependabot/149) | `sanitize-html` | [GHSA-cv27-6wvh-8x7j](https://github.com/advisories/GHSA-cv27-6wvh-8x7j) / CVE-2026-113661 | Media | Lock | 2.17.6 | `< 2.18.0` | 2.18.0 | Sin coincidencia | Sin coincidencia |
| [#148](https://github.com/ErickCSS/astro-intl/security/dependabot/148) | `sanitize-html` | [GHSA-x3q4-9hxx-gx8m](https://github.com/advisories/GHSA-x3q4-9hxx-gx8m) / CVE-2026-113654 | Media | Lock | 2.17.6 | `< 2.18.0` | 2.18.0 | Sin coincidencia | Sin coincidencia |
| [#147](https://github.com/ErickCSS/astro-intl/security/dependabot/147) | `devalue` | [GHSA-r9w8-h9r3-54w4](https://github.com/advisories/GHSA-r9w8-h9r3-54w4) | Alta | Lock | 5.8.1 | `<= 5.9.2` | 5.9.3 | 5.8.1 | Sin coincidencia |
| [#146](https://github.com/ErickCSS/astro-intl/security/dependabot/146) | `source-map-js` | [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) / CVE-2026-93749 | Alta | Lock | 1.2.1 | `>= 1.0.0, < 1.2.2` | 1.2.2 | 1.2.1 | Sin coincidencia |
| [#145](https://github.com/ErickCSS/astro-intl/security/dependabot/145) | `brace-expansion` | [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) / CVE-2026-102277 | Media | Lock | 1.1.13 | `< 1.1.21` | 1.1.21 | 1.1.13 | Sin coincidencia |
| [#144](https://github.com/ErickCSS/astro-intl/security/dependabot/144) | `devalue` | [GHSA-hx4r-w6wj-j8fg](https://github.com/advisories/GHSA-hx4r-w6wj-j8fg) | Media | Lock | 5.8.1 | `<= 5.9.2` | 5.9.3 | 5.8.1 | Sin coincidencia |
| [#143](https://github.com/ErickCSS/astro-intl/security/dependabot/143) | `devalue` | [GHSA-wf3x-273g-mvxv](https://github.com/advisories/GHSA-wf3x-273g-mvxv) | Baja | Lock | 5.8.1 | `>= 1.0.0, <= 5.9.2` | 5.9.3 | 5.8.1 | Sin coincidencia |
| [#142](https://github.com/ErickCSS/astro-intl/security/dependabot/142) | `devalue` | [GHSA-mcm9-63f2-9j32](https://github.com/advisories/GHSA-mcm9-63f2-9j32) | Alta | Lock | 5.8.1 | `<= 5.9.2` | 5.9.3 | 5.8.1 | Sin coincidencia |
| [#141](https://github.com/ErickCSS/astro-intl/security/dependabot/141) | `devalue` | [GHSA-4q55-j62x-fr9h](https://github.com/advisories/GHSA-4q55-j62x-fr9h) | Media | Lock | 5.8.1 | `<= 5.9.2` | 5.9.3 | 5.8.1 | Sin coincidencia |
| [#140](https://github.com/ErickCSS/astro-intl/security/dependabot/140) | `devalue` | [GHSA-j22f-vq7h-c4qm](https://github.com/advisories/GHSA-j22f-vq7h-c4qm) / CVE-2026-92708 | Alta | Lock | 5.8.1 | `>= 5.1.0, <= 5.9.2` | 5.9.3 | 5.8.1 | Sin coincidencia |
| [#139](https://github.com/ErickCSS/astro-intl/security/dependabot/139) | `devalue` | [GHSA-x5rw-q4pp-hg5g](https://github.com/advisories/GHSA-x5rw-q4pp-hg5g) | Alta | Lock | 5.8.1 | `>= 5.8.0, <= 5.9.2` | 5.9.3 | 5.8.1 | Sin coincidencia |
| [#138](https://github.com/ErickCSS/astro-intl/security/dependabot/138) | `brace-expansion` | [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) / CVE-2026-102277 | Media | Lock | 5.0.5 | `>= 4.0.0, < 5.0.12` | 5.0.12 | 5.0.5 | Sin coincidencia |
| [#137](https://github.com/ErickCSS/astro-intl/security/dependabot/137) | `brace-expansion` | [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) / CVE-2026-102278 | Alta | Lock | 5.0.5 | `>= 4.0.0, < 5.0.11` | 5.0.11 | 5.0.5 | Sin coincidencia |
| [#136](https://github.com/ErickCSS/astro-intl/security/dependabot/136) | `brace-expansion` | [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) / CVE-2026-102276 | Alta | Lock | 5.0.5 | `>= 4.0.0, < 5.0.10` | 5.0.10 | 5.0.5 | Sin coincidencia |
| [#135](https://github.com/ErickCSS/astro-intl/security/dependabot/135) | `devalue` | [GHSA-9rgm-9g3h-6x36](https://github.com/advisories/GHSA-9rgm-9g3h-6x36) / CVE-2026-81176 | Media | Lock | 5.8.1 | `< 5.9.1` | 5.9.2 | 5.8.1 | Sin coincidencia |
| [#134](https://github.com/ErickCSS/astro-intl/security/dependabot/134) | `js-yaml` | [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh) / CVE-2026-84375 | Alta | Lock | 4.1.1 | `>= 4.0.0, < 4.3.2` | 4.3.2 | 4.1.1 | Sin coincidencia |
| [#132](https://github.com/ErickCSS/astro-intl/security/dependabot/132) | `smol-toml` | [GHSA-7w5x-hrqm-74c2](https://github.com/advisories/GHSA-7w5x-hrqm-74c2) / CVE-2026-85730 | Alta | Lock | 1.6.1 | `<= 1.7.0` | 1.7.1 | 1.6.1 | Sin coincidencia |
| [#131](https://github.com/ErickCSS/astro-intl/security/dependabot/131) | `vitest` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) / CVE-2026-84373 | Media | Lock | 4.1.2 | `>= 2.1.0, < 4.1.11` | 4.1.11 | 4.1.2 | Sin coincidencia |
| [#122](https://github.com/ErickCSS/astro-intl/security/dependabot/122) | `@vitest/mocker` | [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9) / CVE-2026-84373 | Media | Lock | 4.1.2 | `>= 2.1.0, < 4.1.11` | 4.1.11 | 4.1.2 | Sin coincidencia |
| [#121](https://github.com/ErickCSS/astro-intl/security/dependabot/121) | `svgo` | [GHSA-w27v-7q3p-w38r](https://github.com/advisories/GHSA-w27v-7q3p-w38r) / CVE-2026-84370 | Alta | Lock | 4.0.1 | `>= 4.0.0, < 4.1.0` | 4.1.0 | 4.0.1 | Sin coincidencia |
| [#120](https://github.com/ErickCSS/astro-intl/security/dependabot/120) | `svgo` | [GHSA-4vpr-x523-8j87](https://github.com/advisories/GHSA-4vpr-x523-8j87) / CVE-2026-84369 | Media | Lock | 4.0.1 | `>= 4.0.0, < 4.1.0` | 4.1.0 | 4.0.1 | Sin coincidencia |
| [#119](https://github.com/ErickCSS/astro-intl/security/dependabot/119) | `nanoid` | [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) / CVE-2026-73086 | Alta | Lock | 3.3.11 | `< 3.3.12` | 3.3.12 | Sin coincidencia | Sin coincidencia |
| [#118](https://github.com/ErickCSS/astro-intl/security/dependabot/118) | `fflate` | [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98) / CVE-2026-45820 | Media | Lock | 0.8.2 | `>= 0.8.0, < 0.8.3` | 0.8.3 | 0.8.2 | Sin coincidencia |
| [#117](https://github.com/ErickCSS/astro-intl/security/dependabot/117) | `@humanfs/node` | [GHSA-p498-v437-472g](https://github.com/advisories/GHSA-p498-v437-472g) | Media | Lock | 0.16.7 | `< 0.16.8` | 0.16.8 | 0.16.7 | Sin coincidencia |
| [#116](https://github.com/ErickCSS/astro-intl/security/dependabot/116) | `sanitize-html` | [GHSA-g8qq-57p8-ggw5](https://github.com/advisories/GHSA-g8qq-57p8-ggw5) / CVE-2026-84371 | Media | Lock | 2.17.6 | `>= 1.9.0, <= 2.17.6` | 2.17.7 | Sin coincidencia | Sin coincidencia |
| [#115](https://github.com/ErickCSS/astro-intl/security/dependabot/115) | `nanoid` | [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) / CVE-2026-67213 | Alta | Lock | 3.3.11, 3.3.16 | `< 3.3.18` | 3.3.18 | 3.3.16 | Sin coincidencia |
| [#113](https://github.com/ErickCSS/astro-intl/security/dependabot/113) | `nanoid` | [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) / CVE-2026-67214 | Alta | Lock | 3.3.11 | `< 3.3.16` | 3.3.16 | Sin coincidencia | Sin coincidencia |
| [#112](https://github.com/ErickCSS/astro-intl/security/dependabot/112) | `js-yaml` | [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) | Alta | Lock | 4.1.1 | `>= 4.0.0, < 4.3.1` | 4.3.1 | 4.1.1 | Sin coincidencia |
| [#111](https://github.com/ErickCSS/astro-intl/security/dependabot/111) | `postcss` | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) / CVE-2026-69153 | Media | Lock | 8.5.19, 8.5.8 | `<= 8.5.22` | 8.5.23 | 8.5.19 | Sin coincidencia |
| [#110](https://github.com/ErickCSS/astro-intl/security/dependabot/110) | `brace-expansion` | [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) / CVE-2026-69152 | Alta | Lock | 1.1.13 | `< 1.1.18` | 1.1.18 | 1.1.13 | Sin coincidencia |
| [#109](https://github.com/ErickCSS/astro-intl/security/dependabot/109) | `brace-expansion` | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) / CVE-2026-14257 | Alta | Lock | 1.1.13 | `< 1.1.17` | 1.1.17 | 1.1.13 | Sin coincidencia |
| [#107](https://github.com/ErickCSS/astro-intl/security/dependabot/107) | `brace-expansion` | [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) / CVE-2026-69152 | Alta | Lock | 5.0.5 | `>= 4.0.0, < 5.0.9` | 5.0.9 | 5.0.5 | Sin coincidencia |
| [#106](https://github.com/ErickCSS/astro-intl/security/dependabot/106) | `postcss` | [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) / CVE-2026-73646 | Alta | Lock | 8.5.8 | `<= 8.5.17` | 8.5.18 | Sin coincidencia | Sin coincidencia |
| [#103](https://github.com/ErickCSS/astro-intl/security/dependabot/103) | `brace-expansion` | [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) / CVE-2026-14257 | Alta | Lock | 5.0.5 | `>= 4.0.0, < 5.0.8` | 5.0.8 | 5.0.5 | Sin coincidencia |
| [#102](https://github.com/ErickCSS/astro-intl/security/dependabot/102) | `postcss` | [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) / CVE-2026-45623 | Alta | Lock | 8.5.8 | `<= 8.5.11` | 8.5.12 | Sin coincidencia | Sin coincidencia |
| [#100](https://github.com/ErickCSS/astro-intl/security/dependabot/100) | `tar` | [GHSA-r292-9mhp-454m](https://github.com/advisories/GHSA-r292-9mhp-454m) / CVE-2026-73566 | Alta | Lock | 7.5.13 | `<= 7.5.20` | 7.5.21 | Sin coincidencia | Sin coincidencia |
| [#99](https://github.com/ErickCSS/astro-intl/security/dependabot/99) | `brace-expansion` | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) / CVE-2026-13149 | Alta | Lock | 1.1.13 | `< 1.1.16` | 1.1.16 | 1.1.13 | Sin coincidencia |
| [#98](https://github.com/ErickCSS/astro-intl/security/dependabot/98) | `js-yaml` | [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m) / CVE-2026-59869 | Alta | Lock | 4.1.1 | `>= 4.0.0, < 4.3.0` | 4.3.0 | 4.1.1 | Sin coincidencia |
| [#97](https://github.com/ErickCSS/astro-intl/security/dependabot/97) | `tar` | [GHSA-23hp-3jrh-7fpw](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) / CVE-2026-59873 | Crítica | Lock | 7.5.13 | `<= 7.5.18` | 7.5.19 | Sin coincidencia | Sin coincidencia |
| [#96](https://github.com/ErickCSS/astro-intl/security/dependabot/96) | `tar` | [GHSA-w8wr-v893-vjvp](https://github.com/advisories/GHSA-w8wr-v893-vjvp) / CVE-2026-59871 | Media | Lock | 7.5.13 | `<= 7.5.17` | 7.5.18 | Sin coincidencia | Sin coincidencia |
| [#95](https://github.com/ErickCSS/astro-intl/security/dependabot/95) | `tar` | [GHSA-gvwx-54wh-qm9j](https://github.com/advisories/GHSA-gvwx-54wh-qm9j) / CVE-2026-59875 | Media | Lock | 7.5.13 | `<= 7.5.16` | 7.5.17 | Sin coincidencia | Sin coincidencia |
| [#94](https://github.com/ErickCSS/astro-intl/security/dependabot/94) | `tar` | [GHSA-8x88-c5mf-7j5w](https://github.com/advisories/GHSA-8x88-c5mf-7j5w) / CVE-2026-59874 | Alta | Lock | 7.5.13 | `<= 7.5.17` | 7.5.18 | Sin coincidencia | Sin coincidencia |
| [#91](https://github.com/ErickCSS/astro-intl/security/dependabot/91) | `svgo` | [GHSA-2p49-hgcm-8545](https://github.com/advisories/GHSA-2p49-hgcm-8545) / CVE-2026-73650 | Alta | Lock | 4.0.1 | `>= 4.0.0, < 4.0.2` | 4.0.2 | 4.0.1 | Sin coincidencia |
| [#85](https://github.com/ErickCSS/astro-intl/security/dependabot/85) | `brace-expansion` | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) / CVE-2026-13149 | Alta | Lock | 5.0.5 | `>= 3.0.0, < 5.0.7` | 5.0.7 | 5.0.5 | Sin coincidencia |
| [#84](https://github.com/ErickCSS/astro-intl/security/dependabot/84) | `postcss` | [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) / CVE-2026-41305 | Media | Lock | 8.5.8 | `< 8.5.10` | 8.5.10 | Sin coincidencia | Sin coincidencia |
| [#82](https://github.com/ErickCSS/astro-intl/security/dependabot/82) | `js-yaml` | [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) / CVE-2026-53550 | Media | Lock | 4.1.1 | `>= 4.0.0, <= 4.1.1` | 4.2.0 | 4.1.1 | Sin coincidencia |
| [#76](https://github.com/ErickCSS/astro-intl/security/dependabot/76) | `ws` | [GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) / CVE-2026-48779 | Alta | Lock | 8.20.0 | `>= 8.0.0, < 8.21.0` | 8.21.0 | 8.20.0 | Sin coincidencia |
| [#75](https://github.com/ErickCSS/astro-intl/security/dependabot/75) | `tar` | [GHSA-vmf3-w455-68vh](https://github.com/advisories/GHSA-vmf3-w455-68vh) / CVE-2026-53655 | Media | Lock | 7.5.13 | `<= 7.5.15` | 7.5.16 | Sin coincidencia | Sin coincidencia |
| [#62](https://github.com/ErickCSS/astro-intl/security/dependabot/62) | `ws` | [GHSA-58qx-3vcg-4xpx](https://github.com/advisories/GHSA-58qx-3vcg-4xpx) / CVE-2026-45736 | Media | Lock | 8.20.0 | `>= 8.0.0, < 8.20.1` | 8.20.1 | 8.20.0 | Sin coincidencia |
| [#61](https://github.com/ErickCSS/astro-intl/security/dependabot/61) | `brace-expansion` | [GHSA-jxxr-4gwj-5jf2](https://github.com/advisories/GHSA-jxxr-4gwj-5jf2) / CVE-2026-45149 | Media | Lock | 5.0.5 | `>= 5.0.0, < 5.0.6` | 5.0.6 | 5.0.5 | Sin coincidencia |
| [#44](https://github.com/ErickCSS/astro-intl/security/dependabot/44) | `defu` | [GHSA-737v-mqg7-c878](https://github.com/advisories/GHSA-737v-mqg7-c878) / CVE-2026-35209 | Alta | Lock | 6.1.4 | `<= 6.1.4` | 6.1.5 | 6.1.4 | Sin coincidencia |
