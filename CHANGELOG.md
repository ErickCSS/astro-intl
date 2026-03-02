# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026

### Added

- **Localized routing system** — define translated URL paths per locale (e.g. `/es/sobre-nosotros` instead of `/es/about`).
- `path(routeKey, options?)` — generate localized URLs for named routes with dynamic `[param]` substitution. Import from `astro-intl/routing`.
- `switchLocalePath(currentPath, nextLocale)` — convert the current URL to its equivalent in another locale, preserving params, query strings and hashes. Import from `astro-intl/routing`.
- `routes` option in `createIntlMiddleware` — the middleware automatically rewrites translated URLs to their canonical filesystem paths (no duplicate page files needed).
- `routes` option in integration config (`astro.config.mjs`) — for projects that don't use middleware.
- `RoutesMap` type exported from `astro-intl/types`.
- Route template validation — detects unbalanced brackets and invalid param names at build time.
- Route conflict detection — throws on duplicate templates and warns on structurally equivalent ones.

### Changed

- `createIntlMiddleware` signature now accepts `routes?: RoutesMap` in options.
- New `./routing` export path in package.json for `astro-intl/routing`.

## [1.0.3] - 2026

### Changed

- `createIntlMiddleware()` now automatically sets `locales` and `defaultLocale` in the intl store via `__setIntlConfig`. Users who use middleware no longer need to pass these options to `intl()` in `astro.config.mjs`.

### Added

- `defaultLocale` option in `IntlMiddlewareOptions` type.

## [1.0.2] - 2026

### Added

- Configurable `defaultLocale` option — no more hardcoded `"en"` fallback.
- `runWithLocale()` — concurrency-safe request context via `AsyncLocalStorage`.
- Multi-runtime support — auto-detects `AsyncLocalStorage` (Node.js) with global-variable fallback (Cloudflare Workers, Deno).
- `IntlConfig` type exported for integration configuration.

### Changed

- Modular architecture — `core.ts` split into `sanitize`, `interpolation`, `store`, `translations` modules.
- `react.ts` now imports shared `escapeRegExp` from `sanitize.ts` (removed duplicate).

### Fixed

- Race condition in SSR — concurrent requests no longer share state.
- Hardcoded `"en"` fallback locale now respects `defaultLocale` config.

## [1.0.1] - 2026

### Added

- Variable interpolation with `t("key", { name: "value" })`.
- `t.markup()` for HTML in translations with security sanitisation.
- `t.rich()` for React with nested tag support.
- `defineRequestConfig()` for global config registration (next-intl style).
- Messages via integration options (`messages` config).
- BCP-47 locale validation.
- Prototype-pollution protection in dot-path traversal.
- HTML sanitisation (defence-in-depth) in `t.markup()`.

## [1.0.0] - 2026

### Added

- Initial release.
- `setRequestLocale()` for URL-based locale detection.
- `getLocale()` to read current locale.
- `getTranslations()` with namespace support.
- `getTranslationsReact()` for React components.
- Type-safety with `DotPaths<T>`.
- Native Astro integration.
