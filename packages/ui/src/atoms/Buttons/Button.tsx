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
   * Custom inline style object
   */
  style?: React.CSSProperties;

  /**
   * Additional CSS class name
   */
  className?: string;
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
      style,
      ...props
    },
    ref
  ) => {
    const isButtonTag = Component === "button";
    const isDisabled = disabled || loading;

    const renderIcon = (icon?: IconName | ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        const iconSize = size === "xs" ? 12 : size === "sm" ? 14 : size === "lg" ? 18 : 16;
        return <Icon name={icon as IconName} size={iconSize} />;
      }
      return icon;
    };

    const classNames = [
      "bs-button",
      `bs-button--variant-${variant}`,
      `bs-button--size-${size}`,
      fullWidth && "bs-button--full-width",
      rounded && "bs-button--rounded-full",
      loading && "bs-button--loading",
      isDisabled && "bs-button--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Component
        ref={ref as any}
        className={classNames}
        style={style}
        type={isButtonTag ? type : undefined}
        disabled={isButtonTag ? isDisabled : undefined}
        aria-disabled={isDisabled ? true : undefined}
        {...(props as any)}
      >
        {loading ? (
          <>
            <span className="bs-button__spinner" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="bs-button__icon bs-button__icon--left">{renderIcon(leftIcon)}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="bs-button__icon bs-button__icon--right">{renderIcon(rightIcon)}</span>}
          </>
        )}
      </Component>
    );
  }
);

Button.displayName = "Button";
