import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { TableInput, type TableColumn } from "../TableInput";

const meta: Meta<typeof TableInput> = {
  title: "Molecules/Selects/TableInput",
  component: TableInput,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const COLUMNS: TableColumn[] = [
  { header: "Parameter", accessor: "key", placeholder: "e.g. BATCH_SIZE", width: "35%" },
  {
    header: "Type",
    accessor: "type",
    type: "select",
    width: "25%",
    options: [
      { label: "String", value: "string" },
      { label: "Number", value: "number" },
      { label: "Boolean", value: "boolean" },
    ],
  },
  { header: "Default Value", accessor: "value", placeholder: "e.g. 64", width: "40%" },
];

export const Playground: Story = {
  args: {
    label: "Model Hyperparameters Matrix",
    columns: COLUMNS,
    addButtonLabel: "Add Parameter",
  },
  render: (args) => {
    const [rows, setRows] = useState<Array<Record<string, any>>>([
      { key: "LEARNING_RATE", type: "number", value: "0.001" },
      { key: "OPTIMIZER", type: "string", value: "AdamW" },
    ]);

    return (
      <div style={{ width: 620, padding: 16 }}>
        <TableInput {...args} value={rows} onValueChange={setRows} />
      </div>
    );
  },
};

