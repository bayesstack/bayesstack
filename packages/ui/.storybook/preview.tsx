import type { Preview } from "@storybook/react-vite";
import "../src/styles.css";
import "./preview.css";

const preview: Preview = {
  parameters: {
    docs: {
      canvas: {
        sourceState: "shown",
      },
      codePanel: true,
      source: {
        type: "dynamic",
      },
      toc: true,
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
