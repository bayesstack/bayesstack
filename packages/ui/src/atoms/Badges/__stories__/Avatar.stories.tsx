import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from ".././Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Atoms/Badges/Avatar",
  component: Avatar,
  argTypes: {
    name: { control: { type: "text" } },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    status: {
      control: { type: "select" },
      options: ["online", "offline", "busy", "away"],
    },
    src: { control: { type: "text" } },
    alt: { control: { type: "text" } },
    className: { control: { type: "text" } },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    name: "Sagar Udasi",
    size: "md",
    status: "online",
  },
};
