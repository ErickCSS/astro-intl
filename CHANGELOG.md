# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

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

## [1.0.1] - 2025

### Added

- Variable interpolation with `t("key", { name: "value" })`.
- `t.markup()` for HTML in translations with security sanitisation.
- `t.rich()` for React with nested tag support.
- `defineRequestConfig()` for global config registration (next-intl style).
- Messages via integration options (`messages` config).
- BCP-47 locale validation.
- Prototype-pollution protection in dot-path traversal.
- HTML sanitisation (defence-in-depth) in `t.markup()`.

## [1.0.0] - 2025

### Added

- Initial release.
- `setRequestLocale()` for URL-based locale detection.
- `getLocale()` to read current locale.
- `getTranslations()` with namespace support.
- `getTranslationsReact()` for React components.
- Type-safety with `DotPaths<T>`.
- Native Astro integration.
