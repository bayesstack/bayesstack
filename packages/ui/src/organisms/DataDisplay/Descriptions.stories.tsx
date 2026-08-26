import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Descriptions } from "./Descriptions";
import { Badge } from "../../atoms/Badges/Badge";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Descriptions> = {
  title: "Organisms/DataDisplay/Descriptions",
  component: Descriptions,
  tags: ["autodocs"],
  argTypes: {
    bordered: { control: "boolean" },
    column: { control: { type: "number", min: 1, max: 4 } },
    size: { control: "select", options: ["sm", "md", "lg"] },
    layout: { control: "select", options: ["horizontal", "vertical"] },
  },
};

export default meta;
type Story = StoryObj<typeof Descriptions>;

export const EntityMetadataGrid: Story = {
  render: () => (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Descriptions
        title="Model Pipeline Deployment Metadata"
        extra={<Button size="xs" variant="secondary">Edit Specs</Button>}
        bordered
        column={3}
        items={[
          { label: "Pipeline Name", value: "transformer-v4-prod" },
          { label: "Deployment Region", value: "us-east-1 (N. Virginia)" },
          {
            label: "Health Status",
            value: <Badge size="sm" color="success">Healthy</Badge>,
          },
          { label: "Latency P99", value: "14.2ms" },
          { label: "Throughput", value: "4,200 req/sec" },
          { label: "Replica Count", value: "12 Pods" },
          { label: "Created By", value: "Sarah Chen (MLOps)" },
          { label: "Created At", value: "Aug 24, 2026 14:22 UTC", span: 2 },
        ]}
      />
    </div>
  ),
};
