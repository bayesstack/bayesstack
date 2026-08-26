import React from "react";
import "./DataDisplay.css";

export interface DescriptionItem {
  key?: string;
  label: React.ReactNode;
  value: React.ReactNode;
  span?: number;
}

export interface DescriptionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Section title header
   */
  title?: React.ReactNode;

  /**
   * Action element in top-right of header (e.g. Edit button)
   */
  extra?: React.ReactNode;

  /**
   * Show outer and cell border lines
   * @default false
   */
  bordered?: boolean;

  /**
   * Grid column layout count (1, 2, 3, 4)
   * @default 3
   */
  column?: number;

  /**
   * Layout alignment direction
   * @default 'horizontal'
   */
  layout?: "horizontal" | "vertical";

  /**
   * Padding size scale ('sm' | 'md' | 'lg')
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Array of key-value description items
   */
  items: DescriptionItem[];
}

export function Descriptions({
  title,
  extra,
  bordered = false,
  column = 3,
  layout = "horizontal",
  size = "md",
  items = [],
  className = "",
  style,
  ...props
}: DescriptionsProps) {
  return (
    <div
      className={[
        "bs-descriptions",
        bordered ? "bs-descriptions--bordered" : "",
        `bs-descriptions--${layout}`,
        `bs-descriptions--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {/* Header */}
      {(title || extra) && (
        <div className="bs-descriptions-header">
          {title && <div className="bs-descriptions-title">{title}</div>}
          {extra && <div className="bs-descriptions-extra">{extra}</div>}
        </div>
      )}

      {/* Grid Container */}
      <div
        className="bs-descriptions-grid"
        style={{
          gridTemplateColumns: `repeat(${column}, 1fr)`,
        }}
      >
        {items.map((item, idx) => {
          const gridSpan = item.span ? Math.min(item.span, column) : 1;
          return (
            <div
              key={item.key || idx}
              className="bs-descriptions-item"
              style={{ gridColumn: `span ${gridSpan}` }}
            >
              <span className="bs-descriptions-item-label">{item.label}</span>
              <span className="bs-descriptions-item-value">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
