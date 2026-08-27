import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Descriptions } from "../Descriptions";

describe("Descriptions Component", () => {
  const items = [
    { label: "User Name", value: "Sarah Chen" },
    { label: "Role", value: "Administrator" },
  ];

  it("renders title, extra actions, and key-value items", () => {
    render(
      <Descriptions
        title="User Details"
        extra={<button>Edit</button>}
        items={items}
      />
    );

    expect(screen.getByText("User Details")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("User Name")).toBeInTheDocument();
    expect(screen.getByText("Sarah Chen")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });
});
