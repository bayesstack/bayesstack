import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TableInput, type TableColumn } from ".././TableInput";

const meta: Meta<typeof TableInput> = {
  title: "Molecules/Selects/TableInput",
  component: TableInput,
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TableInput>;

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

export const Default: Story = {
  render: () => {
    const [rows, setRows] = useState<Array<Record<string, any>>>([
      { key: "LEARNING_RATE", type: "number", value: "0.001" },
      { key: "OPTIMIZER", type: "string", value: "AdamW" },
    ]);

    return (
      <div style={{ width: 620 }}>
        <TableInput
          label="Model Hyperparameters Matrix"
          columns={COLUMNS}
          value={rows}
          onValueChange={setRows}
          addButtonLabel="Add Parameter"
        />
        <div style={{ marginTop: 12, fontSize: 12, color: "#4A6360" }}>
          Structured Data Output: {JSON.stringify(rows)}
        </div>
      </div>
    );
  },
};
