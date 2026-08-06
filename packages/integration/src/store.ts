import type {
  GetRequestConfigFn,
  MessagesConfig,
  IntlConfig,
  RequestConfig,
  RoutesMap,
  FallbackRouteInfo,
} from "./types/index.js";
import { sanitizeLocale } from "./sanitize.js";

// ─── Types ──────────────────────────────────────────────────────────

type RequestState = {
  locale: string;
  messages: Record<string, unknown>;
};

let AsyncLocalStorageConstructor: (new <T>() => ALS<T>) | null = null;

try {
  const asyncHooks = await import("node:async_hooks");
  AsyncLocalStorageConstructor = asyncHooks.AsyncLocalStorage;
} catch {
  // Non-Node runtimes are handled explicitly when SSR state is requested.
}

// ─── Global singleton ───────────────────────────────────────────────
// When bundlers (Vite) resolve workspace-linked packages, sub-path
// exports like "astro-intl/middleware" may get a separate module
// instance from "astro-intl". Using a Symbol-keyed global ensures all
// copies share the same mutable state.

interface ALS<T> {
  getStore(): T | undefined;
  run<R>(store: T, fn: () => R): R;
  enterWith(store: T): void;
}

interface IntlGlobalState {
  registeredGetRequestConfig: GetRequestConfigFn | null;
  configMessages: MessagesConfig | null;
  intlConfig: IntlConfig;
  als: ALS<RequestState | null> | null;
  clientState: RequestState | null;
}

const GLOBAL_KEY = Symbol.for("__astro_intl_store__");
const g = globalThis as unknown as Record<symbol, IntlGlobalState | undefined>;

function getGlobalState(): IntlGlobalState {
  const existing = g[GLOBAL_KEY];
  if (existing) return existing;
  const fresh: IntlGlobalState = {
    registeredGetRequestConfig: null,
    configMessages: null,
    intlConfig: { defaultLocale: "en", locales: [] },
    als: null,
    clientState: null,
  };
  g[GLOBAL_KEY] = fresh;
  return fresh;
}

const $ = getGlobalState();

// ─── AsyncLocalStorage ───────────────────────────────────────────────

function ensureAls(): ALS<RequestState | null> | null {
  if (typeof window !== "undefined") return null;
  if ($.als) return $.als;
  if (AsyncLocalStorageConstructor) {
    $.als = new AsyncLocalStorageConstructor<RequestState | null>();
  }
  return $.als;
}

// ─── Internal getters/setters ───────────────────────────────────────

function getRequestState(): RequestState | null {
  if (typeof window !== "undefined") return $.clientState;
  return $.als?.getStore() ?? null;
}

function clearRequestState(): void {
  if (typeof window !== "undefined") {
    $.clientState = null;
    return;
  }
  const als = ensureAls();
  als?.enterWith(null);
}

// ─── Public API ─────────────────────────────────────────────────────

export function __setIntlConfig(config: Partial<IntlConfig>) {
  const nextDefaultLocale = config.defaultLocale
    ? sanitizeLocale(config.defaultLocale)
    : $.intlConfig.defaultLocale;
  const nextLocales = config.locales
    ? config.locales.map((locale) => sanitizeLocale(locale))
    : $.intlConfig.locales;

  if (nextLocales.length > 0 && !nextLocales.includes(nextDefaultLocale)) {
    throw new Error(
      `[astro-intl] defaultLocale "${nextDefaultLocale}" must be included in configured locales: ${nextLocales.join(", ")}`
    );
  }

  $.intlConfig = {
    ...$.intlConfig,
    defaultLocale: nextDefaultLocale,
    locales: nextLocales,
  };
  if (config.routes) {
    $.intlConfig = { ...$.intlConfig, routes: config.routes };
    detectRouteConflicts(config.routes);
  }
}

export function getDefaultLocale(): string {
  return $.intlConfig.defaultLocale;
}

export function getRoutes(): RoutesMap | undefined {
  return $.intlConfig.routes;
}

export function getLocales(): string[] {
  return $.intlConfig.locales;
}

export function isValidLocale(locale: string): boolean {
  let sanitized: string;
  try {
    sanitized = sanitizeLocale(locale);
  } catch {
    return false;
  }
  if ($.intlConfig.locales.length === 0) return true;
  return $.intlConfig.locales.includes(sanitized);
}

export function defineRequestConfig(
  fn: (locale: string) => Promise<RequestConfig> | RequestConfig
): GetRequestConfigFn {
  $.registeredGetRequestConfig = fn;
  return fn;
}

export function __setConfigMessages(messages: MessagesConfig) {
  $.configMessages = messages;
}

export function __resetRequestConfig() {
  $.registeredGetRequestConfig = null;
  $.configMessages = null;
  $.clientState = null;
  $.als = null;
  $.intlConfig = { defaultLocale: "en", locales: [], routes: undefined, fallbackRoutes: [] };
}

// ─── Fallback routes (Astro 6.1+ astro:routes:resolved) ─────────────

export function setFallbackRoutes(routes: FallbackRouteInfo[]): void {
  $.intlConfig = { ...$.intlConfig, fallbackRoutes: routes };
}

export function getFallbackRoutes(): FallbackRouteInfo[] {
  return $.intlConfig.fallbackRoutes ?? [];
}

// ─── Route conflict detection ────────────────────────────────────────

function normalizeTemplate(template: string): string {
  return template.replace(/\[\w+\]/g, "[*]");
}

function detectRouteConflicts(routes: RoutesMap): void {
  const keys = Object.keys(routes);
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = routes[keys[i]];
      const b = routes[keys[j]];
      for (const locale of Object.keys(a)) {
        if (!b[locale]) continue;
        if (a[locale] === b[locale]) {
          throw new Error(
            `[astro-intl] Duplicate route template for locale "${locale}": ` +
              `"${keys[i]}" and "${keys[j]}" both use "${a[locale]}". ` +
              `Each routeKey must have a unique template per locale.`
          );
        }
        if (normalizeTemplate(a[locale]) === normalizeTemplate(b[locale])) {
          console.warn(
            `[astro-intl] ⚠️  Route conflict detected for locale "${locale}":\n` +
              `  "${keys[i]}" (${a[locale]})\n` +
              `  "${keys[j]}" (${b[locale]})\n` +
              `  Both templates match the same pattern. "${keys[i]}" will take priority.`
          );
        }
      }
    }
  }
}

// ─── Resolve messages from MessagesConfig ───────────────────────────

async function resolveMessages(
  locale: string,
  source: MessagesConfig
): Promise<Record<string, unknown>> {
  const entry = source[locale];
  if (!entry) {
    throw new Error(
      `[astro-intl] No messages found for locale "${locale}". Available locales: ${Object.keys(source).join(", ")}`
    );
  }
  if (typeof entry === "function") {
    const result = await entry();
    return (
      (result as { default?: Record<string, unknown> }).default ??
      (result as Record<string, unknown>)
    );
  }
  return entry;
}

// ─── setRequestLocale ───────────────────────────────────────────────

export async function setRequestLocale(url: URL, getConfig?: GetRequestConfigFn): Promise<boolean> {
  const [, lang] = url.pathname.split("/");

  if (lang && $.intlConfig.locales.length > 0 && !$.intlConfig.locales.includes(lang)) {
    clearRequestState();
    return false;
  }

  const locale = sanitizeLocale(lang || $.intlConfig.defaultLocale);

  const resolvedGetConfig = getConfig ?? $.registeredGetRequestConfig;

  const state: RequestState = { locale, messages: {} };
  const als = typeof window === "undefined" ? ensureAls() : null;
  if (typeof window === "undefined") {
    if (!als) {
      throw new Error(
        "[astro-intl] This SSR runtime does not provide AsyncLocalStorage. " +
          "Request state cannot be isolated safely; use a supported Node runtime or static rendering."
      );
    }
    // Enter before the first await so the caller's continuation inherits this request context.
    als.enterWith(state);
  }

  try {
    if (resolvedGetConfig) {
      const config = await resolvedGetConfig(locale);
      state.locale = sanitizeLocale(config.locale);
      state.messages = config.messages;
    } else if ($.configMessages) {
      const messages = await resolveMessages(locale, $.configMessages);
      state.messages = messages;
    } else {
      // No config available — this can happen when Astro 6's built-in i18n
      // router triggers internal reroutes before the user middleware runs.
      // Return false so the caller can decide what to do.
      clearRequestState();
      return false;
    }
  } catch (error) {
    clearRequestState();
    throw error;
  }

  if (typeof window !== "undefined") {
    $.clientState = state;
    return true;
  }

  return true;
}

// ─── runWithLocale (concurrency-safe via AsyncLocalStorage) ─────────

export async function runWithLocale<R>(
  url: URL,
  fn: () => R | Promise<R>,
  getConfig?: GetRequestConfigFn
): Promise<R> {
  const [, lang] = url.pathname.split("/");
  const locale = sanitizeLocale(lang || $.intlConfig.defaultLocale);

  const resolvedGetConfig = getConfig ?? $.registeredGetRequestConfig;

  let state: RequestState;

  if (resolvedGetConfig) {
    const config = await resolvedGetConfig(locale);
    state = { locale: sanitizeLocale(config.locale), messages: config.messages };
  } else if ($.configMessages) {
    const messages = await resolveMessages(locale, $.configMessages);
    state = { locale, messages };
  } else {
    throw new Error(
      "[astro-intl] No getRequestConfig or messages provided. " +
        "Either pass getConfig to setRequestLocale(), use defineRequestConfig(), or add messages to the integration options."
    );
  }

  if (typeof window !== "undefined") {
    const previous = $.clientState;
    $.clientState = state;
    try {
      return await fn();
    } finally {
      $.clientState = previous;
    }
  }

  const als = ensureAls();
  if (!als) {
    throw new Error(
      "[astro-intl] This SSR runtime does not provide AsyncLocalStorage. " +
        "Request state cannot be isolated safely; use a supported Node runtime or static rendering."
    );
  }
  return als.run(state, fn);
}

// ─── Auto-detect locale from URL (for static mode without explicit setRequestLocale) ────────────────────────────────────────────

function autoDetectLocaleFromUrl(): string | null {
  // Try to detect from browser URL (client-side)
  if (typeof window !== "undefined" && window.location) {
    const pathname = window.location.pathname;
    const [, lang] = pathname.split("/");
    if (lang && ($.intlConfig.locales.length === 0 || $.intlConfig.locales.includes(lang))) {
      return sanitizeLocale(lang);
    }
    return $.intlConfig.defaultLocale;
  }
  return null;
}

// ─── Read current state ─────────────────────────────────────────────

export function getLocale(): string {
  const state = getRequestState();
  if (state) {
    return state.locale;
  }

  // Try auto-detection for static mode
  const detectedLocale = autoDetectLocaleFromUrl();
  if (detectedLocale) {
    return detectedLocale;
  }

  throw new Error("[astro-intl] No request config found. Did you call setRequestLocale()?");
}

export function getMessages<T extends Record<string, unknown> = Record<string, unknown>>(
  namespace?: string
): T {
  const state = getRequestState();
  if (state) {
    return namespace ? (state.messages[namespace] as T) : (state.messages as T);
  }

  // For async initialization case, throw with helpful message
  // The user should either call setRequestLocale or we need to be in a context
  // where auto-initialization has already happened
  throw new Error("[astro-intl] No request config found. Did you call setRequestLocale()?");
}

export function getRequestLocale(): string {
  return getLocale();
}
