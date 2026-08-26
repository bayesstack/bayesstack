import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { Kanban, type KanbanCardItem, type KanbanColumnItem } from "./Kanban";

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
      { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
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
      { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
    ],
    dueDate: "Aug 29",
    progress: 75,
    subtasks: { total: 5, completed: 3 },
  },
  {
    id: "card-3",
    columnId: "in_progress",
    title: "Kanban Board WIP Limits & Collapse",
    description: "Support collapsible columns and inline add card input.",
    priority: "high",
    tags: ["Enterprise"],
    assignees: [{ name: "Sarah Chen" }],
    dueDate: "Aug 30",
    progress: 50,
    subtasks: { total: 4, completed: 2 },
  },
  {
    id: "card-4",
    columnId: "in_review",
    title: "Tiptap Rich Text Editor Engine",
    description: "ProseMirror WYSIWYG editor integration with floating toolbar.",
    priority: "medium",
    tags: ["Editor"],
    assignees: [{ name: "Alex Rivera" }],
    dueDate: "Sep 02",
    progress: 90,
    subtasks: { total: 6, completed: 5 },
  },
  {
    id: "card-5",
    columnId: "in_review",
    title: "SchemaNav Document Table of Contents",
    description: "Auto-generated heading tree from H1-H6 tags.",
    priority: "low",
    tags: ["Docs"],
    assignees: [{ name: "Marcus Vance" }],
    dueDate: "Sep 03",
    progress: 10,
    subtasks: { total: 3, completed: 0 },
  },
];

export const EnterpriseKanbanBoard: Story = {
  render: () => {
    const [cards, setCards] = useState<KanbanCardItem[]>(cardsData);

    return (
      <div style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#123333" }}>Sprint Planning Board</h3>
        <p style={{ margin: "0 0 16px 0", color: "#68807D", fontSize: 13.5 }}>
          Features column drag reordering, inline "+ Add Card", WIP limit warnings (e.g. In Review 2/1), card hover action tools, and collapsible columns.
        </p>
        <Kanban
          columns={columnsData}
          cards={cards}
          onChange={(updatedCards, movedCard, targetColumnId) => {
            console.log(`Moved card "${movedCard.title}" to ${targetColumnId}`);
            setCards(updatedCards);
          }}
          onCardAdd={({ columnId, title }) => {
            console.log(`Added card "${title}" to column ${columnId}`);
          }}
          onCardAction={(action, card) => {
            alert(`Triggered "${action}" on card: ${card.title}`);
          }}
          onCardClick={(card) => {
            console.log("Card clicked:", card.title);
          }}
        />
      </div>
    );
  },
};
