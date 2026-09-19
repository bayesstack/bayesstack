import React from "react";
import { Icon, type IconName } from "../../atoms/Icons";
import "./DataDisplay.css";

export type ScheduleEventType = "session" | "deadline" | "milestone" | "exam" | "personal";

export interface ScheduleCalendarEvent {
  id: string;
  title: string;
  dayIndex: number;
  start: string;
  end?: string;
  description?: string;
  type: ScheduleEventType;
  icon?: IconName;
  ariaLabel?: string;
}

export interface ScheduleCalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  days: Array<{ label: string; date: string; isToday?: boolean }>;
  events: ScheduleCalendarEvent[];
  startHour?: number;
  endHour?: number;
  currentTime?: { dayIndex: number; time: string };
  onEventClick?: (event: ScheduleCalendarEvent) => void;
  classNames?: { root?: string; event?: string; day?: string };
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

/**
 * A compact schedule display for time-bound sessions and due items. Sessions occupy duration;
 * deadlines and milestones use a distinct diamond-marked treatment so meaning is not colour-only.
 */
export function ScheduleCalendar({
  days,
  events,
  startHour = 8,
  endHour = 21,
  currentTime,
  onEventClick,
  className = "",
  classNames,
  style,
  ...props
}: ScheduleCalendarProps) {
  const slotCount = (endHour - startHour) * 2;
  const startMinutes = startHour * 60;
  const getRow = (time: string) => Math.max(2, Math.floor((toMinutes(time) - startMinutes) / 30) + 2);
  const getSpan = (event: ScheduleCalendarEvent) => {
    if (!event.end || event.type === "deadline" || event.type === "milestone") return 1;
    return Math.max(1, Math.ceil((toMinutes(event.end) - toMinutes(event.start)) / 30));
  };

  return <div className={["bs-schedule-calendar", className, classNames?.root].filter(Boolean).join(" ")} style={{ ...style, "--bs-schedule-days": days.length } as React.CSSProperties} {...props}>
    <div className="bs-schedule-grid" style={{ gridTemplateRows: `38px repeat(${slotCount}, 28px)` }}>
      <div className="bs-schedule-corner" />
      {days.map((day) => <div key={day.date} className={["bs-schedule-day", day.isToday ? "bs-schedule-day--today" : "", classNames?.day].filter(Boolean).join(" ")}><strong>{day.label}</strong><span>{day.date}</span>{day.isToday && <em>Today</em>}</div>)}
      {Array.from({ length: endHour - startHour + 1 }, (_, index) => <div key={index} className="bs-schedule-hour" style={{ gridColumn: 1, gridRow: index * 2 + 2 }}>{String(startHour + index).padStart(2, "0")}:00</div>)}
      {days.map((_, dayIndex) => <div key={`track-${dayIndex}`} className="bs-schedule-day-track" style={{ gridColumn: dayIndex + 2, gridRow: `2 / span ${slotCount}` }} />)}
      {currentTime && <div className="bs-schedule-now" style={{ gridColumn: currentTime.dayIndex + 2, gridRow: getRow(currentTime.time) }}><span>{currentTime.time}</span></div>}
      {events.map((event) => <button
        key={event.id}
        type="button"
        aria-label={event.ariaLabel || `${event.type}: ${event.title}, ${event.start}`}
        onClick={() => onEventClick?.(event)}
        className={["bs-schedule-event", `bs-schedule-event--${event.type}`, onEventClick ? "bs-schedule-event--clickable" : "", classNames?.event].filter(Boolean).join(" ")}
        style={{ gridColumn: event.dayIndex + 2, gridRow: `${getRow(event.start)} / span ${getSpan(event)}` }}
      >
        <span className="bs-schedule-event-marker">{event.icon ? <Icon name={event.icon} size={11} /> : event.type === "deadline" || event.type === "milestone" ? "◆" : ""}</span>
        <span className="bs-schedule-event-copy"><strong>{event.title}</strong>{event.description && <small>{event.description}</small>}</span>
      </button>)}
    </div>
  </div>;
}
