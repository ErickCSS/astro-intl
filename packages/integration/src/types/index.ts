export type I18nConfig<UI extends Record<string, Record<string, unknown>>, DefaultLocale extends keyof UI> = {
  ui: UI;
  defaultLocale: DefaultLocale;
};
