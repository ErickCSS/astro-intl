import type { I18nConfig } from "./types";
import { createGetTranslationsReact } from "./react";

export type DotPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}` | `${K}.${DotPaths<T[K]>}` : `${K}`;
    }[keyof T & string]
  : never;

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function createTranslationGetter<
  UI extends Record<string, Record<string, unknown>>,
  DefaultLocale extends keyof UI,
  N extends keyof UI[DefaultLocale],
>(ui: UI, defaultLocale: DefaultLocale, lang: string | undefined, namespace: N) {
  type Locale = keyof UI;
  type Messages = UI[DefaultLocale][N];

  const resolvedLang: Locale = lang && lang in ui ? (lang as Locale) : defaultLocale;
  const localeMessages = (ui[resolvedLang] as UI[DefaultLocale])[namespace] as Messages;
  const fallbackMessages = (ui[defaultLocale] as UI[DefaultLocale])[namespace] as Messages;

  function t(key: DotPaths<Messages>): string {
    const value =
      getNestedValue(localeMessages as Record<string, unknown>, key) ??
      getNestedValue(fallbackMessages as Record<string, unknown>, key);

    return (typeof value === "string" ? value : key) as string;
  }

  return { t, localeMessages, fallbackMessages };
}

export function createI18n<
  UI extends Record<string, Record<string, unknown>>,
  DefaultLocale extends keyof UI,
>(config: I18nConfig<UI, DefaultLocale>) {
  const { ui, defaultLocale } = config;

  type Locale = keyof UI;
  type Namespace = keyof UI[DefaultLocale];

  function getLangFromUrl(url: URL): Locale {
    const [, lang] = url.pathname.split("/");
    if (lang && lang in ui) return lang as Locale;
    return defaultLocale;
  }

  function getTranslations<N extends Namespace>(lang: string | undefined, namespace: N) {
    type Messages = UI[DefaultLocale][N];

    const { t } = createTranslationGetter(ui, defaultLocale, lang, namespace);

    (t as any).markup = function (
      key: DotPaths<Messages>,
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
      markup: (key: DotPaths<Messages>, tags: Record<string, (chunks: string) => string>) => string;
    };
  }

  return {
    ui,
    defaultLocale,
    getLangFromUrl,
    getTranslations,
    getTranslationsReact: createGetTranslationsReact(ui, defaultLocale),
  };
}
