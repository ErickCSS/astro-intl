import type { AstroIntegration } from "astro";

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
