import type { VNodeChild } from "vue";
import { createJsxAdapter } from "./jsx.js";

export const { getTranslations, createGetTranslations } = createJsxAdapter<VNodeChild>(
  (value) => value
);
