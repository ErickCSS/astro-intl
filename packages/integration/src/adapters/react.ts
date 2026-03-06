import type { ReactNode } from "react";
import { getNestedValue, type DotPaths } from "../interpolation.js";
import { parseRichSegments } from "../framework-base.js";
import { getMessages, getLocale } from "../store.js";

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

    const rich = function (
      key: DotPaths<Messages>,
      tags: Record<string, (chunks: ReactNode) => ReactNode>
    ): ReactNode[] {
      const str = t(key);
      const tagNames = Object.keys(tags);

      function processString(input: string): ReactNode[] {
        const segments = parseRichSegments(input, tagNames);

        return segments.map((seg) => {
          if (seg.type === "text") return seg.value;

          // Recursively process nested tags within chunks
          const innerSegments = parseRichSegments(seg.chunks, tagNames);
          const hasNestedTags = innerSegments.some((s) => s.type === "tag");
          const resolvedChunks: ReactNode = hasNestedTags ? processString(seg.chunks) : seg.chunks;

          const tagFn = tags[seg.tag];
          if (typeof tagFn !== "function") {
            console.warn(
              `[astro-intl] Unregistered rich tag: <${seg.tag}>. Content will render without transformation.`
            );
            return resolvedChunks;
          }

          return tagFn(resolvedChunks);
        });
      }

      return processString(str);
    };

    Object.assign(t, { rich });

    return t as typeof t & {
      rich: typeof rich;
    };
  };
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
