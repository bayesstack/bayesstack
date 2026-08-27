import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface TimePreset {
  label: string;
  value: string;
}

export interface TimeInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Controlled time string (e.g. '09:30 AM' or '14:30')
   */
  value?: string;

  /**
   * Default initial time string
   */
  defaultValue?: string;

  /**
   * Callback fired when selected time changes
   */
  onValueChange?: (time: string) => void;

  /**
   * Time display format mode
   * @default '12h'
   */
  format?: "12h" | "24h";

  /**
   * Minute option interval step in minutes (e.g. 1, 5, 15, 30)
   * @default 15
   */
  minuteStep?: number;

  /**
   * Quick time preset buttons
   */
  presets?: TimePreset[];

  /**
   * Input placeholder text
   */
  placeholder?: string;

  /**
   * Displays clear selection button
   * @default true
   */
  clearable?: boolean;

  /**
   * Disables time input component
   * @default false
   */
  disabled?: boolean;

  /**
   * Error state highlight or message
   */
  error?: boolean | React.ReactNode;

  /**
   * Header label title
   */
  label?: React.ReactNode;

  /**
   * Helper description text
   */
  helperText?: React.ReactNode;

  /**
   * Display size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

const DEFAULT_PRESETS_12H: TimePreset[] = [
  { label: "09:00 AM", value: "09:00 AM" },
  { label: "12:00 PM", value: "12:00 PM" },
  { label: "02:00 PM", value: "02:00 PM" },
  { label: "05:00 PM", value: "05:00 PM" },
];

export const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      format = "12h",
      minuteStep = 15,
      presets = DEFAULT_PRESETS_12H,
      placeholder,
      clearable = true,
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
    const [internalValue, setInternalValue] = useState<string>(defaultValue);
    const activeValue = isControlled ? controlledValue : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // State breakdown for overlay selection columns
    const [selectedHour, setSelectedHour] = useState<string>("09");
    const [selectedMinute, setSelectedMinute] = useState<string>("00");
    const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");

    // Sync state when activeValue changes or overlay opens
    useEffect(() => {
      if (!activeValue) return;
      if (format === "12h") {
        const match = activeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (match) {
          setSelectedHour(match[1].padStart(2, "0"));
          setSelectedMinute(match[2].padStart(2, "0"));
          setSelectedPeriod((match[3]?.toUpperCase() as "AM" | "PM") || "AM");
        }
      } else {
        const match = activeValue.match(/^(\d{1,2}):(\d{2})$/);
        if (match) {
          setSelectedHour(match[1].padStart(2, "0"));
          setSelectedMinute(match[2].padStart(2, "0"));
        }
      }
    }, [activeValue, format]);

    // Close on outside click
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

    // Generate hours options list
    const hours: string[] = [];
    if (format === "12h") {
      for (let h = 1; h <= 12; h++) {
        hours.push(String(h).padStart(2, "0"));
      }
    } else {
      for (let h = 0; h < 24; h++) {
        hours.push(String(h).padStart(2, "0"));
      }
    }

    // Generate minutes options list based on minuteStep
    const minutes: string[] = [];
    for (let m = 0; m < 60; m += Math.max(1, minuteStep)) {
      minutes.push(String(m).padStart(2, "0"));
    }

    const commitTime = (h: string, m: string, p?: "AM" | "PM") => {
      const formatted =
        format === "12h" ? `${h}:${m} ${p || selectedPeriod}` : `${h}:${m}`;
      if (!isControlled) {
        setInternalValue(formatted);
      }
      if (onValueChange) {
        onValueChange(formatted);
      }
    };

    const handleSelectHour = (h: string) => {
      setSelectedHour(h);
      commitTime(h, selectedMinute, selectedPeriod);
    };

    const handleSelectMinute = (m: string) => {
      setSelectedMinute(m);
      commitTime(selectedHour, m, selectedPeriod);
    };

    const handleSelectPeriod = (p: "AM" | "PM") => {
      setSelectedPeriod(p);
      commitTime(selectedHour, selectedMinute, p);
    };

    const handleSelectPreset = (presetValue: string) => {
      if (!isControlled) {
        setInternalValue(presetValue);
      }
      if (onValueChange) {
        onValueChange(presetValue);
      }
      setIsOpen(false);
    };

    const handleSetNow = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(Math.round(now.getMinutes() / minuteStep) * minuteStep % 60).padStart(2, "0");
      let p: "AM" | "PM" = "AM";

      if (format === "12h") {
        p = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
      }
      const hourStr = String(h).padStart(2, "0");
      setSelectedHour(hourStr);
      setSelectedMinute(m);
      setSelectedPeriod(p);
      commitTime(hourStr, m, p);
      setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isControlled) {
        setInternalValue("");
      }
      if (onValueChange) {
        onValueChange("");
      }
    };

    const defaultPlaceholder = format === "12h" ? "hh:mm AM/PM" : "HH:mm";

    return (
      <div
        ref={containerRef}
        className={["bs-select-field", className].filter(Boolean).join(" ")}
        style={style}
        {...props}
      >
        {label && <div className="bs-select-field__label">{label}</div>}

        <div
          ref={ref}
          tabIndex={disabled ? -1 : 0}
          className={[
            "bs-select-trigger",
            `bs-select-trigger--${size}`,
            isOpen ? "bs-select-trigger--open" : "",
            disabled ? "bs-select-trigger--disabled" : "",
            error ? "bs-select-trigger--error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
        >
          <div className="bs-select-trigger__left">
            <Icon name="Time" size="sm" color="#4A6360" />
            {activeValue ? (
              <span className="bs-select-trigger__value">{activeValue}</span>
            ) : (
              <span className="bs-select-trigger__placeholder">
                {placeholder || defaultPlaceholder}
              </span>
            )}
          </div>

          <div className="bs-select-trigger__right">
            {clearable && activeValue && !disabled && (
              <IconButton
                name="Close"
                label="Clear time"
                size="xs"
                variant="transparent"
                onClick={handleClear}
              />
            )}
            <Icon name="ArrowDown" size="sm" color="#4A6360" />
          </div>
        </div>

        {/* TimeInput Floating Overlay Menu */}
        {isOpen && !disabled && (
          <div className="bs-timeinput-popover">
            {/* Presets Bar */}
            {presets && presets.length > 0 && (
              <div className="bs-timeinput-presets">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={[
                      "bs-timeinput-preset-pill",
                      activeValue === preset.value
                        ? "bs-timeinput-preset-pill--active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleSelectPreset(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable Column Selectors */}
            <div className="bs-timeinput-columns">
              {/* Hours Column */}
              <div className="bs-timeinput-column">
                <div className="bs-timeinput-column-title">Hours</div>
                <div className="bs-timeinput-column-list">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={[
                        "bs-timeinput-cell",
                        selectedHour === h ? "bs-timeinput-cell--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelectHour(h)}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="bs-timeinput-column">
                <div className="bs-timeinput-column-title">Minutes</div>
                <div className="bs-timeinput-column-list">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={[
                        "bs-timeinput-cell",
                        selectedMinute === m ? "bs-timeinput-cell--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelectMinute(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM Period Column */}
              {format === "12h" && (
                <div className="bs-timeinput-column bs-timeinput-column--narrow">
                  <div className="bs-timeinput-column-title">Period</div>
                  <div className="bs-timeinput-column-list">
                    {(["AM", "PM"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={[
                          "bs-timeinput-cell",
                          selectedPeriod === p ? "bs-timeinput-cell--active" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => handleSelectPeriod(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="bs-timeinput-footer">
              <button
                type="button"
                className="bs-timeinput-now-btn"
                onClick={handleSetNow}
              >
                Set to Now
              </button>
              <button
                type="button"
                className="bs-timeinput-done-btn"
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </div>
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

TimeInput.displayName = "TimeInput";
