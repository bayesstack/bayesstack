import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CodeEditor } from "../CodeEditor";

describe("CodeEditor Organism Component", () => {
  it("renders code value, line numbers, and status telemetry footer", () => {
    render(
      <CodeEditor
        defaultValue={'function test() {\n  return 42;\n}'}
        language="typescript"
        showLineNumbers
        showStatusFooter
      />
    );

    const textarea = screen.getByPlaceholderText("// Type or paste your code here...") as HTMLTextAreaElement;
    expect(textarea.value).toContain("function test()");
    expect(screen.getByText("Ln 1, Col 1")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "TypeScript" })).toBeInTheDocument();
  });

  it("renders syntax highlighting tokens overlay when syntaxHighlight is enabled", () => {
    const { container } = render(
      <CodeEditor
        defaultValue={'const count = 100;\nreturn "done";'}
        language="typescript"
        syntaxHighlight
      />
    );

    const preOverlay = container.querySelector(".bs-code-editor-highlight");
    expect(preOverlay).toBeInTheDocument();
    expect(container.querySelector(".bs-token-keyword")).toHaveTextContent("const");
    expect(container.querySelector(".bs-token-number")).toHaveTextContent("100");
    expect(container.querySelector(".bs-token-string")).toHaveTextContent('"done"');
  });

  it("handles text input and language selection changes", () => {
    const handleValueChange = vi.fn();
    const handleLangChange = vi.fn();

    render(
      <CodeEditor
        defaultValue="SELECT * FROM users;"
        language="sql"
        onChange={handleValueChange}
        onLanguageChange={handleLangChange}
      />
    );

    const select = screen.getByRole("combobox", { name: "Select programming language" });
    fireEvent.change(select, { target: { value: "python" } });
    expect(handleLangChange).toHaveBeenCalledWith("python");

    const textarea = screen.getByPlaceholderText("// Type or paste your code here...");
    fireEvent.change(textarea, { target: { value: "import os" } });
    expect(handleValueChange).toHaveBeenCalledWith("import os");
  });
  it("handles smart bracket matching", () => {
    const handleValueChange = vi.fn();
    render(
      <CodeEditor
        defaultValue=""
        onChange={handleValueChange}
      />
    );
    
    const textarea = screen.getByPlaceholderText("// Type or paste your code here...") as HTMLTextAreaElement;
    
    // Simulate typing a bracket '{'
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;
    fireEvent.keyDown(textarea, { key: "{" });
    expect(handleValueChange).toHaveBeenCalledWith("{}");
  });

  it("handles smart enter indentation", () => {
    const handleValueChange = vi.fn();
    render(
      <CodeEditor
        defaultValue="function test() {"
        onChange={handleValueChange}
      />
    );
    
    const textarea = screen.getByPlaceholderText("// Type or paste your code here...") as HTMLTextAreaElement;
    
    // Simulate Enter at the end of the line
    textarea.selectionStart = 17;
    textarea.selectionEnd = 17;
    fireEvent.keyDown(textarea, { key: "Enter" });
    
    // Expect newline + 2 spaces (default tabSize)
    expect(handleValueChange).toHaveBeenCalledWith("function test() {\n  ");
  });
});
