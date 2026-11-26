import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import {
  catalogs,
  integrationName,
  islandConfig,
  islandFiles,
  solidNpmOverrides,
  middleware,
} from "../docs/shared/island-examples.mjs";

const preactVersions = ["10.29.8", "11.2.0"];
const vueVersion = "3.5.46";
const expectations = {
  en: {
    title: "Welcome",
    description: "Read the Astro guide.",
    link: "guide",
    follow: "Follow",
    following: "Following",
  },
  es: {
    title: "Bienvenido",
    description: "Lee la guía de Astro.",
    link: "guía",
    follow: "Seguir",
    following: "Siguiendo",
  },
};

async function verifyPage(context, url, locale, interactive) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (
      msg.type() === "error" ||
      /hydrat.*(mismatch|fail)|hydration_/i.test(msg.text())
    )
      errors.push(msg.text());
  });
  try {
    const response = await page.goto(url);
    assert.equal(response.status(), 200, url);
    const expected = expectations[locale];
    assert.equal(await page.locator("html").getAttribute("lang"), locale);
    assert.equal(await page.locator("h1").innerText(), expected.title);
    assert.equal(
      await page.locator("header p").innerText(),
      expected.description,
    );
    assert.equal(await page.locator("header strong").innerText(), "Astro");
    assert.equal(
      await page
        .locator('header a[href="https://docs.astro.build/"]')
        .innerText(),
      expected.link,
    );
    const button = page.getByRole("button", {
      name: expected.follow,
      exact: true,
    });
    assert.equal(await button.getAttribute("aria-pressed"), "false");
    if (interactive) {
      await page.locator("astro-island:not([ssr]) button").waitFor();
      await button.click();
      const following = page.getByRole("button", {
        name: expected.following,
        exact: true,
      });
      assert.equal(await following.getAttribute("aria-pressed"), "true");
      await following.click();
      assert.equal(await button.getAttribute("aria-pressed"), "false");
    }
    assert.deepEqual(errors, [], url);
  } finally {
    await page.close();
  }
}

export async function validateIslands(
  projectDir,
  tarball,
  version,
  npm,
  waitForServer,
) {
  await validateConsumer(
    resolve(projectDir, "solid"),
    tarball,
    version,
    npm,
    waitForServer,
    ["solid"],
  );
  await validateConsumer(
    resolve(projectDir, "vue"),
    tarball,
    version,
    npm,
    waitForServer,
    ["vue"],
  );
  for (const preact of preactVersions) {
    await validateConsumer(
      resolve(projectDir, `preact-${preact}`),
      tarball,
      version,
      npm,
      waitForServer,
      ["preact"],
      preact,
    );
  }
  await validateConsumer(
    resolve(projectDir, "mixed"),
    tarball,
    version,
    npm,
    waitForServer,
    ["react", "svelte", "preact", "vue", "solid"],
  );
}

async function validateConsumer(
  projectDir,
  tarball,
  version,
  npm,
  waitForServer,
  frameworks,
  preact = preactVersions[1],
) {
  const singleFramework = frameworks.length === 1;
  const dependencies = {
    solid: { "@astrojs/solid-js": "7.1.6", "solid-js": "1.9.13" },
    preact: { "@astrojs/preact": "6.1.6", preact },
    react: {
      "@astrojs/react": "7.1.9",
      react: "19.2.4",
      "react-dom": "19.2.4",
    },
    svelte: { "@astrojs/svelte": "9.1.6", svelte: "5.56.5" },
    vue: { "@astrojs/vue": "7.1.6", vue: vueVersion },
  };
  function write(file, content) {
    const path = resolve(projectDir, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }

  write(
    "package.json",
    JSON.stringify({
      name: "astro-intl-island-consumer",
      private: true,
      type: "module",
      ...(frameworks.includes("solid") ? { overrides: solidNpmOverrides } : {}),
      dependencies: {
        "astro-intl": `file:${tarball.replaceAll("\\", "/")}`,
        astro: version.astro,
        "@astrojs/node": version.node,
        ...Object.assign({}, ...frameworks.map((name) => dependencies[name])),
        ...(singleFramework ? { typescript: "5.9.3" } : {}),
        "playwright-core": "1.56.1",
      },
    }),
  );
  write("src/middleware.js", middleware);
  for (const [lang, messages] of Object.entries(catalogs)) {
    write(`src/i18n/messages/${lang}.json`, JSON.stringify(messages));
  }
  npm(["install", "--ignore-scripts", "--no-audit", "--no-fund"], projectDir);
  if (singleFramework) {
    const require = createRequire(resolve(projectDir, "package.json"));
    assert.throws(() => require.resolve("react"), { code: "MODULE_NOT_FOUND" });
    const framework = frameworks[0];
    const isVue = framework === "vue";
    const isSolid = framework === "solid";
    const filename = isVue ? "consumer.ts" : "consumer.tsx";
    write(
      filename,
      isVue
        ? `import { h, type VNodeChild } from "vue";
import { createGetTranslations, getTranslations } from "astro-intl/vue";

const translate = createGetTranslations({ en: { demo: { heading: { title: "Welcome" } } } }, "en");
const t = translate("en", "demo");
const title: string = t("heading.title");
const children: VNodeChild[] = t.rich("heading.title", { bold: text => h("strong", [text]) });
export const heading = () => h("header", [getTranslations<{ title: string }>("demo")("title"), title, ...children]);
// @ts-expect-error The catalog has no heading.subtitle.
t("heading.subtitle");
`
        : `import { createGetTranslations, getTranslations } from "astro-intl/${framework}";
${isSolid ? 'import type { JSX } from "solid-js";' : 'import type { ComponentChildren } from "preact";'}

const get = createGetTranslations({ en: { demo: { heading: { title: "Hello" } } } }, "en");
const t = get("en", "demo");
const title: string = t("heading.title");
const children: ${isSolid ? "JSX.Element" : "ComponentChildren"}[] = t.rich("heading.title", { bold: text => <strong>{text}</strong> });
const heading = getTranslations<{ title: string }>("heading");
export const example = <header>{heading("title")}{title}{children}</header>;
// @ts-expect-error The catalog has no heading.subtitle.
t("heading.subtitle");
`,
    );
    npm(
      [
        "exec",
        "--",
        "tsc",
        "--noEmit",
        "--strict",
        "--target",
        "ES2022",
        "--module",
        "NodeNext",
        ...(isVue
          ? []
          : [
              "--jsx",
              isSolid ? "preserve" : "react-jsx",
              "--jsxImportSource",
              integrationName(framework),
            ]),
        filename,
      ],
      projectDir,
    );
  }
  function build(server) {
    write("astro.config.mjs", islandConfig(frameworks, server));
    for (const framework of frameworks) {
      for (const { file, code } of islandFiles(framework, server))
        write(file, code);
    }
    npm(["exec", "--", "astro", "build"], projectDir);
  }
  build(false);
  for (const framework of frameworks) {
    for (const [locale, expected] of Object.entries(expectations)) {
      const html = readFileSync(
        resolve(projectDir, "dist", locale, framework, "index.html"),
        "utf8",
      );
      assert.ok(
        html.includes(`<title>${expected.title}</title>`),
        `${locale}/${framework} static HTML`,
      );
      const markup = html.replace(/<!--[\s\S]*?-->/g, "");
      assert.ok(markup.includes(`<h1>${expected.title}</h1>`));
      assert.ok(markup.includes("<strong>Astro</strong>"));
      assert.ok(
        markup.includes(
          `href="https://docs.astro.build/">${expected.link}</a>`,
        ),
      );
    }
  }
  build(true);

  const { chromium } = createRequire(resolve(projectDir, "package.json"))(
    "playwright-core",
  );
  const channel =
    process.env.ASTRO_INTL_BROWSER_CHANNEL ||
    (process.platform === "win32" ? "msedge" : "chrome");
  const browser = await chromium.launch({ channel });
  const port = 4673;
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ["dist/server/entry.mjs"], {
    cwd: projectDir,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: "inherit",
  });
  const closed = new Promise((resolveClose) =>
    server.once("close", resolveClose),
  );
  try {
    await waitForServer(server, origin + `/en/${frameworks[0]}/`);
    for (const interactive of [false, true]) {
      const context = await browser.newContext({
        javaScriptEnabled: interactive,
      });
      try {
        await Promise.all(
          frameworks.flatMap((framework) =>
            Object.keys(expectations).map((locale) =>
              verifyPage(
                context,
                `${origin}/${locale}/${framework}/`,
                locale,
                interactive,
              ),
            ),
          ),
        );
      } finally {
        await context.close();
      }
    }
    console.log(
      `Astro ${version.astro}, ${frameworks.map((name) => name + " " + dependencies[name][integrationName(name)]).join(" + ")}: static HTML, concurrent SSR and EN/ES hydration passed.`,
    );
  } finally {
    server.kill();
    await Promise.all([closed, browser.close()]);
  }
}
