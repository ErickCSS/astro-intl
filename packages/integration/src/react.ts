import type { ReactNode } from "react";
import { createTranslationGetter, type DotPaths } from "./core";

export function createGetTranslationsReact<
  UI extends Record<string, Record<string, unknown>>,
  DefaultLocale extends keyof UI,
>(ui: UI, defaultLocale: DefaultLocale) {
  return function getTranslationsReact<N extends keyof UI[DefaultLocale]>(
    lang: string | undefined,
    namespace: N,
  ) {
    type Messages = UI[DefaultLocale][N];

    const { t } = createTranslationGetter(ui, defaultLocale, lang, namespace);

    (t as any).rich = function (
      key: DotPaths<Messages>,
      tags: Record<string, (chunks: string) => ReactNode>,
    ): ReactNode[] {
      const str = t(key);
      const tagNames = Object.keys(tags);
      const regex = new RegExp(`<(${tagNames.join("|")})>(.*?)<\\/\\1>`, "g");

      const result: ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          result.push(str.slice(lastIndex, match.index));
        }
        const [, tag, chunks] = match;
        result.push(tags[tag](chunks));
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < str.length) result.push(str.slice(lastIndex));
      return result;
    };

    return t as typeof t & {
      rich: (key: DotPaths<Messages>, tags: Record<string, (chunks: string) => ReactNode>) => ReactNode[];
    };
  };
}
