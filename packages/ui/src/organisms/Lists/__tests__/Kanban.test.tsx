import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Kanban } from "../Kanban";

describe("Kanban Component", () => {
  const columns = [
    { id: "todo", title: "To Do" },
    { id: "done", title: "Done" },
  ];
  const cards = [
    { id: "card-1", columnId: "todo", title: "Task One", priority: "high" as const, tags: ["frontend"] },
    { id: "card-2", columnId: "done", title: "Task Two", priority: "low" as const },
  ];

  it("renders columns and card items", () => {
    const handleCardClick = vi.fn();
    render(
      <Kanban
        columns={columns}
        cards={cards}
        onCardClick={handleCardClick}
      />
    );

    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Task One")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Task One"));
    expect(handleCardClick).toHaveBeenCalledWith(cards[0]);
  });

  it("filters cards by title search query", () => {
    render(<Kanban columns={columns} cards={cards} searchable />);

    const searchInput = screen.getByPlaceholderText(/Filter cards by title/i);
    fireEvent.change(searchInput, { target: { value: "Task Two" } });

    expect(screen.queryByText("Task One")).not.toBeInTheDocument();
    expect(screen.getByText("Task Two")).toBeInTheDocument();
  });

  it("allows inline card creation", () => {
    const handleCardAdd = vi.fn();
    render(<Kanban columns={columns} cards={cards} onCardAdd={handleCardAdd} />);

    const addButtons = screen.getAllByTitle(/Add card to/i);
    fireEvent.click(addButtons[0]); // Click add on To Do column

    const titleInput = screen.getByPlaceholderText("Enter card title...");
    fireEvent.change(titleInput, { target: { value: "New Inline Task" } });

    const submitBtn = screen.getByRole("button", { name: "Add Card" });
    fireEvent.click(submitBtn);

    expect(handleCardAdd).toHaveBeenCalledWith({ columnId: "todo", title: "New Inline Task" });
  });

  it("triggers edit, duplicate, and delete card quick actions", () => {
    const handleCardAction = vi.fn();
    render(<Kanban columns={columns} cards={cards} onCardAction={handleCardAction} />);

    const editBtn = screen.getAllByTitle("Edit card")[0];
    fireEvent.click(editBtn);
    expect(handleCardAction).toHaveBeenCalledWith("edit", cards[0]);

    const duplicateBtn = screen.getAllByTitle("Duplicate card")[0];
    fireEvent.click(duplicateBtn);
    expect(handleCardAction).toHaveBeenCalledWith("duplicate", cards[0]);

    const deleteBtn = screen.getAllByTitle("Delete card")[0];
    fireEvent.click(deleteBtn);
    expect(handleCardAction).toHaveBeenCalledWith("delete", cards[0]);
  });

  it("collapses and expands columns", () => {
    render(<Kanban columns={columns} cards={cards} />);

    const collapseBtn = screen.getAllByTitle("Collapse column")[0];
    fireEvent.click(collapseBtn);

    expect(screen.getByTitle("Expand To Do")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Expand To Do"));
    expect(screen.queryByTitle("Expand To Do")).not.toBeInTheDocument();
  });
});
