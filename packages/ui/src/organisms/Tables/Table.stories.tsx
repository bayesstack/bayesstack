import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Table, type Column } from "./Table";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Badge } from "../../atoms/Badges/Badge";
import { Button } from "../../atoms/Buttons/Button";

const meta: Meta<typeof Table> = {
  title: "Organisms/Tables/Table",
  component: Table,
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    striped: { control: "boolean" },
    bordered: { control: "boolean" },
    hoverable: { control: "boolean" },
    loading: { control: "boolean" },
    selectable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Table>;

interface UserRow {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  role: string;
  status: "active" | "offline" | "pending";
  projectsCount: number;
}

const SAMPLE_USERS: UserRow[] = [
  {
    id: "usr-1",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    email: "sarah.chen@bayesstack.com",
    role: "Lead Architect",
    status: "active",
    projectsCount: 14,
  },
  {
    id: "usr-2",
    name: "Marcus Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    email: "marcus.vance@bayesstack.com",
    role: "Senior ML Engineer",
    status: "active",
    projectsCount: 9,
  },
  {
    id: "usr-3",
    name: "Elena Rostova",
    email: "elena.r@bayesstack.com",
    role: "Product Manager",
    status: "offline",
    projectsCount: 22,
  },
  {
    id: "usr-4",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    email: "david.k@bayesstack.com",
    role: "DevOps Specialist",
    status: "pending",
    projectsCount: 5,
  },
];

const USER_COLUMNS: Column<UserRow>[] = [
  {
    key: "name",
    header: "User",
    sortable: true,
    render: (_, row) => (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={row.name} src={row.avatar} size="sm" />
        <div>
          <div style={{ fontWeight: 600, color: "#123333" }}>{row.name}</div>
          <div style={{ fontSize: 12, color: "#68807D" }}>{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (status) => {
      const variantMap: Record<string, "success" | "neutral" | "warning"> = {
        active: "success",
        offline: "neutral",
        pending: "warning",
      };
      return (
        <Badge variant="subtle" color={variantMap[status] || "neutral"}>
          {status}
        </Badge>
      );
    },
  },
  {
    key: "projectsCount",
    header: "Projects",
    sortable: true,
    align: "center",
  },
  {
    key: "actions",
    header: "Action",
    align: "right",
    render: (_, row) => (
      <Button
        variant="outline"
        size="xs"
        onClick={(e) => {
          e.stopPropagation();
          alert(`Managing ${row.name}`);
        }}
      >
        Manage
      </Button>
    ),
  },
];

export const Default: Story = {
  render: () => <Table data={SAMPLE_USERS} columns={USER_COLUMNS} />,
};

export const SelectableAndSortable: Story = {
  render: () => {
    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([
      "usr-1",
    ]);

    return (
      <div>
        <Table
          data={SAMPLE_USERS}
          columns={USER_COLUMNS}
          selectable
          selectedRowKeys={selectedKeys}
          onSelectionChange={(keys) => setSelectedKeys(keys)}
        />
        <div style={{ marginTop: 12, fontSize: 13, color: "#68807D" }}>
          Selected IDs: <strong>{selectedKeys.join(", ") || "None"}</strong>
        </div>
      </div>
    );
  },
};

export const StripedAndBordered: Story = {
  render: () => (
    <Table
      data={SAMPLE_USERS}
      columns={USER_COLUMNS}
      striped
      bordered
      size="sm"
    />
  ),
};

export const WithPagination: Story = {
  render: () => {
    const [page, setPage] = useState(1);

    return (
      <Table
        data={SAMPLE_USERS}
        columns={USER_COLUMNS}
        selectable
        pagination={{
          enabled: true,
          page,
          totalPages: 5,
          pageSize: 10,
          onPageChange: setPage,
          withControls: true,
          withGoTo: true,
        }}
      />
    );
  },
};

export const LoadingState: Story = {
  render: () => <Table data={[]} columns={USER_COLUMNS} loading />,
};

export const EmptyState: Story = {
  render: () => (
    <Table data={[]} columns={USER_COLUMNS} emptyText="No active team members found." />
  ),
};
