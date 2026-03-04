# Contributing to astro-intl / Contribuir a astro-intl

## English

Thank you for your interest in contributing to `astro-intl`.

### Development Setup

1. Fork and clone the repository.
2. Install dependencies:

```bash
pnpm install
```

3. Create a descriptive branch:

```bash
git checkout -b feat/your-change
```

### Project Structure

- `packages/integration`: main `astro-intl` package
- `docs/`: documentation and playground
- `.github/workflows/ci.yml`: CI pipeline

### Before Opening a PR

Run the following checks:

```bash
pnpm --filter astro-intl format:check
pnpm --filter astro-intl lint
pnpm --filter astro-intl test
pnpm --filter astro-intl build
```

### Pull Request Guidelines

- Keep PRs focused and small.
- Clearly explain the problem and solution.
- Add/update tests when behavior changes.
- Update docs when API, routing, or usage changes.
- Avoid unrelated changes in the same PR.

### Commit Style (Recommended)

We recommend Conventional Commits:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
- `chore: ...`

### Reporting Bugs and Requesting Features

Use GitHub Issues:

- Bugs: include reproduction steps, expected vs actual behavior, and environment.
- Features: include problem, proposal, and use cases.

### Code of Conduct

By participating in this project, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Espanol

Gracias por tu interes en contribuir a `astro-intl`.

### Entorno de Desarrollo

1. Haz fork y clona el repositorio.
2. Instala dependencias:

```bash
pnpm install
```

3. Crea una rama descriptiva:

```bash
git checkout -b feat/tu-cambio
```

### Estructura del Proyecto

- `packages/integration`: paquete principal `astro-intl`
- `docs/`: documentacion y playground
- `.github/workflows/ci.yml`: pipeline de CI

### Antes de Abrir un PR

Ejecuta estas verificaciones:

```bash
pnpm --filter astro-intl format:check
pnpm --filter astro-intl lint
pnpm --filter astro-intl test
pnpm --filter astro-intl build
```

### Reglas para Pull Requests

- Mantener PRs pequenos y enfocados.
- Explicar claramente el problema y la solucion.
- Incluir/actualizar tests cuando cambie el comportamiento.
- Actualizar docs cuando cambie API, routing o flujo de uso.
- Evitar cambios no relacionados en el mismo PR.

### Estilo de Commits (Recomendado)

Se recomienda Conventional Commits:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `refactor: ...`
- `test: ...`
- `chore: ...`

### Reporte de Bugs y Solicitud de Features

Usa GitHub Issues:

- Bugs: agrega pasos de reproduccion, comportamiento esperado/actual y entorno.
- Features: explica problema, propuesta y casos de uso.

### Codigo de Conducta

Al participar en este proyecto, aceptas cumplir el [Code of Conduct](./CODE_OF_CONDUCT.md).
