import React from "react";
import {
  BoldTool,
  ItalicTool,
  UnderlineTool,
  StrikeTool,
  BlockquoteTool,
  CodeTool,
  LinkTool,
  ImageTool,
  BulletListTool,
  OrderedListTool,
  LatexTool,
} from "./EditorTools";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Editor.css";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeFormats?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    blockquote?: boolean;
    code?: boolean;
    bulletList?: boolean;
    orderedList?: boolean;
    heading?: "h1" | "h2" | "h3" | "p";
  };
  onFormatChange?: (format: string, value?: any) => void;
  onOpenLinkModal?: () => void;
  onOpenLatexModal?: () => void;
  onInsertImage?: () => void;
  onInsertCodeBlock?: () => void;
  disabled?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: ToolbarClassNames;
}

export interface ToolbarClassNames {
  root?: string;
  select?: string;
  group?: string;
  divider?: string;
}

export function Toolbar({
  activeFormats = {},
  onFormatChange,
  onOpenLinkModal,
  onOpenLatexModal,
  onInsertImage,
  onInsertCodeBlock,
  disabled = false,
  className = "",
  classNames,
  style,
  ...props
}: ToolbarProps) {
  const handleFormat = (format: string, value?: any) => {
    if (disabled || !onFormatChange) return;
    onFormatChange(format, value);
  };

  return (
    <div
      className={[
        "bs-editor-toolbar",
        disabled ? "bs-editor-toolbar--disabled" : "",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {/* Heading Selector */}
      <select
        className={["bs-editor-heading-select", classNames?.select].filter(Boolean).join(" ")}
        value={activeFormats.heading || "p"}
        onChange={(e) => handleFormat("heading", e.target.value)}
        disabled={disabled}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />

      {/* Inline Text Formatting Tools */}
      <div className={["bs-editor-toolbar-group", classNames?.group].filter(Boolean).join(" ")}>
        <BoldTool
          active={activeFormats.bold}
          disabled={disabled}
          onClick={() => handleFormat("bold")}
        />
        <ItalicTool
          active={activeFormats.italic}
          disabled={disabled}
          onClick={() => handleFormat("italic")}
        />
        <UnderlineTool
          active={activeFormats.underline}
          disabled={disabled}
          onClick={() => handleFormat("underline")}
        />
        <StrikeTool
          active={activeFormats.strike}
          disabled={disabled}
          onClick={() => handleFormat("strike")}
        />
        <CodeTool
          active={activeFormats.code}
          disabled={disabled}
          onClick={() => handleFormat("code")}
        />
      </div>

      <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />

      {/* Lists & Quotes */}
      <div className={["bs-editor-toolbar-group", classNames?.group].filter(Boolean).join(" ")}>
        <BulletListTool
          active={activeFormats.bulletList}
          disabled={disabled}
          onClick={() => handleFormat("bulletList")}
        />
        <OrderedListTool
          active={activeFormats.orderedList}
          disabled={disabled}
          onClick={() => handleFormat("orderedList")}
        />
        <BlockquoteTool
          active={activeFormats.blockquote}
          disabled={disabled}
          onClick={() => handleFormat("blockquote")}
        />
      </div>

      <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />

      {/* Media, Links & Math Formulas */}
      <div className={["bs-editor-toolbar-group", classNames?.group].filter(Boolean).join(" ")}>
        <LinkTool disabled={disabled} onClick={onOpenLinkModal} />
        {onOpenLatexModal && <LatexTool disabled={disabled} onClick={onOpenLatexModal} />}
        {onInsertImage && <ImageTool disabled={disabled} onClick={onInsertImage} />}
        {onInsertCodeBlock && (
          <IconButton
            name="Code"
            label="Code Block"
            size="xs"
            variant="transparent"
            disabled={disabled}
            onClick={onInsertCodeBlock}
          />
        )}
      </div>
    </div>
  );
}
