import React from "react";
import "./Layout.css";

export type StackGap = "xs" | "sm" | "md" | "lg" | "xl" | number | string;
export type StackAs =
  | "div"
  | "section"
  | "article"
  | "main"
  | "header"
  | "footer"
  | "nav"
  | "form";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Flex direction
   * @default 'column'
   */
  direction?: "row" | "column";

  /**
   * Gap spacing scale or custom pixel/string value
   * @default 'md'
   */
  gap?: StackGap;

  /**
   * Align items flex property
   */
  align?: React.CSSProperties["alignItems"];

  /**
   * Justify content flex property
   */
  justify?: React.CSSProperties["justifyContent"];

  /**
   * Flex wrap property
   * @default false
   */
  wrap?: boolean;

  /**
   * Separator component element automatically inserted between stack items
   */
  divider?: React.ReactNode;

  /**
   * Polymorphic element tag
   * @default 'div'
   */
  as?: StackAs;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "column",
      gap = "md",
      align,
      justify,
      wrap = false,
      divider,
      as: Component = "div",
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const isNamedGap = typeof gap === "string" && ["xs", "sm", "md", "lg", "xl"].includes(gap);
    const customGap = isNamedGap ? undefined : typeof gap === "number" ? `${gap}px` : gap;

    const validChildren = React.Children.toArray(children).filter(Boolean);

    let content = children;
    if (divider && validChildren.length > 1) {
      content = validChildren.reduce<React.ReactNode[]>((acc, child, index) => {
        acc.push(child);
        if (index < validChildren.length - 1) {
          acc.push(
            React.cloneElement(divider as React.ReactElement, {
              key: `stack-divider-${index}`,
            })
          );
        }
        return acc;
      }, []);
    }

    return (
      <Component
        ref={ref as any}
        className={[
          "bs-stack",
          `bs-stack--${direction}`,
          isNamedGap && `bs-stack--gap-${gap}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : undefined,
          gap: customGap,
          ...style,
        }}
        {...(props as any)}
      >
        {content}
      </Component>
    );
  }
);

Stack.displayName = "Stack";
