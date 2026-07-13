import { describe, it, expect, beforeEach } from "vitest";
import { __resetRequestConfig } from "../core.js";
import { setFallbackRoutes, getFallbackRoutes } from "../store.js";
import type { FallbackRouteInfo } from "../types/index.js";

describe("Fallback Routes (Astro 6.1+)", () => {
  beforeEach(() => {
    __resetRequestConfig();
  });

  it("returns empty array by default", () => {
    expect(getFallbackRoutes()).toEqual([]);
  });

  it("stores and retrieves fallback routes", () => {
    const routes: FallbackRouteInfo[] = [
      { pattern: "/fr/about", pathname: "/fr/about/", locale: "fr" },
      { pattern: "/de/about", pathname: "/de/about/", locale: "de" },
    ];

    setFallbackRoutes(routes);
    expect(getFallbackRoutes()).toEqual(routes);
  });

  it("overwrites previous fallback routes on re-set", () => {
    setFallbackRoutes([{ pattern: "/fr/about", pathname: "/fr/about/", locale: "fr" }]);

    const newRoutes: FallbackRouteInfo[] = [
      { pattern: "/de/contact", pathname: "/de/contact/", locale: "de" },
    ];
    setFallbackRoutes(newRoutes);

    expect(getFallbackRoutes()).toEqual(newRoutes);
  });

  it("clears fallback routes on reset", () => {
    setFallbackRoutes([{ pattern: "/fr/about", pathname: "/fr/about/", locale: "fr" }]);

    __resetRequestConfig();

    expect(getFallbackRoutes()).toEqual([]);
  });

  it("handles routes without pathname (pattern-only)", () => {
    const routes: FallbackRouteInfo[] = [{ pattern: "/fr/blog/[...slug]", locale: "fr" }];

    setFallbackRoutes(routes);
    expect(getFallbackRoutes()).toEqual(routes);
    expect(getFallbackRoutes()[0].pathname).toBeUndefined();
  });

  it("handles empty array without errors", () => {
    setFallbackRoutes([]);
    expect(getFallbackRoutes()).toEqual([]);
  });
});
