import type { ComponentChildren } from "preact";
import { createJsxAdapter } from "./jsx.js";

export const { getTranslations, createGetTranslations } = createJsxAdapter<ComponentChildren>(
  (value) => value
);
