import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Table } from "../Table";

describe("Table Component", () => {
  const columns = [
    { key: "id", header: "ID", sortable: true },
    { key: "name", header: "Full Name", sortable: true },
    { key: "role", header: "Job Role" },
  ];

  const data = [
    { id: "1", name: "Sagar Udasi", role: "Principal Architect" },
    { id: "2", name: "Jane Doe", role: "Design Lead" },
  ];

  it("renders table headers and data rows correctly", () => {
    render(<Table columns={columns} data={data} />);

    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("Sagar Udasi")).toBeInTheDocument();
    expect(screen.getByText("Principal Architect")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders empty state message when data is empty", () => {
    render(<Table columns={columns} data={[]} emptyText="No records available" />);
    expect(screen.getByText("No records available")).toBeInTheDocument();
  });

  it("renders loading state when loading prop is true", () => {
    const { container } = render(<Table columns={columns} data={[]} loading />);
    expect(container.querySelector(".bs-table-tr-loading")).toBeInTheDocument();
  });

  it("handles row selection checkboxes and select all toggle", () => {
    const handleSelectionChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={data}
        rowKey="id"
        selectable
        selectedRowKeys={["1"]}
        onSelectionChange={handleSelectionChange}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(3); // 1 select all + 2 row checkboxes

    fireEvent.click(checkboxes[2]); // click row 2
    expect(handleSelectionChange).toHaveBeenCalled();
  });

  it("triggers column sort callback on sortable header click", () => {
    const handleSort = vi.fn();
    render(<Table columns={columns} data={data} onSortChange={handleSort} />);

    const nameHeader = screen.getByText("Full Name");
    fireEvent.click(nameHeader);

    expect(handleSort).toHaveBeenCalledWith("name", "asc");
  });
});
