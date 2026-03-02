import type { RoutesMap } from "./types/index.js";
import { setRequestLocale, __setIntlConfig } from "./store.js";
import { templateToRegex } from "./routing.js";

// ─── Astro Middleware Helper ─────────────────────────────────────────
// Returns an Astro-compatible middleware handler that calls
// setRequestLocale(context.url) before every page render.
//
// Compatible with Astro's `sequence()` for composing multiple middlewares.
//
// ── Basic usage ──────────────────────────────────────────────────────
//
//   import "@/i18n/request";
//   import { createIntlMiddleware } from "astro-intl/middleware";
//   export const onRequest = createIntlMiddleware({ locales: ["en", "es"] });
//
// ── Composing with other middlewares ─────────────────────────────────
//
//   import { sequence } from "astro:middleware";
//   import "@/i18n/request";
//   import { createIntlMiddleware } from "astro-intl/middleware";
//
//   const intl = createIntlMiddleware({ locales: ["en", "es"] });
//   const auth = async (context, next) => { return next(); };
//
//   export const onRequest = sequence(intl, auth);

export type IntlMiddlewareOptions = {
  locales: readonly string[];
  defaultLocale?: string;
  routes?: RoutesMap;
};

// ─── Route rewrite helper ────────────────────────────────────────────
// Given a pathname like /es/sobre-nosotros, checks if it matches a
// translated route template. If so, returns the canonical (defaultLocale)
// path that maps to the filesystem, e.g. /es/about.
// Returns null when no rewrite is needed.

function resolveTranslatedRoute(
  pathname: string,
  lang: string,
  routes: RoutesMap,
  defaultLocale: string
): string | null {
  const restPath = "/" + pathname.split("/").slice(2).join("/");

  for (const routeKey of Object.keys(routes)) {
    const entry = routes[routeKey];
    const localTemplate = entry[lang];
    if (!localTemplate) continue;

    const { regex, paramNames } = templateToRegex(localTemplate);
    const match = restPath.match(regex);
    if (!match) continue;

    // If this locale's template is the same as defaultLocale's, no rewrite needed
    const canonicalTemplate = entry[defaultLocale];
    if (!canonicalTemplate || canonicalTemplate === localTemplate) return null;

    // Extract params and substitute into the canonical template
    const params: Record<string, string> = {};
    paramNames.forEach((name, idx) => {
      params[name] = match[idx + 1];
    });

    let canonical = canonicalTemplate;
    canonical = canonical.replace(/\[(\w+)\]/g, (_m, name: string) => params[name] ?? `[${name}]`);

    return `/${lang}${canonical}`;
  }

  return null;
}

export function createIntlMiddleware(options: IntlMiddlewareOptions) {
  const { locales, defaultLocale: _defaultLocale, routes } = options;
  const resolvedDefaultLocale = _defaultLocale ?? "en";

  __setIntlConfig({
    locales: [...locales],
    ...(resolvedDefaultLocale && { defaultLocale: resolvedDefaultLocale }),
    ...(routes && { routes }),
  });

  return async (
    context: { url: URL; request: Request; rewrite: (path: string | URL) => Promise<Response> },
    next: () => Promise<Response>
  ) => {
    const [, lang] = context.url.pathname.split("/");

    if (!lang || !locales.includes(lang)) {
      return next();
    }

    await setRequestLocale(context.url);

    // Rewrite translated routes to their canonical filesystem paths
    if (routes) {
      const rewrittenPath = resolveTranslatedRoute(
        context.url.pathname,
        lang,
        routes,
        resolvedDefaultLocale
      );
      if (rewrittenPath) {
        return context.rewrite(rewrittenPath);
      }
    }

    return next();
  };
}
