import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Accordion } from "../Accordion";

describe("Accordion Component (Disclosures Group)", () => {
  it("renders accordion items via items array prop", () => {
    render(
      <Accordion
        items={[
          { id: "item-1", title: "General Settings", content: "General content panel" },
          { id: "item-2", title: "Security Roles", content: "Security content panel" },
        ]}
      />
    );

    expect(screen.getByText("General Settings")).toBeInTheDocument();
    expect(screen.getByText("Security Roles")).toBeInTheDocument();
  });

  it("expands item content when clicked", () => {
    render(
      <Accordion
        items={[
          { id: "item-1", title: "Section One", content: "Content One Details" },
        ]}
      />
    );

    expect(screen.queryByText("Content One Details")).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: /Section One/i });
    fireEvent.click(trigger);

    expect(screen.getByText("Content One Details")).toBeInTheDocument();
  });

  it("supports compound sub-component Accordion.Item usage", () => {
    render(
      <Accordion defaultValue="c-1">
        <Accordion.Item id="c-1" title="Compound Header 1">
          Compound Body 1
        </Accordion.Item>
        <Accordion.Item id="c-2" title="Compound Header 2">
          Compound Body 2
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.getByText("Compound Body 1")).toBeInTheDocument();
    expect(screen.queryByText("Compound Body 2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Compound Header 2/i }));
    expect(screen.getByText("Compound Body 2")).toBeInTheDocument();
  });
});
