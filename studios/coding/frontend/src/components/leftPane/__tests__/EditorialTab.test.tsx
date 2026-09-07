import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { EditorialTab } from "../EditorialTab";
import type { CodingActivityConfig } from "../../../types";

describe("EditorialTab Component with Progressive Disclosure", () => {
  afterEach(() => {
    cleanup();
  });

  const mockConfig: CodingActivityConfig = {
    problem_title: "0/1 Knapsack Problem",
    editorial: {
      intuition: "Binary choice between including or excluding each item.",
      approach: "Iterate capacity backwards to maintain 1D array.",
      complexity: {
        time: "O(N * W)",
        space: "O(W)",
      },
      solutions: {
        python: "print('python solution')",
        cpp: "cout << 'cpp solution';",
      },
    },
  };

  it("renders with progressive hints initially collapsed and solution code hidden behind spoiler shield", () => {
    render(<EditorialTab config={mockConfig} />);

    expect(screen.getByText("Progressive Hinting & Solution Guide")).toBeDefined();
    expect(screen.getByText(/0 \/ 6 unlocked/i)).toBeDefined();

    // Verify Hint triggers exist but hint body is not yet revealed
    expect(screen.getByText("Binary Decision Property")).toBeDefined();
    expect(screen.queryByText(/knapsack capacity remains w/i)).toBeNull();

    // Verify Approach is collapsed
    expect(screen.getByRole("button", { name: "Reveal Approach" })).toBeDefined();
    expect(screen.queryByText(/Iterate capacity backwards to maintain 1D array/i)).toBeNull();

    // Verify Complexity is collapsed
    expect(screen.getByRole("button", { name: "Reveal Complexity" })).toBeDefined();

    // Verify Solution code is hidden behind spoiler warning
    expect(screen.getByText(/Spoiler Alert/i)).toBeDefined();
    expect(screen.getByRole("button", { name: "Reveal Solution Code" })).toBeDefined();
    expect(screen.queryByText("python solution")).toBeNull();
  });

  it("reveals and hides individual hints progressively", () => {
    render(<EditorialTab config={mockConfig} />);

    // Reveal Hint 1
    const revealHint1Buttons = screen.getAllByRole("button", { name: "Reveal Hint" });
    fireEvent.click(revealHint1Buttons[0]);

    // Hint 1 content is now visible and meter is updated
    expect(screen.getByText(/knapsack capacity remains/i)).toBeDefined();
    expect(screen.getByText(/1 \/ 6 unlocked/i)).toBeDefined();
    expect(screen.getByRole("button", { name: "Hide Hint" })).toBeDefined();

    // Hide Hint 1 again
    fireEvent.click(screen.getByRole("button", { name: "Hide Hint" }));
    expect(screen.queryByText(/knapsack capacity remains/i)).toBeNull();
    expect(screen.getByText(/0 \/ 6 unlocked/i)).toBeDefined();
  });

  it("reveals Approach, Complexity, and Solution Code upon clicking their respective triggers", () => {
    render(<EditorialTab config={mockConfig} />);

    // Reveal Approach
    fireEvent.click(screen.getByRole("button", { name: "Reveal Approach" }));
    expect(screen.getByText(/Iterate capacity backwards to maintain 1D array/i)).toBeDefined();

    // Reveal Complexity
    fireEvent.click(screen.getByRole("button", { name: "Reveal Complexity" }));
    expect(screen.getByText("Time Complexity")).toBeDefined();
    expect(screen.getByText("Space Complexity")).toBeDefined();

    // Reveal Solution Code
    fireEvent.click(screen.getByRole("button", { name: "Reveal Solution Code" }));
    expect(screen.getByText(/python solution/i)).toBeDefined();
    expect(screen.getByRole("button", { name: "Copy Code" })).toBeDefined();

    // Toggle solution language
    const cppButton = screen.getByRole("button", { name: "C++ 17" });
    fireEvent.click(cppButton);
    expect(screen.getByText(/cpp solution/i)).toBeDefined();
  });

  it("supports Reveal All Steps and Hide All Spoilers master toggle", () => {
    render(<EditorialTab config={mockConfig} />);

    // Click Reveal All Steps
    const toggleAllBtn = screen.getByRole("button", { name: "Reveal All Steps" });
    fireEvent.click(toggleAllBtn);

    expect(screen.getByText(/6 \/ 6 unlocked/i)).toBeDefined();
    expect(screen.getByRole("button", { name: "Hide All Spoilers" })).toBeDefined();
    expect(screen.getByText(/python solution/i)).toBeDefined();

    // Click Hide All Spoilers
    fireEvent.click(screen.getByRole("button", { name: "Hide All Spoilers" }));
    expect(screen.getByText(/0 \/ 6 unlocked/i)).toBeDefined();
    expect(screen.queryByText(/python solution/i)).toBeNull();
  });

  it("respects custom hints configured on problem config", () => {
    const customConfig: CodingActivityConfig = {
      ...mockConfig,
      editorial: {
        ...mockConfig.editorial,
        hints: [
          { title: "Custom Clue 1", content: "Look at the modulo remainder." },
          { title: "Custom Clue 2", content: "Use a sliding window." },
        ],
      },
    };

    render(<EditorialTab config={customConfig} />);

    expect(screen.getByText("Custom Clue 1")).toBeDefined();
    expect(screen.getByText("Custom Clue 2")).toBeDefined();
    expect(screen.getByText(/0 \/ 5 unlocked/i)).toBeDefined();

    // Reveal custom hint 1
    const revealBtns = screen.getAllByRole("button", { name: "Reveal Hint" });
    fireEvent.click(revealBtns[0]);
    expect(screen.getByText(/Look at the modulo remainder/i)).toBeDefined();
  });
});
