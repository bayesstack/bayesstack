import React, { forwardRef, useState } from "react";
import { Radio, RadioGroupContext } from "../../atoms/Inputs/Radio";
import { Icon, IconName } from "../../atoms/Icons";
import "./ChoiceGroups.css";

export interface ChoiceGroupOption {
  value: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  icon?: IconName | React.ReactNode;
}

export interface RadioGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Input name attribute applied to all radio items in the group
   */
  name?: string;

  /**
   * Controlled active radio value
   */
  value?: string;

  /**
   * Default initial active radio value
   */
  defaultValue?: string;

  /**
   * Callback fired when selected radio value changes, passing the string value
   */
  onValueChange?: (value: string) => void;

  /**
   * Change event listener
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Group layout orientation
   * @default 'column'
   */
  direction?: "row" | "column";

  /**
   * Visual presentation variant:
   * - 'default': Standard radio inputs with text labels
   * - 'card': Rich container cards with borders, icons, and descriptions
   * @default 'default'
   */
  variant?: "default" | "card";

  /**
   * Fieldset group header label
   */
  label?: React.ReactNode;

  /**
   * Validation error message or boolean status
   */
  error?: React.ReactNode | boolean;

  /**
   * Helper description hint text
   */
  helperText?: React.ReactNode;

  /**
   * Disables all radio items in the group
   * @default false
   */
  disabled?: boolean;

  /**
   * Array of option definitions (optional if using React children)
   */
  options?: ChoiceGroupOption[];

  /**
   * React children (<Radio /> items)
   */
  children?: React.ReactNode;
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      onValueChange,
      onChange,
      direction = "column",
      variant = "default",
      label,
      error,
      helperText,
      disabled = false,
      options,
      children,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState<string>(
      defaultValue || ""
    );
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = (nextVal: string) => {
      if (disabled) return;
      if (!isControlled) {
        setInternalValue(nextVal);
      }
      if (onValueChange) {
        onValueChange(nextVal);
      }
    };

    const contextValue = {
      name,
      value: currentValue,
      onValueChange: handleValueChange,
      onChange,
      disabled,
    };

    const renderOptionIcon = (icon?: IconName | React.ReactNode) => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size="sm" />;
      }
      return icon;
    };

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={["bs-choice-group", className].filter(Boolean).join(" ")}
          style={style}
          role="radiogroup"
          aria-invalid={Boolean(error)}
          {...props}
        >
          {label && <div className="bs-choice-group__label">{label}</div>}

          <div
            className={[
              "bs-choice-group__items",
              `bs-choice-group__items--${direction}`,
            ].join(" ")}
          >
            {options
              ? options.map((opt) => {
                  const isSelected = currentValue === opt.value;
                  const isOptDisabled = disabled || opt.disabled;

                  if (variant === "card") {
                    return (
                      <div
                        key={opt.value}
                        className={[
                          "bs-choice-card",
                          isSelected ? "bs-choice-card--selected" : "",
                          isOptDisabled ? "bs-choice-card--disabled" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => !isOptDisabled && handleValueChange(opt.value)}
                      >
                        <Radio
                          value={opt.value}
                          disabled={isOptDisabled}
                          checked={isSelected}
                        />
                        <div className="bs-choice-card__content">
                          <div className="bs-choice-card__title">
                            {renderOptionIcon(opt.icon)}
                            {opt.label}
                          </div>
                          {opt.description && (
                            <div className="bs-choice-card__description">
                              {opt.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Radio
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      disabled={isOptDisabled}
                    />
                  );
                })
              : children}
          </div>

          {error && typeof error !== "boolean" && (
            <div className="bs-choice-group__error">{error}</div>
          )}
          {!error && helperText && (
            <div className="bs-choice-group__helper">{helperText}</div>
          )}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
