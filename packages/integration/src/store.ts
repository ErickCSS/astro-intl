import type {
  GetRequestConfigFn,
  MessagesConfig,
  IntlConfig,
  RequestConfig,
} from "./types/index.js";
import { sanitizeLocale } from "./sanitize.js";

// ─── Types ──────────────────────────────────────────────────────────

type RequestState = {
  locale: string;
  messages: Record<string, unknown>;
};

// ─── Configuration (set once at startup) ────────────────────────────

let registeredGetRequestConfig: GetRequestConfigFn | null = null;
let configMessages: MessagesConfig | null = null;
let intlConfig: IntlConfig = { defaultLocale: "en" };

// ─── AsyncLocalStorage detection ────────────────────────────────────

interface ALS<T> {
  getStore(): T | undefined;
  run<R>(store: T, fn: () => R): R;
}

let als: ALS<RequestState> | null = null;

let alsInitialized = false;

function ensureAls(): void {
  if (alsInitialized) return;
  alsInitialized = true;
  try {
    const g = globalThis as unknown as { AsyncLocalStorage?: new <T>() => ALS<T> };
    if (typeof g.AsyncLocalStorage === "function") {
      als = new g.AsyncLocalStorage<RequestState>();
    }
  } catch {
    // Not available — fallback mode
  }
}

// ─── Fallback global variable (for runtimes without ALS) ────────────

let fallbackState: RequestState | null = null;

// ─── Internal getters/setters ───────────────────────────────────────

function getRequestState(): RequestState | null {
  ensureAls();
  if (als) {
    return als.getStore() ?? null;
  }
  return fallbackState;
}

// ─── Public API ─────────────────────────────────────────────────────

export function __setIntlConfig(config: Partial<IntlConfig>) {
  if (config.defaultLocale) {
    intlConfig = { ...intlConfig, defaultLocale: config.defaultLocale };
  }
}

export function getDefaultLocale(): string {
  return intlConfig.defaultLocale;
}

export function defineRequestConfig(
  fn: (locale: string) => Promise<RequestConfig> | RequestConfig
): GetRequestConfigFn {
  registeredGetRequestConfig = fn;
  return fn;
}

export function __setConfigMessages(messages: MessagesConfig) {
  configMessages = messages;
}

export function __resetRequestConfig() {
  registeredGetRequestConfig = null;
  configMessages = null;
  fallbackState = null;
  intlConfig = { defaultLocale: "en" };
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

export async function setRequestLocale(url: URL, getConfig?: GetRequestConfigFn) {
  const [, lang] = url.pathname.split("/");
  const locale = sanitizeLocale(lang || intlConfig.defaultLocale);

  const resolvedGetConfig = getConfig ?? registeredGetRequestConfig;

  let state: RequestState;

  if (resolvedGetConfig) {
    const config = await resolvedGetConfig(locale);
    state = {
      locale: config.locale,
      messages: config.messages,
    };
  } else if (configMessages) {
    const messages = await resolveMessages(locale, configMessages);
    state = { locale, messages };
  } else {
    throw new Error(
      "[astro-intl] No getRequestConfig or messages provided. " +
        "Either pass getConfig to setRequestLocale(), use defineRequestConfig(), or add messages to the integration options."
    );
  }

  fallbackState = state;
}

// ─── runWithLocale (concurrency-safe via AsyncLocalStorage) ─────────

export async function runWithLocale<R>(
  url: URL,
  fn: () => R | Promise<R>,
  getConfig?: GetRequestConfigFn
): Promise<R> {
  const [, lang] = url.pathname.split("/");
  const locale = sanitizeLocale(lang || intlConfig.defaultLocale);

  const resolvedGetConfig = getConfig ?? registeredGetRequestConfig;

  let state: RequestState;

  if (resolvedGetConfig) {
    const config = await resolvedGetConfig(locale);
    state = { locale: config.locale, messages: config.messages };
  } else if (configMessages) {
    const messages = await resolveMessages(locale, configMessages);
    state = { locale, messages };
  } else {
    throw new Error(
      "[astro-intl] No getRequestConfig or messages provided. " +
        "Either pass getConfig to setRequestLocale(), use defineRequestConfig(), or add messages to the integration options."
    );
  }

  if (als) {
    return als.run(state, () => {
      fallbackState = state;
      return fn();
    });
  }

  fallbackState = state;
  return fn();
}

// ─── Read current state ─────────────────────────────────────────────

export function getLocale(): string {
  const state = getRequestState();
  if (!state) {
    throw new Error("[astro-intl] No request config found. Did you call setRequestLocale()?");
  }
  return state.locale;
}

export function getMessages<T extends Record<string, unknown> = Record<string, unknown>>(
  namespace?: string
): T {
  const state = getRequestState();
  if (!state) {
    throw new Error("[astro-intl] No request config found. Did you call setRequestLocale()?");
  }

  return namespace ? (state.messages[namespace] as T) : (state.messages as T);
}

export function getRequestLocale(): string {
  return getLocale();
}
