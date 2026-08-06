#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageDir = resolve(root, "packages/integration");
const tempDir = mkdtempSync(join(tmpdir(), "astro-intl-audit-"));

function npm(args, cwd, stdio = "inherit") {
  const command = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...args] : args;
  return execFileSync(command, commandArgs, { cwd, encoding: "utf8", stdio });
}

try {
  const output = npm(
    ["pack", "--json", "--silent", "--pack-destination", tempDir],
    packageDir,
    ["ignore", "pipe", "pipe"]
  );
  const packed = JSON.parse(output.slice(output.indexOf("["), output.lastIndexOf("]") + 1))[0];
  const consumerDir = resolve(tempDir, "consumer");
  mkdirSync(consumerDir, { recursive: true });
  writeFileSync(
    resolve(consumerDir, "package.json"),
    JSON.stringify(
      {
        name: "astro-intl-production-audit",
        private: true,
        dependencies: {
          astro: "7.1.4",
          "astro-intl": `file:${resolve(tempDir, packed.filename).replace(/\\/g, "/")}`,
          react: "19.2.4",
          svelte: "5.56.5",
        },
      },
      null,
      2
    )
  );
  npm(["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"], consumerDir);
  npm(["audit", "--omit=dev", "--audit-level=moderate"], consumerDir);
} finally {
  if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
}
