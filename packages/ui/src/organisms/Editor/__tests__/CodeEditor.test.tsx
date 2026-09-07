import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CodeEditor } from "../CodeEditor";

describe("CodeEditor Organism Component", () => {
  describe("Simple Engine (Textarea fallback)", () => {
    it("renders code value, line numbers, and status telemetry footer with custom status", () => {
      render(
        <CodeEditor
          engine="simple"
          defaultValue={"function test() {\n  return 42;\n}"}
          language="typescript"
          showLineNumbers
          showStatusFooter
          footerStatus={<span>Saved to draft</span>}
        />
      );

      const textarea = screen.getByPlaceholderText("// Type or paste your code here...") as HTMLTextAreaElement;
      expect(textarea.value).toContain("function test()");
      expect(screen.getByText("Ln 1, Col 1")).toBeInTheDocument();
      expect(screen.getByText("Saved to draft")).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "TypeScript" })).toBeInTheDocument();
    });

    it("renders syntax highlighting tokens overlay when syntaxHighlight is enabled", () => {
      const { container } = render(
        <CodeEditor
          engine="simple"
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
          engine="simple"
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
          engine="simple"
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
          engine="simple"
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

  describe("CodeMirror Engine (Modern default)", () => {
    it("renders CodeMirror 6 container with gutter and line numbers by default", () => {
      const { container } = render(
        <CodeEditor
          defaultValue="print('Hello BayesStack')"
          language="python"
          showLineNumbers
          showStatusFooter
        />
      );

      // Verify CodeMirror container is rendered
      expect(container.querySelector(".cm-editor")).toBeInTheDocument();
      expect(container.querySelector(".cm-lineNumbers")).toBeInTheDocument();
      expect(container.querySelector(".cm-foldGutter")).toBeInTheDocument();
      expect(container.querySelector(".cm-content")).toBeInTheDocument();

      // Verify status bar
      expect(screen.getByText("Ln 1, Col 1")).toBeInTheDocument();
      expect(screen.getByText("Spaces: 2")).toBeInTheDocument();
    });

    it("supports switching languages in CodeMirror engine", () => {
      const handleLangChange = vi.fn();
      const { container } = render(
        <CodeEditor
          defaultValue="SELECT 1;"
          language="sql"
          onLanguageChange={handleLangChange}
        />
      );

      const select = screen.getByRole("combobox", { name: "Select programming language" });
      fireEvent.change(select, { target: { value: "cpp" } });
      expect(handleLangChange).toHaveBeenCalledWith("cpp");

      expect(container.querySelector(".cm-editor")).toBeInTheDocument();
    });

    it("supports copying code to clipboard", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(
        <CodeEditor
          defaultValue="const x = 10;"
          showCopy
        />
      );

      const copyBtn = screen.getByRole("button", { name: "Copy code to clipboard" });
      expect(copyBtn).toBeInTheDocument();
      await React.act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(writeTextMock).toHaveBeenCalledWith("const x = 10;");
    });

    it("supports keymap configurations (standard, vim, emacs)", () => {
      const { rerender } = render(
        <CodeEditor
          defaultValue="let a = 1;"
          keymap="vim"
          showStatusFooter
        />
      );
      expect(screen.getByText("VIM")).toBeInTheDocument();

      rerender(
        <CodeEditor
          defaultValue="let a = 1;"
          keymap="emacs"
          showStatusFooter
        />
      );
      expect(screen.getByText("EMACS")).toBeInTheDocument();
    });
  });
});

