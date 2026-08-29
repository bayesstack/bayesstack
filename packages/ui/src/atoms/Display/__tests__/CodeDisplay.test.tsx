import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CodeDisplay } from "../CodeDisplay";

describe("CodeDisplay Atom Component", () => {
  it("renders code string, filename, and language badge", () => {
    render(
      <CodeDisplay
        code={'const x = 42;\nconsole.log(x);'}
        language="typescript"
        filename="src/index.ts"
        syntaxHighlight={false}
      />
    );

    expect(screen.getByText("src/index.ts")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText(/const x = 42/)).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("supports custom startingLineNumber offset", () => {
    render(
      <CodeDisplay
        code={'const x = 42;\nconsole.log(x);'}
        language="typescript"
        startingLineNumber={145}
        highlightLines={[
          { line: 146, color: "green", note: "Annotation on line 146" },
        ]}
      />
    );

    expect(screen.getByText("145")).toBeInTheDocument();
    expect(screen.getByText("146")).toBeInTheDocument();
    expect(screen.getByText("Annotation on line 146")).toBeInTheDocument();
  });

  it("applies automatic language-based syntax highlighting tokens", () => {
    const { container } = render(
      <CodeDisplay
        code={'const age = 30;\nreturn "hello";'}
        language="typescript"
        syntaxHighlight
      />
    );

    expect(container.querySelector(".bs-token-keyword")).toHaveTextContent("const");
    expect(container.querySelector(".bs-token-number")).toHaveTextContent("30");
    expect(container.querySelector(".bs-token-string")).toHaveTextContent('"hello"');
  });

  it("renders inline diff indicators and educational line annotations", () => {
    render(
      <CodeDisplay
        code={'- const oldVal = 10;\n+ const newVal = 20;'}
        language="typescript"
        diffMode
        highlightLines={[
          { line: 2, color: "green", note: "Updated calculation formula" },
        ]}
      />
    );

    expect(screen.getAllByText("-")[0]).toBeInTheDocument();
    expect(screen.getAllByText("+")[0]).toBeInTheDocument();
    expect(screen.getByText("Updated calculation formula")).toBeInTheDocument();
  });

  it("handles copy button click state", async () => {
    render(
      <CodeDisplay
        code="function hello() { return 'world'; }"
        language="javascript"
        showCopy
      />
    );

    const copyBtn = screen.getByRole("button", { name: /Copy code snippet/i });
    expect(copyBtn).toBeInTheDocument();

    fireEvent.click(copyBtn);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});
