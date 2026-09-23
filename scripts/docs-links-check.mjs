import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let count = 0;
for (const project of ["astro-intl-i18n", "playground"]) {
  const dist = resolve(root, "docs", project, "dist");
  for (const locale of ["en", "es"]) {
    const docs = resolve(dist, locale, "docs");
    const pages = [
      "",
      ...readdirSync(docs, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    ];
    for (const page of pages) {
      const path = resolve(docs, page, "index.html");
      const html = readFileSync(path, "utf8");
      const base = `https://docs.test/${locale}/docs/${page ? `${page}/` : ""}`;
      for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
        const url = new URL(href.replaceAll("&amp;", "&"), base);
        if (
          url.origin !== "https://docs.test" ||
          !/^\/(en|es)\/docs(?:\/|$)/.test(url.pathname)
        )
          continue;
        const target = resolve(dist, url.pathname.slice(1), "index.html");
        assert.ok(
          existsSync(target),
          `${project}: ${path} links to missing ${href}`,
        );
        if (url.hash) {
          const targetHtml = readFileSync(target, "utf8");
          assert.ok(
            targetHtml.includes(
              `id="${decodeURIComponent(url.hash.slice(1))}"`,
            ),
            `${project}: missing anchor ${href} in ${path}`,
          );
        }
        count++;
      }
      // The old single-page playground links must still reach useful destinations.
      if (!page)
        for (const anchor of [
          "installation",
          "configuration",
          "file-structure",
          "usage",
          "examples",
          "api",
        ]) {
          assert.ok(
            html.includes(`id="${anchor}"`),
            `${project}: lost legacy anchor ${anchor}`,
          );
        }
    }
  }
}
console.log(`Documentation links passed: ${count} internal links and anchors.`);
