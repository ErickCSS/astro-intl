# Auditoría interna de astro-intl

Esta carpeta documenta el saneamiento de `astro-intl` realizado para preparar la versión 2.2.2. La auditoría se basa en el repositorio y no se publica automáticamente en `astro-intl.dev`.

## Documentos

- [Alertas de Dependabot y seguimiento por versión](./DEPENDABOT.md)
- [Visión general](./PROJECT-OVERVIEW.md)
- [Seguridad](./SECURITY.md)
- [Oportunidades de mejora](./IMPROVEMENT-OPPORTUNITIES.md)
- [Roadmap](./ROADMAP.md)
- [Candidato 2.4.0](./RELEASE-CANDIDATE-2.4.0.md)
- [Candidato 2.3.1](./RELEASE-CANDIDATE-2.3.1.md)
- [Candidato 2.3.0](./RELEASE-CANDIDATE-2.3.0.md)
- [Candidato 2.2.2](./RELEASE-CANDIDATE-2.2.2.md)

## Alcance y método

Se revisaron la librería de `packages/integration`, sus exports, estado SSR, traducciones HTML, adaptadores, routing, build, tarball, CI, playground y web oficial. Los hallazgos de seguridad se validaron con pruebas unitarias, consumidores reales y builds SSR; no se consideró suficiente que lint o TypeScript aprobaran. Para Astro 7 también se cubrieron Vite 8/Rolldown, el compilador Rust, renderizado en cola, Advanced Routing y cache estable descritos en el [anuncio oficial](https://astro.build/blog/astro-7/).

La versión 2.3.0 incorporó la validación de catálogos. Para la entrega 2.4.0, la web oficial fija la versión y la integridad del candidato y el playground consume la integración local mediante `workspace:*`.

## Resultado de la revisión anterior

- Lint, 165 pruebas fuente, build limpio, pack check y comprobaciones de documentación pasan.
- Astro 4.16.19, 5.18.2, 6.4.8 y 7.2.8 pasan en consumidores instalados desde el `.tgz`.
- Astro 7 pasa los pipelines predeterminado y compuesto de `src/fetch.ts`, cache por locale y renderizado SSR anidado/concurrente.
- El playground compila contra el workspace y la web oficial compila contra `astro-intl@2.3.0` y Astro 7.4.13.
- `dist` no contiene tests; el build produce 29 archivos y el tarball validado contiene 31.
- No quedan hallazgos críticos, altos o medios confirmados sin corrección o justificación; las limitaciones se registran en [Seguridad](./SECURITY.md).

## Convenciones

- **Corregido**: existía una ruta reproducible y se añadió una regresión.
- **Descartado**: la revisión encontró un control o una frontera de confianza que derrota la hipótesis.
- **Hardening**: defensa adicional para reducir errores de integración aunque la ruta no fuese explotable bajo los supuestos normales.
- **Limitación**: riesgo residual que debe conocer el consumidor.
