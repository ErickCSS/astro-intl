import type { Primitive } from "./types/index.js";
import { FORBIDDEN_KEYS } from "./sanitize.js";

// ─── Dot-path type utility ──────────────────────────────────────────

export type DotPaths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}` | `${K}.${DotPaths<T[K]>}` : `${K}`;
    }[keyof T & string]
  : never;

// ─── Nested value access ────────────────────────────────────────────

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (FORBIDDEN_KEYS.has(key)) return undefined;
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// ─── Placeholder interpolation ──────────────────────────────────────

const INTERPOLATION_REGEX = /\{(\w+)\}/g;

export function interpolateValues(str: string, values?: Record<string, Primitive>): string {
  if (!values) return str;
  return str.replace(INTERPOLATION_REGEX, (match, varName: string) => {
    const val = values[varName];
    if (val === undefined || val === null) return match;
    return String(val);
  });
}
