#!/usr/bin/env node

/**
 * Replaces "workspace:*" references in docs/astro-intl-i18n/package.json
 * with the actual published version from packages/integration/package.json.
 *
 * Usage:
 *   node scripts/prepare-docs-deploy.mjs          # swap to published version
 *   node scripts/prepare-docs-deploy.mjs --restore # restore workspace:*
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const docsPackagePath = resolve(root, "docs/astro-intl-i18n/package.json");
const integrationPackagePath = resolve(root, "packages/integration/package.json");

const restore = process.argv.includes("--restore");

const docsPkg = JSON.parse(readFileSync(docsPackagePath, "utf-8"));

if (restore) {
  if (docsPkg.dependencies["astro-intl"] !== "workspace:*") {
    docsPkg.dependencies["astro-intl"] = "workspace:*";
    writeFileSync(docsPackagePath, JSON.stringify(docsPkg, null, 2) + "\n");
    console.log("✔ Restored astro-intl to workspace:*");
  } else {
    console.log("ℹ Already using workspace:*");
  }
} else {
  const integrationPkg = JSON.parse(readFileSync(integrationPackagePath, "utf-8"));
  const version = `^${integrationPkg.version}`;

  if (docsPkg.dependencies["astro-intl"] === "workspace:*") {
    docsPkg.dependencies["astro-intl"] = version;
    writeFileSync(docsPackagePath, JSON.stringify(docsPkg, null, 2) + "\n");
    console.log(`✔ Replaced workspace:* → ${version}`);
  } else {
    console.log(`ℹ Already set to ${docsPkg.dependencies["astro-intl"]}`);
  }
}
