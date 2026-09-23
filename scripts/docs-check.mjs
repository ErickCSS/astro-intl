#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  renderInlineMarkdown,
  serializeJsonLd,
} from "../docs/shared/security.mjs";
import { quickStartFiles } from "../docs/shared/quick-start.mjs";
import {
  getGuide,
  guideGroups,
  guideLabels,
} from "../docs/shared/doc-guides.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

// Catch drift between the copyable entrypoints and the runnable tutorial.
for (const path of ["README.md", "packages/integration/README.md"]) {
  const content = readFileSync(resolve(root, path), "utf8");
  for (const [filename, code] of Object.entries(quickStartFiles)) {
    if (!content.replaceAll("\r\n", "\n").includes(code)) {
      errors.push(
        `${path} no longer matches the runnable tutorial: ${filename}`,
      );
    }
  }
}
for (const { pages } of guideGroups) {
  for (const slug of pages) {
    for (const locale of ["en", "es"]) {
      if (!guideLabels[locale][slug])
        errors.push(`Missing ${locale} navigation label: ${slug}`);
    }
    const en = getGuide(slug, "en");
    const es = getGuide(slug, "es");
    if (
      Boolean(en) !== Boolean(es) ||
      (en && en.sections.length !== es.sections.length)
    ) {
      errors.push(`Guide structure differs between languages: ${slug}`);
    }
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function filesUnder(dir, extensions) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry);
    if (["node_modules", "dist", ".astro"].includes(entry)) continue;
    if (statSync(path).isDirectory())
      files.push(...filesUnder(path, extensions));
    else if (extensions.includes(extname(entry))) files.push(path);
  }
  return files;
}

const officialPackage = readJson(
  resolve(root, "docs/astro-intl-i18n/package.json"),
);
const playgroundPackage = readJson(
  resolve(root, "docs/playground/package.json"),
);
const integrationPackage = readJson(
  resolve(root, "packages/integration/package.json"),
);
if (officialPackage.dependencies["astro-intl"] !== "2.2.2") {
  errors.push(
    "The official docs must consume exact stable astro-intl 2.2.2 after publication.",
  );
}
if (playgroundPackage.dependencies["astro-intl"] !== "workspace:*") {
  errors.push("The playground must consume astro-intl through workspace:*.");
}
if (integrationPackage.peerDependencies.astro !== "^4 || ^5 || ^6 || ^7") {
  errors.push("astro-intl must declare the approved Astro 4–7 peer range.");
}
if (integrationPackage.bin?.["astro-intl"] !== "./dist/cli.js") {
  errors.push("astro-intl must expose the catalog validation CLI.");
}
if (!integrationPackage.exports?.["./validate"]) {
  errors.push("astro-intl must expose the ./validate subpath.");
}
for (const path of ["README.md", "packages/integration/README.md"]) {
  const content = readFileSync(resolve(root, path), "utf8");
  if (!content.includes("astro-intl validate --dir")) {
    errors.push(`${path} must document the catalog validation command.`);
  }
}
const astro7Dependencies = [
  ["astro", "7.2.8"],
  ["@astrojs/vercel", "11.0.3"],
  ["@astrojs/sitemap", "3.7.3"],
];
for (const [name, pkg] of [
  ["official docs", officialPackage],
  ["playground", playgroundPackage],
]) {
  for (const [dependency, expected] of astro7Dependencies) {
    if (pkg.dependencies[dependency] !== expected) {
      errors.push(`The ${name} must use exact ${dependency}@${expected}.`);
    }
  }
}
for (const [name, pkg] of [
  ["official docs", officialPackage],
  ["playground", playgroundPackage],
]) {
  for (const script of Object.values(pkg.scripts ?? {})) {
    if (String(script).includes("prepare-docs-deploy")) {
      errors.push(`${name} still invokes the destructive deploy mutator.`);
    }
  }
}

for (const project of ["astro-intl-i18n", "playground"]) {
  const src = resolve(root, "docs", project, "src");
  for (const file of filesUnder(src, [".astro", ".ts", ".tsx"])) {
    const content = readFileSync(file, "utf8");
    if (content.includes("getTranslationsReact")) {
      errors.push(`Legacy React symbol in current docs: ${file}`);
    }
  }

  for (const locale of ["en", "es"]) {
    const messagePath = resolve(src, "i18n/messages", `${locale}.json`);
    const messages = readJson(messagePath);
    delete messages.changelog;
    const active = JSON.stringify(messages);
    if (active.includes("getTranslationsReact")) {
      errors.push(
        `Legacy React symbol in active ${project}/${locale} messages.`,
      );
    }
    if (/setRequestLocale\([^)]*\).*Promise<void>/.test(active)) {
      errors.push(
        `Legacy setRequestLocale return type in ${project}/${locale} messages.`,
      );
    }
  }
}

const serialized = serializeJsonLd({
  title: "</script><script>unexpected()</script>",
});
if (serialized.includes("</script>"))
  errors.push("JSON-LD serializer permits script termination.");

const markdown = renderInlineMarkdown(
  "<img src=x onerror=unexpected()> [bad](javascript:unexpected()) [ok](https://example.com)",
);
if (markdown.includes("<img") || markdown.includes('href="javascript:')) {
  errors.push("Changelog renderer permits active HTML or an unsafe URI.");
}
if (!markdown.includes('href="https://example.com"')) {
  errors.push("Changelog renderer broke a legitimate HTTPS link.");
}

for (const file of filesUnder(resolve(root, "docs"), [".md"])) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split("#")[0];
    if (!target || /^(https?:|mailto:)/.test(target) || target.startsWith("#"))
      continue;
    if (!existsSync(resolve(dirname(file), target))) {
      errors.push(`Broken Markdown link in ${file}: ${match[1]}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Documentation checks passed.");
