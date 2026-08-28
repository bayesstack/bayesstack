import type { Meta, StoryObj } from "@storybook/react-vite";
import { CountDown } from "../CountDown";

const meta: Meta<typeof CountDown> = {
  title: "Atoms/Display/CountDown",
  component: CountDown,
  argTypes: {
    target: { control: "number" },
    label: { control: "text" },
    format: {
      control: "select",
      options: ["hh:mm:ss", "mm:ss", "dd:hh:mm:ss"],
    },
    variant: {
      control: "select",
      options: ["default", "warning", "danger", "pill"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    withIcon: { control: "boolean" },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    target: 3600,
    label: "Time Remaining:",
    format: "hh:mm:ss",
    variant: "default",
    size: "md",
    withIcon: true,
  },
};
