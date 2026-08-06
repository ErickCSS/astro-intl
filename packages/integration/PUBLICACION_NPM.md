# Guía interna de publicación en npm

Esta guía describe la promoción controlada de `astro-intl`. Preparar un candidato no autoriza publicarlo. La publicación npm y el despliegue de la web oficial requieren aprobaciones explícitas y separadas.

## Compatibilidad del candidato 2.3.0

- Astro 4.16.19, 5.18.2, 6.4.8 y 7.1.4.
- Astro 7 requiere Node.js 22.12.0 o superior por requisito del propio Astro.
- React y Svelte continúan como peers opcionales.
- Se añade el subpath público `astro-intl/validate` con `validateCatalogs()` y diagnósticos tipados.
- Se añade el binario público `astro-intl` con el comando `validate`.
- No se elimina ni modifica de forma incompatible ninguna API existente.

## Preparación

Desde la raíz del repositorio:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm compat:check
pnpm audit:prod
```

`pnpm check` ejecuta lint, las pruebas fuente, el build limpio, la validación del tarball, la documentación y los dos consumidores. `pnpm compat:check` instala el `.tgz` en consumidores temporales de las cuatro versiones de Astro.

Antes de continuar también se deben comprobar dos builds limpios consecutivos y registrar que sus inventarios y SHA-256 son idénticos.

## Revisión del tarball

```sh
pnpm pack:check
```

La validación debe confirmar:

- 31 archivos exactamente, según `package-files.json`;
- ningún test, declaración de test, fuente interna o tarball anidado;
- presencia de `AutoRedirect.astro` después de un build desde cero;
- imports funcionales de `.`, `/middleware`, `/routing`, `/react`, `/svelte`, `/validate` y `/components` desde una instalación temporal;
- ejecución válida e inválida del comando de catálogos desde una instalación temporal;
- SHA-1, integridad SHA-512, tamaño y commit de origen registrados en `docs/audit/RELEASE-CANDIDATE-2.3.0.md`.

El `.tgz` de revisión se genera en una carpeta temporal y no se versiona.

## Aprobación y publicación

Solo después de revisar el diff, el changelog, la auditoría de seguridad y la identidad del tarball:

1. Crear el commit y tag aprobados.
2. Repetir `pnpm check`, `pnpm compat:check` y `pnpm audit:prod` desde ese commit.
3. Generar nuevamente el tarball y comparar su identidad con el registro aprobado.
4. Solicitar aprobación explícita para publicar.
5. Publicar manualmente el paquete revisado.
6. Leer de vuelta metadata, integridad y archivos desde npm.

No existe publicación automática desde CI en esta fase.

## Promoción de la web oficial

`astro-intl@2.2.2` continúa publicado mientras se revisa el candidato 2.3.0. Solo después de publicar y leer de vuelta npm, la web `docs/astro-intl-i18n` se promoverá a:

- `astro-intl@2.3.0` exacta;
- Astro 7.1.4;
- `@astrojs/vercel@11.0.3`;
- `@astrojs/sitemap@3.7.3`.

La instalación debe conservar un lockfile reproducible. Después se crea y revisa un preview; el despliegue de producción requiere una aprobación distinta.

El playground `docs/playground` es el canary de `workspace:*` y puede adelantarse a la web oficial.
