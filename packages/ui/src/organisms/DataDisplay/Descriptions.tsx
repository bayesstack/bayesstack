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

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: DescriptionsClassNames;
}

export interface DescriptionsClassNames {
  root?: string;
  header?: string;
  title?: string;
  extra?: string;
  grid?: string;
  item?: string;
  label?: string;
  value?: string;
}

/**
 * Descriptions displays key-value pairs in a responsive grid layout. Ideal for model metrics,
 * system specifications, user profile summaries, and entity property sheets.
 */
export function Descriptions({
  title,
  extra,
  bordered = false,
  column = 3,
  layout = "horizontal",
  size = "md",
  items = [],
  className = "",
  classNames,
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
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {/* Header section rendered only if title or top-right extra action is defined */}
      {(title || extra) && (
        <div className={["bs-descriptions-header", classNames?.header].filter(Boolean).join(" ")}>
          {title && <div className={["bs-descriptions-title", classNames?.title].filter(Boolean).join(" ")}>{title}</div>}
          {extra && <div className={["bs-descriptions-extra", classNames?.extra].filter(Boolean).join(" ")}>{extra}</div>}
        </div>
      )}

      {/* CSS Grid dynamically computes columns inline to avoid hardcoding N column CSS classes */}
      <div
        className={["bs-descriptions-grid", classNames?.grid].filter(Boolean).join(" ")}
        style={{
          gridTemplateColumns: `repeat(${column}, 1fr)`,
        }}
      >
        {items.map((item, idx) => {
          // Clamp item column span to the max defined column count to prevent grid wrapping breaks
          const gridSpan = item.span ? Math.min(item.span, column) : 1;
          return (
            <div
              key={item.key || idx}
              className={["bs-descriptions-item", classNames?.item].filter(Boolean).join(" ")}
              style={{ gridColumn: `span ${gridSpan}` }}
            >
              <span className={["bs-descriptions-item-label", classNames?.label].filter(Boolean).join(" ")}>{item.label}</span>
              <span className={["bs-descriptions-item-value", classNames?.value].filter(Boolean).join(" ")}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
