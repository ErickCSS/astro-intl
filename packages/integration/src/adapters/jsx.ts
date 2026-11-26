import { parseRichSegments, type RichSegment } from "../framework-base.js";
import { getNestedValue, type DotPaths } from "../interpolation.js";
import { getMessages } from "../store.js";

export type JsxTranslator<Messages, Child> = {
  (key: DotPaths<Messages>): string;
  rich(key: DotPaths<Messages>, tags: Record<string, (chunks: Child) => Child>): Child[];
};

// Each framework checks text and nested children against its own renderable type.
export function createJsxAdapter<Child>(asChild: (value: string | Child[]) => Child) {
  function translator<Messages>(messages: Messages): JsxTranslator<Messages, Child> {
    function t(key: DotPaths<Messages>): string {
      const value = getNestedValue(messages as Record<string, unknown>, key);
      return typeof value === "string" ? value : key;
    }

    function rich(
      key: DotPaths<Messages>,
      tags: Record<string, (chunks: Child) => Child>
    ): Child[] {
      const names = Object.keys(tags);
      function render(segment: RichSegment): Child {
        if (segment.type === "text") return asChild(segment.value);
        const inner = parseRichSegments(segment.chunks, names);
        const chunks = asChild(
          inner.some((part) => part.type === "tag") ? inner.map(render) : segment.chunks
        );
        const callback = tags[segment.tag];
        if (typeof callback !== "function") {
          console.warn(
            `[astro-intl] Unregistered rich tag: <${segment.tag}>. Content will render without transformation.`
          );
          return chunks;
        }
        return callback(chunks);
      }
      return parseRichSegments(t(key), names).map(render);
    }

    return Object.assign(t, { rich });
  }

  function createGetTranslations<
    UI extends Record<string, Record<string, unknown>>,
    DefaultLocale extends keyof UI,
  >(ui: UI, defaultLocale: DefaultLocale) {
    return function getTranslations<N extends keyof UI[DefaultLocale]>(
      lang: string | undefined,
      namespace: N
    ) {
      const locale = lang && lang in ui ? lang : defaultLocale;
      return translator((ui[locale] as UI[DefaultLocale])[namespace]);
    };
  }

  function getTranslations<T extends Record<string, unknown> = Record<string, unknown>>(
    namespace?: string
  ) {
    return translator(getMessages<T>(namespace));
  }

  return { createGetTranslations, getTranslations };
}
