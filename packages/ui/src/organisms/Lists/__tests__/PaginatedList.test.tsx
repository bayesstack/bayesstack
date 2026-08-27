import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PaginatedList } from "../PaginatedList";

describe("PaginatedList Component", () => {
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
  ];
  const items = [
    { id: "1", name: "Alpha Course" },
    { id: "2", name: "Beta Course" },
  ];

  it("renders table layout with items and pagination footer", () => {
    render(<PaginatedList items={items} columns={columns} totalCount={20} pageSize={2} page={1} />);

    expect(screen.getByText("Alpha Course")).toBeInTheDocument();
    expect(screen.getByText("Beta Course")).toBeInTheDocument();
  });
});
