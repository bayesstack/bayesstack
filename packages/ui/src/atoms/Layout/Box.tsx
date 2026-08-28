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

export interface BoxSlots {
  root?: string;
}

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Underlying HTML element tag to render as
   * @default 'div'
   */
  as?: BoxAs;

  /**
   * Custom root element class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: BoxSlots;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ as: Component = "div", className = "", classNames, style, children, ...props }, ref) => {
    return (
      <Component
        // Type assertion is required because React's polymorphic forwardRef cannot 
        // statically infer the underlying HTML element type when Component is dynamic.
        ref={ref as any}
        className={["bs-box", className, classNames?.root].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = "Box";
