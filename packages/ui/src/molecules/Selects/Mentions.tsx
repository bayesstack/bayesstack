import React, { forwardRef, useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import { Avatar } from "../../atoms/Badges/Avatar";
import "./Selects.css";

export interface MentionOption {
  /**
   * Mention string value to insert (e.g. 'alex_r' or 'design_team')
   */
  value: string;

  /**
   * Primary display label (e.g. 'Alex Rivera')
   */
  label: string;

  /**
   * Optional avatar image URL
   */
  avatar?: string;

  /**
   * Secondary sub-label (e.g. 'Lead Designer' or '@alex')
   */
  sublabel?: string;

  /**
   * Optional icon fallback
   */
  icon?: IconName | React.ReactNode;

  /**
   * Disables this mention option
   */
  disabled?: boolean;
}

export interface MentionsProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "defaultValue" | "prefix"> {

  /**
   * Controlled text value
   */
  value?: string;

  /**
   * Default initial text value
   */
  defaultValue?: string;

  /**
   * Callback fired when text changes
   */
  onValueChange?: (text: string) => void;

  /**
   * Callback fired when a mention option is selected
   */
  onSelectMention?: (option: MentionOption) => void;

  /**
   * List of mention options available for completion
   */
  options: MentionOption[];

  /**
   * Mention trigger character(s)
   * @default '@'
   */
  prefix?: string | string[];

  /**
   * Textarea placeholder text
   * @default 'Type @ to mention...'
   */
  placeholder?: string;

  /**
   * Number of visible text lines
   * @default 3
   */
  rows?: number;

  /**
   * Disables mentions input
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state highlight or message
   */
  error?: boolean | React.ReactNode;

  /**
   * Field header label
   */
  label?: React.ReactNode;

  /**
   * Helper description hint text
   */
  helperText?: React.ReactNode;

  /**
   * Display size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export const Mentions = forwardRef<HTMLTextAreaElement, MentionsProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      onSelectMention,
      options = [],
      prefix = "@",
      placeholder = "Type @ to mention...",
      rows = 3,
      disabled = false,
      error,
      label,
      helperText,
      size = "md",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalText, setInternalText] = useState<string>(defaultValue);
    const textValue = isControlled ? controlledValue : internalText;

    const [isOpen, setIsOpen] = useState(false);
    const [mentionQuery, setMentionQuery] = useState("");
    const [activeTrigger, setActiveTrigger] = useState<string>("@");
    const [highlightIndex, setHighlightIndex] = useState<number>(0);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const prefixes = Array.isArray(prefix) ? prefix : [prefix];

    // Filter matching options
    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      opt.value.toLowerCase().includes(mentionQuery.toLowerCase())
    );

    // Reset highlight index when filtered options change
    useEffect(() => {
      setHighlightIndex(0);
    }, [mentionQuery]);

    // Close popover on outside click
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      const cursorPos = e.target.selectionStart || 0;

      if (!isControlled) {
        setInternalText(val);
      }
      if (onValueChange) {
        onValueChange(val);
      }

      // Check if cursor is immediately after a trigger character
      const textBeforeCursor = val.slice(0, cursorPos);
      let foundTrigger: string | null = null;
      let triggerIndex = -1;

      for (const p of prefixes) {
        const lastIdx = textBeforeCursor.lastIndexOf(p);
        if (lastIdx !== -1) {
          const charBeforeTrigger = textBeforeCursor[lastIdx - 1];
          if (!charBeforeTrigger || /\s/.test(charBeforeTrigger)) {
            foundTrigger = p;
            triggerIndex = lastIdx;
            break;
          }
        }
      }

      if (foundTrigger !== null && triggerIndex !== -1) {
        const query = textBeforeCursor.slice(triggerIndex + foundTrigger.length);
        if (!/\s/.test(query)) {
          setActiveTrigger(foundTrigger);
          setMentionQuery(query);
          setIsOpen(true);
          return;
        }
      }

      setIsOpen(false);
    };

    const handleInsertMention = (option: MentionOption) => {
      if (disabled || option.disabled) return;

      const textareaNode = textareaRef.current;
      const cursorPos = textareaNode ? textareaNode.selectionStart : textValue.length;

      const textBeforeCursor = textValue.slice(0, cursorPos);
      const textAfterCursor = textValue.slice(cursorPos);

      const triggerIndex = textBeforeCursor.lastIndexOf(activeTrigger);

      if (triggerIndex !== -1) {
        const replacement = `${activeTrigger}${option.value} `;
        const newText =
          textBeforeCursor.slice(0, triggerIndex) + replacement + textAfterCursor;

        if (!isControlled) {
          setInternalText(newText);
        }
        if (onValueChange) {
          onValueChange(newText);
        }
        if (onSelectMention) {
          onSelectMention(option);
        }
      }

      setIsOpen(false);
      if (textareaNode) {
        textareaNode.focus();
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!isOpen || filteredOptions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % filteredOptions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev === 0 ? filteredOptions.length - 1 : prev - 1
        );
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredOptions[highlightIndex]) {
          handleInsertMention(filteredOptions[highlightIndex]);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const renderOptionIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size="sm" color="#4A6360" />;
      }
      return icon;
    };

    return (
      <div
        ref={containerRef}
        className={["bs-mentions-container", className].filter(Boolean).join(" ")}
        style={style}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }}
          rows={rows}
          value={textValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            "bs-mentions-textarea",
            `bs-mentions-textarea--${size}`,
            error ? "bs-mentions-textarea--error" : "",
            disabled ? "bs-mentions-textarea--disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {/* Mentions Popover */}
        {isOpen && !disabled && (
          <div className="bs-mentions-popover">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isHighlighted = idx === highlightIndex;

                return (
                  <div
                    key={opt.value}
                    className={[
                      "bs-mentions-item",
                      isHighlighted ? "bs-mentions-item--highlighted" : "",
                      opt.disabled ? "bs-mentions-item--disabled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleInsertMention(opt);
                    }}
                    onMouseEnter={() => setHighlightIndex(idx)}
                  >
                    {opt.avatar ? (
                      <Avatar src={opt.avatar} name={opt.label} size="sm" />
                    ) : (
                      renderOptionIcon(opt.icon)
                    )}

                    <div className="bs-mentions-item__text">
                      <span className="bs-mentions-item__label">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="bs-mentions-item__sublabel">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bs-mentions-empty">No mentions found</div>
            )}
          </div>
        )}

        {error && typeof error !== "boolean" && (
          <div className="bs-select-field__error">{error}</div>
        )}
        {!error && helperText && (
          <div className="bs-select-field__helper">{helperText}</div>
        )}
      </div>
    );
  }
);

Mentions.displayName = "Mentions";
