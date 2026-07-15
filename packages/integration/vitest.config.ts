import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["dist/**", "**/*.tgz", "docs/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/__tests__/**", "src/types/**"],
    },
  },
});
