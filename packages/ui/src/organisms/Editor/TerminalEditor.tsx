import React, { useState, useRef, useEffect } from "react";
import "./Editor.css";

export interface TerminalLine {
  id: string;
  type: "command" | "output" | "error";
  text: React.ReactNode;
  prompt?: React.ReactNode;
}

export interface TerminalEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * The prompt string or component to display before the input
   * @default "$"
   */
  promptLabel?: React.ReactNode;

  /**
   * Optional initial greeting message
   */
  welcomeMessage?: React.ReactNode;

  /**
   * History of terminal lines to display
   */
  history?: TerminalLine[];

  /**
   * Callback fired when user presses Enter
   */
  onCommand?: (command: string) => Promise<void> | void;

  /**
   * Controlled command input value
   */
  value?: string;

  /**
   * Callback when input value changes
   */
  onChange?: (value: string) => void;

  /**
   * Disable input while processing a command
   * @default false
   */
  isProcessing?: boolean;

  /**
   * Theme variant
   * @default "dark"
   */
  variant?: "dark" | "light" | "minimal";

  /**
   * Read-only mode (disables input completely)
   * @default false
   */
  readOnly?: boolean;

  /**
   * Minimum editor height (px number or CSS string)
   * @default "300px"
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
  classNames?: TerminalEditorClassNames;
}

export interface TerminalEditorClassNames {
  root?: string;
  history?: string;
  line?: string;
  prompt?: string;
  input?: string;
}

export function TerminalEditor({
  promptLabel = "$",
  welcomeMessage,
  history = [],
  onCommand,
  value: controlledValue,
  onChange,
  isProcessing = false,
  variant = "dark",
  readOnly = false,
  minHeight = "300px",
  maxHeight,
  className = "",
  classNames,
  style,
  ...props
}: TerminalEditorProps) {
  const [internalValue, setInternalValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : internalValue;

  // Auto-scroll to bottom on history change or processing state
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, isProcessing]);

  // Regain focus automatically after processing completes
  useEffect(() => {
    if (!isProcessing && !readOnly && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isProcessing, readOnly]);

  // Handle focus trap: clicking anywhere focuses the input
  const handleContainerClick = () => {
    if (!readOnly && !isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) setInternalValue(val);
    if (onChange) onChange(val);
    // Reset history cycling when user types
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly || isProcessing) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim() === "") return;
      
      if (onCommand) {
        onCommand(inputValue);
      }
      
      if (!isControlled) setInternalValue("");
      if (onChange) onChange("");
      setHistoryIndex(-1);
      return;
    }

    // Command History Cycling
    const commandLines = history.filter((line) => line.type === "command");
    if (commandLines.length === 0) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = historyIndex === -1 ? commandLines.length - 1 : Math.max(0, historyIndex - 1);
      const prevCmd = commandLines[nextIndex]?.text as string;
      
      if (prevCmd !== undefined) {
        setHistoryIndex(nextIndex);
        if (!isControlled) setInternalValue(prevCmd);
        if (onChange) onChange(prevCmd);
        
        // Move cursor to end
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = prevCmd.length;
          }
        }, 0);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= commandLines.length) {
          // Bottom of history, clear input
          setHistoryIndex(-1);
          if (!isControlled) setInternalValue("");
          if (onChange) onChange("");
        } else {
          const nextCmd = commandLines[nextIndex]?.text as string;
          setHistoryIndex(nextIndex);
          if (!isControlled) setInternalValue(nextCmd);
          if (onChange) onChange(nextCmd);
        }
      }
    }
  };

  const minH = typeof minHeight === "number" ? `${minHeight}px` : minHeight;
  const maxH = maxHeight !== undefined ? (typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight) : undefined;

  return (
    <div
      ref={containerRef}
      className={[
        "bs-terminal-editor",
        `bs-terminal-editor--${variant}`,
        readOnly ? "bs-terminal-editor--readonly" : "",
        isProcessing ? "bs-terminal-editor--processing" : "",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...style, minHeight: minH, maxHeight: maxH }}
      onClick={handleContainerClick}
      {...props}
    >
      <div className={["bs-terminal-editor-history", classNames?.history].filter(Boolean).join(" ")}>
        {welcomeMessage && (
          <div className="bs-terminal-line bs-terminal-line--welcome">
            {welcomeMessage}
          </div>
        )}

        {history.map((line) => (
          <div
            key={line.id}
            className={[
              "bs-terminal-line",
              `bs-terminal-line--${line.type}`,
              classNames?.line,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {line.type === "command" && (
              <span className={["bs-terminal-prompt", classNames?.prompt].filter(Boolean).join(" ")}>
                {line.prompt ?? promptLabel}
              </span>
            )}
            <span className="bs-terminal-line-text">{line.text}</span>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="bs-terminal-active-line">
          {!isProcessing && (
            <span className={["bs-terminal-prompt", classNames?.prompt].filter(Boolean).join(" ")}>
              {promptLabel}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            className={["bs-terminal-input", classNames?.input].filter(Boolean).join(" ")}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            autoComplete="off"
            spellCheck="false"
            aria-label="Terminal input"
            style={{ display: isProcessing ? "none" : "block" }}
          />
          {isProcessing && <span className="bs-terminal-cursor bs-terminal-cursor--blink" />}
        </div>
      )}
    </div>
  );
}
