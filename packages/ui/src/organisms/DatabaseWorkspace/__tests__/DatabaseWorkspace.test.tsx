import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DatabaseWorkspace } from "../DatabaseWorkspace";
import type { DbTable } from "../types";

const testTables: DbTable[] = [
  {
    id: "public.users",
    name: "users",
    schema: "public",
    description: "User accounts table",
    rowCount: 120,
  },
  {
    id: "public.posts",
    name: "posts",
    schema: "public",
    description: "Blog posts table",
    rowCount: 50,
  },
  {
    id: "auth.tokens",
    name: "tokens",
    schema: "auth",
    description: "Auth tokens",
    rowCount: 10,
  },
];

describe("DatabaseWorkspace Component", () => {
  it("renders table explorer and initial opened table tab with custom children render prop", () => {
    render(
      <DatabaseWorkspace tables={testTables} defaultSelectedTableId="public.users">
        {(activeTable) => (
          <div data-testid="app-table-container">
            App rendering table for: {activeTable?.name}
          </div>
        )}
      </DatabaseWorkspace>
    );

    // Verify explorer title and table items
    expect(screen.getByText("Tables")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^users/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^posts/i })).toBeInTheDocument();

    // Verify active tab and app-rendered content
    expect(screen.getByRole("tab", { name: /users/i })).toBeInTheDocument();
    expect(screen.getByTestId("app-table-container")).toHaveTextContent("App rendering table for: users");
  });

  it("opens new tab on clicking explorer table item and updates children render prop", () => {
    render(
      <DatabaseWorkspace
        tables={testTables}
        defaultOpenedTableIds={["public.users"]}
        defaultSelectedTableId="public.users"
      >
        {(activeTable) => <div data-testid="app-content">Active: {activeTable?.name}</div>}
      </DatabaseWorkspace>
    );

    // Initially 1 tab
    expect(screen.getAllByRole("tab")).toHaveLength(1);

    // Click 'posts' table in explorer
    fireEvent.click(screen.getByRole("button", { name: /^posts/i }));

    // Should now have 2 tabs ('users' and 'posts')
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[1]).toHaveTextContent("posts");
    expect(screen.getByTestId("app-content")).toHaveTextContent("Active: posts");

    // Click 'posts' table again in explorer -> Should NOT create duplicate tab
    fireEvent.click(screen.getByRole("button", { name: /^posts/i }));
    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("switches active tab when tab item is clicked", () => {
    render(
      <DatabaseWorkspace
        tables={testTables}
        defaultOpenedTableIds={["public.users", "public.posts"]}
        defaultSelectedTableId="public.users"
      >
        {(activeTable) => <div data-testid="app-content">Active: {activeTable?.name}</div>}
      </DatabaseWorkspace>
    );

    // Click 'posts' tab
    fireEvent.click(screen.getByRole("tab", { name: /posts/i }));

    // Verify 'posts' data table is active
    expect(screen.getByTestId("app-content")).toHaveTextContent("Active: posts");
  });

  it("closes tab when close button is clicked and activates adjacent tab", () => {
    render(
      <DatabaseWorkspace
        tables={testTables}
        defaultOpenedTableIds={["public.users", "public.posts"]}
        defaultSelectedTableId="public.posts"
      >
        {(activeTable) => <div data-testid="app-content">Active: {activeTable?.name}</div>}
      </DatabaseWorkspace>
    );

    expect(screen.getAllByRole("tab")).toHaveLength(2);

    // Click close button on 'posts' tab
    const closeBtn = screen.getByRole("button", { name: /close posts tab/i });
    fireEvent.click(closeBtn);

    // Only 1 tab should remain ('users') and it should be active with its data
    expect(screen.getAllByRole("tab")).toHaveLength(1);
    expect(screen.getByTestId("app-content")).toHaveTextContent("Active: users");
  });

  it("shows empty workspace state when all tabs are closed", () => {
    render(
      <DatabaseWorkspace
        tables={testTables}
        defaultOpenedTableIds={["public.users"]}
        defaultSelectedTableId="public.users"
      />
    );

    // Close the only open tab
    const closeBtn = screen.getByRole("button", { name: /close users tab/i });
    fireEvent.click(closeBtn);

    // Empty state canvas should be displayed
    expect(screen.getByText("No Table Selected")).toBeInTheDocument();
    expect(
      screen.getByText(/select a database table from the explorer on the left/i)
    ).toBeInTheDocument();
  });

  it("filters tables as user types in search input", () => {
    render(<DatabaseWorkspace tables={testTables} defaultOpenedTableIds={[]} defaultSelectedTableId="" />);

    // Search input
    const searchInput = screen.getByPlaceholderText(/filter tables/i);
    fireEvent.change(searchInput, { target: { value: "token" } });

    // 'tokens' table should be visible, 'users' and 'posts' filtered out
    expect(screen.getByRole("button", { name: /^tokens/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^users/i })).not.toBeInTheDocument();
  });

  it("toggles explorer collapse state when toggle button is clicked", () => {
    render(<DatabaseWorkspace tables={testTables} />);

    const toggleBtn = screen.getByRole("button", { name: /collapse table explorer/i });
    fireEvent.click(toggleBtn);

    // Search input should be hidden when collapsed
    expect(screen.queryByPlaceholderText(/filter tables/i)).not.toBeInTheDocument();

    // Clicking toggle again expands it
    const expandBtn = screen.getByRole("button", { name: /expand table explorer/i });
    fireEvent.click(expandBtn);

    expect(screen.getByPlaceholderText(/filter tables/i)).toBeInTheDocument();
  });

  it("renders drag resizer separator when explorer is expanded", () => {
    render(<DatabaseWorkspace tables={testTables} defaultExplorerWidth={300} />);

    const resizer = screen.getByRole("separator", { name: /resize table explorer/i });
    expect(resizer).toBeInTheDocument();
    expect(resizer).toHaveAttribute("aria-valuenow", "300");
  });
});
