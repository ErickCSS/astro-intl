import { defineRequestConfig } from "astro-intl";

export default defineRequestConfig(async (locale) => {
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
