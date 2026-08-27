import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { FileUpload, type FileItemData } from ".././FileUpload";

const meta: Meta<typeof FileUpload> = {
  title: "Molecules/Selects/FileUpload",
  component: FileUpload,
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
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

export const Default: Story = {
  render: () => {
    const [files, setFiles] = useState<FileItemData[]>(SAMPLE_FILES);

    return (
      <div style={{ width: 480 }}>
        <FileUpload
          label="Project Documents Upload"
          value={files}
          onValueChange={setFiles}
          accept=".pdf,.png,.jpg,.zip"
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Uploaded Files ({files.length}): {files.map((f) => f.name).join(", ")}
        </div>
      </div>
    );
  },
};

export const SingleFileUpload: Story = {
  render: () => {
    const [files, setFiles] = useState<FileItemData[]>([]);

    return (
      <div style={{ width: 480 }}>
        <FileUpload
          label="Upload Cover Avatar Image"
          multiple={false}
          value={files}
          onValueChange={setFiles}
          accept="image/*"
          title="Drop image here or click to select"
          subtitle="Single image up to 5MB"
        />
      </div>
    );
  },
};

export const DisabledState: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <FileUpload
        label="Readonly Attachment Area"
        disabled
        value={SAMPLE_FILES}
      />
    </div>
  ),
};
