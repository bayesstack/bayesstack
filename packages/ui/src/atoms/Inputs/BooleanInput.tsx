import React, { useState, type ReactNode } from "react";
import { Icon, type IconName } from "../Icons";
import "./Inputs.css";

export interface BooleanOption {
  /**
   * Display label for this choice
   */
  label: ReactNode;

  /**
   * Value for this option (boolean, string, or number)
   */
  value: boolean | string | number;

  /**
   * Optional Icon indicator
   */
  icon?: IconName | ReactNode;

  /**
   * Disables this individual option
   * @default false
   */
  disabled?: boolean;
}

export interface BooleanInputSlots {
  root?: string;
  label?: string;
  description?: string;
  optionsGroup?: string;
  option?: string;
  optionIcon?: string;
  optionText?: string;
  track?: string;
  thumb?: string;
}

export interface BooleanInputProps {
  /**
   * Current value of the input
   */
  value?: boolean | string | number;

  /**
   * Default initial value for uncontrolled usage
   */
  defaultValue?: boolean | string | number;

  /**
   * Callback fired when selected option value changes
   */
  onChange?: (value: any) => void;

  /**
   * Array of options (defaults to [Yes, No] / [True, False])
   */
  options?: [BooleanOption, BooleanOption] | BooleanOption[];

  /**
   * Visual presentation variant
   * - 'segmented': Segmented button control with animated pill background
   * - 'boxed': Radio-box style cards
   * - 'switch': Switch toggle representation
   * @default 'segmented'
   */
  variant?: "segmented" | "boxed" | "switch";

  /**
   * Display size variant
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Outer label title for boxed or switch variant
   */
  label?: string;

  /**
   * Helper description text
   */
  description?: string;

  /**
   * Disables entire control
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
  classNames?: BooleanInputSlots;
}

const DEFAULT_OPTIONS: [BooleanOption, BooleanOption] = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export const BooleanInput: React.FC<BooleanInputProps> = ({
  value: controlledValue,
  defaultValue = true,
  onChange,
  options = DEFAULT_OPTIONS,
  variant = "segmented",
  size = "md",
  label,
  description,
  disabled = false,
  readOnly = false,
  error = false,
  className = "",
  classNames,
  style,
}) => {
  const [internalValue, setInternalValue] = useState<any>(defaultValue);

  const activeValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSelect = (val: any, isOptionDisabled?: boolean) => {
    if (disabled || readOnly || isOptionDisabled) return;

    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    if (onChange) {
      onChange(val);
    }
  };

  const renderIcon = (icon?: IconName | ReactNode) => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <Icon name={icon as IconName} size={size === "sm" ? 14 : size === "lg" ? 18 : 16} className={classNames?.optionIcon} />;
    }
    return icon;
  };

  // Variant: Switch Mode (True/False toggle switch)
  if (variant === "switch") {
    const isChecked = Boolean(activeValue);

    return (
      <div
        className={[
          "bs-boolean-switch-container",
          `bs-boolean-switch-container--${size}`,
          disabled && "bs-boolean-switch-container--disabled",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        onClick={() => handleSelect(!isChecked)}
      >
        <div
          className={[
            "bs-switch-track",
            `bs-switch-track--${size}`,
            isChecked && "bs-switch-track--checked",
            classNames?.track,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span className={["bs-switch-thumb", classNames?.thumb].filter(Boolean).join(" ")} />
        </div>

        {label && (
          <div className="bs-boolean-switch-text-group">
            <span className={["bs-boolean-switch-label", classNames?.label].filter(Boolean).join(" ")}>
              {label}
            </span>
            {description && (
              <span className={["bs-boolean-switch-desc", classNames?.description].filter(Boolean).join(" ")}>
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Variant: Boxed Cards
  if (variant === "boxed") {
    return (
      <div
        className={[
          "bs-boolean-boxed-container",
          `bs-boolean-boxed-container--${size}`,
          disabled && "bs-boolean-boxed-container--disabled",
          Boolean(error) && "bs-boolean-boxed-container--error",
          className,
          classNames?.root,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        {label && (
          <div className={["bs-boolean-header-label", classNames?.label].filter(Boolean).join(" ")}>
            {label}
          </div>
        )}

        <div className={["bs-boolean-boxed-grid", classNames?.optionsGroup].filter(Boolean).join(" ")}>
          {options.map((opt, idx) => {
            const isSelected = activeValue === opt.value;
            const isDisabled = disabled || readOnly || opt.disabled;

            return (
              <div
                key={idx}
                className={[
                  "bs-boolean-box-card",
                  `bs-boolean-box-card--${size}`,
                  isSelected && "bs-boolean-box-card--selected",
                  isDisabled && "bs-boolean-box-card--disabled",
                  classNames?.option,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => handleSelect(opt.value, isDisabled)}
              >
                <span className="bs-boolean-box-radio">
                  {isSelected && <span className="bs-boolean-box-radio-dot" />}
                </span>

                {opt.icon && <span className="bs-boolean-box-icon">{renderIcon(opt.icon)}</span>}

                <span className={["bs-boolean-box-label", classNames?.optionText].filter(Boolean).join(" ")}>
                  {opt.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default Variant: Segmented Control Button Group
  return (
    <div
      className={[
        "bs-boolean-segmented-wrapper",
        `bs-boolean-segmented-wrapper--${size}`,
        disabled && "bs-boolean-segmented-wrapper--disabled",
        Boolean(error) && "bs-boolean-segmented-wrapper--error",
        className,
        classNames?.root,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {options.map((opt, idx) => {
        const isSelected = activeValue === opt.value;
        const isDisabled = disabled || readOnly || opt.disabled;

        return (
          <button
            key={idx}
            type="button"
            className={[
              "bs-boolean-segment-btn",
              `bs-boolean-segment-btn--${size}`,
              isSelected && "bs-boolean-segment-btn--selected",
              isDisabled && "bs-boolean-segment-btn--disabled",
              classNames?.option,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleSelect(opt.value, isDisabled)}
            disabled={isDisabled}
          >
            {opt.icon && <span className="bs-boolean-segment-icon">{renderIcon(opt.icon)}</span>}
            <span className={["bs-boolean-segment-text", classNames?.optionText].filter(Boolean).join(" ")}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

BooleanInput.displayName = "BooleanInput";
