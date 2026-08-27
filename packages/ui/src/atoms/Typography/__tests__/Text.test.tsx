import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Text } from "../Text";

describe("Text Component", () => {
  it("renders text content with custom element tag", () => {
    render(<Text as="span" size="lg">Sample Typography Text</Text>);
    const textEl = screen.getByText("Sample Typography Text");
    expect(textEl).toBeInTheDocument();
    expect(textEl.tagName.toLowerCase()).toBe("span");
  });

  it("applies font weight and color modifier classes", () => {
    const { container } = render(
      <Text strong color="error">
        Error Message
      </Text>
    );
    expect(container.firstChild).toHaveClass("bs-text--strong");
    expect(container.firstChild).toHaveClass("bs-text--color-error");
  });
});
