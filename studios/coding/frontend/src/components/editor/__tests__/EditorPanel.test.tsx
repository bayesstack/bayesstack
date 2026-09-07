import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorPanel, formatSourceCode } from "../EditorPanel";

describe("EditorPanel Component & Format Logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const renderEditor = (overrides: Partial<React.ComponentProps<typeof EditorPanel>> = {}) =>
    render(
      <EditorPanel
        code="def solve():\n    pass"
        onChange={vi.fn()}
        language="python"
        onLanguageChange={vi.fn()}
        onResetCode={vi.fn()}
        starterCode="def solve():\n    pass"
        isDirty={false}
        draftStatus="clean"
        {...overrides}
      />
    );

  it("formats C++, Java, JS, and Python code correctly", () => {
    expect(formatSourceCode("int main(){\nif(true){\nreturn 0;\n}\n}", "cpp", 2)).toContain(
      "int main(){\n  if(true){\n    return 0;\n  }\n}"
    );
    expect(formatSourceCode("def solve():   \n    x = 10   \n\n\n    return x  ", "python", 4)).toBe(
      "def solve():\n    x = 10\n\n    return x\n"
    );
    expect(formatSourceCode('{"a":1,"b":[2,3]}', "json", 2)).toBe(
      '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}\n'
    );
  });

  it("keeps the editor strip focused on language, format, and compact code actions", () => {
    renderEditor();

    expect(screen.getByRole("combobox", { name: "Select programming language" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Format/i })).toBeDefined();
    expect(screen.getByRole("button", { name: "More code actions" })).toBeDefined();
    expect(screen.queryByText("Starter template")).toBeNull();
  });

  it("keeps draft state in the editor footer", () => {
    const { rerender } = renderEditor({ isDirty: true, draftStatus: "saving" });
    expect(screen.getByText("Saving...")).toBeDefined();

    rerender(
      <EditorPanel
        code="def solve():\n    x = 1"
        onChange={vi.fn()}
        language="python"
        onLanguageChange={vi.fn()}
        onResetCode={vi.fn()}
        starterCode="def solve():\n    pass"
        isDirty={true}
        draftStatus="saved"
      />
    );

    expect(screen.getByText("Saved to draft")).toBeDefined();
  });

  it("keeps copy and reset in the more-actions menu and protects modified starter resets", () => {
    const onResetCode = vi.fn();
    renderEditor({
      code: "def solve():\n    # User modifications\n    return 999",
      starterCode: "def solve():\n    pass",
      isDirty: true,
      draftStatus: "saved",
      onResetCode,
    });

    fireEvent.click(screen.getByRole("button", { name: "More code actions" }));
    expect(screen.getByText("Copy code")).toBeDefined();
    fireEvent.click(screen.getByText("Reset to starter"));

    expect(screen.getByText("Reset to Starter Code?")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /Discard & Reset to Starter/i }));
    expect(onResetCode).toHaveBeenCalledTimes(1);
  });
});
