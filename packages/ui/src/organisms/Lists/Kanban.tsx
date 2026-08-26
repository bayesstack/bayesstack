import React, { useState } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { Badge } from "../../atoms/Badges/Badge";
import { Avatar } from "../../atoms/Badges/Avatar";
import { Button } from "../../atoms/Buttons/Button";
import "./Lists.css";

export interface KanbanCardUser {
  name: string;
  avatar?: string;
}

export interface KanbanCardItem {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low" | "urgent";
  tags?: string[];
  assignees?: KanbanCardUser[];
  dueDate?: string;
  progress?: number; // 0 to 100
  subtasks?: {
    total: number;
    completed: number;
  };
  [key: string]: any;
}

export interface KanbanColumnItem {
  id: string;
  title: string;
  color?: string; // Header accent color bar
  badgeColor?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  wipLimit?: number; // Max allowed cards limit for work-in-progress warning
}

export interface KanbanProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Column definitions array
   */
  columns: KanbanColumnItem[];

  /**
   * Cards dataset array
   */
  cards: KanbanCardItem[];

  /**
   * Callback fired when card order or column assignment changes
   */
  onChange?: (cards: KanbanCardItem[], movedCard: KanbanCardItem, targetColumnId: string) => void;

  /**
   * Callback fired when column positions are reordered
   */
  onColumnReorder?: (columns: KanbanColumnItem[]) => void;

  /**
   * Callback fired when a card item is clicked
   */
  onCardClick?: (card: KanbanCardItem) => void;

  /**
   * Callback fired when a card quick action (edit, duplicate, delete) is clicked
   */
  onCardAction?: (action: "edit" | "duplicate" | "delete", card: KanbanCardItem) => void;

  /**
   * Callback fired when a new card is added via inline form
   */
  onCardAdd?: (newCard: { columnId: string; title: string }) => void;

  /**
   * Enables card search input toolbar
   * @default true
   */
  searchable?: boolean;

  /**
   * Enables column drag-and-drop reordering
   * @default true
   */
  draggableColumns?: boolean;

  /**
   * Disables card drag-and-drop interactions
   * @default false
   */
  disabled?: boolean;
}

export function Kanban({
  columns: initialColumns = [],
  cards: controlledCards = [],
  onChange,
  onColumnReorder,
  onCardClick,
  onCardAction,
  onCardAdd,
  searchable = true,
  draggableColumns = true,
  disabled = false,
  className = "",
  style,
  ...props
}: KanbanProps) {
  const [columns, setColumns] = useState<KanbanColumnItem[]>(initialColumns);
  const [cards, setCards] = useState<KanbanCardItem[]>(controlledCards);
  const activeCards = controlledCards !== undefined ? controlledCards : cards;

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Collapsed column ids set
  const [collapsedColumns, setCollapsedColumns] = useState<string[]>([]);

  // Active inline add card form column id
  const [addingCardColumnId, setAddingCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  // Drag-and-drop state for cards
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Drag-and-drop state for columns
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  const filteredCards = activeCards.filter((card) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      card.title.toLowerCase().includes(query) ||
      (card.description && card.description.toLowerCase().includes(query)) ||
      (card.tags && card.tags.some((t) => t.toLowerCase().includes(query)))
    );
  });

  // Card drag handlers
  const handleCardDragStart = (e: React.DragEvent, cardId: string) => {
    if (disabled) return;
    setDraggedCardId(cardId);
    e.dataTransfer.setData("text/plain", cardId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverColumn = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedCardId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleDropColumn = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (draggedCardId) {
      const targetCard = activeCards.find((c) => c.id === draggedCardId);
      if (targetCard && targetCard.columnId !== targetColumnId) {
        const updatedCards = activeCards.map((c) =>
          c.id === draggedCardId ? { ...c, columnId: targetColumnId } : c
        );

        setCards(updatedCards);
        if (onChange) {
          onChange(updatedCards, { ...targetCard, columnId: targetColumnId }, targetColumnId);
        }
      }
    } else if (draggedColumnId && draggedColumnId !== targetColumnId && draggableColumns) {
      // Reorder columns
      const oldIdx = columns.findIndex((col) => col.id === draggedColumnId);
      const newIdx = columns.findIndex((col) => col.id === targetColumnId);
      if (oldIdx !== -1 && newIdx !== -1) {
        const updatedCols = [...columns];
        const [movedCol] = updatedCols.splice(oldIdx, 1);
        updatedCols.splice(newIdx, 0, movedCol);
        setColumns(updatedCols);
        if (onColumnReorder) onColumnReorder(updatedCols);
      }
    }

    setDraggedCardId(null);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDraggedColumnId(null);
    setDragOverColumnId(null);
  };

  // Column drag handlers
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    if (disabled || !draggableColumns) return;
    setDraggedColumnId(columnId);
    e.dataTransfer.setData("text/plain", columnId);
  };

  // Toggle column collapse
  const toggleColumnCollapse = (columnId: string) => {
    setCollapsedColumns((prev) =>
      prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId]
    );
  };

  // Submit inline new card form
  const handleCreateInlineCard = (columnId: string) => {
    if (!newCardTitle.trim()) return;

    const newCard: KanbanCardItem = {
      id: `card-${Date.now()}`,
      columnId,
      title: newCardTitle.trim(),
    };

    const updated = [...activeCards, newCard];
    setCards(updated);
    if (onCardAdd) {
      onCardAdd({ columnId, title: newCardTitle.trim() });
    }

    setNewCardTitle("");
    setAddingCardColumnId(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
      case "high":
        return "danger";
      case "medium":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <div
      className={["bs-kanban-wrapper", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Search Filter Header */}
      {searchable && (
        <div className="bs-kanban-toolbar">
          <div className="bs-kanban-search-box">
            <Icon name="Search" size={15} className="bs-kanban-search-icon" />
            <input
              type="text"
              placeholder="Filter cards by title, tag, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bs-kanban-search-input"
            />
            {searchQuery && (
              <IconButton
                name="Close"
                label="Clear search"
                size="xs"
                variant="transparent"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
        </div>
      )}

      {/* Kanban Board Stage */}
      <div className="bs-kanban-stage">
        {columns.map((column) => {
          const columnCards = filteredCards.filter((c) => c.columnId === column.id);
          const isColumnDragOver = dragOverColumnId === column.id;
          const isCollapsed = collapsedColumns.includes(column.id);

          // WIP Limit warning calculation
          const isWipExceeded =
            column.wipLimit !== undefined && columnCards.length > column.wipLimit;

          if (isCollapsed) {
            return (
              <div
                key={column.id}
                className="bs-kanban-column bs-kanban-column--collapsed"
                onClick={() => toggleColumnCollapse(column.id)}
                title={`Expand ${column.title}`}
              >
                <div className="bs-kanban-collapsed-header">
                  {column.color && (
                    <span
                      className="bs-kanban-column-indicator"
                      style={{ backgroundColor: column.color }}
                    />
                  )}
                  <span className="bs-kanban-collapsed-title">{column.title}</span>
                  <Badge size="sm" variant="subtle" color="neutral">
                    {columnCards.length}
                  </Badge>
                </div>
              </div>
            );
          }

          return (
            <div
              key={column.id}
              draggable={draggableColumns && !disabled}
              onDragStart={(e) => handleColumnDragStart(e, column.id)}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDrop={(e) => handleDropColumn(e, column.id)}
              onDragEnd={handleDragEnd}
              className={[
                "bs-kanban-column",
                isColumnDragOver ? "bs-kanban-column--drag-over" : "",
                isWipExceeded ? "bs-kanban-column--wip-exceeded" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Column Header */}
              <div className="bs-kanban-column-header">
                <div className="bs-kanban-column-title-group">
                  {draggableColumns && (
                    <span className="bs-kanban-column-grab-handle" title="Drag to reorder column">
                      <Icon name="Menu" size={14} />
                    </span>
                  )}
                  {column.color && (
                    <span
                      className="bs-kanban-column-indicator"
                      style={{ backgroundColor: column.color }}
                    />
                  )}
                  <h4 className="bs-kanban-column-title">{column.title}</h4>

                  {/* Badge with WIP warning */}
                  <Badge
                    size="sm"
                    variant={isWipExceeded ? "solid" : "subtle"}
                    color={isWipExceeded ? "danger" : column.badgeColor || "neutral"}
                  >
                    {column.wipLimit
                      ? `${columnCards.length} / ${column.wipLimit}`
                      : columnCards.length}
                  </Badge>
                </div>

                <div className="bs-kanban-column-header-actions">
                  <IconButton
                    name="Plus"
                    label={`Add card to ${column.title}`}
                    size="xs"
                    variant="transparent"
                    onClick={() => setAddingCardColumnId(column.id)}
                  />
                  <IconButton
                    name="ChevronLeft"
                    label="Collapse column"
                    size="xs"
                    variant="transparent"
                    onClick={() => toggleColumnCollapse(column.id)}
                  />
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="bs-kanban-cards-container">
                {columnCards.map((card) => {
                  const isDragging = draggedCardId === card.id;

                  return (
                    <div
                      key={card.id}
                      draggable={!disabled}
                      onDragStart={(e) => handleCardDragStart(e, card.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onCardClick && onCardClick(card)}
                      className={[
                        "bs-kanban-card",
                        isDragging ? "bs-kanban-card--dragging" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {/* Priority Tag & Badges */}
                      <div className="bs-kanban-card-meta-top">
                        {card.priority && (
                          <Badge
                            size="sm"
                            color={getPriorityColor(card.priority)}
                            variant="subtle"
                          >
                            {card.priority}
                          </Badge>
                        )}
                        {card.tags &&
                          card.tags.map((tag) => (
                            <span key={tag} className="bs-kanban-card-tag">
                              #{tag}
                            </span>
                          ))}

                        {/* Quick Hover Action Bar */}
                        <div
                          className="bs-kanban-card-hover-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {onCardAction && (
                            <>
                              <IconButton
                                name="Edit"
                                label="Edit card"
                                size="xs"
                                variant="transparent"
                                onClick={() => onCardAction("edit", card)}
                              />
                              <IconButton
                                name="Copy"
                                label="Duplicate card"
                                size="xs"
                                variant="transparent"
                                onClick={() => onCardAction("duplicate", card)}
                              />
                              <IconButton
                                name="Trash"
                                label="Delete card"
                                size="xs"
                                variant="transparent"
                                onClick={() => onCardAction("delete", card)}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Card Title & Description */}
                      <h5 className="bs-kanban-card-title">{card.title}</h5>
                      {card.description && (
                        <p className="bs-kanban-card-desc">{card.description}</p>
                      )}

                      {/* Progress Bar (if available) */}
                      {card.progress !== undefined && (
                        <div className="bs-kanban-card-progress-bar">
                          <div
                            className="bs-kanban-card-progress-fill"
                            style={{ width: `${card.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Card Footer: Assignee Avatars, Subtasks, Due Date */}
                      <div className="bs-kanban-card-footer">
                        {card.assignees && card.assignees.length > 0 ? (
                          <div className="bs-kanban-card-assignees">
                            {card.assignees.slice(0, 3).map((u, i) => (
                              <Avatar
                                key={i}
                                name={u.name}
                                src={u.avatar}
                                size="xs"
                                className="bs-kanban-avatar-stacked"
                              />
                            ))}
                          </div>
                        ) : (
                          <span />
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {card.subtasks && (
                            <span className="bs-kanban-card-subtasks">
                              <Icon name="Check" size={12} />
                              {card.subtasks.completed}/{card.subtasks.total}
                            </span>
                          )}

                          {card.dueDate && (
                            <div className="bs-kanban-card-due-date">
                              <Icon name="Calendar" size={12} />
                              <span>{card.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Inline Add Card Input Form */}
                {addingCardColumnId === column.id && (
                  <div className="bs-kanban-inline-add-card">
                    <input
                      type="text"
                      placeholder="Enter card title..."
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateInlineCard(column.id);
                        if (e.key === "Escape") setAddingCardColumnId(null);
                      }}
                      className="bs-kanban-inline-add-input"
                      autoFocus
                    />
                    <div className="bs-kanban-inline-add-actions">
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={() => handleCreateInlineCard(column.id)}
                      >
                        Add Card
                      </Button>
                      <IconButton
                        name="Close"
                        label="Cancel"
                        size="xs"
                        variant="transparent"
                        onClick={() => setAddingCardColumnId(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
