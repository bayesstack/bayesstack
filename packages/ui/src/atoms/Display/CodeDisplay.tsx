import React, { useState } from "react";
import { Icon } from "../Icons/Icon";
import { highlightLine } from "./syntaxHighlighter";
import "./Display.css";

export type HighlightColor = "red" | "green" | "grey" | "yellow" | "blue";

export interface CodeLineHighlight {
  /**
   * 1-indexed line number
   */
  line: number;

  /**
   * Highlight color style: 'red', 'green', 'grey', 'yellow', 'blue'
   * @default 'green'
   */
  color?: HighlightColor;

  /**
   * Diff line action type: 'add' | 'remove' | 'highlight'
   */
  type?: "add" | "remove" | "highlight";

  /**
   * Educational annotation note text to display under line
   */
  note?: string;
}

export interface CodeDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Code snippet string content
   */
  code: string;

  /**
   * Programming language descriptor tag (e.g., 'typescript', 'python', 'sql', 'json', 'bash')
   * @default 'typescript'
   */
  language?: string;

  /**
   * Enable automatic syntax highlighting based on programming language
   * @default true
   */
  syntaxHighlight?: boolean;

  /**
   * Optional file path or filename title in header (e.g., 'src/pipeline/trainer.ts')
   */
  filename?: string;

  /**
   * Enable diff auto-parsing mode (detects lines starting with '+' or '-')
   * @default false
   */
  diffMode?: boolean;

  /**
   * Targeted line numbers or detailed line highlight objects (red, green, grey, yellow, blue)
   */
  highlightLines?: (number | CodeLineHighlight)[];

  /**
   * Line numbers to focus on (dims all un-focused lines for educational focus)
   */
  focusLines?: number[];

  /**
   * Educational inline explanatory callout notes per line number { [line: number]: ReactNode }
   */
  lineAnnotations?: Record<number, React.ReactNode>;

  /**
   * Starting line number offset for line number gutter and educational annotations
   * @default 1
   */
  startingLineNumber?: number;

  /**
   * Enable word wrapping instead of horizontal scrolling
   * @default false
   */
  wrapLines?: boolean;

  /**
   * Show line number gutter
   * @default true
   */
  showLineNumbers?: boolean;

  /**
   * Show top header copy snippet button
   * @default true
   */
  showCopy?: boolean;

  /**
   * Show top header language badge indicator
   * @default true
   */
  showLanguageBadge?: boolean;

  /**
   * Max height scroll container (number in px or CSS length string)
   */
  maxHeight?: number | string;

  /**
   * Visual theme mode
   * @default 'dark'
   */
  variant?: "dark" | "light" | "minimal";

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: CodeDisplayClassNames;
}

export interface CodeDisplayClassNames {
  root?: string;
  header?: string;
  filename?: string;
  badge?: string;
  copyBtn?: string;
  body?: string;
  gutter?: string;
  code?: string;
  annotation?: string;
}

export function CodeDisplay({
  code = "",
  language = "typescript",
  syntaxHighlight = true,
  filename,
  diffMode = false,
  startingLineNumber = 1,
  highlightLines = [],
  focusLines,
  lineAnnotations = {},
  wrapLines = false,
  showLineNumbers = true,
  showCopy = true,
  showLanguageBadge = true,
  maxHeight,
  variant = "dark",
  className = "",
  classNames,
  ...props
}: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const lines = code ? code.split("\n") : [""];

  // Normalize highlight lines lookup map
  const highlightMap = new Map<number, CodeLineHighlight>();
  highlightLines.forEach((item) => {
    if (typeof item === "number") {
      highlightMap.set(item, { line: item, color: "green", type: "highlight" });
    } else if (item && typeof item.line === "number") {
      highlightMap.set(item.line, item);
    }
  });

  const focusSet = new Set(focusLines || []);
  const hasFocusFilter = Boolean(focusLines && focusLines.length > 0);

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

  return (
    <div
      className={[
        "bs-code-display",
        `bs-code-display--${variant}`,
        wrapLines ? "bs-code-display--wrap" : "",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {(filename || showLanguageBadge || showCopy) && (
        <div className={["bs-code-display-header", classNames?.header].filter(Boolean).join(" ")}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {filename && (
              <span className={["bs-code-display-filename", classNames?.filename].filter(Boolean).join(" ")}>
                <Icon name="File" size={13} style={{ marginRight: 5 }} />
                {filename}
              </span>
            )}
            {showLanguageBadge && (
              <span className={["bs-code-display-badge", classNames?.badge].filter(Boolean).join(" ")}>
                {language}
              </span>
            )}
          </div>

          {showCopy && (
            <button
              type="button"
              onClick={handleCopy}
              className={[
                "bs-code-display-copy-btn",
                copied ? "bs-code-display-copy-btn--copied" : "",
                classNames?.copyBtn,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label="Copy code snippet"
            >
              <Icon name={copied ? "CheckCircle" : "Copy"} size={13} />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>
      )}

      <div
        className={["bs-code-display-body", classNames?.body].filter(Boolean).join(" ")}
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        {showLineNumbers && (
          <div
            aria-hidden="true"
            className={["bs-code-display-gutter", classNames?.gutter].filter(Boolean).join(" ")}
          >
            {lines.map((lineText, i) => {
              const lineNum = startingLineNumber + i;
              const isAdd = diffMode && lineText.startsWith("+");
              const isRemove = diffMode && lineText.startsWith("-");

              let gutterSymbol: React.ReactNode = lineNum;
              if (isAdd) gutterSymbol = "+";
              if (isRemove) gutterSymbol = "-";

              return (
                <span
                  key={i}
                  className={[
                    "bs-code-display-line-number",
                    isAdd ? "bs-code-gutter--add" : "",
                    isRemove ? "bs-code-gutter--remove" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {gutterSymbol}
                </span>
              );
            })}
          </div>
        )}

        <div className={["bs-code-display-lines-stage", classNames?.code].filter(Boolean).join(" ")}>
          {lines.map((rawLine, idx) => {
            const lineNum = startingLineNumber + idx;
            const hlConfig = highlightMap.get(lineNum);

            let isAdd = diffMode && rawLine.startsWith("+");
            let isRemove = diffMode && rawLine.startsWith("-");

            if (hlConfig?.type === "add") isAdd = true;
            if (hlConfig?.type === "remove") isRemove = true;

            const isDimmed = hasFocusFilter && !focusSet.has(lineNum);
            const colorClass = hlConfig?.color ? `bs-code-line--${hlConfig.color}` : "";

            const annotation = hlConfig?.note || lineAnnotations[lineNum];

            return (
              <React.Fragment key={idx}>
                {/* Educational Annotation Callout Note (Above Line) */}
                {annotation && (
                  <div className={["bs-code-annotation-callout", classNames?.annotation].filter(Boolean).join(" ")}>
                    <Icon name="InfoCircle" size={13} className="bs-code-annotation-icon" />
                    <span className="bs-code-annotation-text">{annotation}</span>
                  </div>
                )}

                <div
                  className={[
                    "bs-code-line-row",
                    isAdd ? "bs-code-line--add" : "",
                    isRemove ? "bs-code-line--remove" : "",
                    colorClass,
                    isDimmed ? "bs-code-line--dimmed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <code className="bs-code-line-text">
                    {syntaxHighlight ? highlightLine(rawLine, language) : rawLine}
                  </code>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
