import { describe, it, expect, beforeEach } from "vitest";
import {
  setRequestLocale,
  getLocale,
  getTranslations,
  defineRequestConfig,
  __resetRequestConfig,
} from "../core.js";
import { __setConfigMessages } from "../core.js";

describe("Config-based messages (simple approach)", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  it("should work with static messages in config", async () => {
    __setConfigMessages({
      en: { greeting: "Hello", farewell: "Goodbye" },
      es: { greeting: "Hola", farewell: "Adiós" },
    });

    const url = new URL("https://example.com/es/page");
    await setRequestLocale(url);

    expect(getLocale()).toBe("es");
    const t = getTranslations();
    expect(t("greeting" as any)).toBe("Hola");
    expect(t("farewell" as any)).toBe("Adiós");
  });

  it("should work with dynamic import functions", async () => {
    __setConfigMessages({
      en: () => Promise.resolve({ default: { greeting: "Hello" } }),
      fr: () => Promise.resolve({ default: { greeting: "Bonjour" } }),
    });

    const url = new URL("https://example.com/fr/page");
    await setRequestLocale(url);

    expect(getLocale()).toBe("fr");
    expect(getTranslations()("greeting" as any)).toBe("Bonjour");
  });

  it("should work with dynamic imports without default export", async () => {
    __setConfigMessages({
      en: () => Promise.resolve({ greeting: "Hello" }),
      de: () => Promise.resolve({ greeting: "Hallo" }),
    });

    const url = new URL("https://example.com/de/page");
    await setRequestLocale(url);

    expect(getLocale()).toBe("de");
    expect(getTranslations()("greeting" as any)).toBe("Hallo");
  });

  it("should handle namespaces with config messages", async () => {
    __setConfigMessages({
      en: {
        nav: { home: "Home", about: "About" },
        hero: { title: "Welcome" },
      },
      es: {
        nav: { home: "Inicio", about: "Acerca" },
        hero: { title: "Bienvenido" },
      },
    });

    const url = new URL("https://example.com/es/page");
    await setRequestLocale(url);

    const tNav = getTranslations("nav");
    expect(tNav("home" as any)).toBe("Inicio");

    const tHero = getTranslations("hero");
    expect(tHero("title" as any)).toBe("Bienvenido");
  });

  it("should throw when locale is not in messages config", async () => {
    __setConfigMessages({
      en: { greeting: "Hello" },
    });

    const url = new URL("https://example.com/fr/page");
    await expect(setRequestLocale(url)).rejects.toThrow(/No messages found for locale "fr"/);
  });

  it("should switch locales correctly", async () => {
    __setConfigMessages({
      en: { greeting: "Hello" },
      es: { greeting: "Hola" },
      fr: { greeting: "Bonjour" },
    });

    await setRequestLocale(new URL("https://example.com/en/page"));
    expect(getTranslations()("greeting" as any)).toBe("Hello");

    await setRequestLocale(new URL("https://example.com/es/page"));
    expect(getTranslations()("greeting" as any)).toBe("Hola");

    await setRequestLocale(new URL("https://example.com/fr/page"));
    expect(getTranslations()("greeting" as any)).toBe("Bonjour");
  });

  it("should throw when no config or messages are provided", async () => {
    const url = new URL("https://example.com/en/page");
    await expect(setRequestLocale(url)).rejects.toThrow(/No getRequestConfig or messages provided/);
  });
});

describe("defineRequestConfig (next-intl style)", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  it("should register config and use it without passing to setRequestLocale", async () => {
    defineRequestConfig((locale) => ({
      locale,
      messages: {
        en: { greeting: "Hello" },
        es: { greeting: "Hola" },
      }[locale] as Record<string, unknown>,
    }));

    const url = new URL("https://example.com/es/page");
    await setRequestLocale(url);

    expect(getLocale()).toBe("es");
    expect(getTranslations()("greeting" as any)).toBe("Hola");
  });

  it("should work with async defineRequestConfig", async () => {
    defineRequestConfig(async (locale) => {
      await new Promise((r) => setTimeout(r, 5));
      return {
        locale,
        messages: { greeting: locale === "fr" ? "Bonjour" : "Hello" },
      };
    });

    const url = new URL("https://example.com/fr/page");
    await setRequestLocale(url);

    expect(getLocale()).toBe("fr");
    expect(getTranslations()("greeting" as any)).toBe("Bonjour");
  });

  it("should allow explicit getConfig to override registered one", async () => {
    defineRequestConfig((locale) => ({
      locale,
      messages: { greeting: "From registered" },
    }));

    const url = new URL("https://example.com/en/page");
    await setRequestLocale(url, (locale) => ({
      locale,
      messages: { greeting: "From explicit" },
    }));

    expect(getTranslations()("greeting" as any)).toBe("From explicit");
  });

  it("should prioritize explicit > registered > configMessages", async () => {
    __setConfigMessages({
      en: { greeting: "From config messages" },
    });

    defineRequestConfig((locale) => ({
      locale,
      messages: { greeting: "From registered" },
    }));

    const url = new URL("https://example.com/en/page");

    // Explicit wins
    await setRequestLocale(url, (locale) => ({
      locale,
      messages: { greeting: "From explicit" },
    }));
    expect(getTranslations()("greeting" as any)).toBe("From explicit");

    // Reset and use registered
    __resetRequestConfig();
    defineRequestConfig((locale) => ({
      locale,
      messages: { greeting: "From registered" },
    }));
    __setConfigMessages({
      en: { greeting: "From config messages" },
    });

    await setRequestLocale(url);
    expect(getTranslations()("greeting" as any)).toBe("From registered");

    // Reset registered, falls back to configMessages
    __resetRequestConfig();
    __setConfigMessages({
      en: { greeting: "From config messages" },
    });

    await setRequestLocale(url);
    expect(getTranslations()("greeting" as any)).toBe("From config messages");
  });
});
