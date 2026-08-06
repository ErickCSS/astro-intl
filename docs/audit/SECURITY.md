# Seguridad de astro-intl 2.2.2

## Modelo de amenazas

Las entradas remotas normales son URL, locale, parámetros, query/hash, concurrencia y preferencias del navegador. Catálogos, callbacks, rutas y `messagesDir` son configuración confiable por defecto, aunque pueden cruzar una frontera adicional cuando proceden de un CMS o de traductores externos.

Los límites principales son visitante→middleware/routing, solicitud→estado de proceso, catálogo→HTML crudo, build→imports y repositorio/CI→paquete npm. La librería no implementa autenticación, base de datos, sesiones ni peticiones salientes.

## Vulnerabilidades corregidas

### Contaminación entre solicitudes SSR — severidad final: media

La implementación publicada podía caer en un estado global compartido. Dos solicitudes intercaladas podían observar locale y mensajes incorrectos; el impacto podía cruzar usuarios si un consumidor almacenaba mensajes específicos por tenant.

2.2.2 carga `AsyncLocalStorage` desde `node:async_hooks`, ejecuta todo `next()`/rewrite dentro del contexto y elimina el fallback SSR. La regresión intercala dos solicitudes y verifica ambos valores antes y después de una pausa.

### XSS en `t.markup()` — severidad final: media bajo catálogos no confiables

El saneador regex no representaba el árbol HTML real y podía omitir variantes de atributos, entidades, SVG/MathML y esquemas peligrosos. La salida se usa habitualmente en `set:html`.

2.2.2 usa `sanitize-html` con allowlist de elementos, atributos y esquemas; rechaza URLs relativas a protocolo y aplica `noopener noreferrer` a enlaces externos con `target=_blank`. Hay regresiones para handlers sin comillas, SVG, entidades y URIs peligrosas.

### XSS en rich text Svelte — severidad final: media bajo catálogos no confiables

Texto, chunks, tags mapeados, tags desconocidos y callbacks podían formar HTML sin escape antes de `{@html}`. Ahora se escapan los fragmentos, se limita el tag nativo y se sanitiza el documento final.

### Locale como segmento no validado — severidad final: baja; hardening aplicado

Cuando no había lista configurada, `path()`, `switchLocalePath()` y `AutoRedirect` aceptaban segmentos sintácticamente inválidos. Ahora todos pasan por validación BCP-47 acotada y se cubren slash, backslash, puntos, espacios, controles y `pt-BR`.

## Hardening adicional

- JSON-LD escapa terminadores de `<script>`, `&` y separadores Unicode.
- El changelog escapa HTML y solo permite enlaces relativos o esquemas `http`, `https`, `mailto` y `tel`.
- Los parsers de pseudo-tags ya no usan expresiones lazy-wildcard sobre contenido malformado.
- `dist` se limpia, los exports se verifican y el tarball se compara con un inventario cerrado.
- CI declara `contents: read`, no persiste credenciales y no publica.

## Hallazgos descartados

- **Prototype pollution:** `getNestedValue` bloquea `__proto__`, `constructor` y `prototype`; no existe una escritura equivalente.
- **Import arbitrario remoto:** `messagesDir` y locales son configuración de build. No se encontró una ruta desde entradas HTTP hacia el import.
- **Open redirect confirmado:** no se reprodujo una salida externa con configuración válida. La validación estricta de locales elimina las formas ambiguas.
- **AutoRedirect remoto directo:** sus props son código de la aplicación. Se endureció igualmente porque escribe en `location.href`.

## Dependencias

La auditoría del consumidor empacado con Astro 7.1.4, React 19.2.4 y Svelte 5.56.5 reporta cero vulnerabilidades moderadas o superiores. Astro 7.0.9 se retiró de desarrollo, documentación y compatibilidad por `GHSA-4g3v-8h47-v7g6`; el audit ahora falla desde severidad moderada. La matriz conserva Astro 4–6 para compatibilidad, pero el escaneo de producción se ejecuta sobre la línea actual.

## Limitaciones conocidas

- SSR edge sin `AsyncLocalStorage` no está soportado: la librería falla explícitamente.
- Los callbacks de markup y componentes React/Svelte siguen siendo código confiable del consumidor.
- `sanitize-html` reduce XSS HTML; no valida semántica de negocio, autorización ni destinos permitidos por una aplicación.
- Desactivar el encoding de parámetros de ruta transfiere la responsabilidad al consumidor.
- No se ejecutó una matriz real por cada proveedor edge; sí se ejecutó Node SSR de Astro 4, 5, 6 y 7.
- Un `src/fetch.ts` de Astro 7 es responsable de incluir los handlers que necesita. Omitir `middleware()` omite también la inicialización de `astro-intl`.

## Evidencia de verificación

| Control | Resultado |
| --- | --- |
| Suite fuente | 10 archivos, 165 pruebas, una sola ejecución |
| Concurrencia | dos solicitudes intercaladas conservan locale/mensajes |
| Build | 29 archivos; sin tests y con exports/binarios validados |
| Tarball | 31 archivos; sin tests, fuentes ni `.tgz` anidados |
| Subpaths | raíz, middleware, routing, React, Svelte y componente importables |
| Compatibilidad | Astro 4.16.19, 5.18.2, 6.4.8 y 7.1.4: estático y SSR aprobados |
| Astro 7 | Advanced Routing completo/compuesto, cache por locale y renderizado anidado concurrente aprobados; assets cliente sin `AsyncLocalStorage` ni `node:async_hooks` |
| Consumidores | playground workspace y web oficial 2.2.2 sobre Astro 7.1.4 compilan |
| Dependencias | cero vulnerabilidades moderadas o superiores en el consumidor empacado con Astro 7.1.4 |

No se afirma que la librería sea invulnerable. La conclusión es que los hallazgos críticos, altos y medios confirmados en el alcance revisado fueron corregidos o descartados con evidencia, y que las limitaciones restantes están explícitas.
