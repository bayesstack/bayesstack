import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Table } from "../Table";

describe("Table Component", () => {
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Full Name" },
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
});
