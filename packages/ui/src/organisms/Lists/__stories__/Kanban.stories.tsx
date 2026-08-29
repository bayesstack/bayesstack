import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "@storybook/test";
import { Kanban, type KanbanCardItem, type KanbanColumnItem } from ".././Kanban";

const meta: Meta<typeof Kanban> = {
  title: "Organisms/Lists/Kanban",
  component: Kanban,
  argTypes: {
    searchable: { control: "boolean" },
    draggableColumns: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Kanban>;

const columnsData: KanbanColumnItem[] = [
  { id: "backlog", title: "Backlog", color: "#94A3B8", badgeColor: "neutral" },
  { id: "in_progress", title: "In Progress", color: "#0284C7", badgeColor: "info", wipLimit: 2 },
  { id: "in_review", title: "In Review", color: "#F59E0B", badgeColor: "warning", wipLimit: 1 },
  { id: "completed", title: "Completed", color: "#10B981", badgeColor: "success" },
];

const cardsData: KanbanCardItem[] = [
  {
    id: "card-1",
    columnId: "backlog",
    title: "Implement Modal & Overlay Suite",
    description: "Build Modal, ModalZoom, Notification, and Tour organisms.",
    priority: "urgent",
    tags: ["Organisms", "UI"],
    assignees: [
      { name: "Sarah Chen" },
    ],
    dueDate: "Aug 28",
    progress: 100,
    subtasks: { total: 4, completed: 4 },
  },
  {
    id: "card-2",
    columnId: "in_progress",
    title: "Drag & Drop Transfer Board",
    description: "Dual-bucket item selector with drag highlights.",
    priority: "high",
    tags: ["Lists", "DND"],
    assignees: [
      { name: "Marcus Vance" },
      { name: "Sarah Chen" },
    ],
    dueDate: "Aug 29",
    progress: 75,
    subtasks: { total: 5, completed: 3 },
  },
];

export const EnterpriseKanbanBoard: Story = {
  render: () => {
    const [cards, setCards] = useState<KanbanCardItem[]>(cardsData);

    return (
      <div style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#123333" }}>Sprint Planning Board</h3>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13.5 }}>
          Features column drag reordering, inline "+ Add Card", WIP limit warnings, card hover action tools, and collapsible columns.
        </p>
        <Kanban
          columns={columnsData}
          cards={cards}
          onChange={(updatedCards) => {
            setCards(updatedCards);
          }}
          onCardAdd={({ columnId, title }) => {
            setCards((prev) => [
              ...prev,
              { id: `card-${Date.now()}`, columnId, title },
            ]);
          }}
          onCardAction={() => {}}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const colHeading = canvas.getByText("Backlog");
    await expect(colHeading).toBeInTheDocument();

    const cardTitle = canvas.getByText("Implement Modal & Overlay Suite");
    await expect(cardTitle).toBeInTheDocument();
  },
};

export const MinimalKanbanBoard: Story = {
  render: () => {
    const [cards, setCards] = useState<KanbanCardItem[]>(cardsData);

    return (
      <div style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#123333" }}>Minimal & High Density Board</h3>
        <p style={{ margin: "0 0 16px 0", color: "#4A6360", fontSize: 13.5 }}>
          Minimal board theme (`variant="minimal"`) designed for clean, high-density issue tracking.
        </p>
        <Kanban
          columns={columnsData}
          cards={cards}
          variant="minimal"
          onChange={(updatedCards) => {
            setCards(updatedCards);
          }}
        />
      </div>
    );
  },
};

