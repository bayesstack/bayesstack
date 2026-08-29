import React from "react";
import { Icon, IconName } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Editor.css";

export interface ToolButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}

export function ToolButton({
  icon,
  active = false,
  disabled = false,
  onClick,
  title,
}: ToolButtonProps & { icon: IconName }) {
  return (
    <IconButton
      name={icon}
      label={title || icon}
      size="xs"
      variant={active ? "primary" : "transparent"}
      disabled={disabled}
      onClick={onClick}
      className={["bs-editor-tool-btn", active ? "bs-editor-tool-btn--active" : ""].join(" ")}
    />
  );
}

export function BoldTool(props: ToolButtonProps) {
  return <ToolButton icon="TextBold" title="Bold (Ctrl+B)" {...props} />;
}

export function ItalicTool(props: ToolButtonProps) {
  return <ToolButton icon="TextItalic" title="Italic (Ctrl+I)" {...props} />;
}

export function UnderlineTool(props: ToolButtonProps) {
  return <ToolButton icon="TextUnderline" title="Underline (Ctrl+U)" {...props} />;
}

export function StrikeTool(props: ToolButtonProps) {
  return <ToolButton icon="TextStrikethrough" title="Strikethrough" {...props} />;
}

export function BlockquoteTool(props: ToolButtonProps) {
  return <ToolButton icon="Quote" title="Blockquote" {...props} />;
}

export function CodeTool(props: ToolButtonProps) {
  return <ToolButton icon="Code" title="Inline Code" {...props} />;
}

export function LinkTool(props: ToolButtonProps) {
  return <ToolButton icon="Link" title="Insert Link (Ctrl+K)" {...props} />;
}

export function ImageTool(props: ToolButtonProps) {
  return <ToolButton icon="Image" title="Insert Image" {...props} />;
}

export function BulletListTool(props: ToolButtonProps) {
  return <ToolButton icon="ListBullet" title="Bullet List" {...props} />;
}

export function OrderedListTool(props: ToolButtonProps) {
  return <ToolButton icon="ListNumber" title="Numbered List" {...props} />;
}

export function AlignLeftTool(props: ToolButtonProps) {
  return <ToolButton icon="AlignLeft" title="Align Left" {...props} />;
}

export function AlignCenterTool(props: ToolButtonProps) {
  return <ToolButton icon="AlignCenter" title="Align Center" {...props} />;
}

export function AlignRightTool(props: ToolButtonProps) {
  return <ToolButton icon="AlignRight" title="Align Right" {...props} />;
}

export function AlignJustifyTool(props: ToolButtonProps) {
  return <ToolButton icon="AlignJustify" title="Justify" {...props} />;
}

export function TableTool(props: ToolButtonProps) {
  return <ToolButton icon="Table" title="Insert Table" {...props} />;
}

export function LatexTool(props: ToolButtonProps) {
  return <ToolButton icon="FunctionOfX" title="Insert LaTeX Formula" {...props} />;
}

export function UndoTool(props: ToolButtonProps) {
  return <ToolButton icon="Undo" title="Undo (Ctrl+Z)" {...props} />;
}

export function RedoTool(props: ToolButtonProps) {
  return <ToolButton icon="Redo" title="Redo (Ctrl+Y)" {...props} />;
}

export function ClearFormattingTool(props: ToolButtonProps) {
  return <ToolButton icon="Eraser" title="Clear Formatting" {...props} />;
}
