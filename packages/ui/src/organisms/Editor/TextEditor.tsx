import React, { useState, useRef, useMemo, useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Toolbar } from "./Toolbar";
import { BubbleMenu } from "./BubbleMenu";
import { LinkModal } from "./LinkModal";
import { LatexModal } from "./LatexModal";
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
   * Optional callback fired when the publish action is triggered
   */
  onPublish?: (html: string) => void;

  /**
   * Displays document Table of Contents outline panel (SchemaNav)
   * @default false
   */
  showOutline?: boolean;
  
  /**
   * Shows a subtle footer bar with word and character count
   * @default false
   */
  showWordCount?: boolean;

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
   * Controls which toolbar groups are visible
   * @default ["typography", "formatting", "lists", "alignment", "media", "history", "actions"]
   */
  toolbarGroups?: string[];

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
  footer?: string;
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
  onPublish,
  showOutline = false,
  showWordCount = false,
  readOnly = false,
  enableLatex = true,
  toolbarGroups,
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

  // Word count state
  const [words, setWords] = useState(0);
  const [chars, setChars] = useState(0);

  // Formatting state
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    blockquote: false,
    code: false,
    heading: "p" as "p" | "h1" | "h2" | "h3",
    align: "left" as "left" | "center" | "right" | "justify"
  });

  // Processed HTML content with KaTeX math if enabled
  const renderedContent = useMemo(() => {
    return enableLatex ? processEditorLatex(value) : value;
  }, [value, enableLatex]);

  // Update counts on mount or value change
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setChars(text.length);
      setWords(text.trim() ? text.trim().split(/\\s+/).length : 0);
    }
  }, [value, renderedContent]);

  const emitChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText || "";
      setChars(text.length);
      setWords(text.trim() ? text.trim().split(/\\s+/).length : 0);
      if (onChange) onChange(html);
    }
  };

  // Handle format action execution
  const handleFormatChange = (format: string, val?: any) => {
    if (readOnly) return;
    
    if (format === "align") {
      if (val === "left") document.execCommand("justifyLeft", false);
      if (val === "center") document.execCommand("justifyCenter", false);
      if (val === "right") document.execCommand("justifyRight", false);
      if (val === "justify") document.execCommand("justifyFull", false);
      setActiveFormats((p) => ({ ...p, align: val }));
    } else {
      document.execCommand(format, false, val);
    }

    // Update active format state toggle
    if (format === "bold") setActiveFormats((p) => ({ ...p, bold: !p.bold }));
    if (format === "italic") setActiveFormats((p) => ({ ...p, italic: !p.italic }));
    if (format === "underline") setActiveFormats((p) => ({ ...p, underline: !p.underline }));
    if (format === "strike") setActiveFormats((p) => ({ ...p, strike: !p.strike }));
    if (format === "heading" && val) {
      document.execCommand("formatBlock", false, `<${val}>`);
      setActiveFormats((p) => ({ ...p, heading: val }));
    }

    emitChange();
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
      rect.bottom <= editorRect.bottom &&
      editorRef.current.contains(range.commonAncestorContainer)
    ) {
      setBubblePos({
        top: rect.top - editorRect.top - 42,
        left: rect.left - editorRect.left + rect.width / 2 - 120, // wider menu
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
    emitChange();
  };

  // Insert LaTeX Formula
  const handleInsertFormula = (formula: string, displayBlock: boolean) => {
    const formulaStr = displayBlock ? `$$ ${formula} $$` : `$ ${formula} $`;
    const formattedHtml = processEditorLatex(formulaStr);

    document.execCommand("insertHTML", false, formattedHtml);
    emitChange();
  };

  // Insert basic table
  const handleInsertTable = () => {
    const tableHTML = `
      <table class="bs-editor-table" border="1" cellpadding="8" cellspacing="0">
        <tbody>
          <tr><td>Header 1</td><td>Header 2</td></tr>
          <tr><td>Cell</td><td>Cell</td></tr>
        </tbody>
      </table><p><br></p>
    `;
    document.execCommand("insertHTML", false, tableHTML);
    emitChange();
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
          toolbarGroups={toolbarGroups}
          onFormatChange={handleFormatChange}
          onOpenLinkModal={() => setLinkModalOpen(true)}
          onOpenLatexModal={() => setLatexModalOpen(true)}
          onInsertTable={handleInsertTable}
          onUndo={() => { document.execCommand("undo"); emitChange(); }}
          onRedo={() => { document.execCommand("redo"); emitChange(); }}
          onClearFormatting={() => { document.execCommand("removeFormat"); emitChange(); }}
          onPublish={onPublish ? () => onPublish(editorRef.current?.innerHTML || "") : undefined}
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
            onInput={emitChange}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
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

      {/* Editor Footer Bar */}
      {(showWordCount || onPublish) && (
        <div className={["bs-editor-footer-bar", classNames?.footer].filter(Boolean).join(" ")}>
          {showWordCount && (
            <div className="bs-editor-word-count">
              {words} {words === 1 ? "word" : "words"} · {chars} {chars === 1 ? "character" : "characters"}
            </div>
          )}
          {onPublish && !showWordCount && <div />}
          <div className="bs-editor-status">
            {readOnly ? "Viewing" : "Editing"}
          </div>
        </div>
      )}

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
