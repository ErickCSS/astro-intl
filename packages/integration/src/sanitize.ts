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

// ─── HTML sanitisation (defence-in-depth, NOT a full sanitiser) ─────

const DANGEROUS_HTML_REGEX =
  /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|select|meta|link|base|applet|style)\b[^>]*>/gi;
const EVENT_HANDLER_REGEX = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URI_REGEX = /\b(href|src|action)\s*=\s*["']\s*javascript\s*:/gi;
const DATA_URI_REGEX = /\b(href|src|action)\s*=\s*["']\s*data\s*:/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_HTML_REGEX, "")
    .replace(EVENT_HANDLER_REGEX, "")
    .replace(JAVASCRIPT_URI_REGEX, "")
    .replace(DATA_URI_REGEX, "");
}

// ─── Prototype-pollution guard ──────────────────────────────────────

export const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
