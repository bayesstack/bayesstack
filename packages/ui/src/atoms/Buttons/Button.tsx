import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode, type ElementType } from "react";
import { Icon, type IconName } from "../Icons";
import "./Button.css";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export type ButtonAs = "button" | "a" | "div" | "span";

export interface ButtonSlots {
  /** Outermost button root element */
  root?: string;
  /** Button text label wrapper slot */
  label?: string;
  /** Left icon wrapper slot */
  leftIcon?: string;
  /** Right icon wrapper slot */
  rightIcon?: string;
  /** Loading spinner element slot */
  spinner?: string;
}

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "style"> {
  /**
   * Button text or node content
   */
  children?: ReactNode;

  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size scale
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Leading icon name string or ReactNode
   */
  leftIcon?: IconName | ReactNode;

  /**
   * Trailing icon name string or ReactNode
   */
  rightIcon?: IconName | ReactNode;

  /**
   * Displays loading spinner and disables user interaction
   * @default false
   */
  loading?: boolean;

  /**
   * Optional text label to display during loading state
   */
  loadingText?: ReactNode;

  /**
   * Spans 100% of parent container width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Renders fully rounded pill edges
   * @default false
   */
  rounded?: boolean;

  /**
   * Underlying HTML element tag
   * @default 'button'
   */
  as?: ButtonAs;

  /**
   * Additional CSS class name string for outer root element
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: ButtonSlots;

  /**
   * Custom inline style object
   */
  style?: React.CSSProperties;
}

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      loadingText,
      fullWidth = false,
      rounded = false,
      as: Component = "button",
      disabled = false,
      type = "button",
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    // Determines if we're rendering a native <button> tag to safely apply button-specific attributes
    // like the native 'disabled' property, which is invalid on <a> or <div> tags.
    const isButtonTag = Component === "button";
    
    // Loading state inherently implies the button should not be interactive.
    const isDisabled = disabled || loading;

    // Helper to allow consumers to pass either a raw string (for our internal Icon catalog)
    // or a custom ReactNode (like an SVG or third-party icon component) for maximum flexibility.
    const renderIcon = (icon?: IconName | ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        const iconSize = size === "xs" ? 12 : size === "sm" ? 14 : size === "lg" ? 18 : 16;
        return <Icon name={icon as IconName} size={iconSize} />;
      }
      return icon;
    };

    const rootClassNames = [
      "bs-button",
      `bs-button--variant-${variant}`,
      `bs-button--size-${size}`,
      fullWidth && "bs-button--full-width",
      rounded && "bs-button--rounded-full",
      loading && "bs-button--loading",
      isDisabled && "bs-button--disabled",
      className,
      classNames?.root,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Component
        // Type assertion is required here because React's polymorphic `forwardRef` 
        // struggles to strictly infer the instance type when `Component` is dynamically evaluated.
        ref={ref as any}
        className={rootClassNames}
        style={style}
        type={isButtonTag ? type : undefined}
        // Only apply the native 'disabled' attribute to actual <button> tags. 
        // Applying it to <a> or <div> tags violates HTML specs and can break layout.
        disabled={isButtonTag ? isDisabled : undefined}
        // aria-disabled ensures that screen readers still announce the disabled state 
        // even if the element is an <a> tag that doesn't support the native disabled attribute.
        aria-disabled={isDisabled ? true : undefined}
        // Spread remaining props using assertion to bypass strict HTML attribute union conflicts 
        // caused by the polymorphic nature of this component.
        {...(props as any)}
      >
        {loading ? (
          <>
            <span
              className={["bs-button__spinner", classNames?.spinner].filter(Boolean).join(" ")}
              aria-hidden="true"
            />
            <span className={classNames?.label}>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span
                className={["bs-button__icon bs-button__icon--left", classNames?.leftIcon]
                  .filter(Boolean)
                  .join(" ")}
              >
                {renderIcon(leftIcon)}
              </span>
            )}
            {children && <span className={classNames?.label}>{children}</span>}
            {rightIcon && (
              <span
                className={["bs-button__icon bs-button__icon--right", classNames?.rightIcon]
                  .filter(Boolean)
                  .join(" ")}
              >
                {renderIcon(rightIcon)}
              </span>
            )}
          </>
        )}
      </Component>
    );
  }
);

Button.displayName = "Button";
