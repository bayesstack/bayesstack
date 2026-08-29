import React, { useState } from "react";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { Badge } from "../../atoms/Badges/Badge";
import "./Editor.css";

export interface CodeBlockComponentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Code content string
   */
  code: string;

  /**
   * Programming language
   * @default 'typescript'
   */
  language?: string;

  /**
   * Callback fired when code content changes
   */
  onChange?: (code: string) => void;

  /**
   * Callback fired when language selection changes
   */
  onLanguageChange?: (language: string) => void;

  /**
   * Editable mode flag
   * @default true
   */
  editable?: boolean;

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: CodeBlockComponentClassNames;
}

export interface CodeBlockComponentClassNames {
  root?: string;
  header?: string;
  select?: string;
  body?: string;
  lines?: string;
  textarea?: string;
  pre?: string;
}

const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "sql",
  "json",
  "bash",
  "html",
  "css",
];

export function CodeBlockComponent({
  code,
  language = "typescript",
  onChange,
  onLanguageChange,
  editable = true,
  className = "",
  classNames,
  style,
  ...props
}: CodeBlockComponentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div
      className={["bs-editor-code-block", className, classNames?.root].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Header bar */}
      <div className={["bs-editor-code-block-header", classNames?.header].filter(Boolean).join(" ")}>
        {editable ? (
          <select
            className={["bs-editor-code-lang-select", classNames?.select].filter(Boolean).join(" ")}
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        ) : (
          <Badge size="sm" variant="subtle" color="neutral">
            {language}
          </Badge>
        )}

        <IconButton
          name={copied ? "Check" : "Copy"}
          label={copied ? "Copied!" : "Copy code"}
          size="xs"
          variant="transparent"
          onClick={handleCopy}
        />
      </div>

      {/* Code Editor Body */}
      <div className={["bs-editor-code-block-body", classNames?.body].filter(Boolean).join(" ")}>
        <div className={["bs-editor-code-lines", classNames?.lines].filter(Boolean).join(" ")}>
          {lines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>

        {editable ? (
          <textarea
            className={["bs-editor-code-textarea", classNames?.textarea].filter(Boolean).join(" ")}
            value={code}
            onChange={(e) => onChange && onChange(e.target.value)}
            spellCheck={false}
            rows={Math.max(3, lines.length)}
          />
        ) : (
          <pre className={["bs-editor-code-pre", classNames?.pre].filter(Boolean).join(" ")}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
