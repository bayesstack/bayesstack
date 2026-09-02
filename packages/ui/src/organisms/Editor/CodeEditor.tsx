import React, { useState, useRef } from "react";
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
   * Enable automatic syntax highlighting overlay
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
   * Indentation spaces count
   * @default 2
   */
  tabSize?: number;

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
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "bash", label: "Bash" },
];

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
  tabSize = 2,
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const code = isControlled ? controlledValue : internalCode;

  const currentLang = controlledLang || internalLang;

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalCode(val);
    }
    if (onChange) {
      onChange(val);
    }
    updateCursorTelemetry(e.target);
  };

  const updateCursorTelemetry = (el: HTMLTextAreaElement) => {
    const textBefore = el.value.substring(0, el.selectionStart);
    const linesBefore = textBefore.split("\n");
    const line = linesBefore.length;
    const col = linesBefore[linesBefore.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = target.scrollTop;
      preRef.current.scrollLeft = target.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = target.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const isSelected = start !== end;
    
    // 1. Handle Tab
    if (e.key === "Tab") {
      e.preventDefault();
      const spaces = " ".repeat(tabSize);

      const nextCode = code.substring(0, start) + spaces + code.substring(end);
      if (!isControlled) {
        setInternalCode(nextCode);
      }
      if (onChange) {
        onChange(nextCode);
      }

      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + tabSize;
      }, 0);
      return;
    }

    // 2. Handle Smart Enter (Auto-Indent)
    if (e.key === "Enter") {
      const textBefore = code.substring(0, start);
      const textAfter = code.substring(end);
      const linesBefore = textBefore.split("\n");
      const currentLine = linesBefore[linesBefore.length - 1];
      
      // Match leading whitespace of current line
      const leadingSpaceMatch = currentLine.match(/^\s*/);
      let indent = leadingSpaceMatch ? leadingSpaceMatch[0] : "";
      
      // Check for opening bracket before cursor
      const prevChar = textBefore.slice(-1);
      const nextChar = textAfter.slice(0, 1);
      
      const isBracketOpen = prevChar === "{" || prevChar === "[" || prevChar === "(";
      const isBracketCloseMatch = 
        (prevChar === "{" && nextChar === "}") ||
        (prevChar === "[" && nextChar === "]") ||
        (prevChar === "(" && nextChar === ")");

      if (isBracketOpen) {
        indent += " ".repeat(tabSize);
      }

      e.preventDefault();
      
      let insertion = "\n" + indent;
      let newCursorPos = start + insertion.length;

      // If exactly between {} or [] or (), push the closing bracket down
      if (isBracketCloseMatch) {
        const originalIndent = leadingSpaceMatch ? leadingSpaceMatch[0] : "";
        insertion += "\n" + originalIndent;
      }

      const nextCode = textBefore + insertion + textAfter;
      if (!isControlled) setInternalCode(nextCode);
      if (onChange) onChange(nextCode);

      setTimeout(() => {
        el.selectionStart = el.selectionEnd = newCursorPos;
        updateCursorTelemetry(el);
      }, 0);
      return;
    }

    // 3. Handle Auto-Closing Brackets & Quotes
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

      if (isSelected) {
        // Wrap selection
        const nextCode = code.substring(0, start) + open + code.substring(start, end) + close + code.substring(end);
        if (!isControlled) setInternalCode(nextCode);
        if (onChange) onChange(nextCode);
        setTimeout(() => {
          el.selectionStart = start + 1;
          el.selectionEnd = end + 1;
          updateCursorTelemetry(el);
        }, 0);
      } else {
        // Insert pair
        const nextCode = code.substring(0, start) + open + close + code.substring(end);
        if (!isControlled) setInternalCode(nextCode);
        if (onChange) onChange(nextCode);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = start + 1;
          updateCursorTelemetry(el);
        }, 0);
      }
      return;
    }
    
    // 4. Skip closing bracket if already typed
    const closingBrackets = ["}", "]", ")", '"', "'", "`"];
    if (closingBrackets.includes(e.key) && !isSelected && code.substring(start, start + 1) === e.key) {
      e.preventDefault();
      el.selectionStart = el.selectionEnd = start + 1;
      updateCursorTelemetry(el);
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
          updateCursorTelemetry(el);
        }, 0);
        return;
      }
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else if (typeof document !== "undefined" && typeof document.execCommand === "function") {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
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
      {(showLanguageSelect || showCopy) && (
        <div className={["bs-code-editor-header", classNames?.header].filter(Boolean).join(" ")}>
          {showLanguageSelect ? (
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
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          ) : <div />}

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
      )}

      {/* Editor Main Stage */}
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
                    ].filter(Boolean).join(" ")}
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
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onClick={(e) => updateCursorTelemetry(e.currentTarget)}
            onKeyUp={(e) => updateCursorTelemetry(e.currentTarget)}
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

      {/* Status Footer Telemetry */}
      {showStatusFooter && (
        <div className={["bs-code-editor-footer", classNames?.footer].filter(Boolean).join(" ")}>
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>{code.length} chars</span>
        </div>
      )}
    </div>
  );
}
