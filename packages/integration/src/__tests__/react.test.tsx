import { describe, it, expect } from "vitest";
import { createGetTranslationsReact } from "../react.js";

describe("react.ts", () => {
  const ui = {
    en: {
      common: {
        greeting: "Hello",
        farewell: "Goodbye",
        nested: {
          deep: "Deep value",
        },
      },
      home: {
        title: "Welcome Home",
        withTags: "Click <link>here</link> to continue",
        multipleTags: "Text with <bold>bold</bold> and <italic>italic</italic>",
      },
    },
    es: {
      common: {
        greeting: "Hola",
        farewell: "Adiós",
        nested: {
          deep: "Valor profundo",
        },
      },
      home: {
        title: "Bienvenido a Casa",
        withTags: "Haz clic <link>aquí</link> para continuar",
        multipleTags: "Texto con <bold>negrita</bold> y <italic>cursiva</italic>",
      },
    },
  } as const;

  describe("createGetTranslationsReact", () => {
    it("should create translation function for default locale", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("en", "common");

      expect(t("greeting" as any)).toBe("Hello");
      expect(t("farewell" as any)).toBe("Goodbye");
    });

    it("should create translation function for non-default locale", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("es", "common");

      expect(t("greeting" as any)).toBe("Hola");
      expect(t("farewell" as any)).toBe("Adiós");
    });

    it("should handle nested keys", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("en", "common");

      expect(t("nested.deep" as any)).toBe("Deep value");
    });

    it("should return key when translation not found", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("en", "common");

      expect(t("nonexistent" as any)).toBe("nonexistent");
    });

    it("should fallback to default locale when locale not found", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("fr" as any, "common");

      expect(t("greeting" as any)).toBe("Hello");
    });

    it("should work with different namespaces", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const tCommon = getT("en", "common");
      const tHome = getT("en", "home");

      expect(tCommon("greeting" as any)).toBe("Hello");
      expect(tHome("title" as any)).toBe("Welcome Home");
    });
  });

  describe("t.rich", () => {
    it("should interpolate React components", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("en", "home");

      const result = t.rich("withTags" as any, {
        link: (chunks) => `<a>${chunks}</a>`,
      });

      expect(result).toEqual(["Click ", "<a>here</a>", " to continue"]);
    });

    it("should handle multiple tags", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("en", "home");

      const result = t.rich("multipleTags" as any, {
        bold: (chunks) => `<strong>${chunks}</strong>`,
        italic: (chunks) => `<em>${chunks}</em>`,
      });

      expect(result).toEqual([
        "Text with ",
        "<strong>bold</strong>",
        " and ",
        "<em>italic</em>",
      ]);
    });

    it("should handle text without tags", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("en", "common");

      const result = t.rich("greeting" as any, {});

      expect(result).toEqual(["Hello"]);
    });

    it("should work with Spanish locale", () => {
      const getT = createGetTranslationsReact(ui, "en");
      const t = getT("es", "home");

      const result = t.rich("withTags" as any, {
        link: (chunks) => `<a>${chunks}</a>`,
      });

      expect(result).toEqual(["Haz clic ", "<a>aquí</a>", " para continuar"]);
    });

    it("should handle nested tags correctly", () => {
      const customUi = {
        en: {
          test: {
            nested: "Start <outer>outer <inner>inner</inner> outer</outer> end",
          },
        },
      } as const;

      const getT = createGetTranslationsReact(customUi, "en");
      const t = getT("en", "test");

      const result = t.rich("nested" as any, {
        outer: (chunks) => `[${chunks}]`,
        inner: (chunks) => `{${chunks}}`,
      });

      expect(result).toEqual(["Start ", "[outer {inner} outer]", " end"]);
    });

    it("should handle adjacent tags", () => {
      const customUi = {
        en: {
          test: {
            adjacent: "<tag1>First</tag1><tag2>Second</tag2>",
          },
        },
      } as const;

      const getT = createGetTranslationsReact(customUi, "en");
      const t = getT("en", "test");

      const result = t.rich("adjacent" as any, {
        tag1: (chunks) => `[${chunks}]`,
        tag2: (chunks) => `{${chunks}}`,
      });

      expect(result).toEqual(["[First]", "{Second}"]);
    });

    it("should handle empty chunks", () => {
      const customUi = {
        en: {
          test: {
            empty: "Text <tag></tag> more text",
          },
        },
      } as const;

      const getT = createGetTranslationsReact(customUi, "en");
      const t = getT("en", "test");

      const result = t.rich("empty" as any, {
        tag: (chunks) => `[${chunks}]`,
      });

      expect(result).toEqual(["Text ", "[]", " more text"]);
    });
  });
});
