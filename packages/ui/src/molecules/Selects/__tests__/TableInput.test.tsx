import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TableInput } from "../TableInput";

describe("TableInput Component", () => {
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Role", accessor: "role" },
  ];

  it("renders table headers and rows and adds new row", () => {
    const handleValueChange = vi.fn();
    render(
      <TableInput
        columns={columns}
        defaultValue={[{ name: "Alice", role: "Dev" }]}
        onValueChange={handleValueChange}
      />
    );

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Alice")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Add Row"));
    expect(handleValueChange).toHaveBeenCalled();
  });
});
