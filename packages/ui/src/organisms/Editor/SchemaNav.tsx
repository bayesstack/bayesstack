import React from "react";
import { Icon } from "../../atoms/Icons";
import "./Editor.css";

export interface SchemaNavHeading {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

export interface SchemaNavProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of heading outline items
   */
  headings: SchemaNavHeading[];

  /**
   * Currently active heading item id
   */
  activeHeadingId?: string;

  /**
   * Heading click handler for smooth scrolling
   */
  onHeadingClick?: (headingId: string) => void;
}

export function SchemaNav({
  headings = [],
  activeHeadingId,
  onHeadingClick,
  className = "",
  style,
  ...props
}: SchemaNavProps) {
  if (headings.length === 0) {
    return (
      <div className="bs-editor-schemanav-empty">
        <Icon name="Menu" size={14} />
        <span>No headings in document</span>
      </div>
    );
  }

  return (
    <div
      className={["bs-editor-schemanav", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      <div className="bs-editor-schemanav-header">
        <Icon name="Menu" size={14} />
        <span>Table of Contents</span>
      </div>

      <div className="bs-editor-schemanav-list">
        {headings.map((h) => {
          const isActive = h.id === activeHeadingId;
          return (
            <div
              key={h.id}
              onClick={() => onHeadingClick && onHeadingClick(h.id)}
              className={[
                "bs-editor-schemanav-item",
                `bs-editor-schemanav-item--h${h.level}`,
                isActive ? "bs-editor-schemanav-item--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{h.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
