import React from "react";
import { BoldTool, ItalicTool, UnderlineTool, LinkTool, CodeTool } from "./EditorTools";
import "./Editor.css";

export interface BubbleMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visible state of the floating bubble menu
   */
  visible: boolean;

  /**
   * Floating coordinates { top, left }
   */
  position?: { top: number; left: number };

  /**
   * Format action trigger
   */
  onFormat?: (format: string) => void;

  /**
   * Open link modal trigger
   */
  onOpenLinkModal?: () => void;

  /**
   * Active formatting state
   */
  activeFormats?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    code?: boolean;
  };

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: BubbleMenuClassNames;
}

export interface BubbleMenuClassNames {
  root?: string;
}

export function BubbleMenu({
  visible,
  position = { top: 0, left: 0 },
  onFormat,
  onOpenLinkModal,
  activeFormats = {},
  className = "",
  classNames,
  style,
  ...props
}: BubbleMenuProps) {
  if (!visible) return null;

  return (
    <div
      className={["bs-editor-bubble-menu", className, classNames?.root].filter(Boolean).join(" ")}
      style={{
        top: position.top,
        left: position.left,
        ...style,
      }}
      {...props}
    >
      <BoldTool
        active={activeFormats.bold}
        onClick={() => onFormat && onFormat("bold")}
      />
      <ItalicTool
        active={activeFormats.italic}
        onClick={() => onFormat && onFormat("italic")}
      />
      <UnderlineTool
        active={activeFormats.underline}
        onClick={() => onFormat && onFormat("underline")}
      />
      <CodeTool
        active={activeFormats.code}
        onClick={() => onFormat && onFormat("code")}
      />
      {onOpenLinkModal && <LinkTool onClick={onOpenLinkModal} />}
    </div>
  );
}
