import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const integration = resolve(root, "packages/integration");
const { dependencies } = JSON.parse(
  readFileSync(resolve(root, "docs/astro-intl-i18n/package.json")),
);
const version = dependencies["astro-intl"];
const id = `astro-intl@${version}`;
const registry = await fetch(
  `https://registry.npmjs.org/astro-intl/${encodeURIComponent(version)}`,
);
if (registry.ok) process.exit(0);
assert.equal(
  registry.status,
  404,
  `Cannot verify ${id} on npm: HTTP ${registry.status}`,
);
assert.equal(
  JSON.parse(readFileSync(resolve(integration, "package.json"))).version,
  version,
);

function run(command, args, cwd, env = process.env) {
  const windows = process.platform === "win32";
  execFileSync(
    windows ? process.env.ComSpec : command,
    windows ? ["/d", "/c", command, ...args] : args,
    {
      cwd,
      env,
      stdio: "inherit",
    },
  );
}

// Install only the build tools, then cache the tarball under its ordinary registry identity.
run("pnpm", ["--filter", "astro-intl", "install", "--frozen-lockfile"], root);
const scratch = mkdtempSync(join(tmpdir(), "astro-intl-release-install-"));
try {
  run("npm", ["pack", "--silent"], integration, {
    ...process.env,
    npm_config_pack_destination: scratch,
  });
  const filename = `astro-intl-${version}.tgz`;
  const integrity =
    "sha512-" +
    createHash("sha512")
      .update(readFileSync(join(scratch, filename)))
      .digest("base64");
  const lock = readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8").replaceAll(
    "\r\n",
    "\n",
  );
  assert.ok(
    lock.includes(`\n  ${id}:\n    resolution: {integrity: ${integrity}}`),
    `The rebuilt ${filename} differs from the documentation lockfile`,
  );

  // This one-package fetch fills pnpm's content store. The real install uses the repository lockfile.
  const { packageManager } = JSON.parse(
    readFileSync(resolve(root, "package.json")),
  );
  writeFileSync(
    join(scratch, "package.json"),
    JSON.stringify({ private: true, packageManager }),
  );
  writeFileSync(
    join(scratch, "pnpm-lock.yaml"),
    `lockfileVersion: '9.0'
importers:
  .:
    dependencies:
      astro-intl:
        specifier: ${version}
        version: ${version}
packages:
  ${id}:
    resolution: {integrity: ${integrity}, tarball: file:./${filename}}
snapshots:
  ${id}: {}
`,
  );
  run("pnpm", ["fetch", "--offline", "--ignore-scripts"], scratch);
  console.log(`Cached ${id} with the integrity pinned by the official site.`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
