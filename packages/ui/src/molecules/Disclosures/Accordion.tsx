import React, { useState, createContext, useContext } from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import "./Accordion.css";

export interface AccordionItemData {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconName | React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
}

export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "defaultValue"> {
  /**
   * List of accordion items data to render
   */
  items?: AccordionItemData[];

  /**
   * Allow multiple panels to be open simultaneously
   * @default false
   */
  multiple?: boolean;

  /**
   * Controlled expanded item ID(s)
   */
  value?: string | string[];

  /**
   * Default expanded item ID(s)
   */
  defaultValue?: string | string[];

  /**
   * Callback fired when expanded items change
   */
  onValueChange?: (value: string | string[]) => void;

  /**
   * Visual variant style
   * @default 'bordered'
   */
  variant?: "bordered" | "separated" | "flush" | "ghost";

  /**
   * Size density
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Chevron icon position
   * @default 'right'
   */
  chevronPosition?: "left" | "right";

  /**
   * Children for compound component usage
   */
  children?: React.ReactNode;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: AccordionClassNames;
}

export interface AccordionClassNames {
  root?: string;
  item?: string;
  header?: string;
  trigger?: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  chevron?: string;
  content?: string;
  body?: string;
}

interface AccordionContextType {
  expandedIds: string[];
  toggleItem: (id: string) => void;
  variant: "bordered" | "separated" | "flush" | "ghost";
  size: "sm" | "md" | "lg";
  chevronPosition: "left" | "right";
  classNames?: AccordionClassNames;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: IconName | React.ReactNode;
  disabled?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AccordionItem({
  id,
  title,
  subtitle,
  icon,
  disabled = false,
  badge,
  children,
  className = "",
}: AccordionItemProps) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion component");
  }

  const isExpanded = context.expandedIds.includes(id);

  return (
    <div
      className={[
        "bs-accordion-item",
        isExpanded ? "bs-accordion-item--expanded" : "",
        disabled ? "bs-accordion-item--disabled" : "",
        className,
        context.classNames?.item,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <h3 className={["bs-accordion-header", context.classNames?.header].filter(Boolean).join(" ")}>
        <button
          type="button"
          aria-expanded={isExpanded}
          disabled={disabled}
          onClick={() => !disabled && context.toggleItem(id)}
          className={[
            "bs-accordion-trigger",
            context.chevronPosition === "left" ? "bs-accordion-trigger--left" : "",
            context.classNames?.trigger,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="bs-accordion-header-left">
            {icon && (
              <div className={["bs-accordion-icon-badge", context.classNames?.icon].filter(Boolean).join(" ")}>
                {typeof icon === "string" ? (
                  <Icon name={icon as IconName} size={18} />
                ) : (
                  icon
                )}
              </div>
            )}

            <div className="bs-accordion-title-group">
              <span className={["bs-accordion-title", context.classNames?.title].filter(Boolean).join(" ")}>
                {title}
              </span>
              {subtitle && (
                <span className={["bs-accordion-subtitle", context.classNames?.subtitle].filter(Boolean).join(" ")}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>

          <div className="bs-accordion-header-right">
            {badge}
            <div className={["bs-accordion-chevron-pill", context.classNames?.chevron].filter(Boolean).join(" ")}>
              <Icon name="ChevronDown" size={14} />
            </div>
          </div>
        </button>
      </h3>

      {isExpanded && (
        <div className={["bs-accordion-content", context.classNames?.content].filter(Boolean).join(" ")}>
          <div className={["bs-accordion-body", context.classNames?.body].filter(Boolean).join(" ")}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function Accordion({
  items,
  multiple = false,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  variant = "bordered",
  size = "md",
  chevronPosition = "right",
  items: itemsData,
  children,
  className = "",
  classNames,
  style,
  ...props
}: AccordionProps) {
  const normalize = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };

  const [internalExpanded, setInternalExpanded] = useState<string[]>(normalize(defaultValue));

  const isControlled = controlledValue !== undefined;
  const expandedIds = isControlled ? normalize(controlledValue) : internalExpanded;

  const toggleItem = (id: string) => {
    let nextExpanded: string[];

    if (multiple) {
      nextExpanded = expandedIds.includes(id)
        ? expandedIds.filter((item) => item !== id)
        : [...expandedIds, id];
    } else {
      nextExpanded = expandedIds.includes(id) ? [] : [id];
    }

    if (!isControlled) {
      setInternalExpanded(nextExpanded);
    }

    if (onValueChange) {
      onValueChange(multiple ? nextExpanded : nextExpanded[0] || "");
    }
  };

  return (
    <AccordionContext.Provider
      value={{
        expandedIds,
        toggleItem,
        variant,
        size,
        chevronPosition,
        classNames,
      }}
    >
      <div
        className={[
          "bs-accordion",
          `bs-accordion--${variant}`,
          `bs-accordion--${size}`,
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {itemsData
          ? itemsData.map((item) => (
              <AccordionItem
                key={item.id}
                id={item.id}
                title={item.title}
                subtitle={item.subtitle}
                icon={item.icon}
                disabled={item.disabled}
                badge={item.badge}
              >
                {item.content}
              </AccordionItem>
            ))
          : children}
      </div>
    </AccordionContext.Provider>
  );
}

Accordion.Item = AccordionItem;
