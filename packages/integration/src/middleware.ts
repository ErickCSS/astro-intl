import { setRequestLocale, __setIntlConfig } from "./store.js";

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
};

export function createIntlMiddleware(options: IntlMiddlewareOptions) {
  const { locales, defaultLocale } = options;

  __setIntlConfig({
    locales: [...locales],
    ...(defaultLocale && { defaultLocale }),
  });

  return async (context: { url: URL; request: Request }, next: () => Promise<Response>) => {
    const [, lang] = context.url.pathname.split("/");

    if (!lang || !locales.includes(lang)) {
      return next();
    }

    await setRequestLocale(context.url);
    return next();
  };
}
