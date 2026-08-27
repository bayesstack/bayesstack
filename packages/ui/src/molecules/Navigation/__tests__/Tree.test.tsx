import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Tree } from "../Tree";

describe("Tree Component", () => {
  const treeData = [
    {
      id: "root-1",
      label: "Documents",
      children: [
        { id: "child-1", label: "Report.pdf" },
        { id: "child-2", label: "Invoice.pdf" },
      ],
    },
    { id: "root-2", label: "Images" },
  ];

  it("renders tree root nodes", () => {
    render(<Tree data={treeData} />);
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Images")).toBeInTheDocument();
  });

  it("expands child nodes on node click and triggers onExpand", () => {
    const handleExpand = vi.fn();
    render(<Tree data={treeData} onExpand={handleExpand} />);

    fireEvent.click(screen.getByText("Documents"));
    expect(handleExpand).toHaveBeenCalledWith(["root-1"], expect.objectContaining({ id: "root-1" }));
    expect(screen.getByText("Report.pdf")).toBeInTheDocument();
  });

  it("triggers onSelect when leaf node is clicked", () => {
    const handleSelect = vi.fn();
    render(<Tree data={treeData} defaultExpandedKeys={["root-1"]} onSelect={handleSelect} />);

    fireEvent.click(screen.getByText("Report.pdf"));
    expect(handleSelect).toHaveBeenCalledWith(["child-1"], expect.objectContaining({ id: "child-1" }));
  });
});
