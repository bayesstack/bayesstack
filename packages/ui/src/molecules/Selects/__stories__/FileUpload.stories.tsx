import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { FileUpload, type FileItemData } from "../FileUpload";

const meta: Meta<typeof FileUpload> = {
  title: "Molecules/Selects/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

const SAMPLE_FILES: FileItemData[] = [
  { name: "financial_report_2026.pdf", size: "3.2 MB", status: "success" },
  {
    name: "architecture_diagram.png",
    size: "1.1 MB",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    status: "success",
  },
];

export const Playground: Story = {
  args: {
    label: "Project Documents Upload",
    multiple: true,
    accept: ".pdf,.png,.jpg,.zip",
  },
  render: (args) => {
    const [files, setFiles] = useState<FileItemData[]>(SAMPLE_FILES);
    return (
      <div style={{ width: 480, padding: 16 }}>
        <FileUpload {...args} value={files} onValueChange={setFiles} />
      </div>
    );
  },
};

