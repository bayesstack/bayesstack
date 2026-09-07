import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { EditorPanel, formatSourceCode } from "../EditorPanel";

describe("EditorPanel Component & Format Logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("formats C++, Java, JS, and Python code correctly", () => {
    // 1. C++ / JS braces indentation formatting
    const unformattedCpp = "int main(){\nif(true){\nreturn 0;\n}\n}";
    const formattedCpp = formatSourceCode(unformattedCpp, "cpp", 2);
    expect(formattedCpp).toContain("int main(){\n  if(true){\n    return 0;\n  }\n}");

    // 2. Python whitespace cleanup
    const unformattedPy = "def solve():   \n    x = 10   \n\n\n    return x  ";
    const formattedPy = formatSourceCode(unformattedPy, "python", 4);
    expect(formattedPy).toBe("def solve():\n    x = 10\n\n    return x\n");

    // 3. JSON formatting
    const unformattedJson = '{"a":1,"b":[2,3]}';
    const formattedJson = formatSourceCode(unformattedJson, "json", 2);
    expect(formattedJson).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}\n');
  });

  it("renders editor controls: language select, format button, font size, keybindings, reset starter", () => {
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
      />
    );

    expect(screen.getByRole("combobox", { name: "Select programming language" })).toBeDefined();
    expect(screen.getByRole("combobox", { name: "Editor Keybinding Mode" })).toBeDefined();
    expect(screen.getByRole("combobox", { name: "Editor Font Size" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Format/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Reset Starter/i })).toBeDefined();
    expect(screen.getByText("Starter template")).toBeDefined();
  });

  it("displays draft status indicators for saving and saved states", () => {
    const { rerender } = render(
      <EditorPanel
        code="def solve():\n    x = 1"
        onChange={vi.fn()}
        language="python"
        onLanguageChange={vi.fn()}
        onResetCode={vi.fn()}
        starterCode="def solve():\n    pass"
        isDirty={true}
        draftStatus="saving"
      />
    );

    expect(screen.getByText(/● Unsaved changes/i)).toBeDefined();

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

    expect(screen.getByText(/● Saved/i)).toBeDefined();
  });

  it("opens ResetConfirmModal with git-style diff when resetting modified code", () => {
    const onResetCode = vi.fn();

    render(
      <EditorPanel
        code="def solve():\n    # User modifications\n    return 999"
        onChange={vi.fn()}
        language="python"
        onLanguageChange={vi.fn()}
        onResetCode={onResetCode}
        starterCode="def solve():\n    pass"
        isDirty={true}
        draftStatus="saved"
      />
    );

    const resetBtn = screen.getByRole("button", { name: /Reset Starter/i });
    fireEvent.click(resetBtn);

    // Diff modal must be opened
    expect(screen.getByText("Reset to Starter Code?")).toBeDefined();
    expect(screen.getByText(/To Discard/i)).toBeDefined();
    expect(screen.getByText(/To Restore/i)).toBeDefined();

    // Confirm reset inside modal
    const confirmBtn = screen.getByRole("button", { name: /Discard & Reset to Starter/i });
    fireEvent.click(confirmBtn);

    expect(onResetCode).toHaveBeenCalledTimes(1);
  });

  it("allows switching keybinding mode between VS Code, Vim, and Emacs", () => {
    render(
      <EditorPanel
        code="let x = 10;"
        onChange={vi.fn()}
        language="javascript"
        onLanguageChange={vi.fn()}
        onResetCode={vi.fn()}
      />
    );

    const keymapSelect = screen.getByRole("combobox", { name: "Editor Keybinding Mode" });
    fireEvent.change(keymapSelect, { target: { value: "vim" } });

    expect(screen.getByText("VIM")).toBeDefined();
  });
});
