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

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: SchemaNavClassNames;
}

export interface SchemaNavClassNames {
  root?: string;
  header?: string;
  list?: string;
  item?: string;
}

export function SchemaNav({
  headings = [],
  activeHeadingId,
  onHeadingClick,
  className = "",
  classNames,
  style,
  ...props
}: SchemaNavProps) {
  if (headings.length === 0) {
    return (
      <div className={["bs-editor-schemanav-empty", className, classNames?.root].filter(Boolean).join(" ")}>
        <Icon name="Menu" size={14} />
        <span>No headings in document</span>
      </div>
    );
  }

  return (
    <div
      className={["bs-editor-schemanav", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      <div className={["bs-editor-schemanav-header", classNames?.header].filter(Boolean).join(" ")}>
        <Icon name="Menu" size={14} />
        <span>Table of Contents</span>
      </div>

      <div className={["bs-editor-schemanav-list", classNames?.list].filter(Boolean).join(" ")}>
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
                classNames?.item,
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
