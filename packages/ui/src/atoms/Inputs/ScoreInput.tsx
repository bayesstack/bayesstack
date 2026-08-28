import React, { useState, type ReactNode } from "react";
import { Icon, type IconName } from "../Icons";
import "./Inputs.css";

export interface ScoreGrade {
  /**
   * Numeric score value (e.g. 1, 2, 3, 4, 5, 10, etc.)
   */
  score: number;

  /**
   * Optional letter or custom code (e.g. 'A', 'B', 'Pass', 'Fail')
   */
  letter?: string;

  /**
   * Optional text label description (e.g. 'Excellent', 'Needs Work')
   */
  label?: string;
}

export interface ScoreInputSlots {
  root?: string;
  item?: string;
  icon?: string;
  text?: string;
}

export interface ScoreInputProps {
  /**
   * Number of rating options (e.g. 5 for 5-star / 5-box, 10 for 10-box)
   * or explicit array of grade objects.
   * @default 5
   */
  grades?: number | ScoreGrade[];

  /**
   * Currently selected score value or grade object
   */
  value?: number | ScoreGrade;

  /**
   * Default initial score for uncontrolled usage
   */
  defaultValue?: number | ScoreGrade;

  /**
   * Callback fired when score/grade selection changes
   */
  onChange?: (grade: ScoreGrade) => void;

  /**
   * Visual presentation style
   * - 'boxes': Horizontal segmented grade boxes
   * - 'stars': Interactive star rating
   * - 'pills': Rounded numeric pills
   * @default 'boxes'
   */
  variant?: "boxes" | "stars" | "pills";

  /**
   * Shows letter grade (if provided) instead of numeric score in box/pill text
   * @default true
   */
  showLetters?: boolean;

  /**
   * Display size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Disables selection
   * @default false
   */
  disabled?: boolean;

  /**
   * Read-only mode
   * @default false
   */
  readOnly?: boolean;

  /**
   * Error state highlight
   * @default false
   */
  error?: boolean | string;

  /**
   * Custom inline styles for wrapper
   */
  style?: React.CSSProperties;

  /**
   * Custom CSS class name for wrapper
   */
  className?: string;

  /**
   * Object mapping custom class names to internal sub-element slots
   */
  classNames?: ScoreInputSlots;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({
  grades = 5,
  value: controlledValue,
  defaultValue,
  onChange,
  variant = "boxes",
  showLetters = true,
  size = "md",
  disabled = false,
  readOnly = false,
  error = false,
  className = "",
  classNames,
  style,
}) => {
  // Normalize grades prop into ScoreGrade[]
  const gradeList: ScoreGrade[] = Array.isArray(grades)
    ? grades
    : Array.from({ length: grades }, (_, i) => ({
        score: i + 1,
      }));

  const getScoreValue = (val?: number | ScoreGrade): number | null => {
    if (val === undefined || val === null) return null;
    if (typeof val === "number") return val;
    return val.score;
  };

  const initialScore = getScoreValue(defaultValue ?? (controlledValue !== undefined ? controlledValue : undefined));
  const [internalScore, setInternalScore] = useState<number | null>(initialScore);
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const activeScore = getScoreValue(controlledValue) ?? internalScore;

  const handleSelect = (gradeObj: ScoreGrade) => {
    if (disabled || readOnly) return;

    if (controlledValue === undefined) {
      setInternalScore(gradeObj.score);
    }
    if (onChange) {
      onChange(gradeObj);
    }
  };

  // Render Star Rating Variant
  if (variant === "stars") {
    return (
      <div
        className={[
          "bs-score-stars-wrapper",
          `bs-score-stars-wrapper--${size}`,
          disabled && "bs-score-stars-wrapper--disabled",
          Boolean(error) && "bs-score-stars-wrapper--error",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        onMouseLeave={() => setHoverScore(null)}
      >
        {gradeList.map((g) => {
          const isFilled =
            hoverScore !== null
              ? g.score <= hoverScore
              : activeScore !== null && g.score <= activeScore;

          return (
            <button
              key={g.score}
              type="button"
              className={[
                "bs-score-star-btn",
                `bs-score-star-btn--${size}`,
                isFilled && "bs-score-star-btn--filled",
                classNames?.item,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(g)}
              onMouseEnter={() => !disabled && !readOnly && setHoverScore(g.score)}
              disabled={disabled || readOnly}
              title={g.label || g.letter || `Score ${g.score}`}
            >
              <Icon
                name="Star"
                size={size === "sm" ? 18 : size === "lg" ? 26 : 22}
                strokeWidth={1.75}
                className={classNames?.icon}
              />
            </button>
          );
        })}
      </div>
    );
  }

  // Render Boxes or Pills Variant
  return (
    <div
      className={[
        "bs-score-input-container",
        `bs-score-input-container--${variant}`,
        `bs-score-input-container--${size}`,
        disabled && "bs-score-input-container--disabled",
        Boolean(error) && "bs-score-input-container--error",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {gradeList.map((g) => {
        const isSelected = activeScore === g.score;
        const displayText = showLetters && g.letter ? g.letter : String(g.score);

        return (
          <div
            key={g.score}
            className={[
              "bs-score-item",
              `bs-score-item--${variant}`,
              `bs-score-item--${size}`,
              isSelected && "bs-score-item--selected",
              classNames?.item,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleSelect(g)}
            title={g.label || `Score ${g.score}`}
          >
            <span className={["bs-score-text", classNames?.text].filter(Boolean).join(" ")}>{displayText}</span>
          </div>
        );
      })}
    </div>
  );
};

ScoreInput.displayName = "ScoreInput";
