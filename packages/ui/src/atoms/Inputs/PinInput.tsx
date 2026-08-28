import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
} from "react";
import { IconButton } from "../Buttons/IconButton";
import "./Inputs.css";

export interface PinInputSlots {
  root?: string;
  slot?: string;
  separator?: string;
  toggleButton?: string;
}

export interface PinInputProps {
  /**
   * Number of pin slot inputs
   * @default 4
   */
  length?: number;

  /**
   * Pin character value type
   * @default 'number'
   */
  type?: "number" | "text" | "alphanumeric";

  /**
   * Mask entered values for security (e.g. ••••)
   * @default false
   */
  mask?: boolean;

  /**
   * Shows a reveal eye button to toggle masking on/off
   * @default false
   */
  showMaskToggle?: boolean;

  /**
   * Group slots with a separator (e.g. `separator={true}` or `separator="–"`)
   * @default false
   */
  separator?: boolean | React.ReactNode;

  /**
   * Number of slots per separator group
   * @default 3
   */
  groupSize?: number;

  /**
   * Placeholder symbol when slot is empty (e.g. '○' or '•')
   */
  placeholder?: string;

  /**
   * Controlled string value (e.g. '1234')
   */
  value?: string;

  /**
   * Default initial string value
   */
  defaultValue?: string;

  /**
   * Callback fired when value changes
   */
  onChange?: (value: string) => void;

  /**
   * Callback fired when all slots are completed
   */
  onComplete?: (value: string) => void;

  /**
   * Size scale
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Highlight error state
   * @default false
   */
  error?: boolean;

  /**
   * Highlight success state
   * @default false
   */
  success?: boolean;

  /**
   * Disable interaction
   * @default false
   */
  disabled?: boolean;

  /**
   * Automatically focus the first input on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Custom root class name
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: PinInputSlots;

  /**
   * Custom inline styles for root container
   */
  wrapperStyle?: React.CSSProperties;
}

export const PinInput = React.forwardRef<HTMLDivElement, PinInputProps>(
  (
    {
      length = 4,
      type = "number",
      mask = false,
      showMaskToggle = false,
      separator = false,
      groupSize = 3,
      placeholder,
      value,
      defaultValue = "",
      onChange,
      onComplete,
      size = "md",
      error = false,
      success = false,
      disabled = false,
      autoFocus = false,
      className = "",
      classNames,
      wrapperStyle,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      defaultValue || ""
    );
    const currentValue = isControlled ? String(value || "") : internalValue;

    const [isMasked, setIsMasked] = useState<boolean>(mask);

    useEffect(() => {
      setIsMasked(mask);
    }, [mask]);

    // Array of character values matching length
    const digits = Array.from({ length }, (_, i) => currentValue[i] || "");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, [autoFocus]);

    const isValidChar = useCallback(
      (char: string) => {
        if (!char) return false;
        if (type === "number") return /^\d$/.test(char);
        if (type === "text") return /^[a-zA-Z]$/.test(char);
        return /^[a-zA-Z0-9]$/.test(char);
      },
      [type]
    );

    const updateValue = useCallback(
      (newDigits: string[]) => {
        const fullString = newDigits.join("");
        if (!isControlled) {
          setInternalValue(fullString);
        }
        if (onChange) {
          onChange(fullString);
        }
        if (fullString.length === length && onComplete) {
          onComplete(fullString);
        }
      },
      [isControlled, length, onChange, onComplete]
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
      if (disabled) return;
      const char = e.target.value.slice(-1);

      if (char && isValidChar(char)) {
        const nextDigits = [...digits];
        nextDigits[index] = char;
        updateValue(nextDigits);

        // Auto-advance to next input slot
        if (index < length - 1 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (disabled) return;

      // Two-stage Backspace handling:
      // 1. If current box has a character, clear it without shifting focus.
      // 2. If current box is already empty, clear the previous box and shift focus left.
      if (e.key === "Backspace") {
        e.preventDefault();
        const nextDigits = [...digits];
        if (nextDigits[index]) {
          nextDigits[index] = "";
          updateValue(nextDigits);
        } else if (index > 0) {
          nextDigits[index - 1] = "";
          updateValue(nextDigits);
          inputRefs.current[index - 1]?.focus();
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    // Filters clipboard text against character validation rules (digits vs text vs alphanumeric),
    // populates matching slots up to max length, and moves focus to the first empty input slot.
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      if (disabled) return;

      const pastedData = e.clipboardData.getData("text").trim();
      const validChars = pastedData.split("").filter(isValidChar).slice(0, length);

      if (validChars.length > 0) {
        const nextDigits = Array.from({ length }, (_, i) => validChars[i] || "");
        updateValue(nextDigits);

        const targetIdx = Math.min(validChars.length, length - 1);
        inputRefs.current[targetIdx]?.focus();
      }
    };

    // Render separator node
    const renderSeparatorNode = () => {
      if (typeof separator === "boolean") return "–";
      return separator;
    };

    return (
      <div
        ref={ref}
        className={["bs-pin-container", className, classNames?.root].filter(Boolean).join(" ")}
        style={wrapperStyle}
      >
        {Array.from({ length }).map((_, index) => {
          const charVal = digits[index] || "";
          const isFilled = Boolean(charVal);
          const showSeparator =
            Boolean(separator) &&
            index > 0 &&
            index % groupSize === 0;

          return (
            <React.Fragment key={index}>
              {showSeparator && (
                <span className={["bs-pin-separator", classNames?.separator].filter(Boolean).join(" ")}>
                  {renderSeparatorNode()}
                </span>
              )}
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type={isMasked ? "password" : "text"}
                inputMode={type === "number" ? "numeric" : "text"}
                maxLength={1}
                value={charVal}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className={[
                  "bs-pin-slot",
                  `bs-pin-slot--${size}`,
                  isFilled && "bs-pin-slot--filled",
                  error && "bs-pin-slot--error",
                  success && "bs-pin-slot--success",
                  classNames?.slot,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`Digit ${index + 1} of ${length}`}
                autoComplete="off"
              />
            </React.Fragment>
          );
        })}

        {showMaskToggle && (
          <IconButton
            name={isMasked ? "Eye" : "EyeOff"}
            label={isMasked ? "Show PIN" : "Hide PIN"}
            variant="transparent"
            size={size === "sm" ? "xs" : "sm"}
            className={classNames?.toggleButton}
            onClick={() => setIsMasked((prev) => !prev)}
            disabled={disabled}
          />
        )}
      </div>
    );
  }
);

PinInput.displayName = "PinInput";

/**
 * OTPInput Alias for PinInput
 */
export const OTPInput = PinInput;
