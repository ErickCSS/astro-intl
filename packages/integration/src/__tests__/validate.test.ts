import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../cli.js";
import { validateCatalogs } from "../validate.js";

const temporaryDirectories: string[] = [];

async function createCatalogDirectory(catalogs: Record<string, unknown>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "astro-intl-catalogs-"));
  temporaryDirectories.push(root);
  const messages = join(root, "messages");
  await mkdir(messages);
  for (const [locale, catalog] of Object.entries(catalogs)) {
    const content = typeof catalog === "string" ? catalog : JSON.stringify(catalog);
    await writeFile(join(messages, `${locale}.json`), content);
  }
  return messages;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true }))
  );
});

describe("validateCatalogs", () => {
  it("accepts equivalent nested catalogs and placeholder sets", () => {
    const result = validateCatalogs(
      {
        en: { hero: { title: "Hello {name} {name}", items: ["one {count}"] } },
        es: { hero: { title: "Hola {name}", items: ["uno {count}", "dos"] } },
      },
      { referenceLocale: "en" }
    );

    expect(result).toEqual({ valid: true, diagnostics: [] });
  });

  it("reports missing and extra keys in deterministic order", () => {
    const result = validateCatalogs(
      {
        en: { common: { alpha: "A", beta: "B" } },
        es: { common: { beta: "B", gamma: "C" } },
      },
      { referenceLocale: "en" }
    );

    expect(result.valid).toBe(false);
    expect(result.diagnostics.map(({ code, key }) => [code, key])).toEqual([
      ["missing-key", "common.alpha"],
      ["extra-key", "common.gamma"],
    ]);
  });

  it("reports incompatible value types and placeholders", () => {
    const result = validateCatalogs(
      {
        en: { count: 1, greeting: "Hello {name} from {place}" },
        es: { count: "uno", greeting: "Hola {name}" },
      },
      { referenceLocale: "en" }
    );

    expect(result.diagnostics.map(({ code, key }) => [code, key])).toEqual([
      ["type-mismatch", "count"],
      ["placeholder-mismatch", "greeting"],
    ]);
  });

  it("rejects an unknown reference locale", () => {
    expect(() => validateCatalogs({ en: { title: "Hello" } }, { referenceLocale: "fr" })).toThrow(
      /Reference locale "fr" was not found/
    );
  });
});

describe("catalog validation CLI", () => {
  it("returns zero for valid catalogs", async () => {
    const directory = await createCatalogDirectory({
      en: { title: "Hello {name}" },
      es: { title: "Hola {name}" },
    });
    const stdout: string[] = [];
    const stderr: string[] = [];

    const exitCode = await runCli(["validate", "--dir", directory, "--reference", "en"], {
      stdout: (message) => stdout.push(message),
      stderr: (message) => stderr.push(message),
    });

    expect(exitCode).toBe(0);
    expect(stdout).toEqual([expect.stringContaining("Catalogs valid")]);
    expect(stderr).toEqual([]);
  });

  it("returns one and sorted diagnostics for catalog differences", async () => {
    const directory = await createCatalogDirectory({
      en: { alpha: "Hello {name}", beta: "B" },
      es: { alpha: "Hola {other}", gamma: "C" },
    });
    const stderr: string[] = [];

    const exitCode = await runCli(["validate", "--dir", directory, "--reference", "en"], {
      stdout: () => undefined,
      stderr: (message) => stderr.push(message),
    });

    expect(exitCode).toBe(1);
    expect(stderr.slice(1)).toEqual([
      expect.stringContaining("[placeholder-mismatch]"),
      expect.stringContaining("[missing-key]"),
      expect.stringContaining("[extra-key]"),
    ]);
  });

  it("returns two for malformed JSON and usage errors", async () => {
    const directory = await createCatalogDirectory({
      en: { title: "Hello" },
      es: "{not-json",
    });
    const stderr: string[] = [];

    await expect(
      runCli(["validate", "--dir", directory, "--reference", "en"], {
        stdout: () => undefined,
        stderr: (message) => stderr.push(message),
      })
    ).resolves.toBe(2);
    expect(stderr[0]).toContain("Could not parse");

    await expect(
      runCli(["validate"], { stdout: () => undefined, stderr: () => undefined })
    ).resolves.toBe(2);
  });
});
