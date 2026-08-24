import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryPlaceholder } from "../stories/CategoryPlaceholder";

const meta = {
  title: "Atoms/Getting started",
  component: CategoryPlaceholder,
  parameters: { layout: "fullscreen", controls: { disable: true } },
  tags: ["autodocs"],
} satisfies Meta<typeof CategoryPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyShelf: Story = {
  args: {
    category: "Atoms",
    marker: "01",
    description:
      "The smallest, most focused pieces of the system: typography, controls, icons, inputs, and other foundations.",
    path: "packages/ui/src/atoms/<component>",
  },
};
