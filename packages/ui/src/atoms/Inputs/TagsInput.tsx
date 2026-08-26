import React, {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import { Icon } from "../Icons";
import "./Inputs.css";

export interface TagsInputProps {
  /**
   * Array of selected tag strings
   */
  value?: string[];

  /**
   * Default initial tags for uncontrolled state
   */
  defaultValue?: string[];

  /**
   * Callback fired when tags list changes
   */
  onChange?: (tags: string[]) => void;

  /**
   * List of autocomplete suggestions
   */
  suggestions?: string[];

  /**
   * Input placeholder text displayed when no tags or during typing
   */
  placeholder?: string;

  /**
   * Allows adding custom free-text tags beyond `suggestions`
   * @default true
   */
  canAddNew?: boolean;

  /**
   * Maximum number of tags allowed
   */
  maxTags?: number;

  /**
   * Size variant of the input shell
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Disables input interactions
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state highlight
   * @default false
   */
  error?: boolean | string;

  /**
   * Read-only state
   * @default false
   */
  readOnly?: boolean;

  /**
   * Additional custom CSS class name for wrapper
   */
  className?: string;

  /**
   * Custom inline styles for wrapper
   */
  style?: React.CSSProperties;
}

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  (
    {
      value: controlledValue,
      defaultValue = [],
      onChange,
      suggestions = [],
      placeholder = "Add tag...",
      canAddNew = true,
      maxTags,
      size = "md",
      disabled = false,
      error = false,
      readOnly = false,
      className = "",
      style,
    },
    ref
  ) => {
    const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const tags = controlledValue !== undefined ? controlledValue : internalTags;

    // Filter matching suggestions excluding already added tags
    const filteredSuggestions = suggestions.filter(
      (s) =>
        !tags.includes(s) &&
        s.toLowerCase().includes(inputValue.trim().toLowerCase())
    );

    const updateTags = (newTags: string[]) => {
      if (controlledValue === undefined) {
        setInternalTags(newTags);
      }
      if (onChange) {
        onChange(newTags);
      }
    };

    const addTag = (rawTag: string) => {
      const trimmed = rawTag.trim();
      if (!trimmed) return;

      if (maxTags && tags.length >= maxTags) return;

      // Handle comma-separated tags
      const newItems = trimmed
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const validNewItems = newItems.filter((item) => {
        if (tags.includes(item)) return false;
        if (!canAddNew && suggestions.length > 0 && !suggestions.includes(item)) {
          return false;
        }
        return true;
      });

      if (validNewItems.length > 0) {
        updateTags([...tags, ...validNewItems]);
        setInputValue("");
        setShowSuggestions(false);
      }
    };

    const removeTag = (indexToRemove: number) => {
      if (disabled || readOnly) return;
      const updated = tags.filter((_, idx) => idx !== indexToRemove);
      updateTags(updated);
      setHighlightIndex(-1);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;

      // Add tag on Enter or Comma
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputValue);
        return;
      }

      // Backspace logic: remove last tag if input is empty
      if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
        if (highlightIndex === tags.length - 1) {
          removeTag(tags.length - 1);
        } else {
          setHighlightIndex(tags.length - 1);
        }
        return;
      } else {
        setHighlightIndex(-1);
      }

      // Escape key closes suggestions
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.includes(",")) {
        addTag(val);
      } else {
        setInputValue(val);
        setShowSuggestions(true);
      }
    };

    const handleContainerClick = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    // Close suggestions on outside click
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }, []);

    const isMaxReached = maxTags !== undefined && tags.length >= maxTags;

    return (
      <div
        ref={containerRef}
        className={["bs-tags-input-wrapper", className].filter(Boolean).join(" ")}
        style={style}
      >
        <div
          onClick={handleContainerClick}
          className={[
            "bs-tags-input-shell",
            `bs-tags-input-shell--${size}`,
            isFocused && "bs-tags-input-shell--focused",
            Boolean(error) && "bs-tags-input-shell--error",
            disabled && "bs-tags-input-shell--disabled",
            readOnly && "bs-tags-input-shell--readonly",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={[
                "bs-tag-badge",
                `bs-tag-badge--${size}`,
                highlightIndex === idx && "bs-tag-badge--highlighted",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="bs-tag-label">{tag}</span>
              {!disabled && !readOnly && (
                <button
                  type="button"
                  className="bs-tag-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(idx);
                  }}
                  title={`Remove ${tag}`}
                >
                  <Icon name="Close" size={12} strokeWidth={2.5} />
                </button>
              )}
            </span>
          ))}

          {!isMaxReached && !disabled && !readOnly && (
            <input
              ref={(node) => {
                inputRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
              }}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsFocused(true);
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsFocused(false);
              }}
              placeholder={tags.length === 0 ? placeholder : ""}
              className="bs-tags-field"
            />
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && !disabled && !readOnly && (
          <div className="bs-tags-suggestions-overlay">
            <ul className="bs-tags-suggestions-list">
              {filteredSuggestions.map((item) => (
                <li
                  key={item}
                  className="bs-tags-suggestion-item"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(item);
                  }}
                >
                  <Icon name="AddCircle" size={14} className="bs-tags-suggestion-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

TagsInput.displayName = "TagsInput";
