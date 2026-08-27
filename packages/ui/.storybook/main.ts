import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)", "../src/**/*.mdx"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
  ],
  staticDirs: [
    "../public",
    { from: "../../../apps/landing/public/assets/brand", to: "/" },
    { from: "../../../apps/landing/public/assets", to: "/assets" },
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;