# Auditoría interna de astro-intl

Esta carpeta documenta el saneamiento de `astro-intl` realizado para preparar la versión 2.2.2. La auditoría se basa en el repositorio y no se publica automáticamente en `astro-intl.dev`.

## Documentos

- [Visión general](./PROJECT-OVERVIEW.md)
- [Seguridad](./SECURITY.md)
- [Oportunidades de mejora](./IMPROVEMENT-OPPORTUNITIES.md)
- [Roadmap](./ROADMAP.md)
- [Candidato 2.2.2](./RELEASE-CANDIDATE-2.2.2.md)

## Alcance y método

Se revisaron la librería de `packages/integration`, sus exports, estado SSR, traducciones HTML, adaptadores, routing, build, tarball, CI, playground y web oficial. Los hallazgos de seguridad se validaron con pruebas unitarias, consumidores reales y builds SSR; no se consideró suficiente que lint o TypeScript aprobaran. Para Astro 7 también se cubrieron Vite 8/Rolldown, el compilador Rust, renderizado en cola, Advanced Routing y cache estable descritos en el [anuncio oficial](https://astro.build/blog/astro-7/).

La fase implementa y verifica correcciones, pero no publica en npm ni despliega la web. El playground sigue siendo el canary de `workspace:*`; la web oficial permanece en la versión publicada 2.2.1 hasta una aprobación explícita.

## Resultado

- Lint, 158 pruebas fuente, build limpio, pack check y comprobaciones de documentación pasan.
- Astro 4.16.19, 5.18.2, 6.4.8 y 7.0.9 pasan en consumidores instalados desde el `.tgz`.
- Astro 7 pasa los pipelines predeterminado y compuesto de `src/fetch.ts`, cache por locale y renderizado SSR anidado/concurrente.
- El playground compila contra el workspace y la web oficial compila contra 2.2.1.
- `dist` no contiene tests y dos builds limpios producen el mismo inventario de 25 archivos con hashes idénticos.
- No quedan hallazgos críticos, altos o medios confirmados sin corrección o justificación; las limitaciones se registran en [Seguridad](./SECURITY.md).

## Convenciones

- **Corregido**: existía una ruta reproducible y se añadió una regresión.
- **Descartado**: la revisión encontró un control o una frontera de confianza que derrota la hipótesis.
- **Hardening**: defensa adicional para reducir errores de integración aunque la ruta no fuese explotable bajo los supuestos normales.
- **Limitación**: riesgo residual que debe conocer el consumidor.
