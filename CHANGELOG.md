# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [2.2.0] - 2026-04-07

### Added

- **`t.raw()` function** — access raw translation values (arrays, objects, numbers) without string coercion. Use `t.raw("key")` to get the native value type instead of `[object Object]`.
- **`messagesDir` integration option** — simplified API for loading JSON files. Set `messagesDir: "./src/i18n/messages"` and the integration will automatically load `{locale}.json` files with the correct import attributes.
- **Auto-detection of locale in static mode** — `getLocale()` now automatically detects the locale from `window.location.pathname` when `setRequestLocale()` hasn't been called (client-side only).
- **`<AutoRedirect />` component** — new Astro component export from `astro-intl/components`. Detects browser language and redirects to the appropriate localized route without the blank page issue of `Astro.redirect()`. Supports `locales` and `defaultLocale` props.
- **`MessagesDirConfig` type** — exported type for the `messagesDir` configuration option.

### Changed

- Updated `package.json` exports to include `./components` sub-path for the `AutoRedirect` component.
- Improved error messages when request config is not found.

## [2.1.0] - 2026

### Added

- **Astro v6 support** — `peerDependencies` now accepts `^4 || ^5 || ^6`. Backward compatible with Astro 4 and 5.
- **`getFallbackRoutes()` API** — new public function that returns i18n fallback routes collected from Astro 6.1's `astro:routes:resolved` hook. Returns an empty array on Astro < 6.1.
- **`FallbackRouteInfo` type** — exported type with `{ pattern: string; pathname?: string; locale: string }`.
- **`astro:routes:resolved` hook** — the integration now listens to this hook to automatically detect and store fallback routes when `i18n.fallbackType: 'rewrite'` is configured in Astro.

### Changed

- `devDependencies.astro` updated to `^6.1.0`.
- `@astrojs/vercel` updated to `^10.0.3` in docs projects (Astro 6 compatible).
- `happy-dom` updated to `^20.8.9` to fix CVE-2026-33943 (RCE via ECMAScriptModuleCompiler).

### Security

- Resolved all 32 Dependabot vulnerability alerts, including:
  - `flatted` — Prototype Pollution and unbounded recursion DoS via `parse()`
  - `happy-dom` — ECMAScriptModuleCompiler RCE and fetch credentials leak
  - `h3` — SSE injection, path traversal, and double decoding bypasses
  - `svgo` — DoS via Billion Laughs entity expansion
  - `picomatch` — ReDoS via extglob and POSIX character class method injection
  - `tar` / `node-tar` — symlink/hardlink path traversal
  - `@astrojs/vercel` — unauthenticated path override via `x-astro-path`
  - `devalue` — prototype pollution in `parse` and `unflatten`
  - `brace-expansion` — zero-step sequence hang
  - `smol-toml` — DoS via commented lines
  - `astro` — remote allowlist bypass via unanchored matchPathname wildcard

## [2.0.0] - 2026

### Breaking Changes

- **`getTranslationsReact` removed from root export** — React support is now imported from `astro-intl/react` instead of `astro-intl`.
- **Sub-path imports required for framework adapters** — use `astro-intl/react` and `astro-intl/svelte` instead of importing from the root.
- **Old `src/react.ts` deleted** — logic migrated to `src/adapters/react.ts`.

### Added

- **Svelte adapter** — `getTranslations` and `createGetTranslations` with `t.rich()` returning `RichSegment[]`. Import from `astro-intl/svelte`.
- **`renderRichText()` helper** — resolves `RichSegment[]` into an HTML string using `tags` (native HTML elements) and `components` (custom functions). Import from `astro-intl/svelte`.
- **`RichSegment` type** — framework-agnostic segment type (`text` | `tag`) exported from `astro-intl/svelte`.
- **`createGetTranslations` factory** — standalone translation factory (no store dependency) available in both React and Svelte adapters.
- **Framework-agnostic base** — `parseRichSegments()` in `src/framework-base.ts` powers both React and Svelte rich text parsing.
- **New sub-path exports** — `astro-intl/react` and `astro-intl/svelte` in `package.json` exports.
- `svelte@^5` added as optional peer dependency.

### Changed

- React adapter moved from `src/react.ts` to `src/adapters/react.ts`.
- React `t.rich()` now uses the shared `parseRichSegments()` base with recursive nested tag support.
- Package structure reorganized with `src/adapters/` directory for framework-specific code.

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
