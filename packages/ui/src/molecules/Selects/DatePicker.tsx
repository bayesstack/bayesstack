import React, { forwardRef, useState, useRef, useEffect } from "react";
import { Icon } from "../../atoms/Icons";
import { IconButton } from "../../atoms/Buttons/IconButton";
import "./Selects.css";

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Controlled Date value or Range tuple [startDate, endDate]
   */
  value?: Date | [Date | null, Date | null] | null;

  /**
   * Default initial date value or range
   */
  defaultValue?: Date | [Date | null, Date | null] | null;

  /**
   * Callback fired when selected date changes
   */
  onValueChange?: (val: any) => void;

  /**
   * Enables date range picking mode
   * @default false
   */
  range?: boolean;

  /**
   * Enables time selector input
   * @default false
   */
  withTime?: boolean;

  /**
   * Input placeholder string
   */
  placeholder?: string;

  /**
   * Minimum selectable date
   */
  minDate?: Date;

  /**
   * Maximum selectable date
   */
  maxDate?: Date;

  /**
   * Displays clear button when value is set
   * @default true
   */
  clearable?: boolean;

  /**
   * Disables date picker component
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

  /**
   * Additional root container CSS class string
   */
  className?: string;

  /**
   * Slot class names object for granular component targeted overrides
   */
  classNames?: DatePickerClassNames;
}

export interface DatePickerClassNames {
  root?: string;
  label?: string;
  trigger?: string;
  popover?: string;
  header?: string;
  weekdays?: string;
  grid?: string;
  dayBtn?: string;
  footer?: string;
  error?: string;
  helper?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      range = false,
      withTime = false,
      placeholder,
      minDate,
      maxDate,
      clearable = true,
      disabled = false,
      error,
      label,
      helperText,
      size = "md",
      className = "",
      classNames,
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = useState<any>(
      defaultValue ?? (range ? [null, null] : null)
    );
    const activeValue = isControlled ? controlledValue : internalValue;

    const [isOpen, setIsOpen] = useState(false);

    // Active viewed month & year in calendar popover
    const now = new Date();
    const initialViewDate =
      (range ? (activeValue as any)?.[0] : activeValue) || now;

    const [viewYear, setViewYear] = useState<number>(initialViewDate.getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(initialViewDate.getMonth());

    // Time picker state
    const [selectedHour, setSelectedHour] = useState<string>("12");
    const [selectedMinute, setSelectedMinute] = useState<string>("00");
    const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("PM");
    const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);

    const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

    const handleTimeChange = (h: string, m: string, p: "AM" | "PM") => {
      setSelectedHour(h);
      setSelectedMinute(m);
      setSelectedPeriod(p);
    };

    const handleSelectPreset = (preset: string) => {
      const match = preset.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
      if (match) {
        setSelectedHour(match[1]);
        setSelectedMinute(match[2]);
        setSelectedPeriod(match[3].toUpperCase() as "AM" | "PM");
      }
    };

    const containerRef = useRef<HTMLDivElement>(null);

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

    const handlePrevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    };

    const handleNextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    };

    const isSameDay = (d1: Date | null, d2: Date | null) => {
      if (!d1 || !d2) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    const isBetweenDays = (d: Date, start: Date | null, end: Date | null) => {
      if (!start || !end) return false;
      const t = d.getTime();
      return t > start.getTime() && t < end.getTime();
    };

    const handleSelectDay = (day: number) => {
      if (disabled) return;
      const selected = new Date(viewYear, viewMonth, day);

      if (range) {
        let currentRange = (activeValue as [Date | null, Date | null]) || [null, null];
        let newRange: [Date | null, Date | null];

        if (!currentRange[0] || (currentRange[0] && currentRange[1])) {
          newRange = [selected, null];
        } else {
          if (selected < currentRange[0]) {
            newRange = [selected, currentRange[0]];
          } else {
            newRange = [currentRange[0], selected];
          }
        }

        if (!isControlled) setInternalValue(newRange);
        if (onValueChange) onValueChange(newRange);
      } else {
        if (!isControlled) setInternalValue(selected);
        if (onValueChange) onValueChange(selected);
        if (!withTime) setIsOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      const cleared = range ? [null, null] : null;
      if (!isControlled) setInternalValue(cleared);
      if (onValueChange) onValueChange(cleared);
    };

    const handleSetToday = (e: React.MouseEvent) => {
      e.stopPropagation();
      const todayDate = new Date();
      setViewYear(todayDate.getFullYear());
      setViewMonth(todayDate.getMonth());
      if (!range) {
        if (!isControlled) setInternalValue(todayDate);
        if (onValueChange) onValueChange(todayDate);
      }
    };

    // Calculate grid days for viewed month
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const calendarGrid: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) calendarGrid.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarGrid.push(d);

    const formatDateString = (d: Date | null) => {
      if (!d) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const getDisplayString = () => {
      if (range) {
        const [start, end] = (activeValue as [Date | null, Date | null]) || [null, null];
        if (!start && !end) return "";
        return `${formatDateString(start)} ~ ${formatDateString(end)}`;
      }
      if (!activeValue) return "";
      const dateStr = formatDateString(activeValue as Date);
      return withTime ? `${dateStr} ${timeString}` : dateStr;
    };

    const defaultPlaceholder = range
      ? "YYYY-MM-DD ~ YYYY-MM-DD"
      : withTime
      ? "YYYY-MM-DD HH:mm"
      : "YYYY-MM-DD";

    return (
      <div
        ref={containerRef}
        className={["bs-select-field", className, classNames?.root].filter(Boolean).join(" ")}
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
            <Icon name="Calendar" size="sm" color="#4A6360" />
            {getDisplayString() ? (
              <span className="bs-select-trigger__value">{getDisplayString()}</span>
            ) : (
              <span className="bs-select-trigger__placeholder">
                {placeholder || defaultPlaceholder}
              </span>
            )}
          </div>

          <div className="bs-select-trigger__right">
            {clearable && getDisplayString() && !disabled && (
              <IconButton
                name="Close"
                label="Clear date"
                size="xs"
                variant="transparent"
                onClick={handleClear}
              />
            )}
            <Icon name="ArrowDown" size="sm" color="#4A6360" />
          </div>
        </div>

        {/* DatePicker Floating Calendar Popover */}
        {isOpen && !disabled && (
          <div className="bs-datepicker-popover">
            {/* Header: Month/Year navigation */}
            <div className="bs-datepicker-header">
              <button
                type="button"
                className="bs-datepicker-nav-btn"
                aria-label="Previous month"
                onClick={handlePrevMonth}
              >
                <Icon name="ArrowLeft" size={14} />
              </button>
              <span className="bs-datepicker-month-label">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>
              <button
                type="button"
                className="bs-datepicker-nav-btn"
                aria-label="Next month"
                onClick={handleNextMonth}
              >
                <Icon name="ArrowRight" size={14} />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="bs-datepicker-weekdays">
              {WEEKDAY_NAMES.map((wd) => (
                <span key={wd} className="bs-datepicker-weekday">
                  {wd}
                </span>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="bs-datepicker-grid">
              {calendarGrid.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <span key={`empty-${idx}`} className="bs-datepicker-day--empty" />;
                }

                const currentCellDate = new Date(viewYear, viewMonth, dayNum);
                let isSelected = false;
                let isInRange = false;

                if (range) {
                  const [start, end] = (activeValue as [Date | null, Date | null]) || [
                    null,
                    null,
                  ];
                  isSelected = isSameDay(currentCellDate, start) || isSameDay(currentCellDate, end);
                  isInRange = isBetweenDays(currentCellDate, start, end);
                } else {
                  isSelected = isSameDay(currentCellDate, activeValue as Date);
                }

                const isToday = isSameDay(currentCellDate, now);

                return (
                  <button
                    key={dayNum}
                    type="button"
                    className={[
                      "bs-datepicker-day-btn",
                      isSelected ? "bs-datepicker-day-btn--selected" : "",
                      isInRange ? "bs-datepicker-day-btn--in-range" : "",
                      isToday ? "bs-datepicker-day-btn--today" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDay(dayNum);
                    }}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Time Slot & Footer Actions */}
            <div className="bs-datepicker-footer">
              {withTime && !range && (
                <div className="bs-datepicker-time-trigger-wrapper">
                  <button
                    type="button"
                    className="bs-datepicker-time-picker-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTimePickerOpen((prev) => !prev);
                    }}
                  >
                    <Icon name="Time" size={14} color="#0B6763" />
                    <span>{timeString}</span>
                    <Icon name="ArrowDown" size={12} color="#4A6360" />
                  </button>

                  {isTimePickerOpen && (
                    <div className="bs-datepicker-time-dropdown">
                      {/* Quick Presets Bar */}
                      <div className="bs-timeinput-presets">
                        {["09:00 AM", "12:00 PM", "02:00 PM", "05:00 PM"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={[
                              "bs-timeinput-preset-pill",
                              timeString === preset ? "bs-timeinput-preset-pill--active" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPreset(preset);
                            }}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      {/* Scrollable Column Selectors */}
                      <div className="bs-timeinput-columns">
                        {/* Hours */}
                        <div className="bs-timeinput-column">
                          <div className="bs-timeinput-column-title">Hours</div>
                          <div className="bs-timeinput-column-list">
                            {Array.from({ length: 12 }, (_, i) =>
                              String(i + 1).padStart(2, "0")
                            ).map((h) => (
                              <button
                                key={h}
                                type="button"
                                className={[
                                  "bs-timeinput-cell",
                                  selectedHour === h ? "bs-timeinput-cell--active" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTimeChange(h, selectedMinute, selectedPeriod);
                                }}
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Minutes */}
                        <div className="bs-timeinput-column">
                          <div className="bs-timeinput-column-title">Minutes</div>
                          <div className="bs-timeinput-column-list">
                            {[
                              "00",
                              "05",
                              "10",
                              "15",
                              "20",
                              "25",
                              "30",
                              "35",
                              "40",
                              "45",
                              "50",
                              "55",
                            ].map((m) => (
                              <button
                                key={m}
                                type="button"
                                className={[
                                  "bs-timeinput-cell",
                                  selectedMinute === m ? "bs-timeinput-cell--active" : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTimeChange(selectedHour, m, selectedPeriod);
                                }}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Period */}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTimeChange(selectedHour, selectedMinute, p);
                                }}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="bs-datepicker-today-btn"
                onClick={handleSetToday}
              >
                Today
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

DatePicker.displayName = "DatePicker";
