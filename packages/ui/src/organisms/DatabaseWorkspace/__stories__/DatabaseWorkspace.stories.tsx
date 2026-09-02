import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DatabaseWorkspace } from "../DatabaseWorkspace";
import { Table } from "../../Tables/Table";

const meta: Meta<typeof DatabaseWorkspace> = {
  title: "Organisms/DatabaseWorkspace",
  component: DatabaseWorkspace,
  parameters: {
    layout: "fullscreen",
    docs: {
      disable: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatabaseWorkspace>;

export const Playground: Story = {
  render: () => (
    <div style={{ height: "650px", padding: "16px", background: "#f8fafc" }}>
      <DatabaseWorkspace>
        {(activeTable) => (
          <div style={{ padding: "20px" }}>
            <h3>App Custom Tab View for {activeTable?.name}</h3>
            <p>Schema: {activeTable?.schema || "public"}</p>
          </div>
        )}
      </DatabaseWorkspace>
    </div>
  ),
};

export const AppProvidedDataTable: Story = {
  render: () => (
    <div style={{ height: "650px", padding: "16px", background: "#f8fafc" }}>
      <DatabaseWorkspace
        defaultOpenedTableIds={["public.tenants", "public.users"]}
        defaultSelectedTableId="public.users"
      >
        {(activeTable) => (
          <Table
            striped
            bordered
            size="sm"
            columns={
              activeTable?.columns?.map((c) => ({ key: c.name, header: c.name })) || [
                { key: "id", header: "ID" },
                { key: "name", header: "Name" },
              ]
            }
            data={[
              { id: "1", name: "Sample Record 1" },
              { id: "2", name: "Sample Record 2" },
            ]}
          />
        )}
      </DatabaseWorkspace>
    </div>
  ),
};
