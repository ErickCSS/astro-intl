import { getRoutes, getDefaultLocale, getLocales, getLocale, isValidLocale } from "./store.js";

// ─── Regex cache ─────────────────────────────────────────────────────

type CompiledTemplate = {
  regex: RegExp;
  paramNames: string[];
};

const regexCache = new Map<string, CompiledTemplate>();

// ─── Template validation ─────────────────────────────────────────────

const VALID_PARAM_REGEX = /^\w+$/;
const BRACKET_OPEN = /\[/g;
const BRACKET_CLOSE = /\]/g;

function validateTemplate(template: string, routeKey: string, locale: string): void {
  const opens = (template.match(BRACKET_OPEN) || []).length;
  const closes = (template.match(BRACKET_CLOSE) || []).length;
  if (opens !== closes) {
    throw new Error(
      `[astro-intl] Invalid route template for "${routeKey}" (${locale}): "${template}". ` +
        `Unbalanced brackets.`
    );
  }
  const params = [...template.matchAll(/\[([^\]]*)\]/g)];
  for (const match of params) {
    if (!VALID_PARAM_REGEX.test(match[1])) {
      throw new Error(
        `[astro-intl] Invalid param name "[${match[1]}]" in route "${routeKey}" (${locale}): "${template}". ` +
          `Param names must match /\\w+/.`
      );
    }
  }
}

// ─── templateToRegex ─────────────────────────────────────────────────

export function templateToRegex(template: string): CompiledTemplate {
  const cached = regexCache.get(template);
  if (cached) return cached;

  const paramNames: string[] = [];
  const pattern = template
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\[(\w+)\\\]/g, (_match, name: string) => {
      paramNames.push(name);
      return "([^/]+)";
    });

  const compiled: CompiledTemplate = {
    regex: new RegExp(`^${pattern}$`),
    paramNames,
  };

  regexCache.set(template, compiled);
  return compiled;
}

// ─── substituteParams ────────────────────────────────────────────────

function substituteParams(
  template: string,
  params: Record<string, string>,
  encode: boolean
): string {
  let result = template;
  const missing: string[] = [];

  result = result.replace(/\[(\w+)\]/g, (_match, name: string) => {
    if (!(name in params)) {
      missing.push(name);
      return `[${name}]`;
    }
    return encode ? encodeURIComponent(params[name]) : params[name];
  });

  if (missing.length > 0) {
    throw new Error(
      `[astro-intl] Missing params for route template "${template}": ${missing.join(", ")}`
    );
  }

  return result;
}

// ─── path() ──────────────────────────────────────────────────────────

export function path(
  routeKey: string,
  options: {
    locale?: string;
    params?: Record<string, string>;
    encode?: boolean;
  } = {}
): string {
  const routes = getRoutes();
  if (!routes) {
    throw new Error("[astro-intl] No routes configured. Add routes to your astro-intl config.");
  }

  const routeEntry = routes[routeKey];
  if (!routeEntry) {
    throw new Error(
      `[astro-intl] Unknown route key: "${routeKey}". ` +
        `Available keys: ${Object.keys(routes).join(", ")}`
    );
  }

  const locale = options.locale ?? getLocale();

  if (getLocales().length > 0 && !isValidLocale(locale)) {
    throw new Error(
      `[astro-intl] Invalid locale "${locale}" for path(). ` +
        `Configured locales: ${getLocales().join(", ")}`
    );
  }

  const template = routeEntry[locale];
  if (!template) {
    throw new Error(
      `[astro-intl] Route "${routeKey}" has no template for locale "${locale}". ` +
        `Available locales for this route: ${Object.keys(routeEntry).join(", ")}`
    );
  }

  validateTemplate(template, routeKey, locale);

  const encode = options.encode !== false;
  const resolvedPath = substituteParams(template, options.params ?? {}, encode);

  return `/${locale}${resolvedPath}`;
}

// ─── switchLocalePath() ──────────────────────────────────────────────

export function switchLocalePath(currentPath: string | URL, nextLocale: string): string {
  const locales = getLocales();
  if (locales.length > 0 && !isValidLocale(nextLocale)) {
    throw new Error(
      `[astro-intl] Invalid locale "${nextLocale}" for switchLocalePath(). ` +
        `Configured locales: ${locales.join(", ")}`
    );
  }

  // Parse input
  let pathname: string;
  let suffix = "";
  if (currentPath instanceof URL) {
    pathname = currentPath.pathname;
    suffix = (currentPath.search || "") + (currentPath.hash || "");
  } else if (currentPath.includes("://")) {
    try {
      const url = new URL(currentPath);
      pathname = url.pathname;
      suffix = (url.search || "") + (url.hash || "");
    } catch {
      pathname = currentPath;
    }
  } else {
    const qIdx = currentPath.indexOf("?");
    const hIdx = currentPath.indexOf("#");
    const splitIdx =
      qIdx >= 0 && hIdx >= 0 ? Math.min(qIdx, hIdx) : qIdx >= 0 ? qIdx : hIdx >= 0 ? hIdx : -1;
    if (splitIdx >= 0) {
      pathname = currentPath.slice(0, splitIdx);
      suffix = currentPath.slice(splitIdx);
    } else {
      pathname = currentPath;
    }
  }

  // Detect current locale from pathname
  const segments = pathname.split("/");
  const currentLocaleSegment = segments[1] || "";
  const defaultLocale = getDefaultLocale();

  const currentLocale =
    locales.length > 0 && locales.includes(currentLocaleSegment)
      ? currentLocaleSegment
      : currentLocaleSegment === defaultLocale
        ? defaultLocale
        : null;

  // No locale detected in path → prepend nextLocale
  if (!currentLocale) {
    return `/${nextLocale}${pathname}${suffix}`;
  }

  // Extract rest of path after locale segment
  const restPath = "/" + segments.slice(2).join("/");

  const routes = getRoutes();

  // Try to match against route templates
  if (routes) {
    for (const routeKey of Object.keys(routes)) {
      const routeEntry = routes[routeKey];
      const currentTemplate = routeEntry[currentLocale];
      if (!currentTemplate) continue;

      const { regex, paramNames } = templateToRegex(currentTemplate);
      const match = restPath.match(regex);

      if (match) {
        const nextTemplate = routeEntry[nextLocale];
        if (!nextTemplate) {
          // No template for nextLocale → fallback
          break;
        }

        // Extract params from match
        const params: Record<string, string> = {};
        paramNames.forEach((name, idx) => {
          params[name] = match[idx + 1];
        });

        const nextPath = substituteParams(nextTemplate, params, false);
        return `/${nextLocale}${nextPath}${suffix}`;
      }
    }
  }

  // Fallback: just swap locale prefix
  return `/${nextLocale}${restPath}${suffix}`;
}
