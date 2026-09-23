import {
  mkdir,
  writeFile,
  readFile,
  symlink,
  realpath,
  mkdtemp,
  rm,
} from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { quickStartFiles } from "../docs/shared/quick-start.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const astro = resolve(
  root,
  "docs/astro-intl-i18n/node_modules/astro/bin/astro.mjs",
);
function run(args, cwd) {
  return spawn(process.execPath, [astro, ...args], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    // Keep the fixture server attached so finally can stop the process it owns.
    env: { ...process.env, ASTRO_DEV_BACKGROUND: "1" },
  });
}
function check(html, locale) {
  assert.match(
    html,
    new RegExp(`<h1>${locale === "es" ? "Hola" : "Hello"}</h1>`),
  );
  assert.match(html, new RegExp(`lang="${locale}"`));
  for (const lang of ["es", "en"]) assert.ok(html.includes(`href="/${lang}/"`));
}
const cacheRoot = resolve(root, "node_modules/.cache/quick-start");
await mkdir(cacheRoot, { recursive: true });
const fixtureRoot = await mkdtemp(resolve(cacheRoot, "run-"));
try {
  for (const [name, pkg] of [
    ["stable", "docs/astro-intl-i18n/node_modules/astro-intl"],
    ["local", "packages/integration"],
  ]) {
    const cwd = resolve(fixtureRoot, name);
    await mkdir(resolve(cwd, "node_modules"), { recursive: true });
    for (const [filename, code] of Object.entries(quickStartFiles)) {
      const path = resolve(cwd, filename);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, code);
    }
    await writeFile(
      resolve(cwd, "package.json"),
      JSON.stringify({ private: true, type: "module" }),
    );
    for (const [module, target] of [
      ["astro", "docs/astro-intl-i18n/node_modules/astro"],
      ["astro-intl", pkg],
    ]) {
      const actual = await realpath(resolve(root, target));
      await symlink(actual, resolve(cwd, "node_modules", module), "junction");
    }
    const build = run(["build"], cwd);
    let output = "";
    build.stdout.on("data", (chunk) => {
      output += chunk;
    });
    build.stderr.on("data", (chunk) => {
      output += chunk;
    });
    const code = await new Promise((resolve) => build.on("close", resolve));
    assert.equal(code, 0, output);
    for (const locale of ["es", "en"])
      check(
        await readFile(resolve(cwd, "dist", locale, "index.html"), "utf8"),
        locale,
      );
    const port = name === "stable" ? 4391 : 4392;
    const dev = run(
      ["dev", "--host", "127.0.0.1", "--port", String(port)],
      cwd,
    );
    const devClosed = new Promise((resolve) => dev.on("close", resolve));
    let devOutput = "";
    dev.stdout.on("data", (chunk) => {
      devOutput += chunk;
    });
    dev.stderr.on("data", (chunk) => {
      devOutput += chunk;
    });
    try {
      let ready = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        try {
          const response = await fetch(`http://127.0.0.1:${port}/es/`);
          if (response.ok) {
            check(await response.text(), "es");
            ready = true;
            break;
          }
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      assert.ok(ready, devOutput);
      for (const locale of ["en", "es", "en"]) {
        const response = await fetch(`http://127.0.0.1:${port}/${locale}/`);
        assert.equal(response.status, 200);
        check(await response.text(), locale);
      }
    } finally {
      dev.kill();
      await devClosed;
    }
    console.log(`Quick start: ${name} build and development passed.`);
  }
} finally {
  try {
    await rm(fixtureRoot, {
      recursive: true,
      force: true,
      maxRetries: 10,
      retryDelay: 250,
    });
  } catch (error) {
    if (error.code !== "EBUSY") throw error;
  }
}
