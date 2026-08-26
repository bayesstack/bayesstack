import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { FileItem } from "./FileItem";

const meta: Meta<typeof FileItem> = {
  title: "Atoms/Display/FileItem",
  component: FileItem,
  tags: ["autodocs"],
  argTypes: {
    showFileName: { control: "boolean" },
    hideExtension: { control: "boolean" },
    noBreak: { control: "boolean" },
    size: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof FileItem>;

export const DefaultFile: Story = {
  args: {
    filename: "financial_report_q3.pdf",
    fileSize: "2.4 MB",
    description: "PDF Document",
    onDownload: () => alert("Downloading file..."),
  },
};

export const ImageThumbnail: Story = {
  args: {
    filename: "architecture_diagram.png",
    fileSize: "840 KB",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
    url: "https://unsplash.com",
  },
};

export const CustomBrandBadge: Story = {
  args: {
    filename: "dataset_embeddings.zip",
    fileSize: "142.8 MB",
    color: "#3B82F6",
    onDownload: () => alert("Downloading ZIP..."),
  },
};
