import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryPlaceholder } from "../stories/CategoryPlaceholder";

const meta = {
  title: "Molecules/Getting started",
  component: CategoryPlaceholder,
  parameters: { layout: "fullscreen", controls: { disable: true } },
  tags: ["autodocs"],
} satisfies Meta<typeof CategoryPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyShelf: Story = {
  args: {
    category: "Molecules",
    marker: "02",
    description:
      "Small combinations of atoms that solve a focused interaction and can travel consistently across apps and studios.",
    path: "packages/ui/src/molecules/<component>",
  },
};
