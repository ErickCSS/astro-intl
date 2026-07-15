# Guía interna de publicación en npm

Esta guía describe la promoción controlada de `astro-intl`. Preparar un candidato no autoriza publicarlo. La publicación npm y el despliegue de la web oficial requieren aprobaciones explícitas y separadas.

## Compatibilidad del candidato 2.2.2

- Astro 4.16.19, 5.18.2, 6.4.8 y 7.0.9.
- Astro 7 requiere Node.js 22.12.0 o superior por requisito del propio Astro.
- React y Svelte continúan como peers opcionales.
- No se añade ni se elimina ninguna API pública.

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

- 27 archivos exactamente, según `package-files.json`;
- ningún test, declaración de test, fuente interna o tarball anidado;
- presencia de `AutoRedirect.astro` después de un build desde cero;
- imports funcionales de `.`, `/middleware`, `/routing`, `/react`, `/svelte` y `/components` desde una instalación temporal;
- SHA-1, integridad SHA-512, tamaño y commit de origen registrados en `docs/audit/RELEASE-CANDIDATE-2.2.2.md`.

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

La web `docs/astro-intl-i18n` permanece en `astro-intl@2.2.1` y Astro 6 mientras 2.2.2 no esté publicada. Después de validar la publicación:

1. cambiar la dependencia a `astro-intl@2.2.2` exacta;
2. actualizar Astro 7 y sus adaptadores en una tarea controlada;
3. instalar con lockfile reproducible y crear un preview;
4. revisar la web;
5. solicitar una aprobación distinta para desplegar.

El playground `docs/playground` es el canary de `workspace:*` y puede adelantarse a la web oficial.
