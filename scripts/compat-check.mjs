#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = resolve(root, "packages/integration");
const tempRoot = mkdtempSync(join(tmpdir(), "astro-intl-compat-"));
const requested = process.argv[2];
const versions = {
  4: { astro: "4.16.19", node: "8.3.4" },
  5: { astro: "5.18.2", node: "9.5.5" },
  6: { astro: "6.4.8", node: "10.1.4" },
  7: { astro: "7.1.4", node: "11.0.2" },
};
const majors = requested ? [requested] : Object.keys(versions);

function npm(args, cwd, stdio = "inherit") {
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...args] : args;
  return execFileSync(command, commandArgs, { cwd, encoding: "utf8", stdio });
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeBaseProject(projectDir, tarball, version) {
  mkdirSync(resolve(projectDir, "src/components"), { recursive: true });
  mkdirSync(resolve(projectDir, "src/i18n"), { recursive: true });
  mkdirSync(resolve(projectDir, "src/pages/[lang]"), { recursive: true });
  writeJson(resolve(projectDir, "package.json"), {
    name: `astro-intl-compat-${version.astro}`,
    private: true,
    type: "module",
    dependencies: {
      "@astrojs/node": version.node,
      astro: version.astro,
      "astro-intl": `file:${tarball.replace(/\\/g, "/")}`,
      react: "19.2.4",
      svelte: "5.56.5",
    },
  });
  writeFileSync(
    resolve(projectDir, "src/i18n/request.mjs"),
    `import { defineRequestConfig } from "astro-intl";\n` +
      `export default defineRequestConfig((locale) => ({ locale, messages: { greeting: locale === "es" ? "Hola" : "Hello", nested: locale === "es" ? "Anidado" : "Nested" } }));\n`
  );
  writeFileSync(
    resolve(projectDir, "src/middleware.js"),
    `import "./i18n/request.mjs";\n` +
      `import { createIntlMiddleware } from "astro-intl/middleware";\n` +
      `export const onRequest = createIntlMiddleware({ locales: ["en", "es"], defaultLocale: "en", routes: { home: { en: "/", es: "/inicio" } } });\n`
  );
  writeFileSync(
    resolve(projectDir, "src/components/Nested.astro"),
    `---\n` +
      `import { getLocale, getTranslations } from "astro-intl";\n` +
      `const locale = getLocale();\n` +
      `const t = getTranslations();\n` +
      `---\n` +
      `<span data-nested-locale={locale}>{t("nested")}</span>\n`
  );
  writeFileSync(
    resolve(projectDir, "src/pages/index.astro"),
    `---\n` +
      `import AutoRedirect from "astro-intl/components";\n` +
      `---\n` +
      `<AutoRedirect locales={["en", "es"]} defaultLocale="en" />\n`
  );
}

function writeConfig(projectDir, { server = false, cache = false } = {}) {
  const nodeImport = server ? `import node from "@astrojs/node";\n` : "";
  const cacheImport = cache ? `, memoryCache` : "";
  const serverConfig = server ? `output: "server", adapter: node({ mode: "standalone" }), ` : "";
  const cacheConfig = cache
    ? `cache: { provider: memoryCache() }, routeRules: { "/en/[...path]": { maxAge: 60 }, "/es/[...path]": { maxAge: 60 } }, `
    : "";
  writeFileSync(
    resolve(projectDir, "astro.config.mjs"),
    `import { defineConfig${cacheImport} } from "astro/config";\n` +
      nodeImport +
      `import intl from "astro-intl";\n` +
      `export default defineConfig({ ${serverConfig}${cacheConfig}integrations: [intl({ defaultLocale: "en", locales: ["en", "es"], routes: { home: { en: "/", es: "/inicio" } } })] });\n`
  );
}

function writePage(projectDir, isStatic) {
  writeFileSync(
    resolve(projectDir, "src/pages/[lang]/index.astro"),
    `---\n` +
      `import Nested from "../../components/Nested.astro";\n` +
      `import { getLocale, getTranslations, path } from "astro-intl";\n` +
      (isStatic
        ? `export function getStaticPaths() { return [{ params: { lang: "en" } }, { params: { lang: "es" } }]; }\n`
        : "") +
      `const locale = getLocale();\n` +
      `const t = getTranslations();\n` +
      `const localizedPath = path("home", {}, locale);\n` +
      `---\n` +
      `<main data-locale={locale} data-path={localizedPath}>{t("greeting")}<Nested /></main>\n`
  );
}

function writeFetchEntrypoint(projectDir, mode) {
  const fetchPath = resolve(projectDir, "src/fetch.ts");
  if (mode === "none") {
    if (existsSync(fetchPath)) rmSync(fetchPath, { force: true });
    return;
  }
  if (mode === "full") {
    writeFileSync(
      fetchPath,
      `import { FetchState, astro } from "astro/fetch";\n` +
        `export default { fetch(request: Request) { return astro(new FetchState(request)); } };\n`
    );
    return;
  }
  writeFileSync(
    fetchPath,
    `import { FetchState, middleware, pages } from "astro/fetch";\n` +
      `export default {\n` +
      `  async fetch(request: Request) {\n` +
      `    const state = new FetchState(request);\n` +
      `    return middleware(state, (nextState) => pages(nextState));\n` +
      `  },\n` +
      `};\n`
  );
}

async function waitForServer(child, url) {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`SSR server exited with code ${child.exitCode}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error(`SSR server did not become ready: ${lastError}`);
}

function assertLocalizedHtml(html, locale) {
  const expected =
    locale === "es"
      ? ['data-locale="es"', 'data-nested-locale="es"', "Hola", "Anidado"]
      : ['data-locale="en"', 'data-nested-locale="en"', "Hello", "Nested"];
  for (const marker of expected) {
    if (!html.includes(marker)) throw new Error(`Missing ${locale} marker: ${marker}`);
  }
}

async function assertRequests(port, repetitions = 1) {
  const jobs = [];
  for (let index = 0; index < repetitions; index += 1) {
    jobs.push(
      fetch(`http://127.0.0.1:${port}/en/`, { signal: AbortSignal.timeout(10_000) }).then(async (response) => ({
        locale: "en",
        status: response.status,
        html: await response.text(),
      })),
      fetch(`http://127.0.0.1:${port}/es/inicio`, { signal: AbortSignal.timeout(10_000) }).then(async (response) => ({
        locale: "es",
        status: response.status,
        html: await response.text(),
      }))
    );
  }
  const responses = await Promise.all(jobs);
  for (const response of responses) {
    if (response.status !== 200) throw new Error(`${response.locale} returned ${response.status}`);
    assertLocalizedHtml(response.html, response.locale);
  }
}

async function runServerScenario(projectDir, major, scenario, offset, repetitions) {
  npm(["exec", "--", "astro", "build"], projectDir);
  const port = 4600 + Number(major) * 10 + offset;
  const child = spawn(process.execPath, [resolve(projectDir, "dist/server/entry.mjs")], {
    cwd: projectDir,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: "inherit",
  });
  try {
    await waitForServer(child, `http://127.0.0.1:${port}/en/`);
    await assertRequests(port, 1);
    await assertRequests(port, repetitions);
  } finally {
    child.kill();
  }
  console.log(`Astro ${major} ${scenario}: passed`);
}

function assertRequestStateIsServerOnly(projectDir) {
  const clientDir = resolve(projectDir, "dist/client");
  if (!existsSync(clientDir)) return;
  const pending = [clientDir];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of readdirSync(current)) {
      const path = resolve(current, entry);
      if (statSync(path).isDirectory()) {
        pending.push(path);
        continue;
      }
      if (!/\.(?:js|mjs|cjs)$/.test(entry)) continue;
      const content = readFileSync(path, "utf8");
      if (content.includes("node:async_hooks") || content.includes("AsyncLocalStorage")) {
        throw new Error(`SSR request state leaked into an Astro 7 client asset: ${path}`);
      }
    }
  }
  console.log("Astro 7 client assets exclude AsyncLocalStorage and node:async_hooks");
}

async function validateVersion(major, tarball) {
  const version = versions[major];
  if (!version) throw new Error(`Unsupported Astro major: ${major}`);
  const projectDir = resolve(tempRoot, `astro-${major}`);
  mkdirSync(projectDir, { recursive: true });
  writeBaseProject(projectDir, tarball, version);
  npm(["install", "--ignore-scripts", "--package-lock=false", "--no-audit", "--no-fund"], projectDir);

  writeConfig(projectDir);
  writePage(projectDir, true);
  writeFetchEntrypoint(projectDir, "none");
  npm(["exec", "--", "astro", "build"], projectDir);
  for (const output of ["dist/index.html", "dist/en/index.html", "dist/es/index.html"]) {
    if (!existsSync(resolve(projectDir, output))) throw new Error(`Missing static output: ${output}`);
  }
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      `for (const id of ["astro-intl/react", "astro-intl/svelte", "astro-intl/routing"]) await import(id);`,
    ],
    { cwd: projectDir, stdio: "inherit" }
  );

  writePage(projectDir, false);
  writeConfig(projectDir, { server: true });
  await runServerScenario(projectDir, major, "default SSR", 0, major === "7" ? 12 : 1);

  if (major === "7") {
    assertRequestStateIsServerOnly(projectDir);
    writeFetchEntrypoint(projectDir, "full");
    writeConfig(projectDir, { server: true, cache: true });
    await runServerScenario(projectDir, major, "advanced routing with cache", 1, 12);

    writeFetchEntrypoint(projectDir, "composed");
    writeConfig(projectDir, { server: true });
    await runServerScenario(projectDir, major, "composed advanced routing", 2, 12);
  }

  console.log(
    `Astro ${version.astro}: static, SSR, middleware, routing, React, Svelte and nested rendering passed`
  );
}

try {
  const packOutput = npm(
    ["pack", "--json", "--silent", "--pack-destination", tempRoot],
    packageDir,
    ["ignore", "pipe", "pipe"]
  );
  const packResult = JSON.parse(
    packOutput.slice(packOutput.indexOf("["), packOutput.lastIndexOf("]") + 1)
  )[0];
  const tarball = resolve(tempRoot, packResult.filename);
  for (const major of majors) await validateVersion(major, tarball);
} finally {
  if (existsSync(tempRoot)) rmSync(tempRoot, { recursive: true, force: true });
}
