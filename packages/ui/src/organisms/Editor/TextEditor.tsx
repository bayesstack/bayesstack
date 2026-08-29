import React, { useState, useRef, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Toolbar } from "./Toolbar";
import { BubbleMenu } from "./BubbleMenu";
import { LinkModal } from "./LinkModal";
import { LatexModal } from "./LatexModal";
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

  /**
   * Enables embedded LaTeX equation parsing ($...$, $$...$$) via KaTeX
   * @default true
   */
  enableLatex?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: TextEditorClassNames;
}

export interface TextEditorClassNames {
  root?: string;
  main?: string;
  stage?: string;
  content?: string;
  sidebar?: string;
}

/**
 * Helper to process LaTeX math delimiters in HTML strings for editor view
 */
function processEditorLatex(input: string): string {
  if (!input) return "";

  const pattern = /(?:\$\$\s*([\s\S]+?)\s*\$\$|\\\[\s*([\s\S]+?)\s*\\\])|(?:\$(?!\$)\s*([^\$\n]+?)\s*\$|\\\(\s*([\s\S]+?)\s*\\\))/g;

  return input.replace(pattern, (match, block1, block2, inline1, inline2) => {
    const blockMath = block1 ?? block2;
    const inlineMath = inline1 ?? inline2;
    const isBlock = blockMath !== undefined;
    const mathContent = blockMath ?? inlineMath;

    try {
      const renderedHtml = katex.renderToString(mathContent, {
        displayMode: isBlock,
        throwOnError: true,
        output: "htmlAndMathml",
      });

      if (isBlock) {
        return `<div class="bs-latex-block">${renderedHtml}</div>`;
      }
      return `<span class="bs-latex-inline">${renderedHtml}</span>`;
    } catch (err) {
      return `<code class="bs-latex-error" title="LaTeX Syntax Error: ${(err as Error)?.message}">${mathContent}</code>`;
    }
  });
}

export function TextEditor({
  value = "<p>Welcome to <strong>BayesStack Text Editor</strong>. Select text to see the floating format bubble menu or use the top toolbar.</p>",
  placeholder = "Start typing document content...",
  onChange,
  showOutline = false,
  readOnly = false,
  enableLatex = true,
  className = "",
  classNames,
  style,
  ...props
}: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [latexModalOpen, setLatexModalOpen] = useState(false);

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

  // Processed HTML content with KaTeX math if enabled
  const renderedContent = useMemo(() => {
    return enableLatex ? processEditorLatex(value) : value;
  }, [value, enableLatex]);

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
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Insert LaTeX Formula
  const handleInsertFormula = (formula: string, displayBlock: boolean) => {
    const formulaStr = displayBlock ? `$$ ${formula} $$` : `$ ${formula} $`;
    const formattedHtml = processEditorLatex(formulaStr);

    document.execCommand("insertHTML", false, formattedHtml);
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
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
      className={[
        "bs-text-editor",
        readOnly ? "bs-text-editor--readonly" : "",
        className,
        classNames?.root,
      ]
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
          onOpenLatexModal={() => setLatexModalOpen(true)}
        />
      )}

      <div className={["bs-text-editor-main", classNames?.main].filter(Boolean).join(" ")}>
        {/* Document Editor Stage */}
        <div className={["bs-text-editor-stage", classNames?.stage].filter(Boolean).join(" ")}>
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
            className={["bs-text-editor-content", classNames?.content].filter(Boolean).join(" ")}
            onMouseUp={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
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
          <div className={["bs-text-editor-sidebar", classNames?.sidebar].filter(Boolean).join(" ")}>
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

      {/* LaTeX Formula Modal */}
      <LatexModal
        open={latexModalOpen}
        onClose={() => setLatexModalOpen(false)}
        onInsertFormula={handleInsertFormula}
      />
    </div>
  );
}
