import type { ReactNode } from "react";
import { createJsxAdapter } from "./jsx.js";

export const { getTranslations, createGetTranslations } = createJsxAdapter<ReactNode>(
  (value) => value
);
