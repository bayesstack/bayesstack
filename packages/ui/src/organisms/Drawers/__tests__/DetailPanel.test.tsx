import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DetailPanel } from "../DetailPanel";

describe("DetailPanel Component", () => {
  it("renders entity details, status badge, and edit callback", () => {
    const handleEdit = vi.fn();
    render(
      <DetailPanel
        open={true}
        entityName="Acme Corp"
        entityStatus="Active"
        entityStatusColor="success"
        onEdit={handleEdit}
        fields={[{ label: "Owner", value: "Sarah" }]}
      />
    );

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();

    const editBtn = screen.getByText("Edit Entity");
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalled();
  });
});
