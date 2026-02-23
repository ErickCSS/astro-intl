import type { RequestConfig } from "./types/index.js";
import { createGetTranslationsReact } from "./react.js";

// Global context para almacenar la configuración del request actual
let globalRequestConfig: {
  locale: string;
  messages: Record<string, unknown>;
} | null = null;

export type DotPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}` | `${K}.${DotPaths<T[K]>}`
        : `${K}`;
    }[keyof T & string]
  : never;

export function getNestedValue(
  obj: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
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
  const locale = lang || "en"; // Fallback temporal

  const config = await getConfig(locale);
  globalRequestConfig = {
    locale: config.locale,
    messages: config.messages,
  };
}

// Obtener el locale actual
export function getLocale(): string {
  if (!globalRequestConfig) {
    throw new Error(
      "[astro-intl] No request config found. Did you call setRequestLocale()?",
    );
  }
  return globalRequestConfig.locale;
}

// Obtener traducciones sin pasar locale
export function getTranslations<
  T extends Record<string, unknown> = Record<string, unknown>,
>(namespace?: string) {
  if (!globalRequestConfig) {
    throw new Error(
      "[astro-intl] No request config found. Did you call setRequestLocale()?",
    );
  }

  const messages = namespace
    ? (globalRequestConfig.messages[namespace] as T)
    : (globalRequestConfig.messages as T);

  function t(key: DotPaths<T>): string {
    const value = getNestedValue(messages as Record<string, unknown>, key);
    return (typeof value === "string" ? value : key) as string;
  }

  (t as any).markup = function (
    key: DotPaths<T>,
    tags: Record<string, (chunks: string) => string>,
  ): string {
    let str = t(key);

    for (const [tag, fn] of Object.entries(tags)) {
      const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, "g");
      str = str.replace(regex, (_, chunks) => fn(chunks));
    }

    return str;
  };

  return t as typeof t & {
    markup: (
      key: DotPaths<T>,
      tags: Record<string, (chunks: string) => string>,
    ) => string;
  };
}

// Obtener traducciones para React
export function getTranslationsReact<
  T extends Record<string, unknown> = Record<string, unknown>,
>(namespace?: string) {
  if (!globalRequestConfig) {
    throw new Error(
      "[astro-intl] No request config found. Did you call setRequestLocale()?",
    );
  }

  const messages = namespace
    ? (globalRequestConfig.messages[namespace] as T)
    : (globalRequestConfig.messages as T);

  return createGetTranslationsReact(
    { [globalRequestConfig.locale]: { default: messages } } as any,
    globalRequestConfig.locale as any,
  )(globalRequestConfig.locale, "default" as any);
}
