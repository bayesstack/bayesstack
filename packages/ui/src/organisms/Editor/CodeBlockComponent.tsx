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
      className={["bs-editor-code-block", className].filter(Boolean).join(" ")}
      style={style}
      {...props}
    >
      {/* Header bar */}
      <div className="bs-editor-code-block-header">
        {editable ? (
          <select
            className="bs-editor-code-lang-select"
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
      <div className="bs-editor-code-block-body">
        <div className="bs-editor-code-lines">
          {lines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>

        {editable ? (
          <textarea
            className="bs-editor-code-textarea"
            value={code}
            onChange={(e) => onChange && onChange(e.target.value)}
            spellCheck={false}
            rows={Math.max(3, lines.length)}
          />
        ) : (
          <pre className="bs-editor-code-pre">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
