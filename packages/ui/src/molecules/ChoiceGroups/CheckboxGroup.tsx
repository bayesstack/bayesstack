import React, { forwardRef, useState } from "react";
import { Checkbox, CheckboxGroupContext } from "../../atoms/Inputs/Checkbox";
import { Icon, IconName } from "../../atoms/Icons";
import { ChoiceGroupOption } from "./RadioGroup";
import "./ChoiceGroups.css";

export interface CheckboxGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Input name attribute applied to all checkbox items in the group
   */
  name?: string;

  /**
   * Controlled active checkbox values array
   */
  value?: string[];

  /**
   * Default initial active values array
   */
  defaultValue?: string[];

  /**
   * Callback fired when selected values change, returning the updated string[] array
   */
  onValueChange?: (value: string[]) => void;

  /**
   * Group layout orientation
   * @default 'column'
   */
  direction?: "row" | "column";

  /**
   * Visual presentation variant:
   * - 'default': Standard checkbox inputs with text labels
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
   * Disables all checkbox items in the group
   * @default false
   */
  disabled?: boolean;

  /**
   * Array of option definitions (optional if using React children)
   */
  options?: ChoiceGroupOption[];

  /**
   * React children (<Checkbox /> items)
   */
  children?: React.ReactNode;
}

export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      name,
      value,
      defaultValue = [],
      onValueChange,
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
    const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
    const currentValues = isControlled ? value : internalValue;

    const handleToggle = (itemVal: string) => {
      if (disabled) return;
      const exists = currentValues.includes(itemVal);
      const nextValues = exists
        ? currentValues.filter((val) => val !== itemVal)
        : [...currentValues, itemVal];

      if (!isControlled) {
        setInternalValue(nextValues);
      }
      if (onValueChange) {
        onValueChange(nextValues);
      }
    };

    const contextValue = {
      name,
      value: currentValues,
      onToggle: (itemVal: string) => handleToggle(itemVal),
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
      <CheckboxGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={["bs-choice-group", className].filter(Boolean).join(" ")}
          style={style}
          role="group"
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
                  const isSelected = currentValues.includes(opt.value);
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
                        onClick={() => !isOptDisabled && handleToggle(opt.value)}
                      >
                        <Checkbox
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
                    <Checkbox
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
      </CheckboxGroupContext.Provider>
    );
  }
);

CheckboxGroup.displayName = "CheckboxGroup";
