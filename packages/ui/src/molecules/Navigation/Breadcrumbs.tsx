import React, { forwardRef } from "react";
import { Icon, IconName } from "../../atoms/Icons";
import "./Navigation.css";

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: IconName | React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * List of breadcrumb navigation items
   */
  items: BreadcrumbItem[];

  /**
   * Custom separator icon string name or ReactNode
   * @default 'ArrowRight'
   */
  separator?: IconName | React.ReactNode;

  /**
   * Prepends a root Home icon link
   * @default true
   */
  showHomeIcon?: boolean;
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      items = [],
      separator = "ArrowRight",
      showHomeIcon = true,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const renderIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size="xs" />;
      }
      return icon;
    };

    const renderSeparator = () => {
      if (typeof separator === "string") {
        return <Icon name={separator as IconName} size="xs" color="#94A3B8" />;
      }
      return separator;
    };

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={["bs-breadcrumbs", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {showHomeIcon && (
          <>
            <a href="/" className="bs-breadcrumb-item">
              <Icon name="Home" size="sm" />
            </a>
            <span className="bs-breadcrumb-separator">{renderSeparator()}</span>
          </>
        )}

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <React.Fragment key={idx}>
              {isLast ? (
                <span className="bs-breadcrumb-item bs-breadcrumb-item--active">
                  {renderIcon(item.icon)}
                  <span>{item.label}</span>
                </span>
              ) : (
                <a
                  href={item.href || "#"}
                  className="bs-breadcrumb-item"
                  onClick={item.onClick}
                >
                  {renderIcon(item.icon)}
                  <span>{item.label}</span>
                </a>
              )}

              {!isLast && (
                <span className="bs-breadcrumb-separator">
                  {renderSeparator()}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }
);

Breadcrumbs.displayName = "Breadcrumbs";
