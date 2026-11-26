// @vitest-environment node
import { createComponent } from "solid-js";
import { Dynamic, renderToString } from "solid-js/web";
import { expect, it } from "vitest";
import { createGetTranslations } from "../adapters/solid.js";

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

it("selects nested SolidJS messages and falls back to the default locale", () => {
  expect(translate("es", "demo")("heading.title")).toBe("Bienvenido");
  expect(translate(undefined, "demo")("heading.title")).toBe("Welcome");
  expect(translate("fr", "demo")("heading.title")).toBe("Welcome");
  // @ts-expect-error Check the runtime fallback for a missing key.
  expect(translate("es", "demo")("missing")).toBe("missing");
});

it("renders nested rich text as SolidJS elements", () => {
  const html = renderToString(() =>
    translate("es", "demo").rich("body", {
      link: (children) =>
        createComponent(Dynamic<"a">, { component: "a", href: "/es/guide", children }),
      bold: (children) => createComponent(Dynamic<"strong">, { component: "strong", children }),
    })
  );
  expect(html).toMatch(/Lee <a[^>]* href="\/es\/guide"[^>]*>la <strong[^>]*>guía<\/strong><\/a>\./);
});
