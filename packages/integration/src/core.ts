import type { RequestConfig } from "./types/index.js";
import { createGetTranslationsReact } from "./react.js";

// --- Security helpers ---

const LOCALE_REGEX = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;

function sanitizeLocale(locale: string): string {
  const trimmed = locale.trim();
  if (!LOCALE_REGEX.test(trimmed)) {
    throw new Error(
      `[astro-intl] Invalid locale "${trimmed}". Locale must be a valid BCP-47 language tag (e.g. "en", "es", "pt-BR").`,
    );
  }
  return trimmed;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const DANGEROUS_HTML_REGEX =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|select|meta|link|base|applet|style)\b[^>]*>/gi;
const EVENT_HANDLER_REGEX = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URI_REGEX = /\b(href|src|action)\s*=\s*["']\s*javascript\s*:/gi;
const DATA_URI_REGEX = /\b(href|src|action)\s*=\s*["']\s*data\s*:/gi;

function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_HTML_REGEX, "")
    .replace(EVENT_HANDLER_REGEX, "")
    .replace(JAVASCRIPT_URI_REGEX, "")
    .replace(DATA_URI_REGEX, "");
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// Global context para almacenar la configuración del request actual
let globalRequestConfig: {
  locale: string;
  messages: Record<string, unknown>;
} | null = null;

export type DotPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}` | `${K}.${DotPaths<T[K]>}` : `${K}`;
    }[keyof T & string]
  : never;

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (FORBIDDEN_KEYS.has(key)) return undefined;
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Configurar el request actual
export async function setRequestLocale(
  url: URL,
  getConfig: (locale: string) => Promise<RequestConfig> | RequestConfig,
) {
  const [, lang] = url.pathname.split("/");
  const locale = sanitizeLocale(lang || "en");

  const config = await getConfig(locale);
  globalRequestConfig = {
    locale: config.locale,
    messages: config.messages,
  };
}

// Obtener el locale actual
export function getLocale(): string {
  if (!globalRequestConfig) {
    throw new Error("[astro-intl] No request config found. Did you call setRequestLocale()?");
  }
  return globalRequestConfig.locale;
}

// Obtener traducciones sin pasar locale
export function getTranslations<T extends Record<string, unknown> = Record<string, unknown>>(
  namespace?: string,
) {
  if (!globalRequestConfig) {
    throw new Error("[astro-intl] No request config found. Did you call setRequestLocale()?");
  }

  const messages = namespace
    ? (globalRequestConfig.messages[namespace] as T)
    : (globalRequestConfig.messages as T);

  function t(key: DotPaths<T>): string {
    const value = getNestedValue(messages as Record<string, unknown>, key);
    return (typeof value === "string" ? value : key) as string;
  }

  (t as any).markup = function (key: DotPaths<T>, tags: Record<string, (chunks: string) => string>): string {
    let str = t(key);

    for (const [tag, fn] of Object.entries(tags)) {
      const escaped = escapeRegExp(tag);
      const regex = new RegExp(`<${escaped}>(.*?)</${escaped}>`, "g");
      str = str.replace(regex, (_, chunks) => fn(chunks));
    }

    return sanitizeHtml(str);
  };

  return t as typeof t & {
    markup: (key: DotPaths<T>, tags: Record<string, (chunks: string) => string>) => string;
  };
}

// Obtener traducciones para React
export function getTranslationsReact<T extends Record<string, unknown> = Record<string, unknown>>(
  namespace?: string,
) {
  if (!globalRequestConfig) {
    throw new Error("[astro-intl] No request config found. Did you call setRequestLocale()?");
  }

  const messages = namespace
    ? (globalRequestConfig.messages[namespace] as T)
    : (globalRequestConfig.messages as T);

  return createGetTranslationsReact(
    { [globalRequestConfig.locale]: { default: messages } } as any,
    globalRequestConfig.locale as any,
  )(globalRequestConfig.locale, "default" as any);
}
