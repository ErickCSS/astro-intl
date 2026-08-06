#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateCatalogs, type Catalog } from "./validate.js";

type CliIO = {
  cwd: string;
  stdout: (message: string) => void;
  stderr: (message: string) => void;
};

type ParsedArguments =
  | { help: true }
  | {
      help: false;
      directory: string;
      referenceLocale: string;
    };

const USAGE = "Usage: astro-intl validate --dir <messages-directory> --reference <locale>";

function compareStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function parseArguments(args: string[]): ParsedArguments {
  if (args.includes("--help") || args.includes("-h")) return { help: true };
  if (args[0] !== "validate") {
    throw new Error(`Expected the "validate" command.\n${USAGE}`);
  }

  let directory: string | undefined;
  let referenceLocale: string | undefined;

  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--dir") {
      directory = args[++index];
    } else if (argument === "--reference") {
      referenceLocale = args[++index];
    } else {
      throw new Error(`Unknown argument "${argument}".\n${USAGE}`);
    }
  }

  if (!directory || !referenceLocale) {
    throw new Error(`Both --dir and --reference are required.\n${USAGE}`);
  }

  return { help: false, directory, referenceLocale };
}

async function readCatalogs(directory: string): Promise<Record<string, Catalog>> {
  const entries = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((a, b) => compareStrings(a.name, b.name));

  if (entries.length < 2) {
    throw new Error(
      `[astro-intl] Expected at least two JSON catalogs in "${directory}", found ${entries.length}.`
    );
  }

  const catalogs: Record<string, Catalog> = {};
  for (const entry of entries) {
    const locale = entry.name.slice(0, -".json".length);
    const filePath = resolve(directory, entry.name);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`[astro-intl] Could not parse "${filePath}": ${detail}`);
    }

    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`[astro-intl] Catalog "${filePath}" must contain a JSON object at its root.`);
    }
    catalogs[locale] = parsed as Catalog;
  }

  return catalogs;
}

export async function runCli(args: string[], io?: Partial<CliIO>): Promise<number> {
  const resolvedIO: CliIO = {
    cwd: io?.cwd ?? process.cwd(),
    stdout: io?.stdout ?? ((message) => console.log(message)),
    stderr: io?.stderr ?? ((message) => console.error(message)),
  };

  let parsed: ParsedArguments;
  try {
    parsed = parseArguments(args);
  } catch (error) {
    resolvedIO.stderr(error instanceof Error ? error.message : String(error));
    return 2;
  }

  if (parsed.help) {
    resolvedIO.stdout(USAGE);
    return 0;
  }

  const directory = resolve(resolvedIO.cwd, parsed.directory);
  try {
    const catalogs = await readCatalogs(directory);
    const result = validateCatalogs(catalogs, {
      referenceLocale: parsed.referenceLocale,
    });

    if (result.valid) {
      resolvedIO.stdout(
        `[astro-intl] Catalogs valid: ${Object.keys(catalogs).length} locales, ` +
          `reference "${parsed.referenceLocale}".`
      );
      return 0;
    }

    resolvedIO.stderr(
      `[astro-intl] Catalog validation failed with ${result.diagnostics.length} diagnostic(s).`
    );
    for (const diagnostic of result.diagnostics) {
      resolvedIO.stderr(`[${diagnostic.code}] ${diagnostic.message}`);
    }
    return 1;
  } catch (error) {
    resolvedIO.stderr(error instanceof Error ? error.message : String(error));
    return 2;
  }
}

const entryPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === entryPath) {
  process.exitCode = await runCli(process.argv.slice(2));
}
