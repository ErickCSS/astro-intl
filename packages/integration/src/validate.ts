export type Catalog = Record<string, unknown>;

export type CatalogDiagnosticCode =
  | "missing-key"
  | "extra-key"
  | "placeholder-mismatch"
  | "type-mismatch";

export type CatalogDiagnostic = {
  code: CatalogDiagnosticCode;
  locale: string;
  referenceLocale: string;
  key: string;
  message: string;
};

export type CatalogValidationOptions = {
  referenceLocale: string;
};

export type CatalogValidationResult = {
  valid: boolean;
  diagnostics: CatalogDiagnostic[];
};

const PLACEHOLDER_REGEX = /\{(\w+)\}/g;

function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function isPlainObject(value: unknown): value is Catalog {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function valueType(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value === "object" ? "object" : typeof value;
}

function placeholders(value: unknown): string[] {
  const names =
    typeof value === "string"
      ? [...value.matchAll(PLACEHOLDER_REGEX)].map((match) => match[1])
      : Array.isArray(value)
        ? value.flatMap((item) => placeholders(item))
        : [];
  return names.filter((name, index, names) => names.indexOf(name) === index).sort();
}

function compareValues(
  reference: unknown,
  candidate: unknown,
  key: string,
  locale: string,
  referenceLocale: string,
  diagnostics: CatalogDiagnostic[]
): void {
  const referenceType = valueType(reference);
  const candidateType = valueType(candidate);

  if (referenceType !== candidateType) {
    diagnostics.push({
      code: "type-mismatch",
      locale,
      referenceLocale,
      key,
      message:
        `Locale "${locale}" has type "${candidateType}" at "${key}", ` +
        `but reference locale "${referenceLocale}" has type "${referenceType}".`,
    });
    return;
  }

  if (isPlainObject(reference) && isPlainObject(candidate)) {
    const referenceKeys = Object.keys(reference).sort();
    const candidateKeys = Object.keys(candidate).sort();

    for (const childKey of referenceKeys) {
      const childPath = key ? `${key}.${childKey}` : childKey;
      if (!Object.hasOwn(candidate, childKey)) {
        diagnostics.push({
          code: "missing-key",
          locale,
          referenceLocale,
          key: childPath,
          message:
            `Locale "${locale}" is missing key "${childPath}" ` +
            `from reference locale "${referenceLocale}".`,
        });
        continue;
      }
      compareValues(
        reference[childKey],
        candidate[childKey],
        childPath,
        locale,
        referenceLocale,
        diagnostics
      );
    }

    for (const childKey of candidateKeys) {
      if (Object.hasOwn(reference, childKey)) continue;
      const childPath = key ? `${key}.${childKey}` : childKey;
      diagnostics.push({
        code: "extra-key",
        locale,
        referenceLocale,
        key: childPath,
        message:
          `Locale "${locale}" has extra key "${childPath}" ` +
          `that is absent from reference locale "${referenceLocale}".`,
      });
    }
    return;
  }

  if (
    (typeof reference === "string" && typeof candidate === "string") ||
    (Array.isArray(reference) && Array.isArray(candidate))
  ) {
    const referencePlaceholders = placeholders(reference);
    const candidatePlaceholders = placeholders(candidate);
    if (referencePlaceholders.join("\0") !== candidatePlaceholders.join("\0")) {
      diagnostics.push({
        code: "placeholder-mismatch",
        locale,
        referenceLocale,
        key,
        message:
          `Locale "${locale}" has placeholders [${candidatePlaceholders.join(", ")}] at "${key}", ` +
          `but reference locale "${referenceLocale}" has ` +
          `[${referencePlaceholders.join(", ")}].`,
      });
    }
  }
}

export function validateCatalogs(
  catalogs: Record<string, Catalog>,
  options: CatalogValidationOptions
): CatalogValidationResult {
  if (!options || typeof options.referenceLocale !== "string" || !options.referenceLocale) {
    throw new Error("[astro-intl] referenceLocale is required.");
  }

  const locales = Object.keys(catalogs).sort();
  if (!Object.hasOwn(catalogs, options.referenceLocale)) {
    throw new Error(
      `[astro-intl] Reference locale "${options.referenceLocale}" was not found. ` +
        `Available locales: ${locales.join(", ") || "none"}.`
    );
  }

  for (const locale of locales) {
    if (!isPlainObject(catalogs[locale])) {
      throw new Error(`[astro-intl] Catalog "${locale}" must contain a JSON object at its root.`);
    }
  }

  const reference = catalogs[options.referenceLocale];
  const diagnostics: CatalogDiagnostic[] = [];

  for (const locale of locales) {
    if (locale === options.referenceLocale) continue;
    compareValues(reference, catalogs[locale], "", locale, options.referenceLocale, diagnostics);
  }

  diagnostics.sort(
    (a, b) =>
      compareStrings(a.locale, b.locale) ||
      compareStrings(a.key, b.key) ||
      compareStrings(a.code, b.code)
  );

  return {
    valid: diagnostics.length === 0,
    diagnostics,
  };
}
