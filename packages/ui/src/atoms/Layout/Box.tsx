import React from "react";
import "./Layout.css";

export type BoxAs =
  | "div"
  | "span"
  | "section"
  | "article"
  | "main"
  | "header"
  | "footer"
  | "aside"
  | "nav";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Underlying HTML element tag to render as
   * @default 'div'
   */
  as?: BoxAs;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ as: Component = "div", className = "", style, children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={["bs-box", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = "Box";
