import "@/i18n/request";
import { runWithLocale } from "astro-intl";
import { createIntlMiddleware } from "astro-intl/middleware";
import { defineMiddleware } from "astro:middleware";
import { routing } from "@/i18n/routing";

// The public site intentionally stays on the published 2.2.1 package until
// 2.2.2 is released. Wrap its render in the public request-context API because
// the 2.2.1 middleware initializes state before `next()` instead of around it.
const intl = createIntlMiddleware(routing);

export const onRequest = defineMiddleware((context, next) => {
  const locale = context.url.pathname.split("/")[1];
  if (!routing.locales.includes(locale)) return next();
  return runWithLocale(context.url, () => intl(context, next));
});
