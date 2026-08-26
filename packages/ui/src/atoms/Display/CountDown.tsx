import React, { forwardRef, useState, useEffect } from "react";
import { Icon } from "../Icons";
import "./Display.css";

export interface CountDownProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Target finish Date instance, ISO date string, or total seconds duration
   */
  target: Date | string | number;

  /**
   * Displays timer clock icon
   * @default true
   */
  withIcon?: boolean;

  /**
   * Optional prefix/label text (e.g. 'Time remaining:')
   */
  label?: string;

  /**
   * Output time format layout
   * @default 'hh:mm:ss'
   */
  format?: "hh:mm:ss" | "mm:ss" | "dd:hh:mm:ss";

  /**
   * Callback fired when timer reaches 0
   */
  onFinish?: () => void;

  /**
   * Visual theme status variant
   * @default 'default'
   */
  variant?: "default" | "warning" | "danger" | "pill";

  /**
   * Size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export const CountDown = forwardRef<HTMLDivElement, CountDownProps>(
  (
    {
      target,
      withIcon = true,
      label,
      format = "hh:mm:ss",
      onFinish,
      variant = "default",
      size = "md",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    // Calculate target timestamp in ms
    const targetMs = React.useMemo(() => {
      if (typeof target === "number") {
        return Date.now() + target * 1000;
      }
      return new Date(target).getTime();
    }, [target]);

    const [timeLeftMs, setTimeLeftMs] = useState<number>(() =>
      Math.max(0, targetMs - Date.now())
    );

    useEffect(() => {
      const interval = setInterval(() => {
        const remaining = Math.max(0, targetMs - Date.now());
        setTimeLeftMs(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          if (onFinish) onFinish();
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [targetMs, onFinish]);

    const pad = (num: number) => String(num).padStart(2, "0");

    const totalSeconds = Math.floor(timeLeftMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let timeString = "";
    if (format === "dd:hh:mm:ss") {
      timeString = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else if (format === "mm:ss") {
      const totalMinutes = Math.floor(totalSeconds / 60);
      timeString = `${pad(totalMinutes)}:${pad(seconds)}`;
    } else {
      timeString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    const isDanger = totalSeconds <= 60 && totalSeconds > 0;
    const activeVariant = isDanger ? "danger" : variant;

    return (
      <div
        ref={ref}
        role="timer"
        className={[
          "bs-countdown",
          `bs-countdown--${size}`,
          `bs-countdown--${activeVariant}`,
          isDanger ? "bs-countdown--pulse" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        {...props}
      >
        {withIcon && (
          <Icon
            name="Time"
            size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
            className="bs-countdown-icon"
          />
        )}
        {label && <span className="bs-countdown-label">{label}</span>}
        <span className="bs-countdown-digits">{timeString}</span>
      </div>
    );
  }
);

CountDown.displayName = "CountDown";
