// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";
import { createIntlMiddleware } from "../middleware.js";
import {
  __resetRequestConfig,
  __setIntlConfig,
  defineRequestConfig,
  getLocale,
  getMessages,
  runWithLocale,
  setRequestLocale,
} from "../store.js";

function context(locale: string) {
  const url = new URL(`https://example.test/${locale}/page`);
  return {
    url,
    request: new Request(url),
    rewrite: () => Promise.resolve(new Response("rewritten")),
  };
}

describe("request isolation", () => {
  beforeEach(() => {
    __resetRequestConfig();
    defineRequestConfig((locale) => ({ locale, messages: { marker: locale } }));
  });

  it("isolates two interleaved middleware requests", async () => {
    const middleware = createIntlMiddleware({ locales: ["en", "es"], defaultLocale: "en" });
    const seenByA: string[] = [];
    let releaseA!: () => void;
    let markAReady!: () => void;
    const aReady = new Promise<void>((resolve) => (markAReady = resolve));
    const aCanFinish = new Promise<void>((resolve) => (releaseA = resolve));

    const requestA = middleware(context("en"), async () => {
      seenByA.push(`${getLocale()}:${getMessages<{ marker: string }>().marker}`);
      markAReady();
      await aCanFinish;
      seenByA.push(`${getLocale()}:${getMessages<{ marker: string }>().marker}`);
      return new Response("a");
    });

    await aReady;
    await middleware(context("es"), () => {
      expect(getLocale()).toBe("es");
      expect(getMessages<{ marker: string }>().marker).toBe("es");
      return Promise.resolve(new Response("b"));
    });
    releaseA();
    await requestA;

    expect(seenByA).toEqual(["en:en", "en:en"]);
    expect(() => getLocale()).toThrow(/No request config found/);
  });

  it("isolates direct runWithLocale calls", async () => {
    __setIntlConfig({ locales: ["en", "es"], defaultLocale: "en" });
    let releaseA!: () => void;
    let markAReady!: () => void;
    const aReady = new Promise<void>((resolve) => (markAReady = resolve));
    const aCanFinish = new Promise<void>((resolve) => (releaseA = resolve));

    const requestA = runWithLocale(new URL("https://example.test/en"), async () => {
      markAReady();
      await aCanFinish;
      return getMessages<{ marker: string }>().marker;
    });

    await aReady;
    const resultB = await runWithLocale(
      new URL("https://example.test/es"),
      () => getMessages<{ marker: string }>().marker
    );
    releaseA();

    expect(resultB).toBe("es");
    await expect(requestA).resolves.toBe("en");
  });

  it("clears the current legacy context after failed initialization", async () => {
    __setIntlConfig({ locales: ["en", "es"], defaultLocale: "en" });
    await setRequestLocale(new URL("https://example.test/en"));
    expect(getLocale()).toBe("en");

    await expect(setRequestLocale(new URL("https://example.test/fr"))).resolves.toBe(false);
    expect(() => getLocale()).toThrow(/No request config found/);
  });
});
