import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Transfer } from "../Transfer";

describe("Transfer Component", () => {
  const dataSource = [
    { key: "1", title: "Option 1" },
    { key: "2", title: "Option 2" },
  ];

  it("renders source and target buckets and transfers items", () => {
    const handleChange = vi.fn();
    render(
      <Transfer
        dataSource={dataSource}
        targetKeys={[]}
        onChange={handleChange}
      />
    );

    expect(screen.getByText("Available Items")).toBeInTheDocument();
    expect(screen.getByText("Selected Items")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();

    const moveAllRightBtn = screen.getByLabelText("Move all right");
    fireEvent.click(moveAllRightBtn);

    expect(handleChange).toHaveBeenCalledWith(["1", "2"], "right", ["1", "2"]);
  });
});
