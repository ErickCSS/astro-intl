import type { AstroIntegration } from "astro";
import type { MessagesConfig, RoutesMap, FallbackRouteInfo } from "./types/index.js";
import {
  setRequestLocale as _setRequestLocale,
  runWithLocale as _runWithLocale,
  getLocale as _getLocale,
  getLocales as _getLocales,
  isValidLocale as _isValidLocale,
  getMessages as _getMessages,
  getTranslations as _getTranslations,
  defineRequestConfig as _defineRequestConfig,
  getFallbackRoutes as _getFallbackRoutes,
  setFallbackRoutes as _setFallbackRoutes,
  __resetRequestConfig as _resetRequestConfig,
  __setConfigMessages,
  __setIntlConfig,
} from "./core.js";
import { path as _path, switchLocalePath as _switchLocalePath } from "./core.js";

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
      "astro:routes:resolved": ({ routes }) => {
        if (!enabled) return;

        const collected: FallbackRouteInfo[] = [];
        for (const route of routes) {
          // fallbackRoutes is available in Astro 6.1+
          const fallbacks = (route as unknown as Record<string, unknown>).fallbackRoutes as
            | Array<{ pattern: string; pathname?: string }>
            | undefined;
          if (!fallbacks) continue;

          for (const fb of fallbacks) {
            // Extract locale from the pattern (first segment after /)
            const segments = (fb.pathname ?? fb.pattern).split("/");
            const locale = segments[1] || "";
            if (locale) {
              collected.push({
                pattern: fb.pattern,
                pathname: fb.pathname,
                locale,
              });
            }
          }
        }

        if (collected.length > 0) {
          _setFallbackRoutes(collected);
        }
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
export const defineRequestConfig = _defineRequestConfig;
export const __resetRequestConfig = _resetRequestConfig;
export const getFallbackRoutes = _getFallbackRoutes;
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
  FallbackRouteInfo,
} from "./types/index.js";
export type { DotPaths } from "./core.js";
