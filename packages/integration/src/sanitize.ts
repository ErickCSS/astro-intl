import sanitize from "sanitize-html";

// ─── Locale validation ──────────────────────────────────────────────

const LOCALE_REGEX = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/;

export function sanitizeLocale(locale: string): string {
  const trimmed = locale.trim();
  if (!LOCALE_REGEX.test(trimmed)) {
    throw new Error(
      `[astro-intl] Invalid locale "${trimmed}". Locale must be a valid BCP-47 language tag (e.g. "en", "es", "pt-BR").`
    );
  }
  return trimmed;
}

// ─── Regex escape ───────────────────────────────────────────────────

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── HTML sanitisation ──────────────────────────────────────────────

const SAFE_HTML_TAGS = [
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "i",
  "kbd",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "ul",
] as const;

const SAFE_HTML_TAG_SET = new Set<string>(SAFE_HTML_TAGS);

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isAllowedHtmlTag(tag: string): boolean {
  return SAFE_HTML_TAG_SET.has(tag.toLowerCase());
}

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [...SAFE_HTML_TAGS],
    allowedAttributes: {
      a: ["href", "target", "rel", "title", "class"],
      code: ["class"],
      pre: ["class"],
      span: ["class"],
      strong: ["class"],
      em: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    parseStyleAttributes: false,
    transformTags: {
      a: (tagName, attribs) => {
        const next = { ...attribs };
        if (next.target !== "_blank" && next.target !== "_self") {
          delete next.target;
        }
        if (next.target === "_blank") {
          const rel = new Set((next.rel ?? "").split(/\s+/).filter(Boolean));
          rel.add("noopener");
          rel.add("noreferrer");
          next.rel = [...rel].join(" ");
        }
        return { tagName, attribs: next };
      },
    },
  });
}

// ─── Prototype-pollution guard ──────────────────────────────────────

export const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
