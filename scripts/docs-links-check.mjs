import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { exports: packageExports } = JSON.parse(
  readFileSync(resolve(root, "packages/integration/package.json"), "utf8"),
);
const adapterSlugs = Object.entries(packageExports)
  .filter(([, target]) => target.import?.startsWith("./dist/adapters/"))
  .map(([subpath]) => subpath.slice(2));
let count = 0;
for (const project of ["astro-intl-i18n", "playground"]) {
  const dist = resolve(root, "docs", project, "dist");
  for (const locale of ["en", "es"]) {
    const docs = resolve(dist, locale, "docs");
    const index = readFileSync(resolve(docs, "index.html"), "utf8");
    const home = readFileSync(resolve(dist, locale, "index.html"), "utf8");
    const testing = readFileSync(resolve(docs, "testing", "index.html"), "utf8");
    const cards = home.match(/<section\b[^>]*\bid="frameworks"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(cards, `${project}/${locale}: missing home framework cards`);
    assert.deepEqual(
      Array.from(cards.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g), ([, href]) => href).sort(),
      adapterSlugs.map((slug) => `/${locale}/docs/${slug}`).sort(),
      `${project}/${locale}: advertised adapters differ from the package exports`,
    );
    for (const slug of adapterSlugs) {
      assert.ok(testing.includes(`astro-intl/${slug}`), `${project}/${locale}: missing ${slug} import on testing page`);
      assert.ok(
        index.includes(`id="${slug}" href="/${locale}/docs/${slug}"`),
        `${project}/${locale}: adapter ${slug} is missing from the documentation index`,
      );
      const guide = readFileSync(resolve(docs, slug, "index.html"), "utf8");
      assert.ok(guide.includes(`astro-intl/${slug}`), `${project}/${locale}: missing adapter usage for ${slug}`);
    }
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
