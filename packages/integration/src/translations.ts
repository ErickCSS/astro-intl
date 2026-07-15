import type { Primitive } from "./types/index.js";
import { getMessages } from "./store.js";
import { getNestedValue, interpolateValues, type DotPaths } from "./interpolation.js";
import { sanitizeHtml } from "./sanitize.js";

function replaceRichTag(
  input: string,
  tag: string,
  render: (chunks: string) => string
): string {
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(tag)) {
    throw new Error(`[astro-intl] Invalid markup tag name "${tag}".`);
  }

  const open = `<${tag}>`;
  const close = `</${tag}>`;
  let cursor = 0;
  let output = "";

  while (cursor < input.length) {
    const openIndex = input.indexOf(open, cursor);
    if (openIndex === -1) {
      output += input.slice(cursor);
      break;
    }

    const contentStart = openIndex + open.length;
    const closeIndex = input.indexOf(close, contentStart);
    if (closeIndex === -1) {
      output += input.slice(cursor);
      break;
    }

    output += input.slice(cursor, openIndex);
    output += render(input.slice(contentStart, closeIndex));
    cursor = closeIndex + close.length;
  }

  return output;
}

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

  function raw<K extends DotPaths<T>>(key: K): unknown {
    return getNestedValue(messages as Record<string, unknown>, key);
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
      str = replaceRichTag(str, tag, fn);
    }

    str = sanitizeHtml(str);

    return str;
  };

  Object.assign(t, { markup, raw });

  return t as typeof t & {
    markup: typeof markup;
    raw: typeof raw;
  };
}
