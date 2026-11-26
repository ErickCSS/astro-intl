// The guides and the packaged-consumer check render these same components.
export const solidNpmOverrides = { "solid-js@1.9.13": { seroval: "1.8.2" } };

export const catalogs = {
  en: {
    demo: {
      title: "Welcome",
      description: "Read the <bold>Astro</bold> <link>guide</link>.",
      follow: "Follow",
      following: "Following",
    },
  },
  es: {
    demo: {
      title: "Bienvenido",
      description: "Lee la <link>guía</link> de <bold>Astro</bold>.",
      follow: "Seguir",
      following: "Siguiendo",
    },
  },
};

export const middleware = `import { defineRequestConfig } from "astro-intl";
import { createIntlMiddleware } from "astro-intl/middleware";
import en from "./i18n/messages/en.json";
import es from "./i18n/messages/es.json";

defineRequestConfig((locale) => ({
  locale,
  messages: locale === "es" ? es : en,
}));

export const onRequest = createIntlMiddleware({
  locales: ["en", "es"],
  defaultLocale: "en",
});`;

const jsxFrameworks = ["react", "preact", "solid"];

export function integrationName(framework) {
  return framework === "solid" ? "solid-js" : framework;
}

export function islandConfig(frameworks, server = false) {
  const multipleJsx =
    frameworks.filter((name) => jsxFrameworks.includes(name)).length > 1;
  return [
    'import { defineConfig } from "astro/config";',
    'import astroIntl from "astro-intl";',
    ...frameworks.map(
      (name) => `import ${name} from "@astrojs/${integrationName(name)}";`,
    ),
    ...(server ? ['import node from "@astrojs/node";'] : []),
    "",
    "export default defineConfig({",
    ...(server
      ? ['  output: "server",', '  adapter: node({ mode: "standalone" }),']
      : []),
    "  integrations: [",
    ...frameworks.map((name) =>
      multipleJsx && jsxFrameworks.includes(name)
        ? `    ${name}({ include: ["**/components/${name}/**"] }),`
        : `    ${name}(),`,
    ),
    '    astroIntl({ defaultLocale: "en", locales: ["en", "es"] }),',
    "  ],",
    "});",
  ].join("\n");
}

function jsxComponents(framework, hooks) {
  return {
    "Heading.jsx": `import { getTranslations } from "astro-intl/${framework}";

export default function Heading() {
  const t = getTranslations("demo");
  return <header>
    <h1>{t("title")}</h1>
    <p>{t.rich("description", {
      bold: (text) => <strong key="bold">{text}</strong>,
      link: (text) => <a key="link" href="https://docs.astro.build/">{text}</a>,
    })}</p>
  </header>;
}`,
    "FollowButton.jsx": `import { useState } from "${hooks}";

export default function FollowButton({ follow, following }) {
  const [active, setActive] = useState(false);
  return <button type="button" aria-pressed={active} onClick={() => setActive(!active)}>
    {active ? following : follow}
  </button>;
}`,
  };
}

const components = {
  react: jsxComponents("react", "react"),
  preact: jsxComponents("preact", "preact/hooks"),
  solid: {
    "Heading.jsx": `import { getTranslations } from "astro-intl/solid";

export default function Heading() {
  const t = getTranslations("demo");
  return <header>
    <h1>{t("title")}</h1>
    <p>{t.rich("description", {
      bold: (text) => <strong>{text}</strong>,
      link: (text) => <a href="https://docs.astro.build/">{text}</a>,
    })}</p>
  </header>;
}`,
    "FollowButton.jsx": `import { createSignal } from "solid-js";

export default function FollowButton(props) {
  const [active, setActive] = createSignal(false);
  return <button type="button" aria-pressed={active()} onClick={() => setActive(value => !value)}>
    {active() ? props.following : props.follow}
  </button>;
}`,
  },
  vue: {
    "Heading.vue": `<script setup>
import { h } from "vue";
import { getTranslations } from "astro-intl/vue";

const t = getTranslations("demo");
const Description = () => h("p", t.rich("description", {
  bold: text => h("strong", [text]),
  link: text => h("a", { href: "https://docs.astro.build/" }, [text]),
}));
</script>

<template>
  <header>
    <h1>{{ t("title") }}</h1>
    <Description />
  </header>
</template>`,
    "FollowButton.vue": `<script setup>
import { ref } from "vue";

defineProps({ follow: String, following: String });
const active = ref(false);
</script>

<template>
  <button type="button" :aria-pressed="active" @click="active = !active">
    {{ active ? following : follow }}
  </button>
</template>`,
  },
  svelte: {
    "Heading.svelte": `<script>
  import { getTranslations, renderRichText } from "astro-intl/svelte";

  const t = getTranslations("demo");
  const segments = t.rich("description", ["bold", "link"]);
  const html = renderRichText(segments, {
    tags: { bold: "strong" },
    components: { link: (text) => \`<a href="https://docs.astro.build/">\${text}</a>\` },
  });
</script>

<header>
  <h1>{t("title")}</h1>
  <p>{@html html}</p>
</header>`,
    "FollowButton.svelte": `<script>
  let { follow, following } = $props();
  let active = $state(false);
</script>

<button type="button" aria-pressed={active} onclick={() => active = !active}>
  {active ? following : follow}
</button>`,
  },
};

export function islandFiles(framework, server = false) {
  const ext = jsxFrameworks.includes(framework) ? "jsx" : framework;
  const componentDir = `src/components/${framework}`;
  const page = `---
import { getLocale, getTranslations } from "astro-intl";
import Heading from "../../components/${framework}/Heading.${ext}";
import FollowButton from "../../components/${framework}/FollowButton.${ext}";
${
  server
    ? ""
    : `
export function getStaticPaths() {
  return [{ params: { lang: "en" } }, { params: { lang: "es" } }];
}
`
}
const locale = getLocale();
const t = getTranslations("demo");
---

<html lang={locale}>
  <head><meta charset="utf-8" /><link rel="icon" href="data:," /><title>{t("title")}</title></head>
  <body>
    <Heading />
    <FollowButton client:load follow={t("follow")} following={t("following")} />
  </body>
</html>`;
  return [
    ...Object.entries(components[framework]).map(([name, code]) => ({
      file: `${componentDir}/${name}`,
      lang: ext,
      code,
    })),
    { file: `src/pages/[lang]/${framework}.astro`, lang: "astro", code: page },
  ];
}
