import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";

const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    storybookTest({ configDir: path.join(dirname, ".storybook") })
  ],
  test: {
    name: "storybook",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: "chromium" }
      ],
      headless: true,
    },
  },
});
