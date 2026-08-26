import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import "./preview.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    docs: {
      canvas: {
        sourceState: "shown",
      },
      source: {
        type: "dynamic",
      },
    },
    layout: "fullscreen",
    controls: {
      expanded: false,
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: ["Welcome", "Atoms", "Molecules", "Organisms", "Layouts"],
      },
    },
  },
};

export default preview;
