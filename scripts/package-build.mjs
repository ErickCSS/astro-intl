#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const packageDir = process.cwd();
const packageJsonPath = resolve(packageDir, "package.json");
const pkg = JSON.parse(readFileSync(packageJsonPath, "utf8"));

if (pkg.name !== "astro-intl") {
  throw new Error("package-build.mjs must run from the astro-intl package directory.");
}

const distDir = resolve(packageDir, "dist");
const command = process.argv[2];

function exportedTargets(exportsMap) {
  const targets = [];
  for (const value of Object.values(exportsMap)) {
    if (typeof value === "string") targets.push(value);
    else if (value && typeof value === "object") targets.push(...exportedTargets(value));
  }
  return targets;
}

if (command === "clean") {
  rmSync(distDir, { recursive: true, force: true });
} else if (command === "finalize") {
  const componentDir = resolve(distDir, "components");
  mkdirSync(componentDir, { recursive: true });
  cpSync(
    resolve(packageDir, "src/components/AutoRedirect.astro"),
    resolve(componentDir, "AutoRedirect.astro")
  );

  const packageTargets = [
    ...exportedTargets(pkg.exports),
    ...Object.values(pkg.bin ?? {}),
  ];
  const missing = packageTargets
    .filter((target) => target.startsWith("./"))
    .filter((target) => !existsSync(resolve(packageDir, target)));
  if (missing.length > 0) {
    throw new Error(`Missing package export targets:\n${missing.join("\n")}`);
  }
} else {
  throw new Error('Usage: package-build.mjs <clean|finalize>');
}
