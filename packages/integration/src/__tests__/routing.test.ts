import { describe, it, expect, beforeEach, vi } from "vitest";
import { __resetRequestConfig, __setIntlConfig, setRequestLocale } from "../core.js";
import { path, switchLocalePath, templateToRegex } from "../routing.js";
import type { RequestConfig, RoutesMap } from "../types/index.js";

// ─── Helpers ─────────────────────────────────────────────────────────

const ROUTES: RoutesMap = {
  home: { en: "/", es: "/" },
  about: { en: "/about", es: "/sobre-nosotros" },
  post: { en: "/blog/[slug]", es: "/blog/[slug]" },
  shop: { en: "/shop/[category]/[id]", es: "/tienda/[category]/[id]" },
};

function setupConfig(opts?: { routes?: RoutesMap; locales?: string[] }) {
  __setIntlConfig({
    defaultLocale: "en",
    locales: opts?.locales ?? ["en", "es"],
    routes: opts?.routes ?? ROUTES,
  });
}

async function setLocale(locale: string) {
  const url = new URL(`https://example.com/${locale}/page`);
  const config: RequestConfig = { locale, messages: {} };
  await setRequestLocale(url, () => config);
}

// ─── templateToRegex ─────────────────────────────────────────────────

describe("templateToRegex()", () => {
  it("converts template without params", () => {
    const { regex, paramNames } = templateToRegex("/about");
    expect(paramNames).toEqual([]);
    expect(regex.test("/about")).toBe(true);
    expect(regex.test("/other")).toBe(false);
  });

  it("converts template with one param", () => {
    const { regex, paramNames } = templateToRegex("/blog/[slug]");
    expect(paramNames).toEqual(["slug"]);
    expect(regex.test("/blog/hello-world")).toBe(true);
    expect(regex.test("/blog/")).toBe(false);
    expect(regex.test("/blog/a/b")).toBe(false);
  });

  it("converts template with multiple params", () => {
    const { regex, paramNames } = templateToRegex("/shop/[category]/[id]");
    expect(paramNames).toEqual(["category", "id"]);
    expect(regex.test("/shop/clothing/42")).toBe(true);
    expect(regex.test("/shop/clothing")).toBe(false);
  });

  it("escapes special regex characters in template", () => {
    const { regex } = templateToRegex("/file.html");
    expect(regex.test("/file.html")).toBe(true);
    expect(regex.test("/fileXhtml")).toBe(false);
  });

  it("caches compiled regex", () => {
    const a = templateToRegex("/blog/[slug]");
    const b = templateToRegex("/blog/[slug]");
    expect(a).toBe(b);
  });

  it("matches root path", () => {
    const { regex, paramNames } = templateToRegex("/");
    expect(paramNames).toEqual([]);
    expect(regex.test("/")).toBe(true);
  });
});

// ─── path() ──────────────────────────────────────────────────────────

describe("path()", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  it("generates simple path without params", async () => {
    setupConfig();
    await setLocale("en");
    expect(path("about", { locale: "es" })).toBe("/es/sobre-nosotros");
  });

  it("generates path with params", async () => {
    setupConfig();
    await setLocale("en");
    expect(path("post", { locale: "en", params: { slug: "hello-world" } })).toBe(
      "/en/blog/hello-world"
    );
  });

  it("generates path with multiple params", async () => {
    setupConfig();
    await setLocale("en");
    expect(path("shop", { locale: "es", params: { category: "ropa", id: "42" } })).toBe(
      "/es/tienda/ropa/42"
    );
  });

  it("uses current locale when not specified", async () => {
    setupConfig();
    await setLocale("en");
    expect(path("about", {})).toBe("/en/about");
  });

  it("uses current locale when options is empty", async () => {
    setupConfig();
    await setLocale("es");
    expect(path("about")).toBe("/es/sobre-nosotros");
  });

  it("throws if routeKey does not exist", async () => {
    setupConfig();
    await setLocale("en");
    expect(() => path("nonexistent", { locale: "en" })).toThrow(/Unknown route key/);
  });

  it("throws if locale has no template for route", async () => {
    setupConfig({
      routes: { about: { en: "/about" } },
      locales: ["en", "es"],
    });
    await setLocale("en");
    expect(() => path("about", { locale: "es" })).toThrow(/no template for locale/);
  });

  it("throws if routes not configured", async () => {
    __setIntlConfig({ defaultLocale: "en", locales: ["en", "es"] });
    await setLocale("en");
    expect(() => path("about", { locale: "en" })).toThrow(/No routes configured/);
  });

  it("throws if params are missing", async () => {
    setupConfig();
    await setLocale("en");
    expect(() => path("post", { locale: "en" })).toThrow(/Missing params/);
  });

  it("throws for invalid locale", async () => {
    setupConfig();
    await setLocale("en");
    expect(() => path("about", { locale: "fr" })).toThrow(/Invalid locale/);
  });

  it("encodes params by default", async () => {
    setupConfig();
    await setLocale("en");
    expect(path("post", { locale: "en", params: { slug: "hello world" } })).toBe(
      "/en/blog/hello%20world"
    );
  });

  it("skips encoding when encode is false", async () => {
    setupConfig();
    await setLocale("en");
    expect(path("post", { locale: "en", params: { slug: "hello world" }, encode: false })).toBe(
      "/en/blog/hello world"
    );
  });

  it("handles root path template", async () => {
    setupConfig();
    await setLocale("en");
    expect(path("home", { locale: "es" })).toBe("/es/");
  });
});

// ─── switchLocalePath() ──────────────────────────────────────────────

describe("switchLocalePath()", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  it("switches locale on simple route", () => {
    setupConfig();
    expect(switchLocalePath("/en/about", "es")).toBe("/es/sobre-nosotros");
  });

  it("switches locale on route with params", () => {
    setupConfig();
    expect(switchLocalePath("/en/blog/my-post", "es")).toBe("/es/blog/my-post");
  });

  it("switches locale with multiple params", () => {
    setupConfig();
    expect(switchLocalePath("/en/shop/clothing/42", "es")).toBe("/es/tienda/clothing/42");
  });

  it("fallback: just swaps prefix when no route matches", () => {
    setupConfig();
    expect(switchLocalePath("/en/unknown/page", "es")).toBe("/es/unknown/page");
  });

  it("handles full URL input", () => {
    setupConfig();
    expect(switchLocalePath("https://example.com/en/about", "es")).toBe("/es/sobre-nosotros");
  });

  it("handles URL object input", () => {
    setupConfig();
    const url = new URL("https://example.com/en/about");
    expect(switchLocalePath(url, "es")).toBe("/es/sobre-nosotros");
  });

  it("handles root path", () => {
    setupConfig();
    expect(switchLocalePath("/en/", "es")).toBe("/es/");
  });

  it("handles root path without trailing slash", () => {
    setupConfig();
    expect(switchLocalePath("/en", "es")).toBe("/es/");
  });

  it("preserves query params", () => {
    setupConfig();
    expect(switchLocalePath("/en/about?ref=nav", "es")).toBe("/es/sobre-nosotros?ref=nav");
  });

  it("preserves hash", () => {
    setupConfig();
    expect(switchLocalePath("/en/about#section", "es")).toBe("/es/sobre-nosotros#section");
  });

  it("preserves query + hash", () => {
    setupConfig();
    expect(switchLocalePath("/en/about?x=1#section", "es")).toBe("/es/sobre-nosotros?x=1#section");
  });

  it("works without routes configured (fallback only)", () => {
    __setIntlConfig({ defaultLocale: "en", locales: ["en", "es"] });
    expect(switchLocalePath("/en/about", "es")).toBe("/es/about");
  });

  it("prepends locale when path has no locale prefix", () => {
    setupConfig();
    expect(switchLocalePath("/about", "es")).toBe("/es/about");
  });

  it("throws for invalid nextLocale", () => {
    setupConfig();
    expect(() => switchLocalePath("/en/about", "fr")).toThrow(/Invalid locale/);
  });

  it("switches from es to en", () => {
    setupConfig();
    expect(switchLocalePath("/es/sobre-nosotros", "en")).toBe("/en/about");
  });

  it("switches es route with params to en", () => {
    setupConfig();
    expect(switchLocalePath("/es/tienda/ropa/42", "en")).toBe("/en/shop/ropa/42");
  });
});

// ─── detectRouteConflicts (via __setIntlConfig) ──────────────────────

describe("detectRouteConflicts", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  it("throws on exact duplicate templates", () => {
    expect(() =>
      __setIntlConfig({
        locales: ["en"],
        routes: {
          blog: { en: "/blog/[slug]" },
          news: { en: "/blog/[slug]" },
        },
      })
    ).toThrow(/Duplicate route template/);
  });

  it("warns on structurally equivalent templates", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    __setIntlConfig({
      locales: ["en"],
      routes: {
        blog: { en: "/blog/[slug]" },
        news: { en: "/blog/[article]" },
      },
    });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Route conflict detected"));
    warnSpy.mockRestore();
  });

  it("does not warn for distinct templates", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    __setIntlConfig({
      locales: ["en"],
      routes: {
        blog: { en: "/blog/[slug]" },
        about: { en: "/about" },
      },
    });
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ─── Template validation ─────────────────────────────────────────────

describe("template validation", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  it("throws on unbalanced brackets", async () => {
    setupConfig({
      routes: { bad: { en: "/blog/[slug", es: "/blog/[slug]" } },
      locales: ["en", "es"],
    });
    await setLocale("en");
    expect(() => path("bad", { locale: "en" })).toThrow(/Unbalanced brackets/);
  });

  it("throws on invalid param names", async () => {
    setupConfig({
      routes: { bad: { en: "/blog/[slug-name]", es: "/blog/[slug]" } },
      locales: ["en", "es"],
    });
    await setLocale("en");
    expect(() => path("bad", { locale: "en" })).toThrow(/Param names must match/);
  });
});
