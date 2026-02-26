import { describe, it, expect, beforeEach } from "vitest";
import {
  setRequestLocale,
  getLocale,
  getTranslations,
  getNestedValue,
  __resetRequestConfig,
} from "../core.js";
import type { RequestConfig } from "../types/index.js";

describe("core.ts", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  describe("getNestedValue", () => {
    it("should get nested values from object", () => {
      const obj = {
        user: {
          name: "John",
          address: {
            city: "New York",
          },
        },
      };

      expect(getNestedValue(obj, "user.name")).toBe("John");
      expect(getNestedValue(obj, "user.address.city")).toBe("New York");
    });

    it("should return undefined for non-existent paths", () => {
      const obj = { user: { name: "John" } };
      expect(getNestedValue(obj, "user.age")).toBeUndefined();
      expect(getNestedValue(obj, "nonexistent.path")).toBeUndefined();
    });

    it("should block prototype pollution attempts", () => {
      const obj = { user: { name: "John" } };
      expect(getNestedValue(obj, "__proto__")).toBeUndefined();
      expect(getNestedValue(obj, "constructor")).toBeUndefined();
      expect(getNestedValue(obj, "prototype")).toBeUndefined();
    });
  });

  describe("setRequestLocale", () => {
    it("should set locale from URL pathname", async () => {
      const url = new URL("https://example.com/es/about");
      const config: RequestConfig = {
        locale: "es",
        messages: { greeting: "Hola" },
      };

      await setRequestLocale(url, () => config);
      expect(getLocale()).toBe("es");
    });

    it("should default to 'en' when no locale in URL", async () => {
      const url = new URL("https://example.com/");
      const config: RequestConfig = {
        locale: "en",
        messages: { greeting: "Hello" },
      };

      await setRequestLocale(url, () => config);
      expect(getLocale()).toBe("en");
    });

    it("should accept async config function", async () => {
      const url = new URL("https://example.com/fr/home");
      const config: RequestConfig = {
        locale: "fr",
        messages: { greeting: "Bonjour" },
      };

      await setRequestLocale(url, async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(config), 10);
        });
      });

      expect(getLocale()).toBe("fr");
    });

    it("should sanitize and validate locale", async () => {
      const url = new URL("https://example.com/pt-BR/home");
      const config: RequestConfig = {
        locale: "pt-BR",
        messages: { greeting: "Olá" },
      };

      await setRequestLocale(url, () => config);
      expect(getLocale()).toBe("pt-BR");
    });

    it("should throw error for invalid locale format", async () => {
      const url = new URL("https://example.com/invalid@locale/home");
      const config: RequestConfig = {
        locale: "invalid@locale",
        messages: {},
      };

      await expect(setRequestLocale(url, () => config)).rejects.toThrow(/Invalid locale/);
    });
  });

  describe("getLocale", () => {
    it("should throw error when called before setRequestLocale", () => {
      expect(() => getLocale()).toThrow(/No request config found/);
    });

    it("should return current locale after setRequestLocale", async () => {
      const url = new URL("https://example.com/de/page");
      await setRequestLocale(url, () => ({
        locale: "de",
        messages: {},
      }));

      expect(getLocale()).toBe("de");
    });
  });

  describe("getTranslations", () => {
    beforeEach(async () => {
      const url = new URL("https://example.com/en/home");
      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          common: {
            greeting: "Hello",
            farewell: "Goodbye",
            nested: {
              deep: "Deep value",
            },
          },
          home: {
            title: "Welcome Home",
            description: "This is the home page",
          },
        },
      }));
    });

    it("should throw error when called before setRequestLocale", () => {
      __resetRequestConfig();
      expect(() => getTranslations()).toThrow(/No request config found/);
    });

    it("should get translations without namespace", () => {
      const t = getTranslations();
      expect(t("common.greeting" as any)).toBe("Hello");
      expect(t("home.title" as any)).toBe("Welcome Home");
    });

    it("should get translations with namespace", () => {
      const t = getTranslations("common");
      expect(t("greeting" as any)).toBe("Hello");
      expect(t("farewell" as any)).toBe("Goodbye");
    });

    it("should handle nested keys", () => {
      const t = getTranslations("common");
      expect(t("nested.deep" as any)).toBe("Deep value");
    });

    it("should return key when translation not found", () => {
      const t = getTranslations("common");
      expect(t("nonexistent" as any)).toBe("nonexistent");
    });

    describe("t() interpolation", () => {
      beforeEach(async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            greeting: "Hello, {name}!",
            intro: "I am {name}, age {age}, active: {active}",
            missing: "Hello, {name}! You are from {city}.",
            plain: "No variables here",
          },
        }));
      });

      it("should interpolate a single variable", () => {
        const t = getTranslations();
        expect(t("greeting" as any, { name: "Erick" })).toBe("Hello, Erick!");
      });

      it("should interpolate multiple variables", () => {
        const t = getTranslations();
        expect(t("intro" as any, { name: "Erick", age: 30, active: true })).toBe(
          "I am Erick, age 30, active: true"
        );
      });

      it("should keep placeholder when variable is missing", () => {
        const t = getTranslations();
        expect(t("missing" as any, { name: "Erick" })).toBe("Hello, Erick! You are from {city}.");
      });

      it("should keep placeholder when value is null or undefined", () => {
        const t = getTranslations();
        expect(t("greeting" as any, { name: null as any })).toBe("Hello, {name}!");
        expect(t("greeting" as any, { name: undefined })).toBe("Hello, {name}!");
      });

      it("should return plain string when no values provided (backward compat)", () => {
        const t = getTranslations();
        expect(t("plain" as any)).toBe("No variables here");
      });

      it("should return plain string with placeholders when no values provided", () => {
        const t = getTranslations();
        expect(t("greeting" as any)).toBe("Hello, {name}!");
      });
    });

    describe("t.markup", () => {
      it("should interpolate HTML tags", async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            text: "Click <link>here</link> to continue",
          },
        }));

        const t = getTranslations();
        const result = t.markup("text" as any, {
          link: (chunks) => `<a href="/test">${chunks}</a>`,
        });

        expect(result).toBe('Click <a href="/test">here</a> to continue');
      });

      it("should handle multiple tags", async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            text: "Text with <bold>bold</bold> and <italic>italic</italic>",
          },
        }));

        const t = getTranslations();
        const result = t.markup("text" as any, {
          bold: (chunks) => `<strong>${chunks}</strong>`,
          italic: (chunks) => `<em>${chunks}</em>`,
        });

        expect(result).toBe("Text with <strong>bold</strong> and <em>italic</em>");
      });

      it("should sanitize dangerous HTML", async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            dangerous: "<script>alert('xss')</script>Safe text",
          },
        }));

        const t = getTranslations();
        const result = t.markup("dangerous" as any, {});

        expect(result).not.toContain("<script>");
        expect(result).toContain("Safe text");
      });

      it("should remove event handlers", async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            text: '<div onclick="alert()">Click</div>',
          },
        }));

        const t = getTranslations();
        const result = t.markup("text" as any, {});

        expect(result).not.toContain("onclick");
      });

      it("should remove javascript: URIs", async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            text: '<a href="javascript:alert()">Link</a>',
          },
        }));

        const t = getTranslations();
        const result = t.markup("text" as any, {});

        expect(result).not.toContain("javascript:");
      });

      it("should support interpolation combined with tags", async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            welcome: "Hello {name}, click <link>here</link> to continue",
          },
        }));

        const t = getTranslations();
        const result = t.markup("welcome" as any, {
          values: { name: "Erick" },
          tags: {
            link: (chunks) => `<a href="/home">${chunks}</a>`,
          },
        });

        expect(result).toBe('Hello Erick, click <a href="/home">here</a> to continue');
      });

      it("should support markup with tags-only (backward compat)", async () => {
        const url = new URL("https://example.com/en/home");
        await setRequestLocale(url, () => ({
          locale: "en",
          messages: {
            text: "Click <link>here</link>",
          },
        }));

        const t = getTranslations();
        const result = t.markup("text" as any, {
          link: (chunks) => `<a href="/go">${chunks}</a>`,
        });

        expect(result).toBe('Click <a href="/go">here</a>');
      });
    });
  });
});
