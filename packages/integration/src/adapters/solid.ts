import type { JSX } from "solid-js";
import { createJsxAdapter } from "./jsx.js";

export const { getTranslations, createGetTranslations } = createJsxAdapter<JSX.Element>(
  (value) => value
);
