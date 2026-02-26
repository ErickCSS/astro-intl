import type { AstroIntegration } from "astro";
import type { MessagesConfig } from "./types/index.js";
import {
  setRequestLocale as _setRequestLocale,
  runWithLocale as _runWithLocale,
  getLocale as _getLocale,
  getMessages as _getMessages,
  getTranslations as _getTranslations,
  getTranslationsReact as _getTranslationsReact,
  defineRequestConfig as _defineRequestConfig,
  __resetRequestConfig as _resetRequestConfig,
  __setConfigMessages,
  __setIntlConfig,
} from "./core.js";

export type AstroIntlOptions = {
  enabled?: boolean;
  defaultLocale?: string;
  messages?: MessagesConfig;
};

export default function astroIntl(options: AstroIntlOptions = {}): AstroIntegration {
  const { enabled = true, defaultLocale, messages } = options;

  if (defaultLocale) {
    __setIntlConfig({ defaultLocale });
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
export const getMessages = _getMessages;
export const getTranslations = _getTranslations;
export const getTranslationsReact = _getTranslationsReact;
export const defineRequestConfig = _defineRequestConfig;
export const __resetRequestConfig = _resetRequestConfig;

// Exportar tipos
export type {
  RequestConfig,
  Primitive,
  GetRequestConfigFn,
  MessagesConfig,
  IntlConfig,
} from "./types/index.js";
export type { DotPaths } from "./core.js";
