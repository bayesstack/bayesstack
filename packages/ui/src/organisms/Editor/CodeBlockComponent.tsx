import React, { useState, useRef, useEffect } from "react";
import { IconButton } from "../../atoms/Buttons/IconButton";
import { Badge } from "../../atoms/Badges/Badge";
import "./Editor.css";

export interface CodeBlockComponentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  code: string;
  language?: string;
  onChange?: (code: string) => void;
  onLanguageChange?: (language: string) => void;
  editable?: boolean;
  className?: string;
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

/**
 * CodeBlockComponent renders editable or read-only code snippets inside rich content documents.
 * Features copy-to-clipboard, language switching, line numbering, word wrap toggles, and font size adjustment.
 */
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Settings state
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");

  const settingsRef = useRef<HTMLDivElement>(null);

  // Close code settings popover when clicking anywhere outside its bounds
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");
  
  const fontSizeMap = { sm: "11px", md: "13px", lg: "15px" };

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

        <div style={{ display: "flex", gap: 4, position: "relative" }}>
          <IconButton
            name={copied ? "Check" : "Copy"}
            label={copied ? "Copied!" : "Copy code"}
            size="xs"
            variant="transparent"
            onClick={handleCopy}
          />
          {editable && (
            <div ref={settingsRef}>
              <IconButton
                name="Settings"
                label="Code Block Settings"
                size="xs"
                variant={settingsOpen ? "primary" : "transparent"}
                onClick={() => setSettingsOpen(!settingsOpen)}
              />
              
              {settingsOpen && (
                <div className="bs-codeblock-settings-popover">
                  <div className="bs-codeblock-settings-row">
                    <label>Line Numbers</label>
                    <input type="checkbox" checked={showLineNumbers} onChange={(e) => setShowLineNumbers(e.target.checked)} />
                  </div>
                  <div className="bs-codeblock-settings-row">
                    <label>Word Wrap</label>
                    <input type="checkbox" checked={wordWrap} onChange={(e) => setWordWrap(e.target.checked)} />
                  </div>
                  <div className="bs-codeblock-settings-row" style={{ marginTop: 8 }}>
                    <label>Font Size</label>
                    <select value={fontSize} onChange={(e) => setFontSize(e.target.value as any)}>
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Editor Body */}
      <div className={["bs-editor-code-block-body", classNames?.body].filter(Boolean).join(" ")}>
        {showLineNumbers && (
          <div className={["bs-editor-code-lines", classNames?.lines].filter(Boolean).join(" ")} style={{ fontSize: fontSizeMap[fontSize] }}>
            {lines.map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>
        )}

        {/* Textarea is used for raw editing; pre/code tags are rendered when in read-only mode */}
        {editable ? (
          <textarea
            className={["bs-editor-code-textarea", classNames?.textarea].filter(Boolean).join(" ")}
            value={code}
            onChange={(e) => onChange && onChange(e.target.value)}
            spellCheck={false}
            rows={Math.max(3, lines.length)}
            style={{ 
              fontSize: fontSizeMap[fontSize],
              whiteSpace: wordWrap ? "pre-wrap" : "pre"
            }}
          />
        ) : (
          <pre className={["bs-editor-code-pre", classNames?.pre].filter(Boolean).join(" ")} style={{ fontSize: fontSizeMap[fontSize], whiteSpace: wordWrap ? "pre-wrap" : "pre" }}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
