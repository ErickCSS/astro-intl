import type { RequestConfig } from "astro-intl";

export default async function getRequestConfig(
  locale: string,
): Promise<RequestConfig> {
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
}
