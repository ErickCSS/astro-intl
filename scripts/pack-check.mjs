#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = resolve(root, "packages/integration");
const expectedPath = resolve(packageDir, "package-files.json");
const tempDir = mkdtempSync(join(tmpdir(), "astro-intl-pack-"));

function run(args, cwd) {
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...args] : args;
  return execFileSync(command, commandArgs, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

try {
  const packOutput = run(
    ["pack", "--json", "--silent", "--pack-destination", tempDir],
    packageDir
  );
  const jsonStart = packOutput.indexOf("[");
  const jsonEnd = packOutput.lastIndexOf("]");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`npm pack did not return JSON:\n${packOutput}`);
  }
  const packResult = JSON.parse(packOutput.slice(jsonStart, jsonEnd + 1))[0];
  const files = packResult.files.map(({ path }) => path).sort();
  const forbidden = files.filter(
    (path) =>
      path.includes("__tests__") ||
      /(^|\/)[^/]+\.(test|spec)\.[^.]+$/.test(path) ||
      path.endsWith(".tgz") ||
      path.startsWith("src/")
  );
  if (forbidden.length > 0) {
    throw new Error(`Forbidden package files:\n${forbidden.join("\n")}`);
  }

  const expected = JSON.parse(readFileSync(expectedPath, "utf8")).files.slice().sort();
  if (JSON.stringify(files) !== JSON.stringify(expected)) {
    const missing = expected.filter((path) => !files.includes(path));
    const unexpected = files.filter((path) => !expected.includes(path));
    throw new Error(
      `Package inventory changed.\nMissing: ${missing.join(", ") || "none"}\n` +
        `Unexpected: ${unexpected.join(", ") || "none"}`
    );
  }

  const tarball = resolve(tempDir, packResult.filename);
  const consumerDir = resolve(tempDir, "consumer");
  mkdirSync(consumerDir, { recursive: true });
  writeFileSync(
    resolve(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "astro-intl-smoke-consumer",
        private: true,
        type: "module",
        dependencies: {
          "astro-intl": `file:${tarball.replace(/\\/g, "/")}`,
          astro: "7.2.8",
          react: "19.2.4",
          svelte: "5.56.5",
        },
      },
      null,
      2
    )
  );
  writeFileSync(
    resolve(consumerDir, "smoke.mjs"),
    `import { existsSync } from "node:fs";\n` +
      `import { fileURLToPath } from "node:url";\n` +
      `for (const id of ["astro-intl", "astro-intl/middleware", "astro-intl/routing", "astro-intl/react", "astro-intl/svelte", "astro-intl/validate"]) {\n` +
      `  const mod = await import(id); if (Object.keys(mod).length === 0) throw new Error("Empty export: " + id);\n` +
      `}\n` +
      `const component = import.meta.resolve("astro-intl/components");\n` +
      `if (!existsSync(fileURLToPath(component))) throw new Error("Missing component export");\n` +
      `console.log("smoke imports passed");\n`
  );

  run(["install", "--ignore-scripts", "--package-lock=false", "--no-audit", "--no-fund"], consumerDir);
  execFileSync(process.execPath, [resolve(consumerDir, "smoke.mjs")], {
    cwd: consumerDir,
    stdio: "inherit",
  });

  const messagesDir = resolve(consumerDir, "messages");
  mkdirSync(messagesDir, { recursive: true });
  writeFileSync(resolve(messagesDir, "en.json"), JSON.stringify({ greeting: "Hello {name}" }));
  writeFileSync(resolve(messagesDir, "es.json"), JSON.stringify({ greeting: "Hola {name}" }));
  const cliPath = resolve(consumerDir, "node_modules/astro-intl/dist/cli.js");
  execFileSync(
    process.execPath,
    [cliPath, "validate", "--dir", messagesDir, "--reference", "en"],
    { cwd: consumerDir, stdio: "inherit" }
  );

  writeFileSync(resolve(messagesDir, "es.json"), JSON.stringify({ farewell: "Adiós" }));
  const invalidCli = spawnSync(
    process.execPath,
    [cliPath, "validate", "--dir", messagesDir, "--reference", "en"],
    { cwd: consumerDir, encoding: "utf8" }
  );
  if (invalidCli.status !== 1) {
    throw new Error(
      `Catalog CLI returned ${invalidCli.status ?? "no status"} for invalid catalogs.\n` +
        `${invalidCli.stdout}\n${invalidCli.stderr}`
    );
  }

  console.log(
    JSON.stringify(
      {
        filename: basename(tarball),
        shasum: packResult.shasum,
        integrity: packResult.integrity,
        size: packResult.size,
        unpackedSize: packResult.unpackedSize,
        fileCount: files.length,
        files,
        smoke: "imports and catalog CLI passed",
      },
      null,
      2
    )
  );
} finally {
  if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
}
