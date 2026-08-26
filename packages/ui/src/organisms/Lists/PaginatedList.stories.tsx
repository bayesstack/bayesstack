import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { PaginatedList } from "./PaginatedList";
import { type Column } from "../Tables/Table";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Badge } from "../../atoms/Badges/Badge";

const meta: Meta<typeof PaginatedList> = {
  title: "Organisms/Lists/PaginatedList",
  component: PaginatedList,
  argTypes: {
    layout: {
      control: "select",
      options: ["table", "grid"],
    },
    pagerPlace: {
      control: "select",
      options: ["start", "center", "end"],
    },
    loading: { control: "boolean" },
    selectable: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PaginatedList>;

interface ProjectItem {
  id: string;
  name: string;
  category: string;
  author: string;
  avatar?: string;
  status: "active" | "completed" | "archived";
}

const SAMPLE_PROJECTS: ProjectItem[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `proj-${i + 1}`,
  name: `BayesStack Platform Module ${i + 1}`,
  category: i % 2 === 0 ? "Machine Learning" : "UI Design System",
  author: i % 3 === 0 ? "Sarah Chen" : "Marcus Vance",
  avatar: i % 3 === 0 ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" : undefined,
  status: i % 4 === 0 ? "completed" : "active",
}));

const COLUMNS: Column<ProjectItem>[] = [
  {
    key: "name",
    header: "Project Module",
    sortable: true,
  },
  {
    key: "author",
    header: "Author",
    render: (_, row) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar name={row.author} src={row.avatar} size="xs" />
        <span>{row.author}</span>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
  },
  {
    key: "status",
    header: "Status",
    render: (val) => (
      <Badge color={val === "completed" ? "success" : "info"} variant="subtle">
        {val}
      </Badge>
    ),
  },
];

export const TableLayout: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    const startIndex = (page - 1) * pageSize;
    const currentItems = SAMPLE_PROJECTS.slice(startIndex, startIndex + pageSize);

    return (
      <PaginatedList
        layout="table"
        items={currentItems}
        columns={COLUMNS}
        page={page}
        pageSize={pageSize}
        totalCount={SAMPLE_PROJECTS.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        selectable
      />
    );
  },
};

export const GridLayout: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 6;

    const startIndex = (page - 1) * pageSize;
    const currentItems = SAMPLE_PROJECTS.slice(startIndex, startIndex + pageSize);

    return (
      <PaginatedList
        layout="grid"
        items={currentItems}
        page={page}
        pageSize={pageSize}
        totalCount={SAMPLE_PROJECTS.length}
        onPageChange={setPage}
        renderItem={(item) => (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <strong style={{ color: "#123333" }}>{item.name}</strong>
              <Badge color="info" size="sm">{item.status}</Badge>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#68807D" }}>
              Category: {item.category}
            </p>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Avatar name={item.author} src={item.avatar} size="xs" />
              <span style={{ fontSize: 12, color: "#59716E" }}>{item.author}</span>
            </div>
          </div>
        )}
      />
    );
  },
};
