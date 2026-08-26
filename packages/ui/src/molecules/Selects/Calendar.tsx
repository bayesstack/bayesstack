import React, { forwardRef, useState } from "react";
import { Icon } from "../../atoms/Icons";
import "./Selects.css";

export interface CalendarEvent {
  date: Date | string;
  title?: string;
  color?: string;
}

export interface CalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * Controlled selected date or date range [startDate, endDate]
   */
  value?: Date | [Date | null, Date | null] | null;

  /**
   * Initial default selected date or range
   */
  defaultValue?: Date | [Date | null, Date | null] | null;

  /**
   * Callback fired when date selection changes
   */
  onValueChange?: (val: any) => void;

  /**
   * Enables range selection mode
   * @default false
   */
  range?: boolean;

  /**
   * Number of visible calendar months side-by-side
   * @default 1
   */
  amountOfMonths?: 1 | 2;

  /**
   * Array of event markers to highlight on days
   */
  events?: CalendarEvent[];

  /**
   * Minimum selectable date
   */
  minDate?: Date;

  /**
   * Maximum selectable date
   */
  maxDate?: Date;

  /**
   * Size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
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

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      range = false,
      amountOfMonths = 1,
      events = [],
      minDate,
      maxDate,
      size = "md",
      className = "",
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

    const now = new Date();
    const initialDate =
      (range ? (activeValue as any)?.[0] : activeValue) || now;

    const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

    const handlePrevMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    };

    const handleNextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    };

    const handleToday = () => {
      const todayDate = new Date();
      setViewYear(todayDate.getFullYear());
      setViewMonth(todayDate.getMonth());
      if (!range) {
        if (!isControlled) setInternalValue(todayDate);
        if (onValueChange) onValueChange(todayDate);
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

    const handleSelectDay = (year: number, month: number, day: number) => {
      const selected = new Date(year, month, day);

      if (minDate && selected < minDate) return;
      if (maxDate && selected > maxDate) return;

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
      }
    };

    // Helper to get events for a date
    const getEventsForDay = (year: number, month: number, day: number) => {
      return events.filter((e) => {
        const eventDate = typeof e.date === "string" ? new Date(e.date) : e.date;
        return (
          eventDate.getFullYear() === year &&
          eventDate.getMonth() === month &&
          eventDate.getDate() === day
        );
      });
    };

    // Render single month grid
    const renderMonthGrid = (year: number, month: number) => {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfWeek = new Date(year, month, 1).getDay();

      const calendarGrid: (number | null)[] = [];
      for (let i = 0; i < firstDayOfWeek; i++) calendarGrid.push(null);
      for (let d = 1; d <= daysInMonth; d++) calendarGrid.push(d);

      return (
        <div className="bs-calendar-month-block">
          <div className="bs-calendar-header">
            <span className="bs-calendar-month-title">
              {MONTH_NAMES[month]} {year}
            </span>
          </div>

          <div className="bs-calendar-weekdays">
            {WEEKDAY_NAMES.map((wd) => (
              <span key={wd} className="bs-calendar-weekday">
                {wd}
              </span>
            ))}
          </div>

          <div className="bs-calendar-grid">
            {calendarGrid.map((dayNum, idx) => {
              if (dayNum === null) {
                return <span key={`empty-${idx}`} className="bs-calendar-day--empty" />;
              }

              const currentCellDate = new Date(year, month, dayNum);
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
              const dayEvents = getEventsForDay(year, month, dayNum);

              return (
                <button
                  key={dayNum}
                  type="button"
                  className={[
                    "bs-calendar-day-btn",
                    isSelected ? "bs-calendar-day-btn--selected" : "",
                    isInRange ? "bs-calendar-day-btn--in-range" : "",
                    isToday ? "bs-calendar-day-btn--today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelectDay(year, month, dayNum)}
                >
                  <span>{dayNum}</span>
                  {dayEvents.length > 0 && (
                    <span className="bs-calendar-event-dots">
                      {dayEvents.map((evt, eIdx) => (
                        <span
                          key={eIdx}
                          className="bs-calendar-event-dot"
                          style={{ backgroundColor: evt.color || "#0B6763" }}
                          title={evt.title}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    // Calculate second month details if amountOfMonths is 2
    let secondYear = viewYear;
    let secondMonth = viewMonth + 1;
    if (secondMonth > 11) {
      secondMonth = 0;
      secondYear += 1;
    }

    return (
      <div
        ref={ref}
        className={[
          "bs-calendar-card",
          `bs-calendar-card--${size}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {/* Navigation Toolbar */}
        <div className="bs-calendar-toolbar">
          <button
            type="button"
            className="bs-calendar-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <Icon name="ArrowLeft" size={14} />
          </button>

          <button
            type="button"
            className="bs-calendar-today-btn"
            onClick={handleToday}
          >
            Today
          </button>

          <button
            type="button"
            className="bs-calendar-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        {/* Month Grids Container */}
        <div
          className={[
            "bs-calendar-months-container",
            amountOfMonths === 2 ? "bs-calendar-months-container--dual" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {renderMonthGrid(viewYear, viewMonth)}
          {amountOfMonths === 2 && renderMonthGrid(secondYear, secondMonth)}
        </div>
      </div>
    );
  }
);

Calendar.displayName = "Calendar";
