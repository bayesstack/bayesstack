import React, { useState, useRef } from "react";
import { Toolbar } from "./Toolbar";
import { BubbleMenu } from "./BubbleMenu";
import { LinkModal } from "./LinkModal";
import { CodeBlockComponent } from "./CodeBlockComponent";
import { SchemaNav, type SchemaNavHeading } from "./SchemaNav";
import "./Editor.css";

export interface TextEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * HTML or markdown string value
   */
  value?: string;

  /**
   * Placeholder text when empty
   * @default 'Start typing document content...'
   */
  placeholder?: string;

  /**
   * Content change callback
   */
  onChange?: (html: string) => void;

  /**
   * Displays document Table of Contents outline panel (SchemaNav)
   * @default false
   */
  showOutline?: boolean;

  /**
   * Read-only mode
   * @default false
   */
  readOnly?: boolean;
}

export function TextEditor({
  value = "<p>Welcome to <strong>BayesStack Text Editor</strong>. Select text to see the floating format bubble menu or use the top toolbar.</p>",
  placeholder = "Start typing document content...",
  onChange,
  showOutline = false,
  readOnly = false,
  className = "",
  style,
  ...props
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Link modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  // Bubble menu state
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubblePos, setBubblePos] = useState({ top: 0, left: 0 });

  // Formatting state
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    blockquote: false,
    code: false,
    heading: "p" as "p" | "h1" | "h2" | "h3",
  });

  // Example Code Block state inside document
  const [demoCode, setDemoCode] = useState(
    '// BayesStack MLOps Telemetry Pipeline\nexport function recordEvent(event: string) {\n  console.log("Telemetry event logged:", event);\n}'
  );

  // Handle format action execution
  const handleFormatChange = (format: string, val?: any) => {
    if (readOnly) return;
    document.execCommand(format, false, val);

    // Update active format state toggle
    if (format === "bold") setActiveFormats((p) => ({ ...p, bold: !p.bold }));
    if (format === "italic") setActiveFormats((p) => ({ ...p, italic: !p.italic }));
    if (format === "underline") setActiveFormats((p) => ({ ...p, underline: !p.underline }));
    if (format === "heading" && val) {
      document.execCommand("formatBlock", false, `<${val}>`);
      setActiveFormats((p) => ({ ...p, heading: val }));
    }

    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle text selection for floating BubbleMenu
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) {
      setBubbleVisible(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();

    if (
      rect.top >= editorRect.top &&
      rect.bottom <= editorRect.bottom
    ) {
      setBubblePos({
        top: rect.top - editorRect.top - 42,
        left: rect.left - editorRect.left + rect.width / 2 - 80,
      });
      setBubbleVisible(true);
    } else {
      setBubbleVisible(false);
    }
  };

  // Insert Hyperlink
  const handleInsertLink = (url: string, text?: string, openInNewTab?: boolean) => {
    if (text) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url}" target="${openInNewTab ? "_blank" : "_self"}" rel="noopener noreferrer">${text}</a>`
      );
    } else {
      document.execCommand("createLink", false, url);
    }
  };

  // Document Outline Headings for SchemaNav
  const sampleHeadings: SchemaNavHeading[] = [
    { id: "h1-intro", text: "Introduction & Scope", level: 1 },
    { id: "h2-pipeline", text: "Telemetry Streaming Architecture", level: 2 },
    { id: "h3-metrics", text: "Real-time Metrics Protocol", level: 3 },
  ];

  return (
    <div
      className={["bs-text-editor", readOnly ? "bs-text-editor--readonly" : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...props}
    >
      {/* Formatting Toolbar */}
      {!readOnly && (
        <Toolbar
          activeFormats={activeFormats}
          onFormatChange={handleFormatChange}
          onOpenLinkModal={() => setLinkModalOpen(true)}
        />
      )}

      <div className="bs-text-editor-main">
        {/* Document Editor Stage */}
        <div className="bs-text-editor-stage">
          {/* Floating Bubble Selection Menu */}
          {!readOnly && (
            <BubbleMenu
              visible={bubbleVisible}
              position={bubblePos}
              onFormat={handleFormatChange}
              onOpenLinkModal={() => setLinkModalOpen(true)}
              activeFormats={activeFormats}
            />
          )}

          {/* Editable Document Area */}
          <div
            ref={editorRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            className="bs-text-editor-content"
            onMouseUp={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            dangerouslySetInnerHTML={{ __html: value }}
          />

          {/* Code Block Component */}
          <div style={{ marginTop: 20 }}>
            <CodeBlockComponent
              code={demoCode}
              language="typescript"
              onChange={(newCode) => setDemoCode(newCode)}
              editable={!readOnly}
            />
          </div>
        </div>

        {/* Outline SchemaNav Sidebar */}
        {showOutline && (
          <div className="bs-text-editor-sidebar">
            <SchemaNav
              headings={sampleHeadings}
              onHeadingClick={(id) => {
                console.log("Scroll to heading:", id);
              }}
            />
          </div>
        )}
      </div>

      {/* Link Insertion Modal */}
      <LinkModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onInsertLink={handleInsertLink}
      />
    </div>
  );
}
