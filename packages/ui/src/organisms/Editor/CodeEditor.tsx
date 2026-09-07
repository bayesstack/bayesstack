import React, { useState, useRef, useMemo, useCallback } from "react";
import CodeMirror, { type ReactCodeMirrorRef, type ViewUpdate } from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { vim } from "@replit/codemirror-vim";
import { emacs } from "@replit/codemirror-emacs";
import { Icon } from "../../atoms/Icons/Icon";
import { highlightLine } from "../../atoms/Display/syntaxHighlighter";
import "./Editor.css";

export interface CodeEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Controlled code content value
   */
  value?: string;

  /**
   * Default initial code value
   */
  defaultValue?: string;

  /**
   * Code content change callback
   */
  onChange?: (code: string) => void;

  /**
   * Programming language mode
   * @default 'typescript'
   */
  language?: string;

  /**
   * Enable automatic syntax highlighting overlay (used in simple engine)
   * @default true
   */
  syntaxHighlight?: boolean;

  /**
   * Language change event callback
   */
  onLanguageChange?: (language: string) => void;

  /**
   * IDE theme mode variant
   * @default 'dark'
   */
  variant?: "dark" | "light" | "minimal";

  /**
   * Read-only mode
   * @default false
   */
  readOnly?: boolean;

  /**
   * Show line number gutter
   * @default true
   */
  showLineNumbers?: boolean;

  /**
   * Show header language dropdown selector
   * @default true
   */
  showLanguageSelect?: boolean;

  /**
   * Show header copy button
   * @default true
   */
  showCopy?: boolean;

  /**
   * Show bottom status bar telemetry (Ln, Col, Char count)
   * @default true
   */
  showStatusFooter?: boolean;

  /**
   * Custom status node displayed in footer telemetry (e.g. live dirty state indicator)
   */
  footerStatus?: React.ReactNode;

  /**
   * Indentation spaces count
   * @default 2
   */
  tabSize?: number;

  /**
   * Editor font size (number in px or CSS string)
   * @default '13.5px'
   */
  fontSize?: number | string;

  /**
   * Underlying editor engine: 'codemirror' (modern CodeMirror 6 with tree-sitter & autocomplete) or 'simple' (lightweight textarea)
   * @default 'codemirror'
   */
  engine?: "codemirror" | "simple";

  /**
   * Keybinding mode switcher: 'standard' (VS Code default), 'vim', or 'emacs'
   * @default 'standard'
   */
  keymap?: "standard" | "vim" | "emacs";

  /**
   * Custom selectable languages list
   */
  languages?: { value: string; label: string }[];

  /**
   * Custom header left element
   */
  headerLeft?: React.ReactNode;

  /**
   * Custom header right element
   */
  headerRight?: React.ReactNode;

  /**
   * Minimum editor height (px number or CSS string)
   * @default '240px'
   */
  minHeight?: number | string;

  /**
   * Maximum editor height
   */
  maxHeight?: number | string;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for targeted overrides
   */
  classNames?: CodeEditorClassNames;
}

export interface CodeEditorClassNames {
  root?: string;
  header?: string;
  langSelect?: string;
  copyBtn?: string;
  stage?: string;
  gutter?: string;
  content?: string;
  highlight?: string;
  textarea?: string;
  footer?: string;
}

const SUPPORTED_LANGUAGES = [
  { value: "python", label: "Python 3" },
  { value: "cpp", label: "C++ 17" },
  { value: "java", label: "Java 21" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "bash", label: "Bash" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
];

function getLanguageExtension(lang?: string) {
  const l = (lang || "").toLowerCase().trim();
  switch (l) {
    case "python":
    case "py":
    case "python3":
      return [python()];
    case "javascript":
    case "js":
      return [javascript({ jsx: true })];
    case "typescript":
    case "ts":
    case "tsx":
      return [javascript({ jsx: true, typescript: true })];
    case "cpp":
    case "c++":
    case "c":
      return [cpp()];
    case "java":
      return [java()];
    case "sql":
      return [sql()];
    case "json":
      return [json()];
    default:
      return [];
  }
}

export function CodeEditor({
  value: controlledValue,
  defaultValue = "",
  onChange,
  language: controlledLang = "typescript",
  syntaxHighlight = true,
  onLanguageChange,
  variant = "dark",
  readOnly = false,
  showLineNumbers = true,
  showLanguageSelect = true,
  showCopy = true,
  showStatusFooter = true,
  footerStatus,
  tabSize = 2,
  fontSize = "13.5px",
  engine = "codemirror",
  keymap = "standard",
  languages,
  headerLeft,
  headerRight,
  minHeight = "240px",
  maxHeight,
  className = "",
  classNames,
  style,
  ...props
}: CodeEditorProps) {
  const [internalCode, setInternalCode] = useState(defaultValue);
  const [internalLang, setInternalLang] = useState(controlledLang);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [selectedChars, setSelectedChars] = useState(0);

  // References for textarea / simple engine
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const cmRef = useRef<ReactCodeMirrorRef>(null);

  const isControlled = controlledValue !== undefined;
  const code = isControlled ? controlledValue : internalCode;
  const currentLang = controlledLang || internalLang;

  // CodeMirror Extensions configuration
  const extensions = useMemo(() => {
    const langExts = getLanguageExtension(currentLang);
    const keymapExts = [];
    if (keymap === "vim") {
      keymapExts.push(vim());
    } else if (keymap === "emacs") {
      keymapExts.push(emacs());
    }
    return [...langExts, ...keymapExts];
  }, [currentLang, keymap]);

  // CodeMirror Change Handler
  const handleCmChange = useCallback(
    (val: string) => {
      if (!isControlled) {
        setInternalCode(val);
      }
      if (onChange) {
        onChange(val);
      }
    },
    [isControlled, onChange]
  );

  // CodeMirror Cursor Telemetry Handler
  const handleCmUpdate = useCallback((viewUpdate: ViewUpdate) => {
    if (viewUpdate.selectionSet || viewUpdate.docChanged) {
      const state = viewUpdate.state;
      const head = state.selection.main.head;
      const line = state.doc.lineAt(head);
      setCursorPos({ line: line.number, col: head - line.from + 1 });
      setSelectedChars(state.selection.main.to - state.selection.main.from);
    }
  }, []);

  // Simple Engine Change & Key Handlers (for fallback / test compatibility)
  const handleSimpleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalCode(val);
    }
    if (onChange) {
      onChange(val);
    }
    updateSimpleCursorTelemetry(e.target);
  };

  const updateSimpleCursorTelemetry = (el: HTMLTextAreaElement) => {
    const textBefore = el.value.substring(0, el.selectionStart);
    const linesBefore = textBefore.split("\n");
    const line = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length + 1;
    setCursorPos({ line, col });
    setSelectedChars(el.selectionEnd - el.selectionStart);
  };

  const handleSimpleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = target.scrollTop;
      preRef.current.scrollLeft = target.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = target.scrollTop;
    }
  };

  const handleSimpleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const isSelected = start !== end;

    // 1. Tab
    if (e.key === "Tab") {
      e.preventDefault();
      const spaces = " ".repeat(tabSize);
      const nextCode = code.substring(0, start) + spaces + code.substring(end);
      if (!isControlled) setInternalCode(nextCode);
      if (onChange) onChange(nextCode);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + tabSize;
      }, 0);
      return;
    }

    // 2. Smart Enter
    if (e.key === "Enter") {
      const textBefore = code.substring(0, start);
      const textAfter = code.substring(end);
      const linesBefore = textBefore.split("\n");
      const currentLine = linesBefore[linesBefore.length - 1];
      const leadingSpaceMatch = currentLine.match(/^\s*/);
      let indent = leadingSpaceMatch ? leadingSpaceMatch[0] : "";
      const prevChar = textBefore.slice(-1);
      const nextChar = textAfter.slice(0, 1);
      const isBracketOpen = prevChar === "{" || prevChar === "[" || prevChar === "(";
      const isBracketCloseMatch =
        (prevChar === "{" && nextChar === "}") ||
        (prevChar === "[" && nextChar === "]") ||
        (prevChar === "(" && nextChar === ")");

      if (isBracketOpen) indent += " ".repeat(tabSize);
      e.preventDefault();
      let insertion = "\n" + indent;
      const newCursorPos = start + insertion.length;

      if (isBracketCloseMatch) {
        const originalIndent = leadingSpaceMatch ? leadingSpaceMatch[0] : "";
        insertion += "\n" + originalIndent;
      }

      const nextCode = textBefore + insertion + textAfter;
      if (!isControlled) setInternalCode(nextCode);
      if (onChange) onChange(nextCode);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = newCursorPos;
        updateSimpleCursorTelemetry(el);
      }, 0);
      return;
    }

    // 3. Auto-closing brackets
    const bracketPairs: Record<string, string> = {
      "{": "}",
      "[": "]",
      "(": ")",
      '"': '"',
      "'": "'",
      "`": "`",
    };

    if (bracketPairs[e.key]) {
      e.preventDefault();
      const open = e.key;
      const close = bracketPairs[e.key];
      const nextCode = isSelected
        ? code.substring(0, start) + open + code.substring(start, end) + close + code.substring(end)
        : code.substring(0, start) + open + close + code.substring(end);
      if (!isControlled) setInternalCode(nextCode);
      if (onChange) onChange(nextCode);
      setTimeout(() => {
        el.selectionStart = isSelected ? start + 1 : start + 1;
        el.selectionEnd = isSelected ? end + 1 : start + 1;
        updateSimpleCursorTelemetry(el);
      }, 0);
      return;
    }

    // 4. Skip closing bracket
    const closingBrackets = ["}", "]", ")", '"', "'", "`"];
    if (closingBrackets.includes(e.key) && !isSelected && code.substring(start, start + 1) === e.key) {
      e.preventDefault();
      el.selectionStart = el.selectionEnd = start + 1;
      updateSimpleCursorTelemetry(el);
      return;
    }

    // 5. Smart Backspace
    if (e.key === "Backspace" && !isSelected && start > 0) {
      const prevChar = code.slice(start - 1, start);
      const nextChar = code.slice(start, start + 1);
      const isBracketPair =
        (prevChar === "{" && nextChar === "}") ||
        (prevChar === "[" && nextChar === "]") ||
        (prevChar === "(" && nextChar === ")") ||
        (prevChar === '"' && nextChar === '"') ||
        (prevChar === "'" && nextChar === "'") ||
        (prevChar === "`" && nextChar === "`");

      if (isBracketPair) {
        e.preventDefault();
        const nextCode = code.substring(0, start - 1) + code.substring(start + 1);
        if (!isControlled) setInternalCode(nextCode);
        if (onChange) onChange(nextCode);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = start - 1;
          updateSimpleCursorTelemetry(el);
        }, 0);
      }
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = code ? code.split("\n") : [""];
  const minH = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  const maxH = maxHeight !== undefined ? (typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight) : undefined;

  return (
    <div
      className={[
        "bs-code-editor",
        `bs-code-editor--${variant}`,
        readOnly ? "bs-code-editor--readonly" : "",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...style, minHeight: minH, maxHeight: maxH }}
      {...props}
    >
      {/* Header Toolbar */}
      {(showLanguageSelect || showCopy || headerLeft || headerRight) && (
        <div className={["bs-code-editor-header", classNames?.header].filter(Boolean).join(" ")}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {showLanguageSelect && (
              <select
                value={currentLang}
                disabled={readOnly}
                onChange={(e) => {
                  const nextLang = e.target.value;
                  setInternalLang(nextLang);
                  if (onLanguageChange) onLanguageChange(nextLang);
                }}
                className={["bs-code-editor-lang-select", classNames?.langSelect].filter(Boolean).join(" ")}
                aria-label="Select programming language"
              >
                {(languages || SUPPORTED_LANGUAGES).map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            )}
            {headerLeft}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {headerRight}
            {showCopy && (
              <button
                type="button"
                onClick={handleCopy}
                className={[
                  "bs-code-editor-copy-btn",
                  copied ? "bs-code-editor-copy-btn--copied" : "",
                  classNames?.copyBtn,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label="Copy code to clipboard"
              >
                <Icon name={copied ? "CheckCircle" : "Copy"} size={13} />
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Main Stage */}
      {engine === "codemirror" ? (
        <div
          className={["bs-code-editor-stage", "bs-code-editor-codemirror", classNames?.stage]
            .filter(Boolean)
            .join(" ")}
          style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex" }}
        >
          <CodeMirror
            ref={cmRef}
            value={code}
            height="100%"
            onChange={handleCmChange}
            onUpdate={handleCmUpdate}
            theme={variant === "dark" ? oneDark : "light"}
            extensions={extensions}
            readOnly={readOnly}
            editable={!readOnly}
            placeholder="// Type or paste your code here..."
            basicSetup={{
              lineNumbers: showLineNumbers,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              history: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              defaultKeymap: true,
              searchKeymap: true,
              historyKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
              tabSize: tabSize,
            }}
            style={{
              width: "100%",
              height: "100%",
              fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
            }}
          />
        </div>
      ) : (
        <div className={["bs-code-editor-stage", classNames?.stage].filter(Boolean).join(" ")}>
          {showLineNumbers && (
            <div
              ref={gutterRef}
              aria-hidden="true"
              className={["bs-code-editor-gutter", classNames?.gutter].filter(Boolean).join(" ")}
            >
              {lines.map((_, idx) => {
                const lineNum = idx + 1;
                const isCurrent = lineNum === cursorPos.line;
                return (
                  <span
                    key={idx}
                    className={[
                      "bs-code-editor-line-num",
                      isCurrent ? "bs-code-editor-line-num--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {lineNum}
                  </span>
                );
              })}
            </div>
          )}

          <div className={["bs-code-editor-content", classNames?.content].filter(Boolean).join(" ")}>
            {syntaxHighlight && (
              <pre
                ref={preRef}
                aria-hidden="true"
                className={["bs-code-editor-highlight", classNames?.highlight].filter(Boolean).join(" ")}
              >
                {lines.map((lineText, idx) => {
                  const isCurrent = idx + 1 === cursorPos.line;
                  return (
                    <div
                      key={idx}
                      className={[
                        "bs-code-editor-highlight-line",
                        isCurrent ? "bs-code-editor-highlight-line--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {highlightLine(lineText, currentLang) || "\n"}
                    </div>
                  );
                })}
              </pre>
            )}

            <textarea
              ref={textareaRef}
              value={code}
              readOnly={readOnly}
              onChange={handleSimpleCodeChange}
              onKeyDown={handleSimpleKeyDown}
              onScroll={handleSimpleScroll}
              onClick={(e) => updateSimpleCursorTelemetry(e.currentTarget)}
              onKeyUp={(e) => updateSimpleCursorTelemetry(e.currentTarget)}
              className={[
                "bs-code-editor-textarea",
                syntaxHighlight ? "bs-code-editor-textarea--highlighted" : "",
                classNames?.textarea,
              ]
                .filter(Boolean)
                .join(" ")}
              placeholder="// Type or paste your code here..."
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Status Footer Telemetry */}
      {showStatusFooter && (
        <div className={["bs-code-editor-footer", classNames?.footer].filter(Boolean).join(" ")}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            {selectedChars > 0 && <span>({selectedChars} selected)</span>}
            {footerStatus && (
              <div className="bs-code-editor-footer-status" style={{ display: "inline-flex", alignItems: "center" }}>
                {footerStatus}
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            {keymap !== "standard" && (
              <span
                style={{
                  textTransform: "uppercase",
                  fontWeight: 700,
                  fontSize: "10px",
                  padding: "1px 5px",
                  borderRadius: "3px",
                  background: "rgba(14, 165, 233, 0.2)",
                  color: "#38bdf8",
                }}
              >
                {keymap.toUpperCase()}
              </span>
            )}
            <span>Spaces: {tabSize}</span>
            <span>UTF-8</span>
            <span>{code.length} chars</span>
          </div>
        </div>
      )}
    </div>
  );
}
