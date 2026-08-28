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

export interface TagsInputSlots {
  root?: string;
  shell?: string;
  badge?: string;
  badgeLabel?: string;
  badgeCloseBtn?: string;
  input?: string;
  suggestionsOverlay?: string;
  suggestionsList?: string;
  suggestionItem?: string;
}

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
   * Custom inline styles for wrapper
   */
  style?: React.CSSProperties;

  /**
   * Additional custom CSS class name for wrapper
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: TagsInputSlots;
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
      classNames,
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

      // Splits comma-separated text into individual tag candidates (e.g. "react, typescript, ui")
      const newItems = trimmed
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Filters out duplicates and validates non-suggested terms when `canAddNew={false}` (strict whitelist mode)
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

      // Backspace removes the trailing tag if the input query field is empty
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
        className={["bs-tags-input-wrapper", className, classNames?.root].filter(Boolean).join(" ")}
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
            classNames?.shell,
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
                classNames?.badge,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={["bs-tag-label", classNames?.badgeLabel].filter(Boolean).join(" ")}>{tag}</span>
              {!disabled && !readOnly && (
                <button
                  type="button"
                  className={["bs-tag-close-btn", classNames?.badgeCloseBtn].filter(Boolean).join(" ")}
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
              className={["bs-tags-field", classNames?.input].filter(Boolean).join(" ")}
            />
          )}
        </div>

        {/* Suggestion Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && !disabled && !readOnly && (
          <div className={["bs-tags-suggestions-overlay", classNames?.suggestionsOverlay].filter(Boolean).join(" ")}>
            <ul className={["bs-tags-suggestions-list", classNames?.suggestionsList].filter(Boolean).join(" ")}>
              {filteredSuggestions.map((item) => (
                <li
                  key={item}
                  className={["bs-tags-suggestion-item", classNames?.suggestionItem].filter(Boolean).join(" ")}
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
