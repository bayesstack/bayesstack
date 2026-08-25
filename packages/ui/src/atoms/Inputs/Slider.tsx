import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import "./Inputs.css";

export type SliderValue = number | [number, number];

export interface MarkObj {
  style?: CSSProperties;
  label: ReactNode;
}

export type SliderMarks =
  | Record<number, ReactNode | MarkObj>
  | number[];

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "value" | "defaultValue" | "onChange"> {
  /**
   * Value or range array [lower, upper]
   */
  value?: SliderValue;

  /**
   * Default initial value
   */
  defaultValue?: SliderValue;

  /**
   * Callback fired when value changes during sliding
   */
  onChange?: (val: SliderValue) => void;

  /**
   * Callback fired when drag finishes (on mouseUp / touchEnd)
   */
  onChangeComplete?: (val: SliderValue) => void;

  /**
   * Convenience alias callback fired when drag finishes
   */
  onChangeEnd?: (val: SliderValue) => void;

  /**
   * Minimum value bound
   * @default 0
   */
  min?: number;

  /**
   * Maximum value bound
   * @default 100
   */
  max?: number;

  /**
   * Step increment granularity. Pass null to snap strictly to marks.
   * @default 1
   */
  step?: number | null;

  /**
   * Enable dual range handle slider mode
   * @default false
   */
  range?: boolean;

  /**
   * Vertical orientation slider
   * @default false
   */
  vertical?: boolean;

  /**
   * Disable interactive sliding
   * @default false
   */
  disabled?: boolean;

  /**
   * Tick marks along the track with optional custom labels or styles
   */
  marks?: SliderMarks;

  /**
   * Display value tooltip bubble on hover or always
   * @default true
   */
  showTooltip?: boolean | "always";

  /**
   * Custom tooltip value formatter function
   */
  tooltipFormatter?: (val: number) => ReactNode;

  /**
   * Custom root element class
   */
  className?: string;

  /**
   * Custom inline styles for root container
   */
  wrapperStyle?: CSSProperties;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      range = false,
      vertical = false,
      disabled = false,
      marks,
      showTooltip = true,
      tooltipFormatter = (v) => String(v),
      onChange,
      onChangeComplete,
      onChangeEnd,
      className = "",
      wrapperStyle,
      style,
      ...props
    },
    ref
  ) => {
    const isRangeMode = range || Array.isArray(value) || Array.isArray(defaultValue);
    const isControlled = value !== undefined;

    // Normalization helper
    const normalizeValue = useCallback(
      (val: SliderValue | undefined): [number, number] => {
        if (Array.isArray(val)) {
          return [
            Math.max(min, Math.min(max, val[0])),
            Math.max(min, Math.min(max, val[1])),
          ];
        }
        const num = typeof val === "number" ? val : min;
        return [Math.max(min, Math.min(max, num)), max];
      },
      [min, max]
    );

    const [internalVal, setInternalVal] = useState<[number, number]>(() => {
      if (defaultValue !== undefined) return normalizeValue(defaultValue);
      if (value !== undefined) return normalizeValue(value);
      return isRangeMode ? [20, 80] : [min, max];
    });

    // Active value pair
    const currentVal: [number, number] = isControlled
      ? normalizeValue(value)
      : internalVal;

    const activeIndexRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [hoveringIndex, setHoveringIndex] = useState<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

    // Parse marks keys into sorted numbers array
    const parsedMarks = React.useMemo(() => {
      if (!marks) return [];
      if (Array.isArray(marks)) {
        return marks.filter((m) => m >= min && m <= max).sort((a, b) => a - b);
      }
      return Object.keys(marks)
        .map(Number)
        .filter((m) => !isNaN(m) && m >= min && m <= max)
        .sort((a, b) => a - b);
    }, [marks, min, max]);

    // Calculate nearest valid step / mark
    const calcSteppedValue = useCallback(
      (rawVal: number): number => {
        let clamped = Math.max(min, Math.min(max, rawVal));

        if (step === null || step <= 0) {
          // Snap strictly to nearest mark
          if (parsedMarks.length > 0) {
            let closest = parsedMarks[0];
            let minDiff = Math.abs(clamped - closest);
            for (let i = 1; i < parsedMarks.length; i++) {
              const diff = Math.abs(clamped - parsedMarks[i]);
              if (diff < minDiff) {
                minDiff = diff;
                closest = parsedMarks[i];
              }
            }
            return closest;
          }
          return clamped;
        }

        // Standard step quantization
        const stepsCount = Math.round((clamped - min) / step);
        const stepped = min + stepsCount * step;
        // Fix precision issues
        const precision = String(step).split(".")[1]?.length || 0;
        return Number(Math.max(min, Math.min(max, stepped)).toFixed(precision));
      },
      [min, max, step, parsedMarks]
    );

    // Position % helper
    const getPercentage = (val: number) => {
      if (max === min) return 0;
      return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
    };

    // Position to Value calculation
    const getValueFromClientPos = useCallback(
      (clientX: number, clientY: number): number => {
        if (!containerRef.current) return min;
        const rect = containerRef.current.getBoundingClientRect();
        let pct = 0;

        if (vertical) {
          pct = (rect.bottom - clientY) / rect.height;
        } else {
          pct = (clientX - rect.left) / rect.width;
        }

        pct = Math.max(0, Math.min(1, pct));
        const rawVal = min + pct * (max - min);
        return calcSteppedValue(rawVal);
      },
      [min, max, vertical, calcSteppedValue]
    );

    const updateValue = useCallback(
      (nextPair: [number, number], notifyComplete = false) => {
        let finalVal: SliderValue;
        if (isRangeMode) {
          // Ensure lower <= upper
          const sorted: [number, number] = [
            Math.min(nextPair[0], nextPair[1]),
            Math.max(nextPair[0], nextPair[1]),
          ];
          finalVal = sorted;
          if (!isControlled) setInternalVal(sorted);
        } else {
          finalVal = nextPair[0];
          if (!isControlled) setInternalVal([nextPair[0], max]);
        }

        if (onChange) onChange(finalVal);
        if (notifyComplete) {
          if (onChangeComplete) onChangeComplete(finalVal);
          if (onChangeEnd) onChangeEnd(finalVal);
        }
      },
      [isRangeMode, isControlled, max, onChange, onChangeComplete, onChangeEnd]
    );

    // Mouse / Touch Event Handlers
    const handleDragMove = useCallback(
      (e: MouseEvent | TouchEvent) => {
        if (activeIndexRef.current === null || disabled) return;
        const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        const valAtPos = getValueFromClientPos(clientX, clientY);
        const idx = activeIndexRef.current;

        const nextPair: [number, number] = [...currentVal];
        nextPair[idx] = valAtPos;

        if (isRangeMode) {
          if (idx === 0 && valAtPos > nextPair[1]) nextPair[0] = nextPair[1];
          if (idx === 1 && valAtPos < nextPair[0]) nextPair[1] = nextPair[0];
        }

        updateValue(nextPair);
      },
      [disabled, getValueFromClientPos, currentVal, isRangeMode, updateValue]
    );

    const handleDragEnd = useCallback(() => {
      if (activeIndexRef.current !== null) {
        updateValue(currentVal, true);
      }
      activeIndexRef.current = null;
      setDraggingIndex(null);

      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    }, [handleDragMove, updateValue, currentVal]);

    const handleStartDrag = (idx: number, e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.stopPropagation();
      activeIndexRef.current = idx;
      setDraggingIndex(idx);

      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
    };

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      const clickedVal = getValueFromClientPos(e.clientX, e.clientY);

      if (!isRangeMode) {
        updateValue([clickedVal, max], true);
      } else {
        // Pick closest handle
        const dist0 = Math.abs(clickedVal - currentVal[0]);
        const dist1 = Math.abs(clickedVal - currentVal[1]);
        const targetIdx = dist0 <= dist1 ? 0 : 1;

        const nextPair: [number, number] = [...currentVal];
        nextPair[targetIdx] = clickedVal;
        updateValue(nextPair, true);
      }
    };

    // Keyboard navigation
    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
      if (disabled) return;
      let delta = 0;
      const stepVal = step || 1;

      if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = stepVal;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -stepVal;
      else if (e.key === "PageUp") delta = stepVal * 5;
      else if (e.key === "PageDown") delta = -stepVal * 5;
      else if (e.key === "Home") delta = min - currentVal[idx];
      else if (e.key === "End") delta = max - currentVal[idx];
      else return;

      e.preventDefault();
      const nextVal = calcSteppedValue(currentVal[idx] + delta);
      const nextPair: [number, number] = [...currentVal];
      nextPair[idx] = nextVal;
      updateValue(nextPair, true);
    };

    // Track Fill Dimensions
    const lowerPct = getPercentage(isRangeMode ? currentVal[0] : min);
    const upperPct = getPercentage(isRangeMode ? currentVal[1] : currentVal[0]);

    const trackStyle: CSSProperties = vertical
      ? { bottom: `${lowerPct}%`, height: `${upperPct - lowerPct}%` }
      : { left: `${lowerPct}%`, width: `${upperPct - lowerPct}%` };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={[
          "bs-slider-container",
          vertical ? "bs-slider-container--vertical" : "bs-slider-container--horizontal",
          disabled && "bs-slider-container--disabled",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ ...wrapperStyle, ...style }}
        onClick={handleTrackClick}
        {...props}
      >
        {/* Background Rail */}
        <div className="bs-slider-rail" />

        {/* Filled Active Track */}
        <div className="bs-slider-track" style={trackStyle} />

        {/* Render Marks & Ticks */}
        {parsedMarks.map((mVal) => {
          const mPct = getPercentage(mVal);
          const isActive =
            isRangeMode
              ? mVal >= currentVal[0] && mVal <= currentVal[1]
              : mVal <= currentVal[0];

          let markLabel: ReactNode = mVal;
          let customStyle: CSSProperties | undefined;

          if (marks && !Array.isArray(marks) && marks[mVal]) {
            const entry = marks[mVal];
            if (typeof entry === "object" && entry !== null && "label" in entry) {
              markLabel = entry.label;
              customStyle = entry.style;
            } else {
              markLabel = entry as ReactNode;
            }
          }

          const dotPosStyle: CSSProperties = vertical
            ? { bottom: `${mPct}%` }
            : { left: `${mPct}%` };

          const textPosStyle: CSSProperties = vertical
            ? {
                bottom: `${mPct}%`,
                transform: mPct === 0 ? "translateY(0%)" : mPct === 100 ? "translateY(100%)" : "translateY(50%)",
              }
            : {
                left: `${mPct}%`,
                transform: mPct === 0 ? "translateX(0%)" : mPct === 100 ? "translateX(-100%)" : "translateX(-50%)",
              };

          return (
            <React.Fragment key={mVal}>
              <div
                className={[
                  "bs-slider-mark-dot",
                  isActive && "bs-slider-mark-dot--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={dotPosStyle}
              />
              <div
                className={[
                  "bs-slider-mark-text",
                  isActive && "bs-slider-mark-text--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ ...textPosStyle, ...customStyle }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (disabled) return;
                  if (!isRangeMode) {
                    updateValue([mVal, max], true);
                  } else {
                    const dist0 = Math.abs(mVal - currentVal[0]);
                    const dist1 = Math.abs(mVal - currentVal[1]);
                    const idx = dist0 <= dist1 ? 0 : 1;
                    const nextPair: [number, number] = [...currentVal];
                    nextPair[idx] = mVal;
                    updateValue(nextPair, true);
                  }
                }}
              >
                {markLabel}
              </div>
            </React.Fragment>
          );
        })}

        {/* Slider Handle 0 (or Single Handle) */}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuenow={currentVal[0]}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-disabled={disabled}
          className={[
            "bs-slider-handle",
            draggingIndex === 0 && "bs-slider-handle--active",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            vertical
              ? { bottom: `${getPercentage(currentVal[0])}%` }
              : { left: `${getPercentage(currentVal[0])}%` }
          }
          onMouseDown={(e) => handleStartDrag(0, e)}
          onTouchStart={(e) => handleStartDrag(0, e)}
          onMouseEnter={() => setHoveringIndex(0)}
          onMouseLeave={() => setHoveringIndex(null)}
          onKeyDown={(e) => handleKeyDown(0, e)}
        >
          {showTooltip && (showTooltip === "always" || hoveringIndex === 0 || draggingIndex === 0) && (
            <div className="bs-slider-tooltip">
              {tooltipFormatter(currentVal[0])}
            </div>
          )}
        </div>

        {/* Slider Handle 1 (Dual Range Mode) */}
        {isRangeMode && (
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuenow={currentVal[1]}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-disabled={disabled}
            className={[
              "bs-slider-handle",
              draggingIndex === 1 && "bs-slider-handle--active",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              vertical
                ? { bottom: `${getPercentage(currentVal[1])}%` }
                : { left: `${getPercentage(currentVal[1])}%` }
            }
            onMouseDown={(e) => handleStartDrag(1, e)}
            onTouchStart={(e) => handleStartDrag(1, e)}
            onMouseEnter={() => setHoveringIndex(1)}
            onMouseLeave={() => setHoveringIndex(null)}
            onKeyDown={(e) => handleKeyDown(1, e)}
          >
            {showTooltip && (showTooltip === "always" || hoveringIndex === 1 || draggingIndex === 1) && (
              <div className="bs-slider-tooltip">
                {tooltipFormatter(currentVal[1])}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";
