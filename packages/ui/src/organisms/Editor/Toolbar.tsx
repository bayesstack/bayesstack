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
  AlignLeftTool,
  AlignCenterTool,
  AlignRightTool,
  AlignJustifyTool,
  TableTool,
  LatexTool,
  UndoTool,
  RedoTool,
  ClearFormattingTool,
} from "./EditorTools";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { Button } from "../../atoms/Buttons/Button";
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
    align?: "left" | "center" | "right" | "justify";
  };
  onFormatChange?: (format: string, value?: any) => void;
  onOpenLinkModal?: () => void;
  onOpenLatexModal?: () => void;
  onInsertImage?: () => void;
  onInsertCodeBlock?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearFormatting?: () => void;
  onInsertTable?: () => void;
  onPublish?: () => void;
  
  disabled?: boolean;
  toolbarGroups?: string[];
  
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
  onUndo,
  onRedo,
  onClearFormatting,
  onInsertTable,
  onPublish,
  disabled = false,
  toolbarGroups = ["typography", "formatting", "lists", "alignment", "media", "history", "actions"],
  className = "",
  classNames,
  style,
  ...props
}: ToolbarProps) {
  const handleFormat = (format: string, value?: any) => {
    if (disabled || !onFormatChange) return;
    onFormatChange(format, value);
  };

  const showGroup = (group: string) => toolbarGroups.includes(group);

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
      {/* Typography Selector */}
      {showGroup("typography") && (
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
      )}

      {showGroup("typography") && showGroup("formatting") && <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />}

      {/* Inline Text Formatting Tools */}
      {showGroup("formatting") && (
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
      )}

      {showGroup("formatting") && showGroup("lists") && <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />}

      {/* Lists & Quotes */}
      {showGroup("lists") && (
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
      )}

      {showGroup("lists") && showGroup("alignment") && <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />}

      {/* Alignment */}
      {showGroup("alignment") && (
        <div className={["bs-editor-toolbar-group", classNames?.group].filter(Boolean).join(" ")}>
          <AlignLeftTool
            active={activeFormats.align === "left"}
            disabled={disabled}
            onClick={() => handleFormat("align", "left")}
          />
          <AlignCenterTool
            active={activeFormats.align === "center"}
            disabled={disabled}
            onClick={() => handleFormat("align", "center")}
          />
          <AlignRightTool
            active={activeFormats.align === "right"}
            disabled={disabled}
            onClick={() => handleFormat("align", "right")}
          />
          <AlignJustifyTool
            active={activeFormats.align === "justify"}
            disabled={disabled}
            onClick={() => handleFormat("align", "justify")}
          />
        </div>
      )}

      {showGroup("alignment") && showGroup("media") && <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />}

      {/* Rich Media, Links & Math */}
      {showGroup("media") && (
        <div className={["bs-editor-toolbar-group", classNames?.group].filter(Boolean).join(" ")}>
          <LinkTool disabled={disabled} onClick={onOpenLinkModal} />
          {onOpenLatexModal && <LatexTool disabled={disabled} onClick={onOpenLatexModal} />}
          {onInsertImage && <ImageTool disabled={disabled} onClick={onInsertImage} />}
          {onInsertTable && <TableTool disabled={disabled} onClick={onInsertTable} />}
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
      )}

      {showGroup("media") && showGroup("history") && <div className={["bs-editor-toolbar-divider", classNames?.divider].filter(Boolean).join(" ")} />}

      {/* History Controls */}
      {showGroup("history") && (
        <div className={["bs-editor-toolbar-group", classNames?.group].filter(Boolean).join(" ")}>
          {onUndo && <UndoTool disabled={disabled} onClick={onUndo} />}
          {onRedo && <RedoTool disabled={disabled} onClick={onRedo} />}
          {onClearFormatting && <ClearFormattingTool disabled={disabled} onClick={onClearFormatting} />}
        </div>
      )}

      {showGroup("history") && showGroup("actions") && onPublish && <div style={{ flex: 1 }} />}

      {/* Actions */}
      {showGroup("actions") && onPublish && (
        <div className={["bs-editor-toolbar-group", classNames?.group].filter(Boolean).join(" ")}>
          <Button 
            size="sm" 
            variant="primary" 
            onClick={onPublish}
            disabled={disabled}
            leftIcon="Send"
            className="bs-editor-publish-btn"
          >
            Publish
          </Button>
        </div>
      )}
    </div>
  );
}
