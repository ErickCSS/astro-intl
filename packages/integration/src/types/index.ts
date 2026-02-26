export type Primitive = string | number | boolean | null | undefined;

export type RequestConfig = {
  locale: string;
  messages: Record<string, unknown>;
};

export type GetRequestConfigFn = (locale: string) => Promise<RequestConfig> | RequestConfig;

export type MessagesConfig = Record<
  string,
  | Record<string, unknown>
  | (() => Promise<{ default: Record<string, unknown> } | Record<string, unknown>>)
>;

export type IntlConfig = {
  defaultLocale: string;
};
