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

export type RoutesMap = {
  [routeKey: string]: {
    [locale: string]: string;
  };
};

// ─── Type-level param extraction from route templates ────────────────

export type ExtractParams<T extends string> = T extends `${string}[${infer P}]${infer Rest}`
  ? P | ExtractParams<Rest>
  : never;

export type ParamsForRoute<Template extends string> = [ExtractParams<Template>] extends [never]
  ? Record<string, never>
  : Record<ExtractParams<Template>, string>;

export type IntlConfig = {
  defaultLocale: string;
  locales: string[];
  routes?: RoutesMap;
};
