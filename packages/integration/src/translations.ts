import type { Primitive } from "./types/index.js";
import { getMessages } from "./store.js";
import { getNestedValue, interpolateValues, type DotPaths } from "./interpolation.js";
import { escapeRegExp, sanitizeHtml } from "./sanitize.js";

// ─── getTranslations (Astro / plain HTML) ───────────────────────────

export function getTranslations<T extends Record<string, unknown> = Record<string, unknown>>(
  namespace?: string
) {
  const messages = getMessages<T>(namespace);

  function t(key: DotPaths<T>, values?: Record<string, Primitive>): string {
    const value = getNestedValue(messages as Record<string, unknown>, key);
    const str = typeof value === "string" ? value : (key as string);
    return interpolateValues(str, values);
  }

  const markup = function (
    key: DotPaths<T>,
    options:
      | Record<string, (chunks: string) => string>
      | {
          values?: Record<string, Primitive>;
          tags: Record<string, (chunks: string) => string>;
        }
  ): string {
    const isOptionsObject =
      "tags" in options && typeof (options as { tags: unknown }).tags === "object";
    const tags = isOptionsObject
      ? (options as { tags: Record<string, (chunks: string) => string> }).tags
      : (options as Record<string, (chunks: string) => string>);
    const values = isOptionsObject
      ? (options as { values?: Record<string, Primitive> }).values
      : undefined;

    const raw = getNestedValue(messages as Record<string, unknown>, key);
    let str = typeof raw === "string" ? raw : (key as string);
    str = interpolateValues(str, values);

    for (const [tag, fn] of Object.entries(tags)) {
      const escaped = escapeRegExp(tag);
      const regex = new RegExp(`<${escaped}>(.*?)</${escaped}>`, "g");
      str = str.replace(regex, (_match, chunks: string) => fn(chunks));
    }

    str = sanitizeHtml(str);

    return str;
  };

  Object.assign(t, { markup });

  return t as typeof t & {
    markup: typeof markup;
  };
}
