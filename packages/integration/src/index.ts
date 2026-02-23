import type { AstroIntegration } from "astro";
import {
  setRequestLocale as _setRequestLocale,
  getLocale as _getLocale,
  getTranslations as _getTranslations,
  getTranslationsReact as _getTranslationsReact,
  __resetRequestConfig as _resetRequestConfig,
} from "./core.js";

export type MyIntegrationOptions = {
  enabled?: boolean;
};

export default function myIntegration(options: MyIntegrationOptions = {}): AstroIntegration {
  const { enabled = true } = options;

  return {
    name: "astro-intl",
    hooks: {
      "astro:config:setup": ({ logger }) => {
        if (!enabled) return;
        logger.info("[astro-intl] loaded");
      },
    },
  };
}

// Exportar API
export const setRequestLocale = _setRequestLocale;
export const getLocale = _getLocale;
export const getTranslations = _getTranslations;
export const getTranslationsReact = _getTranslationsReact;
export const __resetRequestConfig = _resetRequestConfig;

// Exportar tipos
export type { RequestConfig } from "./types/index.js";
export type { DotPaths } from "./core.js";
