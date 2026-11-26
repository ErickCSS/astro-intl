import { h, render } from "vue";
import { expect, it } from "vitest";
import { createGetTranslations } from "../adapters/vue.js";

const translate = createGetTranslations(
  {
    en: {
      demo: { heading: { title: "Welcome" }, body: "Read <link>the <bold>guide</bold></link>." },
    },
    es: {
      demo: { heading: { title: "Bienvenido" }, body: "Lee <link>la <bold>guía</bold></link>." },
    },
  },
  "en"
);

it("reads nested Vue messages and falls back to the default locale", () => {
  expect(translate("es", "demo")("heading.title")).toBe("Bienvenido");
  expect(translate(undefined, "demo")("heading.title")).toBe("Welcome");
  expect(translate("fr", "demo")("heading.title")).toBe("Welcome");
  // @ts-expect-error Check the runtime fallback for an unknown key.
  expect(translate("es", "demo")("missing")).toBe("missing");
});

it("renders nested messages as Vue children", () => {
  const parts = translate("es", "demo").rich("body", {
    link: (children) => h("a", { href: "/es/guide" }, [children]),
    bold: (children) => h("strong", [children]),
  });
  const root = document.createElement("div");
  render(h("p", parts), root);
  expect(root.innerHTML).toBe('<p>Lee <a href="/es/guide">la <strong>guía</strong></a>.</p>');
});
