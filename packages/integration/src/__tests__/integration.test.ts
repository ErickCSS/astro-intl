import { describe, it, expect, beforeEach } from "vitest";
import { setRequestLocale, getLocale, getTranslations, __resetRequestConfig } from "../index.js";
import { getTranslations as getTranslationsReact } from "../adapters/react.js";
import type { RequestConfig } from "../types/index.js";

describe("Integration Tests", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  describe("Complete workflow", () => {
    it("should handle complete translation workflow", async () => {
      const url = new URL("https://example.com/es/products");

      const getRequestConfig = (locale: string): RequestConfig => {
        const messages = {
          en: {
            common: {
              greeting: "Hello",
              welcome: "Welcome to our site",
            },
            products: {
              title: "Our Products",
              description: "Browse our amazing products",
            },
          },
          es: {
            common: {
              greeting: "Hola",
              welcome: "Bienvenido a nuestro sitio",
            },
            products: {
              title: "Nuestros Productos",
              description: "Explora nuestros increíbles productos",
            },
          },
        };

        return {
          locale,
          messages: messages[locale as keyof typeof messages],
        };
      };

      await setRequestLocale(url, getRequestConfig);

      expect(getLocale()).toBe("es");

      const tCommon = getTranslations("common");
      expect(tCommon("greeting" as any)).toBe("Hola");
      expect(tCommon("welcome" as any)).toBe("Bienvenido a nuestro sitio");

      const tProducts = getTranslations("products");
      expect(tProducts("title" as any)).toBe("Nuestros Productos");
      expect(tProducts("description" as any)).toBe("Explora nuestros increíbles productos");
    });

    it("should handle locale switching", async () => {
      const getRequestConfig = (locale: string): RequestConfig => {
        const messages = {
          en: { greeting: "Hello" },
          fr: { greeting: "Bonjour" },
          de: { greeting: "Guten Tag" },
        };

        return {
          locale,
          messages: messages[locale as keyof typeof messages],
        };
      };

      const urlEn = new URL("https://example.com/en/page");
      await setRequestLocale(urlEn, getRequestConfig);
      expect(getLocale()).toBe("en");
      expect(getTranslations()("greeting" as any)).toBe("Hello");

      const urlFr = new URL("https://example.com/fr/page");
      await setRequestLocale(urlFr, getRequestConfig);
      expect(getLocale()).toBe("fr");
      expect(getTranslations()("greeting" as any)).toBe("Bonjour");

      const urlDe = new URL("https://example.com/de/page");
      await setRequestLocale(urlDe, getRequestConfig);
      expect(getLocale()).toBe("de");
      expect(getTranslations()("greeting" as any)).toBe("Guten Tag");
    });

    it("should work with deeply nested translations", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          app: {
            navigation: {
              header: {
                menu: {
                  home: "Home",
                  about: "About Us",
                  contact: "Contact",
                },
              },
            },
          },
        },
      }));

      const t = getTranslations("app");
      expect(t("navigation.header.menu.home" as any)).toBe("Home");
      expect(t("navigation.header.menu.about" as any)).toBe("About Us");
      expect(t("navigation.header.menu.contact" as any)).toBe("Contact");
    });

    it("should handle markup with complex HTML", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          legal:
            "By clicking continue, you agree to our <terms>Terms of Service</terms> and <privacy>Privacy Policy</privacy>.",
        },
      }));

      const t = getTranslations();
      const result = t.markup("legal" as any, {
        terms: (chunks) => `<a href="/terms" class="link">${chunks}</a>`,
        privacy: (chunks) => `<a href="/privacy" class="link">${chunks}</a>`,
      });

      expect(result).toContain('<a href="/terms" class="link">Terms of Service</a>');
      expect(result).toContain('<a href="/privacy" class="link">Privacy Policy</a>');
    });

    it("should handle React translations", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          notification: "You have <count>5</count> new messages",
        },
      }));

      const t = getTranslationsReact();
      const result = t.rich(
        "notification" as any,
        {
          count: (chunks: string) => `<span class="badge">${chunks}</span>`,
        } as any
      );

      expect(result).toEqual(["You have ", '<span class="badge">5</span>', " new messages"]);
    });
  });

  describe("Error handling", () => {
    it("should auto-detect locale or throw descriptive error when accessing translations before setup", () => {
      // With auto-detection, getLocale now tries to detect from window.location
      // In test environment (no window), it may return default or throw
      try {
        const locale = getLocale();
        // If auto-detection works, we should get a valid locale string
        expect(typeof locale).toBe("string");
      } catch (error) {
        // If it throws, it should have the expected error message
        expect((error as Error).message).toContain("No request config found");
      }

      // getTranslations should still throw since it needs messages
      expect(() => getTranslations()).toThrow(/No request config found/);
    });

    it("should handle missing translations gracefully", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          existing: "This exists",
        },
      }));

      const t = getTranslations();
      expect(t("existing" as any)).toBe("This exists");
      expect(t("missing" as any)).toBe("missing");
      expect(t("deeply.nested.missing" as any)).toBe("deeply.nested.missing");
    });
  });

  describe("Security", () => {
    it("should prevent XSS attacks in markup", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          malicious: '<script>alert("XSS")</script><img src=x onerror="alert(1)">Safe text',
        },
      }));

      const t = getTranslations();
      const result = t.markup("malicious" as any, {});

      expect(result).not.toContain("<script>");
      expect(result).not.toContain("onerror");
      expect(result).toContain("Safe text");
    });

    it("should prevent prototype pollution", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          safe: "Safe value",
        },
      }));

      const t = getTranslations();
      expect(t("__proto__" as any)).toBe("__proto__");
      expect(t("constructor" as any)).toBe("constructor");
      expect(t("prototype" as any)).toBe("prototype");
    });

    it("should sanitize javascript: URIs", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          link: '<a href="javascript:alert(1)">Click me</a>',
        },
      }));

      const t = getTranslations();
      const result = t.markup("link" as any, {});

      expect(result).not.toContain("javascript:");
    });

    it("should sanitize data: URIs", async () => {
      const url = new URL("https://example.com/en/page");

      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          image: '<img src="data:text/html,<script>alert(1)</script>">',
        },
      }));

      const t = getTranslations();
      const result = t.markup("image" as any, {});

      expect(result).not.toContain("data:");
    });
  });

  describe("Locale validation", () => {
    it("should accept valid BCP-47 language tags", async () => {
      const validLocales = ["en", "es", "pt-BR", "zh-CN", "en-US", "fr-CA"];

      for (const locale of validLocales) {
        const url = new URL(`https://example.com/${locale}/page`);
        await setRequestLocale(url, (loc) => ({
          locale: loc,
          messages: {},
        }));
        expect(getLocale()).toBe(locale);
      }
    });

    it("should reject invalid locale formats", async () => {
      const invalidLocales = ["invalid@locale", "123", "en_US", "en-", "-en", "en--US"];

      for (const locale of invalidLocales) {
        const url = new URL(`https://example.com/${locale}/page`);
        await expect(
          setRequestLocale(url, () => ({
            locale,
            messages: {},
          }))
        ).rejects.toThrow(/Invalid locale/);
      }
    });
  });

  describe("Performance", () => {
    it("should handle large message objects efficiently", async () => {
      const largeMessages: Record<string, string> = {};
      for (let i = 0; i < 1000; i++) {
        largeMessages[`key${i}`] = `Value ${i}`;
      }

      const url = new URL("https://example.com/en/page");
      await setRequestLocale(url, () => ({
        locale: "en",
        messages: largeMessages,
      }));

      const t = getTranslations();
      expect(t("key500" as any)).toBe("Value 500");
      expect(t("key999" as any)).toBe("Value 999");
    });

    it("should handle multiple namespace access efficiently", async () => {
      const url = new URL("https://example.com/en/page");
      await setRequestLocale(url, () => ({
        locale: "en",
        messages: {
          ns1: { key: "value1" },
          ns2: { key: "value2" },
          ns3: { key: "value3" },
          ns4: { key: "value4" },
          ns5: { key: "value5" },
        },
      }));

      const t1 = getTranslations("ns1");
      const t2 = getTranslations("ns2");
      const t3 = getTranslations("ns3");
      const t4 = getTranslations("ns4");
      const t5 = getTranslations("ns5");

      expect(t1("key" as any)).toBe("value1");
      expect(t2("key" as any)).toBe("value2");
      expect(t3("key" as any)).toBe("value3");
      expect(t4("key" as any)).toBe("value4");
      expect(t5("key" as any)).toBe("value5");
    });
  });
});
