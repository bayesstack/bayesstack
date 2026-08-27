import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CodeBlockComponent } from "../CodeBlockComponent";

describe("CodeBlockComponent Component", () => {
  it("renders code textarea and language selector", () => {
    const handleChange = vi.fn();
    const handleLanguageChange = vi.fn();

    render(
      <CodeBlockComponent
        code="const x = 1;"
        language="typescript"
        onChange={handleChange}
        onLanguageChange={handleLanguageChange}
      />
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("const x = 1;");

    fireEvent.change(textarea, { target: { value: "const x = 2;" } });
    expect(handleChange).toHaveBeenCalledWith("const x = 2;");

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "python" } });
    expect(handleLanguageChange).toHaveBeenCalledWith("python");
  });
});
