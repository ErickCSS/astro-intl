import { getNestedValue, type DotPaths } from "../interpolation.js";
import { parseRichSegments, type RichSegment } from "../framework-base.js";
import { getMessages, getLocale } from "../store.js";

export type { RichSegment } from "../framework-base.js";

// ─── createGetTranslations (standalone, no store dependency) ────────

export function createGetTranslations<
  UI extends Record<string, Record<string, unknown>>,
  DefaultLocale extends keyof UI,
>(ui: UI, defaultLocale: DefaultLocale) {
  return function getTranslations<N extends keyof UI[DefaultLocale]>(
    lang: string | undefined,
    namespace: N
  ) {
    type Messages = UI[DefaultLocale][N];

    const resolvedLang = lang && lang in ui ? lang : defaultLocale;
    const messages = (ui[resolvedLang] as UI[DefaultLocale])[namespace] as Messages;

    function t(key: DotPaths<Messages>): string {
      const value = getNestedValue(messages as Record<string, unknown>, key);
      return typeof value === "string" ? value : (key as string);
    }

    const rich = function (key: DotPaths<Messages>, tagNames?: string[]): RichSegment[] {
      const str = t(key);
      return parseRichSegments(str, tagNames ?? []);
    };

    Object.assign(t, { rich });

    return t as typeof t & {
      rich: typeof rich;
    };
  };
}

// ─── renderRichText (resolve segments into HTML string) ─────────────

export type RichTextOptions = {
  tags?: Record<string, string>;
  components?: Record<string, (chunks: string) => string>;
};

export function renderRichText(segments: RichSegment[], options: RichTextOptions = {}): string {
  const { tags = {}, components = {} } = options;

  return segments
    .map((seg) => {
      if (seg.type === "text") return seg.value;

      const componentFn = components[seg.tag];
      if (typeof componentFn === "function") return componentFn(seg.chunks);

      const htmlTag = tags[seg.tag];
      if (typeof htmlTag === "string") return `<${htmlTag}>${seg.chunks}</${htmlTag}>`;

      console.warn(
        `[astro-intl] Unregistered rich tag: <${seg.tag}>. Content will render without transformation.`
      );
      return seg.chunks;
    })
    .join("");
}

// ─── getTranslations (store-backed, for use in Astro islands) ───────

export function getTranslations<T extends Record<string, unknown> = Record<string, unknown>>(
  namespace?: string
) {
  const messages = getMessages<T>(namespace);
  const locale = getLocale();

  type UI = Record<string, Record<string, T>>;
  const ui: UI = { [locale]: { default: messages } };

  return createGetTranslations(ui, locale)(locale, "default");
}
