import React from "react";
import { Modal, Icon } from "@bayesstack/ui";

export interface ModalConfig {
  opened: boolean;
  title: string;
  description: string;
  content?: React.ReactNode;
}

export function DatabasePlaceholdersModal({
  config,
  onClose,
}: {
  config: ModalConfig;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={config.opened}
      onClose={onClose}
      title={config.title}
      description={config.description}
      size="sm"
    >
      {config.content}
    </Modal>
  );
}

export function getRibbonPlaceholderModalConfig(actionId: string): ModalConfig {
  if (actionId === "savedQueries") {
    return {
      opened: true,
      title: "Saved Queries",
      description: "Review and organize your bookmarked SQL console queries.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "4px 0" }}>
          <div style={{ padding: "14px", background: "var(--bs-ui-canvas, #f1f8f6)", borderRadius: "8px", border: "1px solid var(--bs-ui-line, #d7e8e4)", fontSize: "0.85rem", color: "var(--bs-ui-ink, #123333)" }}>
            <div style={{ fontWeight: 600, color: "var(--bs-ui-brand, #0b6763)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon name="Bookmark" size={16} />
              <span>Bookmark Feature Placeholder</span>
            </div>
            <div>Saved queries will appear here with quick-run actions, query parameter templates, and execution history.</div>
          </div>
        </div>
      ),
    };
  }

  if (actionId === "erDiagram") {
    return {
      opened: true,
      title: "ER Diagram Visualizer",
      description: "Interactive Entity-Relationship diagram viewer for your database schema.",
      content: (
        <div style={{ padding: "14px", background: "var(--bs-ui-canvas, #f1f8f6)", borderRadius: "8px", border: "1px solid var(--bs-ui-line, #d7e8e4)", fontSize: "0.85rem", color: "var(--bs-ui-ink, #123333)" }}>
          <div style={{ fontWeight: 600, color: "var(--bs-ui-brand, #0b6763)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Icon name="Flowchart" size={16} />
            <span>Interactive Schema Visualization</span>
          </div>
          <div>The ER Diagram visualizer will map out database tables, foreign key constraints, and entity relationships dynamically.</div>
        </div>
      ),
    };
  }

  return {
    opened: true,
    title: "Feature Placeholder",
    description: `Action "${actionId}" selected.`,
    content: (
      <div style={{ padding: "14px", background: "var(--bs-ui-canvas, #f1f8f6)", borderRadius: "8px", border: "1px solid var(--bs-ui-line, #d7e8e4)", fontSize: "0.85rem", color: "var(--bs-ui-ink, #123333)" }}>
        This feature control is currently under active development.
      </div>
    ),
  };
}
