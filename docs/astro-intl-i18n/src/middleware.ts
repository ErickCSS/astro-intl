import "@/i18n/request";
import { createIntlMiddleware } from "astro-intl/middleware";
import { routing } from "@/i18n/routing";

export const onRequest = createIntlMiddleware(routing);
