import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      expanded: false,
    },
    options: {
      storySort: {
        order: ["Atoms", "Molecules", "Organisms"],
      },
    },
  },
};

export default preview;
