import { h, render } from "preact";
import { expect, it } from "vitest";
import { createGetTranslations } from "../adapters/preact.js";

const en = {
  demo: { nested: { title: "Hello" }, body: "See <link>the <bold>guide</bold></link>." },
};
const es = { demo: { nested: { title: "Hola" }, body: "Lee <link>la <bold>guía</bold></link>." } };
const get = createGetTranslations({ en, es }, "en");

it("looks up nested keys, falls back to the default locale and returns unknown keys", () => {
  expect(get("es", "demo")("nested.title")).toBe("Hola");
  expect(get(undefined, "demo")("nested.title")).toBe("Hello");
  expect(get("fr", "demo")("nested.title")).toBe("Hello");
  // @ts-expect-error Exercise runtime behavior for a key outside the typed catalog.
  expect(get("es", "demo")("missing")).toBe("missing");
});

it("renders nested rich text as native Preact children in message order", () => {
  const t = get("es", "demo");
  const parts = t.rich("body", {
    bold: (children) => h("strong", null, children),
    link: (children) => h("a", { href: "/es/guide" }, children),
  });
  const root = document.createElement("div");
  render(h("p", null, parts), root);
  expect(root.innerHTML).toBe('<p>Lee <a href="/es/guide">la <strong>guía</strong></a>.</p>');
});
