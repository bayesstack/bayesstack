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
  onInsertImage?: () => void;
  onInsertCodeBlock?: () => void;
  disabled?: boolean;
}

export function Toolbar({
  activeFormats = {},
  onFormatChange,
  onOpenLinkModal,
  onInsertImage,
  onInsertCodeBlock,
  disabled = false,
  className = "",
  style,
  ...props
}: ToolbarProps) {
  const handleFormat = (format: string, value?: any) => {
    if (disabled || !onFormatChange) return;
    onFormatChange(format, value);
  };

  return (
    <div
      className={["bs-editor-toolbar", disabled ? "bs-editor-toolbar--disabled" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {/* Heading Selector */}
      <select
        className="bs-editor-heading-select"
        value={activeFormats.heading || "p"}
        onChange={(e) => handleFormat("heading", e.target.value)}
        disabled={disabled}
      >
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <div className="bs-editor-toolbar-divider" />

      {/* Inline Text Formatting Tools */}
      <div className="bs-editor-toolbar-group">
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

      <div className="bs-editor-toolbar-divider" />

      {/* Lists & Quotes */}
      <div className="bs-editor-toolbar-group">
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

      <div className="bs-editor-toolbar-divider" />

      {/* Media & Links */}
      <div className="bs-editor-toolbar-group">
        <LinkTool disabled={disabled} onClick={onOpenLinkModal} />
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
