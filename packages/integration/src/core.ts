// ─── Store (request lifecycle) ──────────────────────────────────────
export {
  setRequestLocale,
  runWithLocale,
  getLocale,
  getMessages,
  getDefaultLocale,
  defineRequestConfig,
  __setConfigMessages,
  __resetRequestConfig,
  __setIntlConfig,
} from "./store.js";

// ─── Translations ───────────────────────────────────────────────────
export { getTranslations, getTranslationsReact } from "./translations.js";

// ─── Interpolation utilities ────────────────────────────────────────
export { getNestedValue, type DotPaths } from "./interpolation.js";

// ─── Sanitisation utilities ─────────────────────────────────────────
export { sanitizeLocale, sanitizeHtml, escapeRegExp } from "./sanitize.js";
