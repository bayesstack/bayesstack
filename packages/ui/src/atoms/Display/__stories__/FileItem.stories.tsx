import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileItem } from "../FileItem";

const meta: Meta<typeof FileItem> = {
  title: "Atoms/Display/FileItem",
  component: FileItem,
  argTypes: {
    filename: { control: "text" },
    description: { control: "text" },
    fileSize: { control: "text" },
    size: { control: "number" },
    iconSize: { control: "number" },
    showFileName: { control: "boolean" },
    hideExtension: { control: "boolean" },
    thumbnailUrl: { control: "text" },
    url: { control: "text" },
    color: { control: "color" },
    noBreak: { control: "boolean" },
    onOpen: { action: "onOpen" },
    onDownload: { action: "onDownload" },
    className: { control: "text" },
    classNames: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    filename: "financial_report_q3.pdf",
    fileSize: "2.4 MB",
    description: "PDF Document",
    size: 32,
    showFileName: true,
    hideExtension: false,
    noBreak: false,
    color: "#0B6763",
  },
};

export const Ex1_FileVariations: Story = {
  name: "01: File Types & Action Handlers",
  render: () => (
    <div style={{ background: "#FFFFFF", padding: 24, borderRadius: 12, border: "1px solid #D7E8E4", maxWidth: 640 }}>
      <h4 style={{ margin: "0 0 16px 0", color: "#123333", fontSize: 15, fontWeight: 700 }}>
        File Types with Open & Download Actions
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FileItem
          filename="quarterly_model_telemetry.pdf"
          fileSize="3.2 MB"
          description="Click body to open • Click icon to download"
          color="#E11D48"
          onOpen={() => alert("Opening PDF preview modal...")}
          onDownload={() => alert("Downloading PDF file...")}
        />

        <FileItem
          filename="dataset_embeddings_vector.csv"
          fileSize="14.8 MB"
          description="Vector dataset file"
          color="#0B6763"
          onOpen={() => alert("Opening CSV data table...")}
          onDownload={() => alert("Downloading CSV file...")}
        />

        <FileItem
          filename="system_architecture_diagram.png"
          fileSize="840 KB"
          description="Image attachment preview"
          thumbnailUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&auto=format&fit=crop&q=80"
          onOpen={() => alert("Opening full-resolution image modal...")}
          onDownload={() => alert("Downloading image file...")}
        />
      </div>
    </div>
  ),
};
