import type { AstroIntegration } from "astro";
import type { MessagesConfig, RoutesMap } from "./types/index.js";
import {
  setRequestLocale as _setRequestLocale,
  runWithLocale as _runWithLocale,
  getLocale as _getLocale,
  getLocales as _getLocales,
  isValidLocale as _isValidLocale,
  getMessages as _getMessages,
  getTranslations as _getTranslations,
  getTranslationsReact as _getTranslationsReact,
  defineRequestConfig as _defineRequestConfig,
  __resetRequestConfig as _resetRequestConfig,
  __setConfigMessages,
  __setIntlConfig,
  path as _path,
  switchLocalePath as _switchLocalePath,
} from "./core.js";

export type AstroIntlOptions = {
  enabled?: boolean;
  defaultLocale?: string;
  locales?: string[];
  messages?: MessagesConfig;
  routes?: RoutesMap;
};

export default function astroIntl(options: AstroIntlOptions = {}): AstroIntegration {
  const { enabled = true, defaultLocale, locales, messages, routes } = options;

  if (defaultLocale || locales || routes) {
    __setIntlConfig({
      ...(defaultLocale && { defaultLocale }),
      ...(locales && { locales }),
      ...(routes && { routes }),
    });
  }

  if (messages) {
    __setConfigMessages(messages);
  }

  return {
    name: "astro-intl",
    hooks: {
      "astro:config:setup": ({ logger, updateConfig }) => {
        if (!enabled) return;
        logger.info("[astro-intl] loaded");

        // Configuración para 'astro add'
        updateConfig({
          vite: {
            optimizeDeps: {
              include: ["astro-intl"],
            },
          },
        });
      },
    },
  };
}

// Exportar API
export const setRequestLocale = _setRequestLocale;
export const runWithLocale = _runWithLocale;
export const getLocale = _getLocale;
export const getLocales = _getLocales;
export const isValidLocale = _isValidLocale;
export const getMessages = _getMessages;
export const getTranslations = _getTranslations;
export const getTranslationsReact = _getTranslationsReact;
export const defineRequestConfig = _defineRequestConfig;
export const __resetRequestConfig = _resetRequestConfig;
export const path = _path;
export const switchLocalePath = _switchLocalePath;

// Exportar tipos
export type {
  RequestConfig,
  Primitive,
  GetRequestConfigFn,
  MessagesConfig,
  IntlConfig,
  RoutesMap,
  ExtractParams,
  ParamsForRoute,
} from "./types/index.js";
export type { DotPaths } from "./core.js";
