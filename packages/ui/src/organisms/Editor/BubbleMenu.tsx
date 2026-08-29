import React from "react";
import { BoldTool, ItalicTool, UnderlineTool, StrikeTool, LinkTool, CodeTool } from "./EditorTools";
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
  onFormat?: (format: string, value?: any) => void;

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
    strike?: boolean;
    code?: boolean;
    heading?: string;
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

/**
 * BubbleMenu displays a floating contextual toolbar above active text selection ranges.
 * Offers inline formatting (bold, italic, strike, code), heading quick-switches, color highlights, and link triggers.
 */
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
  // Early return prevents rendering offscreen floating DOM nodes when no selection is active
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
      {/* Heading quick-toggle dropdown */}
      <select
        className="bs-editor-bubble-heading-select"
        value={activeFormats.heading || "p"}
        onChange={(e) => onFormat && onFormat("heading", e.target.value)}
      >
        <option value="p">Aa</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
      </select>
      
      <div className="bs-editor-bubble-divider" />

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
      <StrikeTool
        active={activeFormats.strike}
        onClick={() => onFormat && onFormat("strike")}
      />
      <CodeTool
        active={activeFormats.code}
        onClick={() => onFormat && onFormat("code")}
      />
      
      <div className="bs-editor-bubble-divider" />

      {/* Preset text highlight palette for fast inline accent coloring without opening a heavy color picker */}
      <div className="bs-editor-bubble-colors">
        <button className="bs-bubble-color-btn" style={{ backgroundColor: "#EF4444" }} onClick={() => onFormat && onFormat("foreColor", "#EF4444")} />
        <button className="bs-bubble-color-btn" style={{ backgroundColor: "#3B82F6" }} onClick={() => onFormat && onFormat("foreColor", "#3B82F6")} />
        <button className="bs-bubble-color-btn" style={{ backgroundColor: "#10B981" }} onClick={() => onFormat && onFormat("foreColor", "#10B981")} />
        <button className="bs-bubble-color-btn" style={{ backgroundColor: "#123333" }} onClick={() => onFormat && onFormat("foreColor", "#123333")} />
      </div>

      {onOpenLinkModal && (
        <>
          <div className="bs-editor-bubble-divider" />
          <LinkTool onClick={onOpenLinkModal} />
        </>
      )}
    </div>
  );
}
