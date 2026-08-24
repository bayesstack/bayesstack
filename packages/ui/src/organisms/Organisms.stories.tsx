import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryPlaceholder } from "../stories/CategoryPlaceholder";

const meta = {
  title: "Organisms/Getting started",
  component: CategoryPlaceholder,
  parameters: { layout: "fullscreen", controls: { disable: true } },
  tags: ["autodocs"],
} satisfies Meta<typeof CategoryPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyShelf: Story = {
  args: {
    category: "Organisms",
    marker: "03",
    description:
      "Larger, composed experiences such as forms, steppers, navigation patterns, and other complete workflows.",
    path: "packages/ui/src/organisms/<component>",
  },
};
