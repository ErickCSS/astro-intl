import { describe, it, expect } from "vitest";
import { createGetTranslations, renderRichText } from "../adapters/svelte.js";

describe("svelte adapter", () => {
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

  describe("createGetTranslations", () => {
    it("should create translation function for default locale", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "common");

      expect(t("greeting" as any)).toBe("Hello");
      expect(t("farewell" as any)).toBe("Goodbye");
    });

    it("should create translation function for non-default locale", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("es", "common");

      expect(t("greeting" as any)).toBe("Hola");
      expect(t("farewell" as any)).toBe("Adiós");
    });

    it("should handle nested keys", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "common");

      expect(t("nested.deep" as any)).toBe("Deep value");
    });

    it("should return key when translation not found", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "common");

      expect(t("nonexistent" as any)).toBe("nonexistent");
    });

    it("should fallback to default locale when locale not found", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("fr" as any, "common");

      expect(t("greeting" as any)).toBe("Hello");
    });
  });

  describe("t.rich", () => {
    it("should return segments for a single tag", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "home");

      const result = t.rich("withTags" as any, ["link"]);
      expect(result).toEqual([
        { type: "text", value: "Click " },
        { type: "tag", tag: "link", chunks: "here" },
        { type: "text", value: " to continue" },
      ]);
    });

    it("should return segments for multiple tags", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "home");

      const result = t.rich("multipleTags" as any, ["bold", "italic"]);
      expect(result).toEqual([
        { type: "text", value: "Text with " },
        { type: "tag", tag: "bold", chunks: "bold" },
        { type: "text", value: " and " },
        { type: "tag", tag: "italic", chunks: "italic" },
      ]);
    });

    it("should return text segment when no tagNames provided", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "common");

      const result = t.rich("greeting" as any);
      expect(result).toEqual([{ type: "text", value: "Hello" }]);
    });

    it("should work with Spanish locale", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("es", "home");

      const result = t.rich("withTags" as any, ["link"]);
      expect(result).toEqual([
        { type: "text", value: "Haz clic " },
        { type: "tag", tag: "link", chunks: "aquí" },
        { type: "text", value: " para continuar" },
      ]);
    });

    it("should handle adjacent tags", () => {
      const customUi = {
        en: {
          test: {
            adjacent: "<tag1>First</tag1><tag2>Second</tag2>",
          },
        },
      } as const;

      const getT = createGetTranslations(customUi, "en");
      const t = getT("en", "test");

      const result = t.rich("adjacent" as any, ["tag1", "tag2"]);
      expect(result).toEqual([
        { type: "tag", tag: "tag1", chunks: "First" },
        { type: "tag", tag: "tag2", chunks: "Second" },
      ]);
    });

    it("should handle empty chunks", () => {
      const customUi = {
        en: {
          test: {
            empty: "Text <tag></tag> more text",
          },
        },
      } as const;

      const getT = createGetTranslations(customUi, "en");
      const t = getT("en", "test");

      const result = t.rich("empty" as any, ["tag"]);
      expect(result).toEqual([
        { type: "text", value: "Text " },
        { type: "tag", tag: "tag", chunks: "" },
        { type: "text", value: " more text" },
      ]);
    });
  });

  describe("renderRichText", () => {
    it("should resolve tags to native HTML elements", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "home");

      const segments = t.rich("multipleTags" as any, ["bold", "italic"]);
      const html = renderRichText(segments, {
        tags: { bold: "strong", italic: "em" },
      });

      expect(html).toBe("Text with <strong>bold</strong> and <em>italic</em>");
    });

    it("should resolve components as callback functions", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "home");

      const segments = t.rich("withTags" as any, ["link"]);
      const html = renderRichText(segments, {
        components: {
          link: (chunks) => `<a href="/target">${chunks}</a>`,
        },
      });

      expect(html).toBe('Click <a href="/target">here</a> to continue');
    });

    it("should mix tags and components", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "home");

      const segments = t.rich("multipleTags" as any, ["bold", "italic"]);
      const html = renderRichText(segments, {
        tags: { bold: "strong" },
        components: {
          italic: (chunks) => `<span class="italic">${chunks}</span>`,
        },
      });

      expect(html).toBe('Text with <strong>bold</strong> and <span class="italic">italic</span>');
    });

    it("should fallback to plain chunks when no resolver found", () => {
      const getT = createGetTranslations(ui, "en");
      const t = getT("en", "home");

      const segments = t.rich("withTags" as any, ["link"]);
      const html = renderRichText(segments);

      expect(html).toBe("Click here to continue");
    });

    it("should handle empty segments", () => {
      const html = renderRichText([]);
      expect(html).toBe("");
    });
  });
});
